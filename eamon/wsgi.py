"""
WSGI config for eamonproj project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/1.9/howto/deployment/wsgi/
"""

import os
import time
import traceback
import signal
import sys

from django.core.wsgi import get_wsgi_application

sys.path.append('/var/www/vhosts/eamon')
sys.path.append('/var/www/vhosts/eamon/venv/lib/python3.5/site-packages')

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "eamon.settings")

application = get_wsgi_application()
