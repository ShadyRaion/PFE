const prisma = require("../config/prisma");
const {
  buildEligibilityWhere,
  isStudentProfileComplete,
} = require("../utils/subjectEligibility");

const {
  normalizeCompact,
  uniqueSkills,
  scoreWithNlp,
} = require("./cvParser.service");

const normalizeSkill = (skill) => {
  return normalizeCompact(skill);
};

const displaySkill = (skill) => {
  return String(skill || "").trim();
};

const parseSkillValue = (value) => {
  if (!value) return [];

  if (Array.isArray(value)) {
    return uniqueSkills(
      value.flatMap((item) => {
        if (typeof item === "string") return [item];

        if (item && typeof item === "object") {
          return [
            item.name,
            item.skill,
            item.label,
            item.value,
            item.technology,
          ].filter(Boolean);
        }

        return [];
      })
    );
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);

      if (Array.isArray(parsed)) return parseSkillValue(parsed);
    } catch {
      // normal parsing below
    }

    return uniqueSkills(
      value
        .split(/[,;\n|]+/)
        .map(displaySkill)
        .filter(Boolean)
    );
  }

  return [];
};

const uniqueNormalized = (values = []) => {
  return uniqueSkills(values);
};

const getLatestCV = async (userId) => {
  return prisma.cV.findFirst({
    where: {
      userId,
    },
    orderBy: {
      uploadedAt: "desc",
    },
  });
};

const getCvSkills = async (userId) => {
  const cv = await getLatestCV(userId);

  if (!cv) return [];

  return parseSkillValue(cv.extractedSkills);
};

const getStudentSkills = async (userId) => {
  return uniqueSkills(await getCvSkills(userId));
};

const getActiveBinome = async (userId) => {
  return prisma.binome.findFirst({
    where: {
      status: "ACCEPTED",
      OR: [{ student1Id: userId }, { student2Id: userId }],
    },
  });
};

const getBinomeSkills = async (binomeId) => {
  const binome = await prisma.binome.findUnique({
    where: {
      id: binomeId,
    },
  });

  if (!binome) return [];

  const student1Skills = await getStudentSkills(binome.student1Id);
  const student2Skills = await getStudentSkills(binome.student2Id);

  return uniqueSkills([...student1Skills, ...student2Skills]);
};

const getBinomeStudentSkills = async (binomeId) => {
  const binome = await prisma.binome.findUnique({
    where: {
      id: binomeId,
    },
  });

  if (!binome) {
    return {
      student1Skills: [],
      student2Skills: [],
    };
  }

  const [student1Skills, student2Skills] = await Promise.all([
    getStudentSkills(binome.student1Id),
    getStudentSkills(binome.student2Id),
  ]);

  return {
    student1Skills,
    student2Skills,
  };
};

const getBinomeLatestCvDate = async (binomeId) => {
  const binome = await prisma.binome.findUnique({
    where: {
      id: binomeId,
    },
  });

  if (!binome) return null;

  const [student1CV, student2CV] = await Promise.all([
    getLatestCV(binome.student1Id),
    getLatestCV(binome.student2Id),
  ]);

  const dates = [student1CV?.uploadedAt, student2CV?.uploadedAt].filter(Boolean);

  if (dates.length === 0) return null;

  return new Date(Math.max(...dates.map((date) => new Date(date).getTime())));
};

const getSubjectMatchTerms = (subject) => {
  const requiredSkills = parseSkillValue(subject.requiredSkills || []);
  const technologies = parseSkillValue(subject.technologies || []);

  return {
    requiredSkills,
    technologies,
  };
};

const calculateTermMatch = ({ candidateSkills = [], terms = [] }) => {
  const candidateKeys = new Set(
    uniqueSkills(candidateSkills).map((skill) => normalizeSkill(skill))
  );

  const originalTerms = uniqueSkills(terms);

  if (originalTerms.length === 0) {
    return {
      percentage: 0,
      matchedTerms: [],
      missingTerms: [],
    };
  }

  const matchedTerms = [];
  const missingTerms = [];

  for (const term of originalTerms) {
    const normalizedTerm = normalizeSkill(term);

    if (candidateKeys.has(normalizedTerm)) {
      matchedTerms.push(term);
    } else {
      missingTerms.push(term);
    }
  }

  return {
    percentage: Math.round((matchedTerms.length / originalTerms.length) * 100),
    matchedTerms,
    missingTerms,
  };
};

