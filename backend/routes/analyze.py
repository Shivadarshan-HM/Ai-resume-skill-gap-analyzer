from pathlib import Path

from flask import Blueprint, jsonify, request

from services.resume_ai_service import build_analysis, extract_resume_text
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


@analyze_bp.route("/analyze-resume", methods=["POST"])
def analyze_uploaded_resume():
    """Analyze uploaded resume file using prompt-guided AI-style insights."""
    uploaded_file = request.files.get("file")
    prompt = request.form.get("prompt", "")
    role = request.form.get("role", "")

    if not uploaded_file or not uploaded_file.filename:
        return jsonify({"error": "Resume file is required."}), 400

    extension = Path(uploaded_file.filename).suffix.lower()
    allowed_extensions = {".pdf", ".doc", ".docx", ".txt"}

    if extension not in allowed_extensions:
        return jsonify({"error": "Unsupported file type. Allowed: .pdf, .doc, .docx, .txt"}), 400

    file_bytes = uploaded_file.read()

    if not file_bytes:
        return jsonify({"error": "Uploaded file is empty."}), 400

    try:
        resume_text = extract_resume_text(file_bytes, extension)
    except ValueError as error:
        return jsonify({"error": str(error)}), 400
    except Exception:
        return jsonify({"error": "Could not extract text from the uploaded file."}), 400

    result = build_analysis(resume_text=resume_text, prompt=prompt, role=role)
    return jsonify(result), 200
