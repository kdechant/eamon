import os
import platform

from datetime import datetime
from fabric import Connection
from fabric import task
from glob import glob
from invoke import run as local

# global connections
# (until I figure out how the context variable works...)
# TODO: look into adding host info to .ssh/config - that seems to be the official way to handle this

connect_kwargs = {}
if platform.system() == 'Windows':
    # this requires SSH key to be loaded into pageant
    connect_kwargs = {
        "key_filename": "c:/users/keith/.ssh/id_rsa",
    }

c = Connection(
    host='kdechant.com',
    user='ubuntu',
    connect_kwargs=connect_kwargs
)
server_python = '/var/www/vhosts/eamon/.venv/bin/python'
server_root = '/var/www/vhosts/eamon'

# utility functions


def _get_db_pw():
    raw = c.run("awk '/PASSWORD/ {{print $2}}' {}/eamon/local_settings.py".format(server_root), hide='out')
    return raw.stdout[1:-3]


def _get_local_db_pw():
    raw = local("awk '/PASSWORD/ {{print $2}}' {}/eamon/local_settings.py".format(os.getcwd()), hide='out')
    return raw.stdout[1:-3]


def _db_pull(tables=None):
    pw = _get_db_pw()
    tables = "".join(tables) if tables is not None else ""
    t = datetime.now()
    fn = 'eamon-{0.year}-{0.month:0>2}-{0.day:0>2}-{0.hour:0>2}-{0.minute:0>2}-{0.second:0>2}.sql'.format(t)
    print('exporting DB on server...')
    c.run('mysqldump eamon -u eamon -p{} {} | gzip > {}.gz'.format(pw, tables, fn))
    print('downloading DB...')
    c.get("{}.gz".format(fn))
    print('importing DB locally...')
    if platform.system() == 'Windows':
        local('7z.exe e ./{}.gz -y'.format(fn), hide='out')
    else:
        local('gunzip {}'.format(fn))

    # We can sniff out the local PW on *nix but Windows should just use an empty PW.
    if platform.system() == 'Windows':
        local_pw = ""
    else:
        local_pw = _get_local_db_pw()

    if local_pw != "":
        local('mysql -u root -p{} eamon -e "source {}"'.format(local_pw, fn))
    else:
        local('mysql -u root eamon -e "source {}"'.format(fn))


def _db_push(prefix="eamon", tables=None):
    pw = _get_db_pw()
    tables = " ".join(tables) if tables is not None else ""
    t = datetime.now()
    fn = '{0}-{1.year}-{1.month:0>2}-{1.day:0>2}-{1.hour:0>2}-{1.minute:0>2}-{1.second:0>2}.sql'.format(prefix, t)
    print('exporting DB locally...')
    local_pw = _get_local_db_pw()
    if local_pw != "":
        local('mysqldump eamon -u root -p{} -r {} {}'.format(local_pw, fn, tables))
    else:
        local('mysqldump eamon -u root -r {} {}'.format(fn, tables))
    if platform.system() == 'Windows':
        local('7z.exe a {0}.gz {0} -y'.format(fn), hide='out')
    else:
        local('gzip {}'.format(fn))
    print('uploading DB...')
    c.put("{}.gz".format(fn))
    _db_backup()
    print('importing DB on server...')
    c.run('gunzip {}.gz'.format(fn))
    c.run('mysql eamon -u eamon -p{} < {}'.format(pw, fn))
    print('cleaning up...')
    c.run('rm {}'.format(fn))


def _db_migrate():
    print('running DB migrations on server...')
    c.run('{} {}/manage.py migrate'.format(server_python, server_root))


def _db_backup():
    print('backing up DB on server...')
    pw = _get_db_pw()
    t = datetime.now()
    fn = 'eamon-{0.year}-{0.month:0>2}-{0.day:0>2}-{0.hour:0>2}-{0.minute:0>2}-{0.second:0>2}.sql'.format(t)
    c.run('mysqldump eamon -u eamon -p{} | gzip > {}/db/{}.gz'.format(pw, server_root, fn))


