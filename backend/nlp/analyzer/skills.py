"""Dictionary + fuzzy skill extraction."""
import re
from . import parse, normalize, stopwords

try:
    from rapidfuzz import fuzz as _fuzz
    HAS_FUZZ = True
except ImportError:
    HAS_FUZZ = False

_skills_data = parse.load_json("skills.json")
_soft_data = parse.load_json("soft_skills.json")
_domains_data = parse.load_json("domains.json")

TECHNICAL = _skills_data.get("technical", [])
TOOLS = _skills_data.get("tools", [])
CERTIFICATIONS = _skills_data.get("certifications", [])
SOFT = _soft_data.get("soft_skills", [])
DOMAINS = _domains_data.get("domains", [])


def _has_token(text_loose, token):
    token = parse.normalize_loose(token)
    if not token:
        return False
    pattern = rf"(^|[^a-z0-9]){re.escape(token)}([^a-z0-9]|$)"
    return re.search(pattern, text_loose) is not None


def _find_in_dictionary(text_loose, dictionary):
    found = []
    for entry in dictionary:
        terms = [entry["canonical"]] + entry.get("aliases", [])
        if any(_has_token(text_loose, t) for t in terms):
            found.append(entry["canonical"])
    return normalize.dedupe(found)


def _fuzzy_match(token, dictionary, threshold=88):
    if not HAS_FUZZ or not token or len(token) < 3:
        return None
    token_norm = parse.normalize_loose(token)
    best = None
    best_score = 0
    for entry in dictionary:
        for term in [entry["canonical"]] + entry.get("aliases", []):
            score = _fuzz.ratio(token_norm, parse.normalize_loose(term))
            if score >= threshold and score > best_score:
                best_score = score
                best = entry["canonical"]
    return best


def extract_skills_from_sections(sections_map, full_text):
    """Extract categorized skills.

    Returns dict with: technicalSkills, softSkills, tools, domainSkills,
    certifications, allSkills, lowConfidenceSkills.
    """
    full_loose = parse.normalize_loose(full_text)

    skills_section = sections_map.get("skills", "") + "\n" + sections_map.get("tools", "")
    soft_section = sections_map.get("soft_skills", "")

    skills_loose = parse.normalize_loose(skills_section) if skills_section.strip() else full_loose
    soft_loose = parse.normalize_loose(soft_section) if soft_section.strip() else full_loose

    technical = _find_in_dictionary(skills_loose, TECHNICAL)
    if not skills_section.strip():
        # Fall back to whole-CV scan if no dedicated section
        technical = _find_in_dictionary(full_loose, TECHNICAL)

    tools = _find_in_dictionary(full_loose, TOOLS)
    soft = _find_in_dictionary(soft_loose, SOFT)
    if not soft_section.strip():
        soft = _find_in_dictionary(full_loose, SOFT)

    domain = _find_in_dictionary(full_loose, DOMAINS)
    certs = _find_in_dictionary(full_loose, CERTIFICATIONS)

    # Fuzzy pass over tokens from skills section (catch typos like "Postgre SQL")
    low_confidence = []
    if HAS_FUZZ and skills_section.strip():
        chunks = re.split(r"[,;\n|/•·]+", skills_section)
        for chunk in chunks:
            cand = chunk.strip(" :-–—|•\t")
            if not cand or len(cand) > 30 or stopwords.is_stopword(cand):
                continue
            cand_norm = parse.normalize_compact(cand)
            if any(parse.normalize_compact(s) == cand_norm for s in technical + tools):
                continue
            match = _fuzzy_match(cand, TECHNICAL + TOOLS)
            if match:
                low_confidence.append({"raw": cand, "matched": match})
                if match not in technical and not any(t["canonical"] == match for t in TOOLS if t["canonical"] == match):
                    technical.append(match)

    all_skills = normalize.dedupe(technical + tools + soft + domain + certs)

    return {
        "technicalSkills": technical,
        "softSkills": soft,
        "tools": tools,
        "domainSkills": domain,
        "certifications": certs,
        "allSkills": all_skills,
        "lowConfidenceSkills": low_confidence,
    }
