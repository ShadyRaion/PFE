"""CV analyzer package: extract structured data and score matches.

Modules:
  parse        – text normalization helpers
  sections     – split CV text by section header
  skills       – dictionary + fuzzy skill extraction
  languages    – language + CEFR-level extraction
  normalize    – synonym canonicalization + dedupe
  stopwords    – generic-word filter
  matching     – weighted score + breakdown + explanation

All modules degrade gracefully if optional deps (rapidfuzz, langdetect, pdfminer)
are missing.
"""

from . import parse, sections, skills, languages, normalize, stopwords, matching

__all__ = [
    "parse",
    "sections",
    "skills",
    "languages",
    "normalize",
    "stopwords",
    "matching",
]
