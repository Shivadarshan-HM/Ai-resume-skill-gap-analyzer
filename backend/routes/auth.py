import os

import requests
from flask import Blueprint, current_app, jsonify, request
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required
from itsdangerous import URLSafeTimedSerializer, BadSignature, SignatureExpired

from database import db
from models.user import User, UserProfile
from services.email_service import send_otp_email, verify_otp

auth_bp = Blueprint("auth", __name__, url_prefix="/auth")


# ─── Helpers ────────────────────────────────────────────────────

def _json_payload():
    return request.get_json(silent=True) or {}


def _password_valid(password: str) -> bool:
    return isinstance(password, str) and len(password) >= 6


def _reset_token_serializer() -> URLSafeTimedSerializer:
    return URLSafeTimedSerializer(current_app.config["JWT_SECRET_KEY"])


# ─── OTP & Auth Routes ──────────────────────────────────────────

@auth_bp.post("/send-otp")
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


@auth_bp.post("/register")
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


@auth_bp.post("/login")
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


# ─── Profile Routes ─────────────────────────────────────────────

@auth_bp.get("/me")
@jwt_required()
def me():
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id)) if user_id is not None else None
    if not user:
        return jsonify({"error": "User not found."}), 404
    return jsonify({"user": user.to_dict()}), 200


@auth_bp.get("/profile")
@jwt_required()
def get_profile():
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id)) if user_id is not None else None
    if not user:
        return jsonify({"error": "User not found."}), 404
    return jsonify({"user": user.to_dict()}), 200


@auth_bp.put("/profile")
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


# ─── Forgot Password ────────────────────────────────────────────

@auth_bp.post("/forgot-password/send-otp")
def forgot_password_send_otp():
    payload = _json_payload()
    email = (payload.get("email") or "").strip().lower()

    if not email:
        return jsonify({"error": "Email is required."}), 400

    # Generic response to avoid account enumeration
    user = User.query.filter_by(email=email).first()
    if user:
        send_otp_email(email)

    return jsonify({"message": "If the email exists, an OTP has been sent."}), 200


@auth_bp.post("/forgot-password/verify-otp")
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


@auth_bp.post("/forgot-password/reset")
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


# ─── Google OAuth ────────────────────────────────────────────────

@auth_bp.post("/google")
def google_auth():
    payload = _json_payload()
    token = (payload.get("token") or "").strip()

    if not token:
        return jsonify({"error": "Google token required."}), 400

    r = requests.get(
        "https://oauth2.googleapis.com/tokeninfo",
        params={"id_token": token},
        timeout=10,
    )
    if r.status_code != 200:
        return jsonify({"error": "Invalid Google token."}), 401

    data = r.json()
    if data.get("aud") != os.getenv("GOOGLE_CLIENT_ID"):
        return jsonify({"error": "Token mismatch."}), 401

    email = data.get("email", "").lower()
    full_name = data.get("name", email.split("@")[0])

    user = User.query.filter_by(email=email).first()
    if not user:
        user = User(
            full_name=full_name,
            email=email,
            oauth_provider="google",
            oauth_id=data.get("sub"),
        )
        user.set_password(os.urandom(24).hex())
        db.session.add(user)
        db.session.commit()

    access_token = create_access_token(identity=str(user.id))
    return jsonify({
        "message": "Google login successful.",
        "token": access_token,
        "user": user.to_dict(),
    }), 200
