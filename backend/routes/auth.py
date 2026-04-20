import os

import requests
from flask import Blueprint, current_app, jsonify, request
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required
from itsdangerous import URLSafeTimedSerializer, BadSignature, SignatureExpired

from database import db
from models.user import User, UserProfile
from services.email_service import send_otp_email, verify_otp

oauth_bp = Blueprint("oauth", __name__, url_prefix="/auth")

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
FACEBOOK_APP_ID = os.getenv("FACEBOOK_APP_ID")
FACEBOOK_APP_SECRET = os.getenv("FACEBOOK_APP_SECRET")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")


def _json_payload():
    return request.get_json(silent=True) or {}


def _password_valid(password: str) -> bool:
    return isinstance(password, str) and len(password) >= 6


def _reset_token_serializer() -> URLSafeTimedSerializer:
    return URLSafeTimedSerializer(current_app.config["JWT_SECRET_KEY"])


@oauth_bp.post("/send-otp")
def send_otp():
    payload = _json_payload()
    email = (payload.get("email") or "").strip().lower()

    if not email:
        return jsonify({"error": "Email is required."}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email is already registered. Please sign in."}), 409

    sent = send_otp_email(email)
    if not sent:
        return jsonify({"error": "Unable to send OTP right now. Please try again."}), 503

    return jsonify({"message": "OTP sent successfully."}), 200


@oauth_bp.post("/register")
def register():
    payload = _json_payload()
    full_name = (payload.get("full_name") or "").strip()
    email = (payload.get("email") or "").strip().lower()
    password = payload.get("password") or ""
    otp = (payload.get("otp") or "").strip()

    if not full_name or not email or not password or not otp:
        return jsonify({"error": "Full name, email, password, and OTP are required."}), 400

    if not _password_valid(password):
        return jsonify({"error": "Password must be at least 6 characters."}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "User already exists. Please sign in."}), 409

    if not verify_otp(email, otp):
        return jsonify({"error": "Invalid or expired OTP."}), 400

    user = User(full_name=full_name, email=email)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()

    token = create_access_token(identity=str(user.id))
    return jsonify({
        "message": "Registration successful.",
        "token": token,
        "user": user.to_dict(),
    }), 201


@oauth_bp.post("/login")
def login():
    payload = _json_payload()
    email = (payload.get("email") or "").strip().lower()
    password = payload.get("password") or ""

    if not email or not password:
        return jsonify({"error": "Email and password are required."}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({"error": "Invalid email or password."}), 401

    token = create_access_token(identity=str(user.id))
    return jsonify({
        "message": "Login successful.",
        "token": token,
        "user": user.to_dict(),
    }), 200


@oauth_bp.put("/profile")
@jwt_required()
def update_profile():
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id)) if user_id is not None else None
    if not user:
        return jsonify({"error": "User not found."}), 404

    payload = _json_payload()
    full_name = (payload.get("full_name") or "").strip()
    if full_name:
        user.full_name = full_name

    profile = user.profile
    if profile is None:
        profile = UserProfile(user_id=user.id)
        db.session.add(profile)

    profile.summary = (payload.get("bio") or "").strip() or None
    profile.phone = (payload.get("phone") or "").strip() or None
    profile.location = (payload.get("location") or "").strip() or None
    profile.linkedin_url = (payload.get("linkedin_url") or "").strip() or None
    profile.github_url = (payload.get("github_url") or "").strip() or None
    profile.portfolio_url = (payload.get("portfolio_url") or "").strip() or None

    db.session.commit()
    return jsonify({"message": "Profile updated.", "user": user.to_dict()}), 200


@oauth_bp.post("/forgot-password/send-otp")
def forgot_password_send_otp():
    payload = _json_payload()
    email = (payload.get("email") or "").strip().lower()

    if not email:
        return jsonify({"error": "Email is required."}), 400

    # Keep response generic to avoid account enumeration.
    user = User.query.filter_by(email=email).first()
    if user:
        send_otp_email(email)

    return jsonify({"message": "If the email exists, an OTP has been sent."}), 200


@oauth_bp.post("/forgot-password/verify-otp")
def forgot_password_verify_otp():
    payload = _json_payload()
    email = (payload.get("email") or "").strip().lower()
    otp = (payload.get("otp") or "").strip()

    if not email or not otp:
        return jsonify({"error": "Email and OTP are required."}), 400

    if not User.query.filter_by(email=email).first():
        return jsonify({"error": "Invalid OTP or email."}), 400

    if not verify_otp(email, otp):
        return jsonify({"error": "Invalid or expired OTP."}), 400

    reset_token = _reset_token_serializer().dumps({"email": email, "purpose": "password_reset"})
    return jsonify({"message": "OTP verified.", "reset_token": reset_token}), 200


@oauth_bp.post("/forgot-password/reset")
def forgot_password_reset():
    payload = _json_payload()
    email = (payload.get("email") or "").strip().lower()
    reset_token = (payload.get("reset_token") or "").strip()
    new_password = payload.get("new_password") or ""

    if not email or not reset_token or not new_password:
        return jsonify({"error": "Email, reset token, and new password are required."}), 400

    if not _password_valid(new_password):
        return jsonify({"error": "Password must be at least 6 characters."}), 400

    try:
        token_data = _reset_token_serializer().loads(reset_token, max_age=600)
    except SignatureExpired:
        return jsonify({"error": "Reset token expired. Please verify OTP again."}), 400
    except BadSignature:
        return jsonify({"error": "Invalid reset token."}), 400

    if token_data.get("purpose") != "password_reset" or token_data.get("email") != email:
        return jsonify({"error": "Invalid reset token."}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"error": "User not found."}), 404

    user.set_password(new_password)
    db.session.commit()

    return jsonify({"message": "Password reset successful."}), 200


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
