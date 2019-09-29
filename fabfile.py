from fabric import task
from datetime import datetime
from fabric import Connection
from invoke import run as local

# global connections
# (until I figure out how the context variable works...)
# TODO: look into adding host info to .ssh/config - that seems to be the official way to handle this

# this connection requires SSH key to be loaded into pageant
c = Connection(
    host='kdechant.com',
    user='ubuntu',
    connect_kwargs={
        "key_filename": "c:/users/keith/.ssh/id_rsa",
    },
)
server_python = '/var/www/vhosts/eamon/.venv/bin/python'
server_root = '/var/www/vhosts/eamon'

# utility functions


def _get_db_pw():
    raw = c.run("awk '/PASSWORD/ {{print $2}}' {}/eamon/local_settings.py".format(server_root), hide='out')
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
    # windows only
    local('7z.exe e ./{}.gz -y'.format(fn), hide='out')
    local('mysql -u root eamon -e "source {}"'.format(fn))


def _db_push(tables=None):
    pw = _get_db_pw()
    tables = "".join(tables) if tables is not None else ""
    t = datetime.now()
    fn = 'eamon-{0.year}-{0.month:0>2}-{0.day:0>2}-{0.hour:0>2}-{0.minute:0>2}-{0.second:0>2}.sql'.format(t)
    print('exporting DB locally...')
    local('mysqldump eamon -u root -r {} {}'.format(fn, tables))
    local('7z.exe a {0}.gz {0} -y'.format(fn), hide='out')  # windows only
    print('uploading DB...')
    c.put("{}.gz".format(fn))
    print('backing up DB on server...')
    c.run('mysqldump eamon -u eamon -p{} | gzip > {}/db/{}.gz'.format(pw, server_root, fn))
    print('importing DB on server...')
    c.run('gunzip {}.gz'.format(fn))
    c.run('mysql eamon -u eamon -p{} < {}'.format(pw, fn))
    print('cleaning up...')
    c.run('rm {}'.format(fn))


def _db_migrate():
    print('running DB migrations on server...')
    c.run('{} {}/manage.py migrate'.format(server_python, server_root))


# tasks
@task
def pw(context):
    print(_get_db_pw())


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
    tables = ['adventure_adventure', 'adventure_artifact', 'adventure_author', 'adventure_effect',
              'adventure_hint', 'adventure_hintanswer', 'adventure_monster', 'adventure_room',
              'adventure_roomexit', 'taggit_tag', 'taggit_taggeditem']
    _db_push(tables)


@task
def dbpush_news(context):
    """push DB from local to remote - news tables only"""
    tables = ['news_article']
    _db_push(tables)


@task
def migrate(context):
    """runs db migrations remotely"""
    print('running DB migrations on server...')
    _db_migrate()


@task
def deploy(context):
    """deploys code - NOT TESTED YET"""
    print('building JS files locally...')
    local('git stash save "pre-deployment"')
    local('cd client; npm run build')
    print('pulling new code...')
    # with cd() is not in fabric 2 yet
    c.run('cd {} && git pull'.format(server_root))
    print('installing python packages...')
    c.run('cd {} && pipenv install'.format(server_root))
    _db_migrate()
    print('uploading JS files...')
    remote_static = '{}/client/build/static/'.format(server_root)
    c.put('client/build/static/*.js', remote=remote_static)
    c.put('client/build/static/adventures/*.js', remote=remote_static)
    print('collecting static...')
    c.run('{} {}/manage.py collectstatic --no-input'.format(server_python, server_root))
    print('restarting server...')
    c.run('sudo apachectl graceful')
