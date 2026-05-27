"""Language + CEFR-level extraction.

Strategy: locate every language alias first, then look for a level token only
within the bounded window that ends at the next language's position. This
prevents one language from picking up the next language's level
(e.g. "English (Fluent), French (Native)" mis-tagging English as Native).
"""
import re
from . import parse

_data = parse.load_json("languages.json")
LANGUAGES = _data.get("languages", [])
LEVELS = _data.get("levels", {})
CEFR_MAP = _data.get("cefr_map", {})

# Pre-compile level patterns: list of (canonical_level, regex). Longer aliases
# first so "upper intermediate" matches before "intermediate".
_LEVEL_PATTERNS = []
for level_name, aliases in LEVELS.items():
    for alias in aliases:
        alias_norm = parse.normalize_loose(alias)
        if not alias_norm:
            continue
        _LEVEL_PATTERNS.append((
            level_name,
            alias_norm,
            re.compile(rf"(^|[^a-z0-9]){re.escape(alias_norm)}([^a-z0-9]|$)"),
        ))
_LEVEL_PATTERNS.sort(key=lambda x: -len(x[1]))


def _find_level_in(window):
    """Return the canonical level name found in `window`, or None."""
    if not window:
        return None
    for level_name, _alias, pattern in _LEVEL_PATTERNS:
        if pattern.search(window):
            return level_name
    return None


def _find_all_language_hits(source_loose):
    """Return list of (canonical, start, end) for every language alias hit,
    keeping at most one hit per canonical language (the earliest one)."""
    hits = []
    seen = set()
    for entry in LANGUAGES:
        canonical = entry["canonical"]
        if canonical in seen:
            continue
        best = None
        for alias in [canonical] + entry.get("aliases", []):
            alias_norm = parse.normalize_loose(alias)
            if not alias_norm:
                continue
            pattern = re.compile(
                rf"(^|[^a-z0-9])({re.escape(alias_norm)})([^a-z0-9]|$)"
            )
            m = pattern.search(source_loose)
            if not m:
                continue
            start, end = m.start(2), m.end(2)
            if best is None or start < best[0]:
                best = (start, end)
        if best is not None:
            hits.append((canonical, best[0], best[1]))
            seen.add(canonical)
    hits.sort(key=lambda h: h[1])
    return hits


def extract_languages(sections_map, full_text):
    """Return [{name, level}] for languages detected.

    For each language we look for a level only in a small window starting just
    after the language token and ending **before the next detected language**
    (or 60 chars later, whichever is smaller). A parenthesised level
    immediately after the language wins over the looser scan.
    """
    lang_section = sections_map.get("languages", "")
    source = lang_section if lang_section.strip() else full_text
    source_loose = parse.normalize_loose(source)

    hits = _find_all_language_hits(source_loose)
    if not hits:
        return []

    results = []
    for idx, (canonical, _start, end) in enumerate(hits):
        next_start = hits[idx + 1][1] if idx + 1 < len(hits) else len(source_loose)
        max_end = min(end + 60, next_start)

        level = None

        paren = re.match(r"\s*\(([^)]{1,40})\)", source_loose[end:max_end])
        if paren:
            level = _find_level_in(paren.group(1))

        if not level:
            window = source_loose[end:max_end]
            level = _find_level_in(window)

        if not level and idx == 0:
            before_start = max(0, _start - 30)
            level = _find_level_in(source_loose[before_start:_start])

        results.append({"name": canonical, "level": level or "Unknown"})

    return results
