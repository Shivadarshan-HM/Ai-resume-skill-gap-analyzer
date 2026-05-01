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
from routes.chat import chat_bp


def _ensure_schema_compatibility() -> None:
    """Backfill missing SQLite columns for older local databases."""
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
    app = Flask(__name__)
    app.config.from_object(Config)

    CORS(app, origins=["http://localhost:3000", "http://localhost:3001"], supports_credentials=True, allow_headers=["Content-Type", "Authorization"], methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])
    JWTManager(app)
    db.init_app(app)
    mail.init_app(app)

    app.register_blueprint(auth_bp)
    app.register_blueprint(legacy_auth_bp)
    app.register_blueprint(analyze_bp)
    app.register_blueprint(chat_bp)

    with app.app_context():
        db.create_all()
        _ensure_schema_compatibility()

    @app.get("/")
    def health_check():
        return {"status": "ok", "service": "CVisionary API"}

    return app


if __name__ == "__main__":
    flask_app = create_app()
    flask_app.run(host=Config.HOST, port=Config.PORT, debug=Config.DEBUG)
