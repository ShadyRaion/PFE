const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const pdfParseModule = require("pdf-parse");
const mammoth = require("mammoth");

const backendRoot = path.join(__dirname, "../..");
const matcherPath = path.join(backendRoot, "nlp", "matcher.py");
const pythonExecutable = path.join(
  backendRoot,
  "nlp",
  ".venv",
  "Scripts",
  "python.exe"
);

const parsePdf = async (buffer) => {
  if (typeof pdfParseModule === "function") {
    return pdfParseModule(buffer);
  }

  if (typeof pdfParseModule.default === "function") {
    return pdfParseModule.default(buffer);
  }

  if (typeof pdfParseModule.pdfParse === "function") {
    return pdfParseModule.pdfParse(buffer);
  }

  if (typeof pdfParseModule.PDFParse === "function") {
    const parser = new pdfParseModule.PDFParse({ data: buffer });
    const result = await parser.getText();
    await parser.destroy?.();

    return {
      text: result?.text || result || "",
    };
  }

  throw new Error("pdf-parse export format is not supported.");
};

const extractTextFromCV = async (filePath, fileType) => {
  if (!filePath || !fs.existsSync(filePath)) return "";

  if (
    fileType === "application/pdf" ||
    filePath.toLowerCase().endsWith(".pdf")
  ) {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await parsePdf(dataBuffer);
    return data.text || "";
  }

  if (
    fileType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    filePath.toLowerCase().endsWith(".docx")
  ) {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value || "";
  }

  if (fileType === "text/plain" || filePath.toLowerCase().endsWith(".txt")) {
    return fs.readFileSync(filePath, "utf8");
  }

  return "";
};

const PYTHON_TIMEOUT_MS = 30_000;

const runPythonMatcher = (payload) => {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(matcherPath)) {
      return reject(new Error(`Matcher introuvable: ${matcherPath}`));
    }

    const command = fs.existsSync(pythonExecutable)
      ? pythonExecutable
      : "python";

    const child = spawn(command, [matcherPath], {
      cwd: backendRoot,
      env: {
        ...process.env,
        PYTHONIOENCODING: "utf-8",
      },
      stdio: ["pipe", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";
    let settled = false;

    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      try {
        child.kill("SIGKILL");
      } catch {
        // ignore
      }
      reject(new Error("NLP matcher timed out"));
    }, PYTHON_TIMEOUT_MS);

    const finish = (fn, value) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      fn(value);
    };

    child.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    child.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    child.on("error", (error) => {
      finish(reject, error);
    });

    child.on("close", (code) => {
      if (code !== 0) {
        return finish(
          reject,
          new Error(
            stderr ||
              stdout ||
              `Le moteur NLP a échoué avec le code ${code}.`
          )
        );
      }

      try {
        const parsed = JSON.parse(stdout);

        if (parsed.error) {
          return finish(reject, new Error(parsed.error));
        }

        return finish(resolve, parsed);
      } catch (error) {
        return finish(
          reject,
          new Error(
            `Réponse NLP invalide: ${error.message}. Sortie: ${stdout}`
          )
        );
      }
    });

    child.stdin.write(JSON.stringify(payload));
    child.stdin.end();
  });
};

const extractSkillsFromText = async (text = "") => {
  const result = await runPythonMatcher({
    mode: "extract",
    text,
  });

  return result;
};

const extractSkillsFromCV = async (filePath, fileType) => {
  const text = await extractTextFromCV(filePath, fileType);
  const result = await extractSkillsFromText(text);

  return {
    text,
    skills: result.skills || [],
    lowConfidenceSkills: result.lowConfidenceSkills || [],
    sections: result.sections || [],
    extractedData: {
      technicalSkills: result.technicalSkills || [],
      softSkills: result.softSkills || [],
      languages: result.languages || [],
      tools: result.tools || [],
      domainSkills: result.domainSkills || [],
      certifications: result.certifications || [],
      allSkills: result.allSkills || result.skills || [],
      detectedLanguage: result.detectedLanguage || result.language || "unknown",
    },
  };
};

const normalizeCompact = (value) => {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/#/g, "sharp")
    .replace(/\+/g, "plus")
    .replace(/\./g, "dot")
    .replace(/[^a-z0-9]+/g, "");
};

const canonicalizeSkill = (skill) => {
  return String(skill || "").trim();
};

const uniqueSkills = (skills = []) => {
  const seen = new Set();
  const result = [];

  skills.forEach((skill) => {
    const value = canonicalizeSkill(skill);
    const key = normalizeCompact(value);

    if (!value || !key || seen.has(key)) return;

    seen.add(key);
    result.push(value);
  });

  return result;
};

const calculateTextSimilarity = async (a = "", b = "") => {
  const result = await runPythonMatcher({
    mode: "similarity",
    a,
    b,
  });

  return result.semanticScore || 0;
};

const scoreWithNlp = async ({
  cvText = "",
  candidateSkills = [],
  subject = {},
  cv = null,
}) => {
  const payload = {
    mode: "score",
    cvText,
    candidateSkills,
    subject,
  };
  if (cv) payload.cv = cv;

  const result = await runPythonMatcher(payload);

  return {
    score: result.score || 0,
    requiredScore: result.requiredScore || 0,
    technologyScore: result.technologyScore || 0,
    semanticScore: result.semanticScore || 0,
    matchedSkills: result.matchedSkills || [],
    missingSkills: result.missingSkills || [],
    matchedLanguages: result.matchedLanguages || [],
    missingLanguages: result.missingLanguages || [],
    scoreBreakdown: result.scoreBreakdown || null,
    recommendationReason: result.recommendationReason || null,
  };
};

module.exports = {
  extractTextFromCV,
  extractSkillsFromText,
  extractSkillsFromCV,
  calculateTextSimilarity,
  scoreWithNlp,
  normalizeCompact,
  canonicalizeSkill,
  uniqueSkills,
};
