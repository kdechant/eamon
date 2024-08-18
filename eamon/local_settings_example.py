DEBUG = True

# Uncomment the following if you want to use a MySQL database
# instead of SQLite.
# You also need to run `pip install mysqlclient` (But don't freeze it. That package
# should not be listed in Pipfile.)
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'HOST': 'localhost',
        'USER': 'root',
        'PASSWORD': 'root',
        'NAME': 'eamon',
        'OPTIONS': {
            'init_command': "SET sql_mode='STRICT_TRANS_TABLES'"
        }
    }
}