# tasks
@task
def disk_space(context):
    c.run('df -h')


@task
def dbpull(context):
    """download DB from remote to local"""
    _db_pull()


@task
def dbpull_player(context):
    """download DB from remote to local - player data only"""
    tables = ['adventure_activitylog', 'adventure_player', 'adventure_playerartifact', 'adventure_playerprofile',
              'player_rating', 'player_savedgame']
    _db_pull(tables)


@task
def dbpush_adventure(context):
    """push DB from local to remote - non-player adventure tables only"""
    tables = ['adventure_adventure', 'adventure_artifact', 'adventure_author', 'adventure_adventure_authors',
              'adventure_effect', 'adventure_hint', 'adventure_hintanswer', 'adventure_monster', 'adventure_room',
              'adventure_roomexit', 'taggit_tag', 'taggit_taggeditem']
    _db_push('eamon-adventure', tables)


@task
def dbpush_news(context):
    """push DB from local to remote - news tables only"""
    tables = ['news_article']
    _db_push('eamon-news', tables)


@task
def migrate(context):
    """runs db migrations remotely"""
    print('running DB migrations on server...')
    _db_migrate()


@task
def build_js(context):
    """builds js and css for production deploy"""
    print('-- building JS and CSS locally...')
    local('git stash save "pre-deployment"')
    local('cd client && npm run build')
    local('git stash pop --quiet')


@task
def deploy(context):
    """full deployment - python and js/css"""
    build_js(context)
    deploy_python(context)
    deploy_js(context)


@task
def deploy_python(context):
    _db_backup()
    print('-- pulling new code...')
    # with cd() is not in fabric 2 yet
    c.run('cd {} && git pull'.format(server_root))
    print('-- installing python packages...')
    c.run('cd {} && pipenv install'.format(server_root))
    _db_migrate()


@task
def deploy_js(context):
    build_js(context)
    print('-- uploading JS and CSS files...')
    remote_static = '{}/client/build/static/'.format(server_root)
    files = glob('client/build/static/*.js')
    for file in files:
        c.put(file, remote=remote_static)
    files = glob('client/build/static/**/*.js')
    for file in files:
        c.put(file, remote='{}/adventures/'.format(remote_static))
    c.put('client/build/static/css/style.css', remote='{}/css/'.format(remote_static))
    print('-- collecting static...')
    c.run('{} {}/manage.py collectstatic --no-input'.format(server_python, server_root))
    print('-- restarting server...')
    c.run('sudo apachectl graceful')
    print('-- Done!')


@task
def build_sqlite_db(context):
    """Creates the committable SQLite DB from the MySQL DB

    This requires both the MySQL ("default") and SQLite ("sqlite")
    DB connections to be configured in your local_settings.py file.
    """
    # print('-- Exporting data from the master DB...')
    # local("python -Xutf8 manage.py dumpdata --indent 2 --database default --exclude=contenttypes --exclude=auth --exclude=admin --exclude=sessions --output db/dumpdata.json")
    print('-- Running Migrations on SQLite DB...')
    local("python manage.py migrate --database sqlite")
    print('-- Importing data...')
    local("python -Xutf8 manage.py loaddata --database sqlite db/dumpdata.json")
    print('-- Creating distributable copy...')
    if platform.system() == 'Windows':
        local("del db\eamon.sqlite3.dist.old")
        local("move db\eamon.sqlite3.dist db\eamon.sqlite3.dist.old")
        local("copy db\eamon.sqlite3 db\eamon.sqlite3.dist")
    else:
        local("rm db/eamon.sqlite3.dist.old")
        local("mv db/eamon.sqlite3.dist db/eamon/sqlite3.dist.old")
        local("cp db/eamon.sqlite3 db/eamon.sqlite3.dist")
    print('-- Done!')