const calculateBinomeTermMatch = ({
  student1Skills = [],
  student2Skills = [],
  terms = [],
}) => {
  const studentSkillSets = [student1Skills, student2Skills].map(
    (skills) =>
      new Set(uniqueSkills(skills).map((skill) => normalizeSkill(skill)))
  );

  const originalTerms = uniqueSkills(terms);

  if (originalTerms.length === 0) {
    return {
      percentage: 0,
      matchedTerms: [],
      missingTerms: [],
    };
  }

  let totalMatchUnits = 0;
  const matchedTerms = [];
  const missingTerms = [];

  for (const term of originalTerms) {
    const normalizedTerm = normalizeSkill(term);

    const matchedStudentCount = studentSkillSets.filter((skills) =>
      skills.has(normalizedTerm)
    ).length;

    totalMatchUnits += matchedStudentCount / studentSkillSets.length;

    if (matchedStudentCount > 0) {
      matchedTerms.push(term);
    } else {
      missingTerms.push(term);
    }
  }

  return {
    percentage: Math.round((totalMatchUnits / originalTerms.length) * 100),
    matchedTerms,
    missingTerms,
  };
};

const calculateScoreFromSkills = ({
  candidateSkills = [],
  requiredSkills = [],
  technologies = [],
}) => {
  const requiredMatch = calculateTermMatch({
    candidateSkills,
    terms: requiredSkills,
  });

  const technologyMatch = calculateTermMatch({
    candidateSkills,
    terms: technologies,
  });

  let score = 0;

  if (requiredSkills.length > 0) {
    score = requiredMatch.percentage;
  } else if (technologies.length > 0) {
    score = technologyMatch.percentage;
  }

  const matchedSkills = uniqueSkills([
    ...requiredMatch.matchedTerms,
    ...technologyMatch.matchedTerms,
  ]);

  const missingSkills = uniqueSkills([
    ...requiredMatch.missingTerms,
    ...technologyMatch.missingTerms,
  ]);

  return {
    score,
    matchedSkills,
    missingSkills,
    requiredScore: requiredMatch.percentage,
    technologyScore: technologyMatch.percentage,
    semanticScore: 0,
  };
};

const calculateBinomeScoreFromStudentSkills = ({
  student1Skills = [],
  student2Skills = [],
  requiredSkills = [],
  technologies = [],
}) => {
  const requiredMatch = calculateBinomeTermMatch({
    student1Skills,
    student2Skills,
    terms: requiredSkills,
  });

  const technologyMatch = calculateBinomeTermMatch({
    student1Skills,
    student2Skills,
    terms: technologies,
  });

  let score = 0;

  if (requiredSkills.length > 0) {
    score = requiredMatch.percentage;
  } else if (technologies.length > 0) {
    score = technologyMatch.percentage;
  }

  const matchedSkills = uniqueSkills([
    ...requiredMatch.matchedTerms,
    ...technologyMatch.matchedTerms,
  ]);

  const missingSkills = uniqueSkills([
    ...requiredMatch.missingTerms,
    ...technologyMatch.missingTerms,
  ]);

  return {
    score,
    matchedSkills,
    missingSkills,
    requiredScore: requiredMatch.percentage,
    technologyScore: technologyMatch.percentage,
    semanticScore: 0,
  };
};

const getCvExtractedData = async (userId) => {
  const cv = await getLatestCV(userId);
  if (!cv) return null;

  const data = cv.extractedData;
  if (data && typeof data === "object" && Array.isArray(data.allSkills) && data.allSkills.length > 0) {
    return data;
  }

  // Back-compat fallback: build minimal extractedData from extractedSkills
  const skills = parseSkillValue(cv.extractedSkills);
  if (skills.length === 0) return null;

  return {
    technicalSkills: skills,
    softSkills: [],
    languages: [],
    tools: [],
    domainSkills: [],
    certifications: [],
    allSkills: skills,
    detectedLanguage: "unknown",
  };
};

const calculateStudentSubjectScore = async ({ studentId, subject }) => {
  const candidateSkills = await getStudentSkills(studentId);
  const { requiredSkills, technologies } = getSubjectMatchTerms(subject);

  // Try Python weighted scoring with extractedData
  try {
    const cvData = await getCvExtractedData(studentId);
    if (cvData) {
      const nlp = await scoreWithNlp({
        cvText: "",
        candidateSkills,
        subject: {
          requiredSkills,
          technologies,
          languages: Array.isArray(subject.languages) ? subject.languages : [],
        },
        cv: cvData,
      });
      return {
        score: nlp.score,
        matchedSkills: nlp.matchedSkills,
        missingSkills: nlp.missingSkills,
        matchedLanguages: nlp.matchedLanguages || [],
        scoreBreakdown: nlp.scoreBreakdown || null,
        recommendationReason: nlp.recommendationReason || null,
        requiredScore: nlp.requiredScore,
        technologyScore: nlp.technologyScore,
        semanticScore: nlp.semanticScore,
      };
    }
  } catch (error) {
    console.error("Python scoring failed, falling back to Node:", error.message);
  }

  return calculateScoreFromSkills({
    candidateSkills,
    requiredSkills,
    technologies,
  });
};

