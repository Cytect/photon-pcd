"""PHOTON — Backend Configuration"""

import os


class Config:
    # ── MySQL (XAMPP) ────────────────────────────────────────
    MYSQL_HOST = os.environ.get('MYSQL_HOST', 'localhost')
    MYSQL_USER = os.environ.get('MYSQL_USER', 'root')
    MYSQL_PASSWORD = os.environ.get('MYSQL_PASSWORD', '')  # XAMPP default
    MYSQL_DB = os.environ.get('MYSQL_DB', 'photon_db')

    # ── Flask ────────────────────────────────────────────────
    SECRET_KEY = os.environ.get('SECRET_KEY', 'photon-dev-secret-key')
    UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'uploads')
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16 MB max upload

    # ── CORS ─────────────────────────────────────────────────
    CORS_ORIGINS = ['http://localhost:3000', 'http://127.0.0.1:3000']
