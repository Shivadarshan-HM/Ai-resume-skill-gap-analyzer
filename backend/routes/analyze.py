from flask import Blueprint, jsonify, request

from services.skill_engine import analyze_resume_skills


analyze_bp = Blueprint("analyze", __name__)


@analyze_bp.route("/analyze", methods=["POST"])
def analyze():
    """Analyze resume text against skills required for a selected role."""
    payload = request.get_json(silent=True) or {}
    resume = payload.get("resume", "")
    role = payload.get("role", "")

    if not resume or not role:
        return jsonify({"error": "Both 'resume' and 'role' are required."}), 400

    result = analyze_resume_skills(resume=resume, role=role)
    return jsonify(result), 200
