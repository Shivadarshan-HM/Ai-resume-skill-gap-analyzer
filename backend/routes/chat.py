from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from groq import Groq
import os

chat_bp = Blueprint("chat", __name__)

client = Groq(api_key=os.getenv("GROQ_API_KEY"))


@chat_bp.route("/chat", methods=["POST"])
@jwt_required()
def chat():
    payload = request.get_json(silent=True) or {}
    user_message = payload.get("message", "").strip()
    analysis_data = payload.get("analysis_data", {})

    if not user_message:
        return jsonify({"error": "Message is required."}), 400

    score = analysis_data.get("match_score", 0)
    found_skills = analysis_data.get("found_skills", [])
    missing_skills = analysis_data.get("missing_skills", [])
    role = analysis_data.get("role", "")

    context = ""
    if score or found_skills or missing_skills:
        context = f"""
The user has analyzed their resume with the following results:
- Target Role: {role}
- Match Score: {score}%
- Found Skills: {", ".join(found_skills) if found_skills else "None detected"}
- Missing Skills: {", ".join(missing_skills) if missing_skills else "None"}

Use this context to give personalized advice.
"""

    system_prompt = f"""You are an expert AI resume coach. Help users improve their resumes, skills, and career prospects.
Be concise, practical, and encouraging. Give actionable advice in 2-3 sentences max.
{context}"""

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message}
            ],
            max_tokens=400,
            temperature=0.7
        )
        reply = response.choices[0].message.content.strip()
        return jsonify({"reply": reply}), 200

    except Exception as e:
        return jsonify({"error": "AI service unavailable. Please try again."}), 500
