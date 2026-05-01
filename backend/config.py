import os
from datetime import timedelta

BASE_DIR = os.path.abspath(os.path.dirname(__file__))

# ✅ Create safe folder for SQLite
INSTANCE_DIR = os.path.join(BASE_DIR, "instance")
os.makedirs(INSTANCE_DIR, exist_ok=True)

DB_PATH = os.path.join(INSTANCE_DIR, "database.db")


class Config:
    DEBUG = os.getenv("FLASK_DEBUG", "false").lower() == "true"
    HOST = os.getenv("FLASK_HOST", "0.0.0.0")
    PORT = int(os.getenv("FLASK_PORT", "5000"))
    JSON_SORT_KEYS = False

    # ✅ Works for both SQLite & PostgreSQL
    SQLALCHEMY_DATABASE_URI = os.getenv(
        "DATABASE_URL",
        f"sqlite:///{DB_PATH}"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # ✅ JWT
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "super-secret-key")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(
        days=int(os.getenv("JWT_ACCESS_TOKEN_EXPIRES_DAYS", "7"))
    )

    # ✅ OTP security
    ALLOW_OTP_IN_RESPONSE = os.getenv("ALLOW_OTP_IN_RESPONSE", "false").lower() == "true"

    # ✅ CORS (from Render env)
    CORS_ORIGINS = [
        origin.strip()
        for origin in os.getenv(
            "CORS_ORIGINS",
            "http://localhost:3000,https://ai-resume-skill-gap-analyzer-eight.vercel.app"
        ).split(",")
        if origin.strip()
    ]

    # ✅ Mail config
    MAIL_SERVER = "smtp.gmail.com"
    MAIL_PORT = 587
    MAIL_USE_TLS = True
    MAIL_USERNAME = os.getenv("MAIL_USERNAME")
    MAIL_PASSWORD = os.getenv("MAIL_PASSWORD")
    MAIL_DEFAULT_SENDER = os.getenv("MAIL_USERNAME") or "no-reply@localhost"