const calculateBinomeSubjectScore = async ({ binomeId, subject }) => {
  const { student1Skills, student2Skills } = await getBinomeStudentSkills(
    binomeId
  );

  const { requiredSkills, technologies } = getSubjectMatchTerms(subject);

  return calculateBinomeScoreFromStudentSkills({
    student1Skills,
    student2Skills,
    requiredSkills,
    technologies,
  });
};

const upsertStudentRecommendationScore = async ({ studentId, subject }) => {
  const result = await calculateStudentSubjectScore({
    studentId,
    subject,
  });

  const persisted = {
    score: result.score,
    matchedSkills: result.matchedSkills,
    missingSkills: result.missingSkills,
    matchedLanguages: result.matchedLanguages || [],
    scoreBreakdown: result.scoreBreakdown || null,
    recommendationReason: result.recommendationReason || null,
  };

  return prisma.recommendationScore.upsert({
    where: {
      studentId_subjectId: {
        studentId,
        subjectId: subject.id,
      },
    },
    update: persisted,
    create: {
      studentId,
      subjectId: subject.id,
      ...persisted,
    },
  });
};

const upsertBinomeRecommendationScore = async ({ binomeId, subject }) => {
  const result = await calculateBinomeSubjectScore({
    binomeId,
    subject,
  });

  return prisma.recommendationScore.upsert({
    where: {
      binomeId_subjectId: {
        binomeId,
        subjectId: subject.id,
      },
    },
    update: {
      score: result.score,
      matchedSkills: result.matchedSkills,
      missingSkills: result.missingSkills,
    },
    create: {
      binomeId,
      subjectId: subject.id,
      score: result.score,
      matchedSkills: result.matchedSkills,
      missingSkills: result.missingSkills,
    },
  });
};

const isScoreStale = ({ score, subject, latestCvDate }) => {
  if (!score) return true;

  const scoreUpdatedAt = new Date(score.updatedAt).getTime();
  const subjectUpdatedAt = new Date(subject.updatedAt).getTime();
  const cvUploadedAt = latestCvDate ? new Date(latestCvDate).getTime() : 0;

  if (subjectUpdatedAt > scoreUpdatedAt) return true;
  if (cvUploadedAt > scoreUpdatedAt) return true;

  return false;
};

const ensureStudentScoreFresh = async ({ studentId, subject }) => {
  const latestCV = await getLatestCV(studentId);

  const existingScore = await prisma.recommendationScore.findUnique({
    where: {
      studentId_subjectId: {
        studentId,
        subjectId: subject.id,
      },
    },
  });

  if (
    isScoreStale({
      score: existingScore,
      subject,
      latestCvDate: latestCV?.uploadedAt,
    })
  ) {
    return upsertStudentRecommendationScore({
      studentId,
      subject,
    });
  }

  return existingScore;
};

const ensureBinomeScoreFresh = async ({ binomeId, subject }) => {
  const latestCvDate = await getBinomeLatestCvDate(binomeId);

  const existingScore = await prisma.recommendationScore.findUnique({
    where: {
      binomeId_subjectId: {
        binomeId,
        subjectId: subject.id,
      },
    },
  });

  if (
    isScoreStale({
      score: existingScore,
      subject,
      latestCvDate,
    })
  ) {
    return upsertBinomeRecommendationScore({
      binomeId,
      subject,
    });
  }

  return existingScore;
};

const recalculateScoresForStudent = async (studentId) => {
  const student = await prisma.user.findUnique({
    where: { id: studentId },
    select: {
      educationField: true,
      degreeLevel: true,
      academicYear: true,
      internshipType: true,
    },
  });

  if (!isStudentProfileComplete(student)) {
    return;
  }

  const subjects = await prisma.subject.findMany({
    where: {
      archived: false,
      ...buildEligibilityWhere(student),
    },
  });

  for (const subject of subjects) {
    await upsertStudentRecommendationScore({
      studentId,
      subject,
    });
  }

  const activeBinomes = await prisma.binome.findMany({
    where: {
      status: "ACCEPTED",
      OR: [{ student1Id: studentId }, { student2Id: studentId }],
    },
  });

  for (const binome of activeBinomes) {
    for (const subject of subjects) {
      await upsertBinomeRecommendationScore({
        binomeId: binome.id,
        subject,
      });
    }
  }
};

