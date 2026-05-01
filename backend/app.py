from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv

from config import Config
from database import db
from services.email_service import mail

from routes.auth import auth_bp, legacy_auth_bp
from routes.analyze import analyze_bp
from routes.chat import chat_bp

import os

load_dotenv()


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # ✅ FIXED CORS (uses env variable)
    CORS(
        app,
        origins=app.config["CORS_ORIGINS"],
        supports_credentials=True
    )

    JWTManager(app)
    db.init_app(app)
    mail.init_app(app)

    # ✅ Register routes
    app.register_blueprint(auth_bp)
    app.register_blueprint(legacy_auth_bp)
    app.register_blueprint(analyze_bp)
    app.register_blueprint(chat_bp)

    # ✅ DB init (safe)
    with app.app_context():
        try:
            db.create_all()
            print("✅ Database initialized")
        except Exception as e:
            print("❌ DB ERROR:", e)

    # ✅ Health check (Render needs this)
    @app.route("/")
    def home():
        return {"status": "ok", "message": "Backend running"}

    return app


# 🔥 REQUIRED FOR GUNICORN
app = create_app()


if __name__ == "__main__":
    app.run(
        host=Config.HOST,
        port=Config.PORT,
        debug=Config.DEBUG
    )