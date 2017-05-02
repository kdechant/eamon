# Settings for use when running the app in docker

import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = [
    '*'
]

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'HOST': 'db',
        'USER': 'root',
        'PASSWORD': 'trollsfire',
        'NAME': 'eamon',
        'OPTIONS': {
            'init_command': "SET sql_mode='STRICT_TRANS_TABLES'"
        }
    }
}

STATIC_URL = '/static/'

# STATIC_ROOT = os.path.join(BASE_DIR, "static")

STATICFILES_DIRS = [
   os.path.join(BASE_DIR, "static")
]
