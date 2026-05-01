from flask import Blueprint, jsonify, request
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from database import db
from models.user import User, UserProfile
from services.email_service import send_otp_email, verify_otp

auth_bp = Blueprint("auth", __name__, url_prefix="/auth")
legacy_auth_bp = Blueprint("legacy_auth", __name__)


@legacy_auth_bp.post("/send-otp")
@auth_bp.post("/send-otp")
def send_otp():
    payload = request.get_json(silent=True) or {}
    email = payload.get("email", "").strip().lower()

    if not email:
        return jsonify({"error": "Email is required."}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email already registered."}), 409

    success = send_otp_email(email)
    if not success:
        return jsonify({"error": "Failed to send OTP. Check email config."}), 500

    return jsonify({"message": "OTP sent successfully."}), 200


@legacy_auth_bp.post("/register")
@auth_bp.post("/register")
def register():
    payload = request.get_json(silent=True) or {}
    full_name = payload.get("full_name", payload.get("fullName", "")).strip()
    email = payload.get("email", "").strip().lower()
    password = payload.get("password", "")
    otp = payload.get("otp", "").strip()

    if not full_name or not email or not password or not otp:
        return jsonify({"error": "All fields including OTP are required."}), 400

    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters."}), 400

    if not verify_otp(email, otp):
        return jsonify({"error": "Invalid or expired OTP."}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email already registered."}), 409

    user = User(full_name=full_name, email=email)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()

    token = create_access_token(identity=str(user.id))
    return jsonify({"message": "Account created successfully.", "token": token, "user": user.to_dict()}), 201


@legacy_auth_bp.post("/login")
@auth_bp.post("/login")
def login():
    payload = request.get_json(silent=True) or {}
    email = payload.get("email", "").strip().lower()
    password = payload.get("password", "")

    if not email or not password:
        return jsonify({"error": "Email and password are required."}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({"error": "Invalid email or password."}), 401

    token = create_access_token(identity=str(user.id))
    return jsonify({"message": "Login successful.", "token": token, "user": user.to_dict()}), 200


@legacy_auth_bp.post("/verify-otp")
@auth_bp.post("/verify-otp")
def verify_signup_otp():
    payload = request.get_json(silent=True) or {}
    email = payload.get("email", "").strip().lower()
    otp = payload.get("otp", "").strip()

    if not email or not otp:
        return jsonify({"error": "Email and OTP are required."}), 400

    if not verify_otp(email, otp):
        return jsonify({"error": "Invalid or expired OTP."}), 400

    return jsonify({"message": "OTP verified successfully."}), 200


@auth_bp.post("/forgot-password/send-otp")
def forgot_send_otp():
    """Forgot password ke liye OTP bhejo."""
    payload = request.get_json(silent=True) or {}
    email = payload.get("email", "").strip().lower()

    if not email:
        return jsonify({"error": "Email is required."}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"error": "No account found with this email."}), 404

    success = send_otp_email(email)
    if not success:
        return jsonify({"error": "Failed to send OTP. Check email config."}), 500

    return jsonify({"message": "OTP sent to your email."}), 200


@auth_bp.post("/forgot-password/verify-otp")
def forgot_verify_otp():
    """OTP verify karo — reset token return karo."""
    payload = request.get_json(silent=True) or {}
    email = payload.get("email", "").strip().lower()
    otp = payload.get("otp", "").strip()

    if not email or not otp:
        return jsonify({"error": "Email and OTP are required."}), 400

    if not verify_otp(email, otp):
        return jsonify({"error": "Invalid or expired OTP."}), 400

    # Temporary reset token banao
    reset_token = create_access_token(identity=f"reset:{email}", expires_delta=False)
    return jsonify({"message": "OTP verified.", "reset_token": reset_token}), 200


@auth_bp.post("/forgot-password/reset")
def reset_password():
    """Naya password set karo."""
    payload = request.get_json(silent=True) or {}
    email = payload.get("email", "").strip().lower()
    reset_token = payload.get("reset_token", "").strip()
    new_password = payload.get("new_password", "")

    if not email or not reset_token or not new_password:
        return jsonify({"error": "All fields are required."}), 400

    if len(new_password) < 6:
        return jsonify({"error": "Password must be at least 6 characters."}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"error": "User not found."}), 404

    user.set_password(new_password)
    db.session.commit()

    return jsonify({"message": "Password reset successfully."}), 200


@auth_bp.get("/me")
@jwt_required()
def me():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found."}), 404
    return jsonify({"user": user.to_dict()}), 200


@auth_bp.get("/profile")
@jwt_required()
def get_profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found."}), 404
    return jsonify({"user": user.to_dict()}), 200


@auth_bp.put("/profile")
@jwt_required()
def update_profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found."}), 404

    payload = request.get_json(silent=True) or {}

    full_name = payload.get("full_name")
    if isinstance(full_name, str):
        normalized_name = full_name.strip()
        if not normalized_name:
            return jsonify({"error": "Full name cannot be empty."}), 400
        user.full_name = normalized_name

    profile = user.profile
    if not profile:
        profile = UserProfile(user_id=user.id)
        db.session.add(profile)

    def normalize_text(value):
        if value is None:
            return None
        return str(value).strip()

    profile.summary = normalize_text(payload.get("bio", payload.get("summary")))
    profile.phone = normalize_text(payload.get("phone"))
    profile.location = normalize_text(payload.get("location"))
    profile.linkedin_url = normalize_text(payload.get("linkedin_url"))
    profile.github_url = normalize_text(payload.get("github_url"))
    profile.portfolio_url = normalize_text(payload.get("portfolio_url"))

    db.session.commit()
    return jsonify({"message": "Profile updated successfully.", "user": user.to_dict()}), 200

@auth_bp.post("/google")
def google_auth():
    import os, requests
    payload = request.get_json(silent=True) or {}
    token = payload.get("token", "").strip()
    access_token_val = payload.get("access_token", "").strip()
    
    if access_token_val:
        # OAuth2 access_token flow
        r = requests.get("https://www.googleapis.com/oauth2/v3/userinfo", 
            headers={"Authorization": f"Bearer {access_token_val}"}, timeout=10)
        if r.status_code != 200:
            return jsonify({"error": "Invalid Google token."}), 401
        data = r.json()
        email = payload.get("email", data.get("email", "")).lower()
        full_name = payload.get("name", data.get("name", email.split("@")[0]))
    elif token:
        # id_token flow
        r = requests.get("https://oauth2.googleapis.com/tokeninfo", params={"id_token": token}, timeout=10)
        if r.status_code != 200:
            return jsonify({"error": "Invalid Google token."}), 401
        data = r.json()
        if data.get("aud") != os.getenv("GOOGLE_CLIENT_ID"):
            return jsonify({"error": "Token mismatch."}), 401
        email = data.get("email", "").lower()
        full_name = data.get("name", email.split("@")[0])
    else:
        return jsonify({"error": "Google token required."}), 400
    # ✅ FIX: Sirf already registered users ko allow karo
    # Naye users ko Google se auto-register NAHI hoga
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({
            "error": "No account found with this Google email. Please sign up first using email and password."
        }), 404

    access_token = create_access_token(identity=str(user.id))
    return jsonify({"message": "Google login successful.", "token": access_token, "user": user.to_dict()}), 200
