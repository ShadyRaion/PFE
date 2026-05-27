"""Smoke tests for analyzer pipeline.

Run from backend/ with:
  python nlp/tests/run_smoke.py
"""
import json
import os
import subprocess
import sys

BACKEND = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
MATCHER = os.path.join(BACKEND, "nlp", "matcher.py")


def run_extract(text):
    proc = subprocess.run(
        [sys.executable, MATCHER],
        input=json.dumps({"mode": "extract", "text": text}),
        capture_output=True,
        text=True,
        cwd=BACKEND,
        encoding="utf-8",
        timeout=60,
    )
    if proc.returncode != 0:
        raise RuntimeError(f"matcher failed: {proc.stderr}")
    return json.loads(proc.stdout)


FIXTURES = {
    "it": "Skills: Python, React, Node.js, PostgreSQL, Docker\nLanguages: English (Fluent), French (Native)",
    "finance": (
        "Profile: Junior Financial Analyst\n"
        "Skills: Financial Analysis, Accounting, Microsoft Excel, Power BI, Risk Management\n"
        "Certifications: CFA Level 1\n"
        "Languages: English (B2), French (Native)"
    ),
    "marketing": (
        "Skills: Digital Marketing, SEO, Social Media Marketing, Google Analytics, Canva\n"
        "Soft skills: Communication, Creativity\n"
        "Languages: English (Fluent), Spanish (B1)"
    ),
    "hr": (
        "Competences: Recrutement, Paie, Formation, Gestion des conflits, Microsoft Office\n"
        "Langues: Francais (maternelle), Anglais (courant)"
    ),
    "french_it": (
        "Competences: Python, React, Base de donnees PostgreSQL\n"
        "Langues: Francais (courant), Anglais (B2)"
    ),
    "language_heavy": "Languages: English (C2), French (B2), Arabic (Native), German (A2)",
    "weak": "Worked on stuff. Did things. Was an intern.",
    "empty": "",
}


def assert_true(cond, msg):
    if not cond:
        print(f"  FAIL: {msg}")
        return False
    print(f"  ok: {msg}")
    return True


def main():
    all_ok = True

    for name, text in FIXTURES.items():
        print(f"\n[{name}]")
        try:
            result = run_extract(text)
        except Exception as e:
            print(f"  FAIL: extractor raised: {e}")
            all_ok = False
            continue

        if name == "empty":
            ok = assert_true(isinstance(result.get("allSkills"), list) and len(result["allSkills"]) == 0,
                             "empty CV -> allSkills empty")
            all_ok = all_ok and ok
            continue

        ok = assert_true(isinstance(result.get("allSkills"), list)
                         and (len(result["allSkills"]) > 0
                              or name in {"weak", "language_heavy"}),
                         "non-empty CV -> allSkills populated (or language-only/weak fixture)")
        all_ok = all_ok and ok

        if name == "french_it":
            langs = [l.get("name") for l in result.get("languages", [])]
            ok = assert_true("French" in langs, "french_it -> detects French")
            all_ok = all_ok and ok

        if name == "finance":
            ok = assert_true(len(result.get("domainSkills", [])) >= 1,
                             "finance -> at least 1 domainSkill")
            all_ok = all_ok and ok

        if name == "hr":
            ok = assert_true(any("RH" in d or "Human Resources" in d or "Recruitment" in d or "Payroll" in d
                                 for d in result.get("domainSkills", [])),
                             "hr -> HR domain skills detected")
            all_ok = all_ok and ok

        if name == "language_heavy":
            ok = assert_true(len(result.get("languages", [])) >= 3,
                             "language_heavy -> >=3 languages")
            all_ok = all_ok and ok

    print()
    if all_ok:
        print("All smoke tests passed.")
        return 0
    print("Some smoke tests failed.")
    return 1


if __name__ == "__main__":
    sys.exit(main())
