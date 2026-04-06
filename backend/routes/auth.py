from flask import Blueprint, jsonify, request
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from database import db
from models.user import User
from services.email_service import send_otp_email, verify_otp

auth_bp = Blueprint("auth", __name__, url_prefix="/auth")


@auth_bp.post("/send-otp")
def send_otp():
    """Register karne se pehle OTP bhejo."""
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


@auth_bp.post("/register")
def register():
    """OTP verify karo aur account banao."""
    payload = request.get_json(silent=True) or {}
    full_name = payload.get("full_name", "").strip()
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

    return jsonify({
        "message": "Account created successfully.",
        "token": token,
        "user": user.to_dict()
    }), 201


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

    return jsonify({
        "message": "Login successful.",
        "token": token,
        "user": user.to_dict()
    }), 200


@auth_bp.get("/me")
@jwt_required()
def me():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user:
        return jsonify({"error": "User not found."}), 404

    return jsonify({"user": user.to_dict()}), 200
