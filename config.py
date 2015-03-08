import os
import platform
import sys

# Environment variables are NOT set when script is called by upstart job
if platform.node() in ('loopy', 'nerve'):
    SECRET_KEY = '$2a$12$9qHkfxqa/CIeh0nVVV1RN.mvcc4TR3F2/VeFYgUNMvWghYYPUwNue'
    DEPLOY_ENV = 'prod'
    DEBUG = False
    POSTGRES_HOST = 'localhost'
    POSTGRES_DATABASE = 'peerrev'
    POSTGRES_USER = 'peerrev'
    POSTGRES_PASSWORD = 'peerrev'
else:
    SECRET_KEY = os.environ.get('SECRET_KEY')
    DEPLOY_ENV = os.environ.get('DEPLOY_ENV', 'local')
    DEBUG = True if 'DEBUG' in os.environ and os.environ['DEBUG'] == 'true' else False
    # setup postgres from os env
    POSTGRES_HOST = os.environ.get('POSTGRES_HOST')
    POSTGRES_PORT = os.environ.get('POSTGRES_PORT', '5432')
    POSTGRES_DATABASE = os.environ.get('POSTGRES_DATABASE')
    POSTGRES_USER = os.environ.get('POSTGRES_USER')
    POSTGRES_PASSWORD = os.environ.get('POSTGRES_PASSWORD')

TESTING = False

# user uploaded media
UPLOAD_FOLDER = './uploads'
MAX_CONTENT_LENGTH =  10000000

# use local config for development environments
if DEPLOY_ENV != 'prod':
    DEBUG = True
    try:
        from config_local import *
    except ImportError:
        print '\nYou must create a config_local.py file for local development.\n'
