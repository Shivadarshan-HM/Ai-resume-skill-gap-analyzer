import re


STOP_WORDS = {
    "the",
    "and",
    "or",
    "with",
    "for",
    "a",
    "an",
    "to",
    "of",
    "in",
    "on",
    "at",
    "by",
    "from",
    "is",
    "are",
}


def clean_text(text: str) -> str:
    """Normalize text so matching logic is consistent."""
    normalized = (text or "").lower()
    normalized = re.sub(r"[^a-z0-9+\s#.-]", " ", normalized)
    normalized = re.sub(r"\s+", " ", normalized).strip()
    return normalized


def tokenize_text(text: str) -> list[str]:
    """Split cleaned text into tokens and drop common stop words."""
    cleaned = clean_text(text)
    tokens = [token for token in cleaned.split(" ") if token and token not in STOP_WORDS]
    return tokens
