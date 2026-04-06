from flask import Flask
from flask_cors import CORS

from config import Config
from routes.analyze import analyze_bp


def create_app() -> Flask:
    """Factory method to build and configure Flask app."""
    app = Flask(__name__)
    app.config.from_object(Config)

    # Allow frontend app to access API during local development.
    CORS(app)

    app.register_blueprint(analyze_bp)

    @app.get("/")
    def health_check():
        return {"status": "ok", "service": "AI Resume Skill Gap Analyzer API"}

    return app


if __name__ == "__main__":
    flask_app = create_app()
    flask_app.run(host=Config.HOST, port=Config.PORT, debug=Config.DEBUG)
