from io import BytesIO
from typing import List

from docx import Document
from pypdf import PdfReader

from services.skill_engine import analyze_resume_skills
from services.skill_engine import load_skills_data
from utils.text_cleaner import clean_text


def _extract_text_from_txt(file_bytes: bytes) -> str:
    return file_bytes.decode("utf-8", errors="ignore")


def _extract_text_from_pdf(file_bytes: bytes) -> str:
    reader = PdfReader(BytesIO(file_bytes))
    pages = [page.extract_text() or "" for page in reader.pages]
    return "\n".join(pages)


def _extract_text_from_docx(file_bytes: bytes) -> str:
    document = Document(BytesIO(file_bytes))
    return "\n".join(paragraph.text for paragraph in document.paragraphs if paragraph.text)


def extract_resume_text(file_bytes: bytes, extension: str) -> str:
    """Extract plain text from supported resume file types."""
    normalized_extension = extension.lower()

    if normalized_extension == ".txt":
        return _extract_text_from_txt(file_bytes)
    if normalized_extension == ".pdf":
        return _extract_text_from_pdf(file_bytes)
    if normalized_extension == ".docx":
        return _extract_text_from_docx(file_bytes)
    if normalized_extension == ".doc":
        # Legacy .doc is not consistently parseable without external converters.
        return _extract_text_from_txt(file_bytes)

    raise ValueError("Unsupported file type. Please upload .pdf, .doc, .docx, or .txt")


def _find_skills(resume_text: str) -> List[str]:
    normalized_resume = clean_text(resume_text)
    all_skills = sorted({skill for skills in load_skills_data().values() for skill in skills})
    return [skill for skill in all_skills if clean_text(skill) in normalized_resume]


def build_analysis(resume_text: str, prompt: str, role: str = "") -> dict:
    """Generate deterministic AI-style analysis from resume text and prompt."""
    highlighted_skills = _find_skills(resume_text)
    role_result = analyze_resume_skills(resume_text, role) if role else None

    suggestions = [
        "Add quantified achievements for each role.",
        "Highlight project impact with measurable metrics.",
        "Align your summary section with target role keywords."
    ]

    if prompt.strip():
        role_text = f" for the role '{role}'" if role else ""
        jd_text = prompt.strip().lower()
        all_skills = [
            "python","javascript","react","node","sql","aws","docker","kubernetes",
            "machine learning","deep learning","tensorflow","pytorch","java","c++",
            "typescript","mongodb","postgresql","redis","graphql","rest api",
            "git","linux","agile","scrum","figma","excel","tableau","power bi",
            "flask","django","fastapi","next.js","vue","angular","terraform","ci/cd",
            "data analysis","nlp","computer vision","pandas","numpy","scikit-learn",
            "network security","ethical hacking","owasp","siem","cybersecurity",
            "penetration testing","firewall","encryption","vulnerability","swift",
            "kotlin","flutter","react native","firebase","unity","unreal engine",
            "solidity","web3","ethereum","smart contracts","blender","c#","devops",
            "kubernetes","terraform","ansible","jenkins","github actions","azure",
            "gcp","power bi","tableau","user research","prototyping","figma",
            "okrs","scrum","roadmap","product management","data visualization"
        ]
        jd_skills = [s for s in all_skills if s in jd_text]
        resume_lower = resume_text.lower()
        resume_has = [s for s in jd_skills if s in resume_lower]
        resume_missing = [s for s in jd_skills if s not in resume_lower]

        if jd_skills:
            match_pct = int(len(resume_has) / len(jd_skills) * 100) if jd_skills else 0
            analysis = (
                f"Job Description Analysis{role_text}:\n\n"
                f"JD Match Score: {match_pct}%\n"
                f"Skills required by JD: {', '.join(jd_skills) if jd_skills else 'None detected'}\n"
                f"Skills you have: {', '.join(resume_has) if resume_has else 'None matched'}\n"
                f"Skills to add: {', '.join(resume_missing) if resume_missing else 'All covered!'}\n\n"
                f"Tip: Tailor your resume to include these missing skills with real project examples."
            )
            if resume_missing:
                suggestions[:0] = [f"Add '{s}' to your resume with a real project example." for s in resume_missing[:3]]
            # Override role_result with JD-based scores
            role_result = {
                "match_score": match_pct,
                "found_skills": resume_has,
                "missing_skills": resume_missing,
                "role": role,
                "suggestions": suggestions
            }
        else:
            analysis = (
                f"You asked: '{prompt.strip()}'\n\n"
                f"Based on the uploaded resume{role_text}, focus on strengthening role-specific achievements, "
                "explicit tools/technologies, and concise impact statements."
            )
    else:
        analysis = (
            "Your resume analysis is ready. Improve clarity by emphasizing achievements, "
            "including relevant role keywords, and showcasing outcomes for projects and experience."
        )

    if highlighted_skills:
        suggestions = [
            "Add at least one real project bullet per highlighted skill.",
            "Prioritize missing domain tools for your target role.",
            "Include a skills section grouped by domain (frontend/backend/data/cloud)."
        ]

    response = {
        "role": role,
        "analysis": analysis,
        "highlighted_skills": highlighted_skills[:12],
        "suggestions": suggestions
    }

    if role_result is not None:
        response.update(
            {
                "match_score": role_result.get("match_score", 0),
                "found_skills": role_result.get("found_skills", []),
                "missing_skills": role_result.get("missing_skills", []),
                "required_skills": role_result.get("required_skills", []),
                "summary": role_result.get("summary", ""),
            }
        )
    else:
        response.update(
            {
                "match_score": 0,
                "found_skills": [],
                "missing_skills": [],
                "required_skills": [],
                "summary": "",
            }
        )

    return response
