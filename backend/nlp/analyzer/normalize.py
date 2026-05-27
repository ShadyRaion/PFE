"""Canonical-name lookup, synonym mapping, and dedupe."""
from . import parse

_SYN = parse.load_json("synonyms.json").get("synonyms", {})
_SYN_NORM = {parse.normalize_compact(k): v for k, v in _SYN.items()}


def canonicalize(value, dictionaries=None):
    """Return canonical form of a skill if found in dictionaries/synonyms, else trimmed input."""
    raw = str(value or "").strip()
    if not raw:
        return ""

    key = parse.normalize_compact(raw)
    if not key:
        return raw

    if key in _SYN_NORM:
        return _SYN_NORM[key]

    if dictionaries:
        for entry in dictionaries:
            terms = [entry["canonical"]] + entry.get("aliases", [])
            for term in terms:
                if parse.normalize_compact(term) == key:
                    return entry["canonical"]

    return raw


def dedupe(values):
    seen = set()
    out = []
    for v in values:
        v = (v or "").strip()
        k = parse.normalize_compact(v)
        if not v or not k or k in seen:
            continue
        seen.add(k)
        out.append(v)
    return out
