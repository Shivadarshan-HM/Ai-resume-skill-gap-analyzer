from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from groq import Groq
import os

chat_bp = Blueprint("chat", __name__)
_groq_client = None

def get_groq_client():
    global _groq_client
    if _groq_client is not None:
        return _groq_client
    api_key = os.getenv("GROQ_API_KEY", "").strip()
    if not api_key:
        return None
    _groq_client = Groq(api_key=api_key)
    return _groq_client

@chat_bp.route("/chat", methods=["POST"])
@jwt_required()
def chat():
    payload = request.get_json(silent=True) or {}
    user_message = payload.get("message", "").strip()
    analysis_data = payload.get("analysis_data", {})
    history = payload.get("history", [])

    if not user_message:
        return jsonify({"error": "Message is required."}), 400

    score = analysis_data.get("match_score", 0)
    found_skills = analysis_data.get("found_skills", [])
    missing_skills = analysis_data.get("missing_skills", [])
    role = analysis_data.get("role", "")

    context = ""
    if score or found_skills or missing_skills:
        context = f"""
User resume analysis:
- Target Role: {role}
- Match Score: {score}%
- Found Skills: {", ".join(found_skills) if found_skills else "None"}
- Missing Skills: {", ".join(missing_skills) if missing_skills else "None"}
"""

    system_prompt = f"""You are an expert AI resume coach for CVisionay platform.
STRICT RULES:
- Only answer questions related to resume, career, skills, jobs, and professional growth.
- If user asks anything unrelated (jokes, personal topics, random chat), politely redirect them to resume topics.
- Keep responses concise — 2-4 sentences max.
- Be encouraging and practical.
- Always consider the full conversation history to give contextual replies.
{context}"""

    client = get_groq_client()
    if client is None:
        return jsonify({{"error": "Chat service not configured."}}), 503

    # Build messages with history
    messages = [{{"role": "system", "content": system_prompt}}]
    for msg in history[-10:]:  # last 10 messages for context
        if msg.get("role") in ("user", "assistant"):
            messages.append({{"role": msg["role"], "content": msg["content"]}})
    messages.append({{"role": "user", "content": user_message}})

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=messages,
            max_tokens=400,
            temperature=0.7
        )
        reply = response.choices[0].message.content.strip()
        return jsonify({{"reply": reply}}), 200
    except Exception as e:
        return jsonify({{"error": "AI service unavailable."}}), 500
