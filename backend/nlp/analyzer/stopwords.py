"""Generic-word filter for skill candidates."""
from . import parse

_data = parse.load_json("stopwords.json")
STOPWORDS = set(parse.normalize_loose(w) for w in _data.get("stopwords", []))


def is_stopword(value):
    return parse.normalize_loose(value) in STOPWORDS
