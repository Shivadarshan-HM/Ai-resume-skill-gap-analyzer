import json
from pathlib import Path

from utils.text_cleaner import clean_text


DATA_FILE = Path(__file__).resolve().parent.parent / "data" / "skills.json"


def load_skills_data() -> dict:
    """Read role-to-skills mapping from local JSON data source."""
    with DATA_FILE.open("r", encoding="utf-8") as file:
        return json.load(file)


def _skill_exists_in_resume(skill: str, cleaned_resume: str) -> bool:
    """Allow exact phrase match for multi-word skills in cleaned text."""
    return clean_text(skill) in cleaned_resume


def analyze_resume_skills(resume: str, role: str) -> dict:
    """Compare resume content against required role skills."""
    skills_data = load_skills_data()
    required_skills = skills_data.get(role, [])

    if not required_skills:
        return {
            "match_score": 0,
            "found_skills": [],
            "missing_skills": [],
        }

    cleaned_resume = clean_text(resume)

    found_skills = [skill for skill in required_skills if _skill_exists_in_resume(skill, cleaned_resume)]
    missing_skills = [skill for skill in required_skills if skill not in found_skills]

    match_score = round((len(found_skills) / len(required_skills)) * 100, 2)

    return {
        "match_score": match_score,
        "found_skills": found_skills,
        "missing_skills": missing_skills,
    }
