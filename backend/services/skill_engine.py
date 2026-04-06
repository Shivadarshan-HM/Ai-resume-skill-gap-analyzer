import json
import os
from pathlib import Path

<<<<<<< HEAD
import anthropic
=======
from groq import Groq
>>>>>>> 13d3aa9e89695d3a8984b6cb3b493772e9f3c1ce

from utils.text_cleaner import clean_text


DATA_FILE = Path(__file__).resolve().parent.parent / "data" / "skills.json"


def load_skills_data() -> dict:
    with DATA_FILE.open("r", encoding="utf-8") as file:
        return json.load(file)


def _skill_exists_in_resume(skill: str, cleaned_resume: str) -> bool:
    return clean_text(skill) in cleaned_resume


def get_ai_suggestions(missing_skills: list, role: str) -> list:
<<<<<<< HEAD
    """Claude se missing skills ke liye actionable suggestions lao."""
    if not missing_skills:
        return []

    api_key = os.environ.get("ANTHROPIC_API_KEY")
=======
    """Groq se missing skills ke liye actionable suggestions lao."""
    if not missing_skills:
        return []

    api_key = os.environ.get("GROQ_API_KEY")
>>>>>>> 13d3aa9e89695d3a8984b6cb3b493772e9f3c1ce
    if not api_key:
        return [
            {"skill": s, "how_to_learn": f"Learn {s} via online courses.", "priority": "Medium"}
            for s in missing_skills
        ]

<<<<<<< HEAD
    client = anthropic.Anthropic(api_key=api_key)
=======
    client = Groq(api_key=api_key)
>>>>>>> 13d3aa9e89695d3a8984b6cb3b493772e9f3c1ce
    prompt = f"""You are a career advisor. A candidate applying for {role} is missing: {', '.join(missing_skills)}.

Return ONLY a JSON array, no markdown:
[{{"skill": "...", "how_to_learn": "...", "priority": "High/Medium/Low"}}]

Be specific and practical. Prioritize by importance for {role}."""

    try:
<<<<<<< HEAD
        msg = client.messages.create(
            model="claude-opus-4-5",
            max_tokens=800,
            messages=[{"role": "user", "content": prompt}]
        )
        text = msg.content[0].text.strip()
=======
        response = client.chat.completions.create(
            model="llama3-8b-8192",
            max_tokens=800,
            messages=[{"role": "user", "content": prompt}]
        )
        text = response.choices[0].message.content.strip()
>>>>>>> 13d3aa9e89695d3a8984b6cb3b493772e9f3c1ce
        if "```" in text:
            text = text.split("```")[1].split("```")[0].replace("json", "").strip()
        return json.loads(text)
    except Exception:
        return [
            {"skill": s, "how_to_learn": f"Learn {s} via online courses.", "priority": "Medium"}
            for s in missing_skills
        ]


def get_ai_summary(role: str, match_score: float, found: list, missing: list) -> str:
<<<<<<< HEAD
    """Claude se 2-line honest candidate assessment lao."""
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        return f"Candidate matches {match_score}% of required skills for {role}."

    client = anthropic.Anthropic(api_key=api_key)
=======
    """Groq se 2-line honest candidate assessment lao."""
    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key:
        return f"Candidate matches {match_score}% of required skills for {role}."

    client = Groq(api_key=api_key)
>>>>>>> 13d3aa9e89695d3a8984b6cb3b493772e9f3c1ce
    prompt = f"""In 2 sentences, give an honest assessment for {role}.
Match: {match_score}% | Found: {', '.join(found) or 'None'} | Missing: {', '.join(missing) or 'None'}
Be direct and helpful."""

    try:
<<<<<<< HEAD
        msg = client.messages.create(
            model="claude-opus-4-5",
            max_tokens=150,
            messages=[{"role": "user", "content": prompt}]
        )
        return msg.content[0].text.strip()
=======
        response = client.chat.completions.create(
            model="llama3-8b-8192",
            max_tokens=150,
            messages=[{"role": "user", "content": prompt}]
        )
        return response.choices[0].message.content.strip()
>>>>>>> 13d3aa9e89695d3a8984b6cb3b493772e9f3c1ce
    except Exception:
        return f"Candidate matches {match_score}% of required skills for {role}."


def analyze_resume_skills(resume: str, role: str) -> dict:
    """Resume vs role skills compare karo + AI suggestions add karo."""
    skills_data = load_skills_data()
    required_skills = skills_data.get(role, [])

    if not required_skills:
        return {
            "match_score": 0,
            "found_skills": [],
            "missing_skills": [],
            "suggestions": [],
            "summary": f"Role '{role}' not found.",
            "required_skills": [],
        }

    cleaned_resume = clean_text(resume)
    found_skills = [s for s in required_skills if _skill_exists_in_resume(s, cleaned_resume)]
    missing_skills = [s for s in required_skills if s not in found_skills]
    match_score = round((len(found_skills) / len(required_skills)) * 100, 2)

    suggestions = get_ai_suggestions(missing_skills, role)
    summary = get_ai_summary(role, match_score, found_skills, missing_skills)

    return {
        "match_score": match_score,
        "found_skills": found_skills,
        "missing_skills": missing_skills,
        "suggestions": suggestions,
        "summary": summary,
        "required_skills": required_skills,
    }