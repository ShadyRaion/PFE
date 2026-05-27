"""Weighted score + breakdown + explanation.

This module is the scoring half of the analyzer. It is intentionally
synonym-aware:

  - Both CV skills and subject required skills are canonicalised via
    normalize.canonicalize() *before* comparison, so "JS" matches
    "JavaScript", "Postgres" matches "PostgreSQL", "Anglais" matches
    "English", etc.
  - Generic words (project, team, internship, ...) are filtered out so a CV
    that only contains buzzwords cannot score highly.
  - Fuzzy matching only applies to non-generic, sufficiently long tokens.
"""
from . import parse, normalize

try:
    from rapidfuzz import fuzz as _fuzz
    HAS_FUZZ = True
except ImportError:
    HAS_FUZZ = False


_STOPWORDS = set(
    parse.normalize_compact(w)
    for w in parse.load_json("stopwords.json").get("stopwords", [])
    if w
)


def _is_generic(value):
    """True for stop-words / generic terms we should never reward."""
    if not value:
        return True
    key = parse.normalize_compact(value)
    if not key or len(key) < 2:
        return True
    return key in _STOPWORDS


def _canon(value):
    """Canonical display form (synonyms applied)."""
    return normalize.canonicalize(value) or str(value or "").strip()


def _term_match(candidate_skills, required_terms):
    """Return (pct, matched, missing) using canonical-form matching.

    Scoring per required term:
      - exact (canonical equal)              -> 1.0
      - fuzzy (rapidfuzz ratio >= 88)        -> 0.7

    Synonym match is rolled into the "exact" tier because by the time we hit
    this function both sides are already canonicalised, so JS == JavaScript
    becomes a true exact match.
    """
    if not required_terms:
        return 0.0, [], []

    canon_candidates = {}
    for raw in candidate_skills:
        if _is_generic(raw):
            continue
        canon = _canon(raw)
        key = parse.normalize_compact(canon)
        if key:
            canon_candidates.setdefault(key, canon)

    matched = []
    missing = []
    total_score = 0.0
    counted = 0

    for term in required_terms:
        if _is_generic(term):
            continue
        counted += 1
        canon_term = _canon(term)
        key = parse.normalize_compact(canon_term)
        if not key:
            continue

        if key in canon_candidates:
            matched.append(canon_term)
            total_score += 1.0
            continue

        if HAS_FUZZ and len(key) >= 4:
            best = 0
            for c_key in canon_candidates:
                if len(c_key) < 4:
                    continue
                score = _fuzz.ratio(key, c_key)
                if score > best:
                    best = score
            if best >= 88:
                matched.append(canon_term)
                total_score += 0.7
                continue

        missing.append(canon_term)

    if counted == 0:
        return 0.0, [], []

    pct = (total_score / counted) * 100.0
    return pct, matched, missing


def _language_match(cv_languages, required_languages):
    """Compare languages with synonym/alias awareness (Anglais ↔ English)."""
    if not required_languages:
        return 0.0, [], []

    cv_keys = set()
    for entry in cv_languages:
        if isinstance(entry, dict):
            name = entry.get("name") or ""
        else:
            name = str(entry or "")
        if not name:
            continue
        cv_keys.add(parse.normalize_compact(_canon(name)))

    matched = []
    missing = []
    for req in required_languages:
        canon = _canon(req)
        if parse.normalize_compact(canon) in cv_keys:
            matched.append(canon)
        else:
            missing.append(canon)

    pct = (len(matched) / len(required_languages)) * 100.0
    return pct, matched, missing


def _build_reason(score, matched, missing, matched_langs, required_count):
    bits = []
    if required_count > 0:
        bits.append(f"{len(matched)} of {required_count} required skills matched")
    if matched_langs:
        bits.append(f"{len(matched_langs)} required language(s) matched")
    if missing:
        sample = ", ".join(missing[:3])
        bits.append(f"missing: {sample}")

    if score >= 75:
        prefix = "Strong match"
    elif score >= 50:
        prefix = "Moderate match"
    elif score >= 25:
        prefix = "Partial match"
    else:
        prefix = "Weak match"

    if not bits:
        return f"{prefix}."
    return f"{prefix}: " + "; ".join(bits) + "."


def score_subject(subject, cv_data):
    """Weighted score with breakdown.

    subject: { requiredSkills, technologies, languages? }
    cv_data: extractedData dict from extract mode (with allSkills, languages, ...)

    Weights:
      55% required-skill match
      15% technology match
      10% domain match
      10% languages (or redistributed to technical if subject has no langs)
      10% soft skills (always; minor contributor)
    """
    required_skills = list(subject.get("requiredSkills", []) or [])
    technologies = list(subject.get("technologies", []) or [])
    req_languages = list(subject.get("languages", []) or [])

    candidate_all = list(cv_data.get("allSkills", []) or [])
    cv_languages = list(cv_data.get("languages", []) or [])
    cv_soft = list(cv_data.get("softSkills", []) or [])
    cv_domain = list(cv_data.get("domainSkills", []) or [])

    req_pct, matched_req, missing_req = _term_match(candidate_all, required_skills)
    tech_pct, matched_tech, missing_tech = _term_match(candidate_all, technologies)
    domain_pct, _, _ = _term_match(candidate_all + cv_domain, required_skills + technologies)
    lang_pct, matched_langs, missing_langs = _language_match(cv_languages, req_languages)

    cv_soft_filtered = [s for s in cv_soft if not _is_generic(s)]
    soft_signal = min(100.0, len(cv_soft_filtered) * 20.0)

    if req_languages:
        w_req, w_tech, w_dom, w_lang, w_soft = 0.55, 0.15, 0.10, 0.10, 0.10
    else:
        w_req, w_tech, w_dom, w_lang, w_soft = 0.65, 0.15, 0.10, 0.0, 0.10

    final = (req_pct * w_req) + (tech_pct * w_tech) + (domain_pct * w_dom) \
        + (lang_pct * w_lang) + (soft_signal * w_soft)
    final = int(round(max(0.0, min(100.0, final))))

    breakdown = {
        "technical": int(round(req_pct * w_req + tech_pct * w_tech)),
        "domain": int(round(domain_pct * w_dom)),
        "languages": int(round(lang_pct * w_lang)),
        "softSkills": int(round(soft_signal * w_soft)),
    }

    reason = _build_reason(
        final,
        normalize.dedupe(matched_req + matched_tech),
        normalize.dedupe(missing_req + missing_tech),
        matched_langs,
        len([t for t in required_skills if not _is_generic(t)]),
    )

    return {
        "score": final,
        "matchedSkills": normalize.dedupe(matched_req + matched_tech),
        "missingSkills": normalize.dedupe(missing_req + missing_tech),
        "matchedLanguages": matched_langs,
        "missingLanguages": missing_langs,
        "scoreBreakdown": breakdown,
        "recommendationReason": reason,
        "requiredScore": int(round(req_pct)),
        "technologyScore": int(round(tech_pct)),
    }
