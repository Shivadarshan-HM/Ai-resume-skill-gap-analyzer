import os
import logging
from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv

load_dotenv()

from config import Config
from database import db
from services.email_service import mail

from routes.auth import auth_bp, legacy_auth_bp
from routes.analyze import analyze_bp
from routes.chat import chat_bp

# ✅ Configure logging so errors are visible in Render logs
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s"
)
logger = logging.getLogger(__name__)


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    logger.info(f"🔧 Using DB: {app.config['SQLALCHEMY_DATABASE_URI'][:40]}...")
    logger.info(f"🔧 CORS Origins: {app.config['CORS_ORIGINS']}")

    # ✅ CORS
    CORS(
        app,
        origins=app.config["CORS_ORIGINS"],
        supports_credentials=True
    )

    JWTManager(app)
    db.init_app(app)

    # ✅ Mail init (safe — won't crash if credentials missing)
    try:
        mail.init_app(app)
        logger.info("✅ Mail initialized")
    except Exception as e:
        logger.warning(f"⚠️ Mail init failed (non-fatal): {e}")

    # ✅ Register routes
    app.register_blueprint(auth_bp)
    app.register_blueprint(legacy_auth_bp)
    app.register_blueprint(analyze_bp)
    app.register_blueprint(chat_bp)

    # ✅ DB init (safe)
    with app.app_context():
        try:
            db.create_all()
            logger.info("✅ Database initialized")
        except Exception as e:
            logger.error(f"❌ DB ERROR: {e}")
            # ✅ Don't crash the app — DB might still work for reads

    # ✅ Health check (Render needs this)
    @app.route("/")
    def home():
        return {"status": "ok", "message": "Backend running"}

    @app.route("/health")
    def health():
        return {"status": "healthy"}, 200

    return app


# ✅ Required for gunicorn: gunicorn app:app
try:
    app = create_app()
    logger.info("✅ App created successfully")
except Exception as e:
    logger.critical(f"🔥 FATAL: App failed to start: {e}")
    raise  # ✅ Re-raise so gunicorn/Render shows the real error