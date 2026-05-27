"""Split CV text into logical sections by header detection."""
import re
from . import parse

SECTION_HEADERS = {
    "skills": ["skills", "competences", "compétences", "technical skills", "hard skills",
               "competences techniques", "compétences techniques", "competences informatiques",
               "tech skills", "stack", "technologies", "technical inventory", "savoir-faire",
               "expertise", "expertises"],
    "soft_skills": ["soft skills", "interpersonal skills", "competences personnelles",
                    "compétences personnelles", "qualites", "qualités", "qualites personnelles"],
    "languages": ["languages", "langues", "spoken languages", "langues parlees", "langues parlées",
                  "foreign languages", "langues etrangeres", "langues étrangères"],
    "experience": ["experience", "expérience", "work experience", "professional experience",
                   "experience professionnelle", "expérience professionnelle", "stages", "stage",
                   "internships", "internship", "employment"],
    "education": ["education", "formation", "academic background", "diplome", "diplôme",
                  "diplomes", "diplômes", "parcours academique", "parcours académique",
                  "etudes", "études"],
    "certifications": ["certifications", "certification", "certificats", "diplomes obtenus",
                       "courses", "cours", "trainings", "formations"],
    "projects": ["projects", "projets", "personal projects", "projets personnels",
                 "academic projects", "projets academiques", "projets académiques"],
    "tools": ["tools", "outils", "software", "logiciels", "outils maitrises", "outils maîtrisés"],
    "summary": ["summary", "profile", "profil", "about", "about me", "resume", "résumé",
                "objective", "objectif", "presentation", "présentation"],
}


def normalize_header(text):
    return parse.normalize_loose(text).strip(" :-–—|")


_ALL_HEADERS = {}
for category, variants in SECTION_HEADERS.items():
    for v in variants:
        _ALL_HEADERS[parse.normalize_loose(v)] = category


def _detect_header(line):
    """Return (category, remainder) if line is a section header, else None."""
    raw = line.strip()
    if not raw or len(raw) > 80:
        return None

    # Inline header: "Skills: React, Node"
    for sep in [":", "：", "|", " - ", " – ", " — ", "\t"]:
        if sep in raw:
            left, right = raw.split(sep, 1)
            left_norm = normalize_header(left)
            if left_norm in _ALL_HEADERS and len(left_norm.split()) <= 5:
                return _ALL_HEADERS[left_norm], right.strip()

    # Standalone header line
    norm = normalize_header(raw)
    if norm in _ALL_HEADERS:
        return _ALL_HEADERS[norm], ""

    # Header followed by inline content separated by 2+ spaces (PDF artifact)
    m = re.match(r"^(.{1,40}?)\s{2,}(.+)$", raw)
    if m:
        left_norm = normalize_header(m.group(1))
        if left_norm in _ALL_HEADERS:
            return _ALL_HEADERS[left_norm], m.group(2).strip()

    return None


def split_sections(text):
    """Return a dict {category: text} aggregating content under each detected header.

    Unknown content lands under 'other'.
    """
    sections = {}
    current = "other"
    buffer = []

    def flush():
        if buffer:
            sections.setdefault(current, [])
            sections[current].append("\n".join(buffer).strip())

    for line in (text or "").splitlines():
        if not line.strip():
            continue
        detected = _detect_header(line)
        if detected:
            flush()
            buffer = []
            current = detected[0]
            if detected[1]:
                buffer.append(detected[1])
        else:
            buffer.append(line)

    flush()

    return {k: "\n".join(v).strip() for k, v in sections.items()}
