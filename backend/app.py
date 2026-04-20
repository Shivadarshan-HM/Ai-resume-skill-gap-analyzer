from dotenv import load_dotenv
load_dotenv()

from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager

from config import Config
from database import db
from services.email_service import mail
from routes.analyze import analyze_bp
from routes.chat import chat_bp
from routes.auth import oauth_bp


def create_app() -> Flask:
    app = Flask(__name__)
    app.config.from_object(Config)

    CORS(app)
    JWTManager(app)
    db.init_app(app)
    mail.init_app(app)

    app.register_blueprint(analyze_bp)
    app.register_blueprint(chat_bp)
    app.register_blueprint(oauth_bp)

    with app.app_context():
        db.create_all()

    @app.get("/")
    def health_check():
        return {"status": "ok", "service": "CVisionary API"}

    return app


if __name__ == "__main__":
    flask_app = create_app()
    flask_app.run(host=Config.HOST, port=Config.PORT, debug=Config.DEBUG)