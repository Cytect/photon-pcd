"""PHOTON — MySQL Database Connection Service"""

import pymysql
from flask import current_app, g


def get_db():
    """Get a database connection for the current request.
    Connections are cached in Flask's `g` object and reused
    within the same request context."""
    if 'db' not in g:
        g.db = pymysql.connect(
            host=current_app.config['MYSQL_HOST'],
            user=current_app.config['MYSQL_USER'],
            password=current_app.config['MYSQL_PASSWORD'],
            database=current_app.config['MYSQL_DB'],
            cursorclass=pymysql.cursors.DictCursor,
            autocommit=True,
        )
    return g.db


def close_db(e=None):
    """Close database connection at end of request."""
    db = g.pop('db', None)
    if db is not None:
        db.close()


def init_db(app):
    """Register the teardown handler so connections auto-close."""
    app.teardown_appcontext(close_db)
