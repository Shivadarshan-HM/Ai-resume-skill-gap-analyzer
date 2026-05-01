import traceback
print("🚀 APP STARTING...")

import os
from dotenv import load_dotenv
load_dotenv()

from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from sqlalchemy import text

from config import Config
from database import db
from services.email_service import mail
from routes.analyze import analyze_bp
from routes.auth import auth_bp, legacy_auth_bp
# from routes.chat import chat_bp   # ❌ disabled for now


def _ensure_schema_compatibility() -> None:
    if db.engine.url.get_backend_name() != "sqlite":
        return

    with db.engine.begin() as connection:
        existing_columns = {
            row[1] for row in connection.execute(text("PRAGMA table_info(users)"))
        }

        if "oauth_provider" not in existing_columns:
            connection.execute(text("ALTER TABLE users ADD COLUMN oauth_provider VARCHAR(20)"))

        if "oauth_id" not in existing_columns:
            connection.execute(text("ALTER TABLE users ADD COLUMN oauth_id VARCHAR(100)"))


def create_app() -> Flask:
    try:
        app = Flask(__name__)
        app.config.from_object(Config)

        if not app.config.get("JWT_SECRET_KEY"):
            raise RuntimeError("JWT_SECRET_KEY is required.")

        allowed_origins = app.config.get("CORS_ORIGINS", [])
        origin_regexes = app.config.get("CORS_ORIGIN_REGEXES", [])
        CORS(
            app,
            origins=allowed_origins + origin_regexes,
            supports_credentials=True,
            allow_headers=["Content-Type", "Authorization"],
            methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        )
        JWTManager(app)
        db.init_app(app)
        mail.init_app(app)

        # Register routes
        app.register_blueprint(auth_bp)
        app.register_blueprint(legacy_auth_bp)
        app.register_blueprint(analyze_bp)
        # app.register_blueprint(chat_bp)  # ❌ disabled

        # DB setup
        with app.app_context():
            try:
                db.create_all()
                print("✅ DB initialized")
                _ensure_schema_compatibility()
            except Exception as e:
                print("❌ DB ERROR:", e)
                traceback.print_exc()

        @app.get("/")
        def health_check():
            return {"status": "ok", "service": "CVisionary API"}

        return app

    except Exception as e:
        print("❌ APP CREATION FAILED:", e)
        traceback.print_exc()
        raise


# 🔥 REQUIRED for gunicorn
app = create_app()


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=Config.DEBUG)
