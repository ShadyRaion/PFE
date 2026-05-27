"""Text parsing and normalization helpers."""
import json
import os
import re
import unicodedata

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")


def load_json(name):
    path = os.path.join(DATA_DIR, name)
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return {}


def repair_mojibake(value):
    value = str(value or "")
    if not value:
        return value
    if "Ã" in value or "Â" in value:
        try:
            repaired = value.encode("latin1").decode("utf-8")
            if repaired.count("Ã") + repaired.count("Â") < value.count("Ã") + value.count("Â"):
                return repaired
        except Exception:
            pass
    return value


def remove_accents(value):
    value = repair_mojibake(value)
    normalized = unicodedata.normalize("NFD", value)
    return "".join(ch for ch in normalized if unicodedata.category(ch) != "Mn")


def normalize_loose(value):
    value = remove_accents(str(value or "")).lower()
    value = re.sub(r"[^a-z0-9#+.]+", " ", value)
    value = re.sub(r"\s+", " ", value)
    return value.strip()


def normalize_compact(value):
    value = remove_accents(str(value or "")).lower()
    value = value.replace("#", "sharp").replace("+", "plus").replace(".", "dot")
    return re.sub(r"[^a-z0-9]+", "", value)


def clean_text(text):
    """Collapse whitespace, drop control chars, fix broken lines."""
    text = repair_mojibake(text)
    text = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f]", " ", text)
    lines = []
    for line in text.splitlines():
        line = re.sub(r"[ \t]+", " ", line).strip()
        if line:
            lines.append(line)
    return "\n".join(lines)


def detect_lang_simple(text):
    """Lightweight language sniff (fr / en / mixed / unknown)."""
    t = " " + normalize_loose(text) + " "
    fr_markers = [" competences ", " experience ", " formation ", " stage ", " projet ",
                  " langues ", " diplome ", " universite ", " developpement "]
    en_markers = [" skills ", " experience ", " education ", " projects ", " languages ",
                  " university ", " engineer ", " development "]
    fr = sum(1 for m in fr_markers if m in t)
    en = sum(1 for m in en_markers if m in t)
    if fr and en:
        return "mixed"
    if fr > en:
        return "fr"
    if en > fr:
        return "en"
    return "unknown"
