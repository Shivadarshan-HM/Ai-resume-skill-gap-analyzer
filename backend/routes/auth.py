import os
import requests
from flask import Blueprint, jsonify, redirect, request
from flask_jwt_extended import create_access_token
from database import db
from models.user import User

oauth_bp = Blueprint("oauth", __name__, url_prefix="/auth")

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
FACEBOOK_APP_ID = os.getenv("FACEBOOK_APP_ID")
FACEBOOK_APP_SECRET = os.getenv("FACEBOOK_APP_SECRET")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")


# ─────────────────────────────────────────
#  GOOGLE OAUTH
# ─────────────────────────────────────────

@oauth_bp.post("/google")
def google_auth():
    """Frontend se Google ID token aata hai — verify karke login/register karo."""
    payload = request.get_json(silent=True) or {}
    token = payload.get("token", "").strip()

    if not token:
        return jsonify({"error": "Google token is required."}), 400

    # Google se token verify karo
    google_response = requests.get(
        "https://oauth2.googleapis.com/tokeninfo",
        params={"id_token": token},
        timeout=10
    )

    if google_response.status_code != 200:
        return jsonify({"error": "Invalid Google token."}), 401

    google_data = google_response.json()

    # Token ka audience check karo
    if google_data.get("aud") != GOOGLE_CLIENT_ID:
        return jsonify({"error": "Token audience mismatch."}), 401

    email = google_data.get("email", "").lower()
    full_name = google_data.get("name", email.split("@")[0])
    google_id = google_data.get("sub")

    if not email:
        return jsonify({"error": "Could not get email from Google."}), 400

    # User dhundo ya banao
    user = User.query.filter_by(email=email).first()
    if not user:
        user = User(
            full_name=full_name,
            email=email,
            oauth_provider="google",
            oauth_id=google_id
        )
        user.set_password(os.urandom(24).hex())  # random password
        db.session.add(user)
        db.session.commit()

    token = create_access_token(identity=str(user.id))
    return jsonify({
        "message": "Google login successful.",
        "token": token,
        "user": user.to_dict()
    }), 200


# ─────────────────────────────────────────
#  FACEBOOK OAUTH
# ─────────────────────────────────────────

@oauth_bp.post("/facebook")
def facebook_auth():
    """Frontend se Facebook access token aata hai — verify karke login/register karo."""
    payload = request.get_json(silent=True) or {}
    access_token = payload.get("token", "").strip()

    if not access_token:
        return jsonify({"error": "Facebook token is required."}), 400

    # Facebook se user info lo
    fb_response = requests.get(
        "https://graph.facebook.com/me",
        params={
            "fields": "id,name,email",
            "access_token": access_token
        },
        timeout=10
    )

    if fb_response.status_code != 200:
        return jsonify({"error": "Invalid Facebook token."}), 401

    fb_data = fb_response.json()

    if "error" in fb_data:
        return jsonify({"error": fb_data["error"].get("message", "Facebook auth failed.")}), 401

    email = fb_data.get("email", "").lower()
    full_name = fb_data.get("name", "Facebook User")
    facebook_id = fb_data.get("id")

    # Facebook email nahi deta toh fallback
    if not email:
        email = f"fb_{facebook_id}@facebook.com"

    # User dhundo ya banao
    user = User.query.filter_by(email=email).first()
    if not user:
        user = User(
            full_name=full_name,
            email=email,
            oauth_provider="facebook",
            oauth_id=facebook_id
        )
        user.set_password(os.urandom(24).hex())  # random password
        db.session.add(user)
        db.session.commit()

    token = create_access_token(identity=str(user.id))
    return jsonify({
        "message": "Facebook login successful.",
        "token": token,
        "user": user.to_dict()
    }), 200