const recalculateScoresForSubject = async (subjectId) => {
  const subject = await prisma.subject.findUnique({
    where: {
      id: subjectId,
    },
  });

  if (!subject || subject.archived) return;

  const students = await prisma.user.findMany({
    where: {
      role: "STUDENT",
    },
    select: {
      id: true,
    },
  });

  for (const student of students) {
    await upsertStudentRecommendationScore({
      studentId: student.id,
      subject,
    });
  }

  const binomes = await prisma.binome.findMany({
    where: {
      status: "ACCEPTED",
    },
    select: {
      id: true,
    },
  });

  for (const binome of binomes) {
    await upsertBinomeRecommendationScore({
      binomeId: binome.id,
      subject,
    });
  }
};

const getSavedScoreForStudentSubject = async ({ studentId, subjectId }) => {
  const subject = await prisma.subject.findUnique({
    where: {
      id: subjectId,
    },
  });

  if (!subject) {
    return {
      score: 0,
      matchedSkills: [],
      missingSkills: [],
      recommendationType: "MONOME",
      binomeId: null,
    };
  }

  const activeBinome = await getActiveBinome(studentId);

  if (activeBinome) {
    const binomeScore = await ensureBinomeScoreFresh({
      binomeId: activeBinome.id,
      subject,
    });

    return {
      ...binomeScore,
      score: binomeScore?.score || 0,
      matchedSkills: binomeScore?.matchedSkills || [],
      missingSkills: binomeScore?.missingSkills || [],
      recommendationType: "BINOME",
      binomeId: activeBinome.id,
    };
  }

  const studentScore = await ensureStudentScoreFresh({
    studentId,
    subject,
  });

  return {
    ...studentScore,
    score: studentScore?.score || 0,
    matchedSkills: studentScore?.matchedSkills || [],
    missingSkills: studentScore?.missingSkills || [],
    recommendationType: "MONOME",
    binomeId: null,
  };
};

const attachSavedScoresToSubjectsForStudent = async ({ studentId, subjects }) => {
  const activeBinome = await getActiveBinome(studentId);

  const result = [];

  for (const subject of subjects) {
    const score = activeBinome
      ? await ensureBinomeScoreFresh({
          binomeId: activeBinome.id,
          subject,
        })
      : await ensureStudentScoreFresh({
          studentId,
          subject,
        });

    result.push({
      ...subject,
      score: score?.score || 0,
      matchedSkills: score?.matchedSkills || [],
      missingSkills: score?.missingSkills || [],
      matchedLanguages: score?.matchedLanguages || [],
      scoreBreakdown: score?.scoreBreakdown || null,
      recommendationReason: score?.recommendationReason || null,
      recommendationType: activeBinome ? "BINOME" : "MONOME",
      binomeId: activeBinome?.id || null,
    });
  }

  return result;
};

const attachSavedScoreToApplication = async (application) => {
  if (!application) return application;

  let score = null;

  if (application.binomeId && application.subject) {
    score = await ensureBinomeScoreFresh({
      binomeId: application.binomeId,
      subject: application.subject,
    });
  } else if (application.studentId && application.subject) {
    score = await ensureStudentScoreFresh({
      studentId: application.studentId,
      subject: application.subject,
    });
  } else if (application.binomeId) {
    score = await prisma.recommendationScore.findUnique({
      where: {
        binomeId_subjectId: {
          binomeId: application.binomeId,
          subjectId: application.subjectId,
        },
      },
    });
  } else if (application.studentId) {
    score = await prisma.recommendationScore.findUnique({
      where: {
        studentId_subjectId: {
          studentId: application.studentId,
          subjectId: application.subjectId,
        },
      },
    });
  }

  return {
    ...application,
    score: score?.score || 0,
    matchedSkills: score?.matchedSkills || [],
    missingSkills: score?.missingSkills || [],
  };
};

const attachSavedScoresToApplications = async (applications = []) => {
  const result = [];

  for (const application of applications) {
    result.push(await attachSavedScoreToApplication(application));
  }

  return result;
};

module.exports = {
  normalizeSkill,
  parseSkillValue,
  uniqueNormalized,
  getCvSkills,
  getStudentSkills,
  getActiveBinome,
  getBinomeSkills,
  getBinomeStudentSkills,
  calculateScoreFromSkills,
  calculateBinomeScoreFromStudentSkills,
  calculateStudentSubjectScore,
  calculateBinomeSubjectScore,
  upsertStudentRecommendationScore,
  upsertBinomeRecommendationScore,
  ensureStudentScoreFresh,
  ensureBinomeScoreFresh,
  recalculateScoresForStudent,
  recalculateScoresForSubject,
  getSavedScoreForStudentSubject,
  attachSavedScoresToSubjectsForStudent,
  attachSavedScoreToApplication,
  attachSavedScoresToApplications,
};