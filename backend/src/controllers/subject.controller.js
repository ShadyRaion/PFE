const fs = require("fs");
const path = require("path");
const prisma = require("../config/prisma");
const { createAuditLog } = require("../services/audit.service");
const { DEPARTMENTS, normalizeDepartment } = require("../utils/department");
const {
  isEducationField,
  getEducationFieldLabel,
} = require("../utils/educationField");

const {
  attachSavedScoresToSubjectsForStudent,
  getSavedScoreForStudentSubject,
  recalculateScoresForSubject,
} = require("../services/recommendation.service");
const { getStudentFacultyEligibility } = require("../services/facultySubject.service");
const {
  getSubjectAssignedPlaces,
  withSubjectPlaces,
  withSubjectPlacesList,
} = require("../services/subjectPlaces.service");
const {
  buildEligibilityWhere,
  checkSubjectEligibility,
  isStudentProfileComplete,
  normalizeSubjectAcademicYearsForInternshipType,
  validateSubjectEligibilityInput,
} = require("../utils/subjectEligibility");

const parseList = (value, fallback = []) => {
  if (value === undefined) return fallback;
  if (Array.isArray(value)) return value;

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);

      if (Array.isArray(parsed)) return parsed;
    } catch {
      return value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }

  return fallback;
};

const parsePlaces = (value) => {
  const places = Number(value);

  if (!Number.isInteger(places) || places < 1) {
    return null;
  }

  return places;
};

const applicationInclude = {
  include: {
    binome: {
      select: {
        student1Id: true,
        student2Id: true,
      },
    },
  },
};

const PROTECTED_ASSIGNMENT_STATUSES = ["AFFECTED", "COMPLETED"];

const hasProtectedAssignedApplication = (subject) => {
  return (subject?.applications || []).some((application) =>
    PROTECTED_ASSIGNMENT_STATUSES.includes(application.status)
  );
};

const assignedSubjectActionMessage =
  "This subject already has an assigned student and cannot be archived or deleted.";

const recalculateSubjectScoresLater = (subjectId, context) => {
  setImmediate(async () => {
    try {
      await recalculateScoresForSubject(subjectId);
    } catch (scoreError) {
      console.error(`${context} score recalculation error:`, scoreError);
    }
  });
};

const getSubjects = async (req, res) => {
  try {
    const isStudent = req.user?.role === "STUDENT";

    if (isStudent && !isStudentProfileComplete(req.user)) {
      res.setHeader("X-Profile-Incomplete", "true");
      return res.status(200).json([]);
    }

    const subjects = await prisma.subject.findMany({
      where: {
        archived: false,
        ...(isStudent ? buildEligibilityWhere(req.user) : {}),
      },
      include: {
        supervisor: {
          select: {
            id: true,
            fullName: true,
            email: true,
            specialty: true,
          },
        },
        documents: {
          orderBy: {
            createdAt: "desc",
          },
        },
        applications: applicationInclude,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (isStudent) {
      try {
        const scoredSubjects = await attachSavedScoresToSubjectsForStudent({
          studentId: req.user.id,
          subjects,
        });

        const subjectsWithEligibility = await Promise.all(
          scoredSubjects.map(async (subject) => ({
            ...withSubjectPlaces(subject),
            facultyApplicationLock: await getStudentFacultyEligibility({
              userId: req.user.id,
              subjectId: subject.id,
            }),
          }))
        );

        return res.status(200).json(subjectsWithEligibility);
      } catch (scoreError) {
        console.error("Subject scoring error:", scoreError);

        const safeSubjects = subjects.map((subject) => ({
          ...withSubjectPlaces(subject),
          score: null,
          matchedSkills: [],
          missingSkills: subject.requiredSkills || [],
          recommendationType: "UNKNOWN",
          binomeId: null,
        }));

        return res.status(200).json(safeSubjects);
      }
    }

    return res.status(200).json(withSubjectPlacesList(subjects));
  } catch (error) {
    console.error("GET /subjects error:", error);

    return res.status(500).json({
      message: error.message || "Erreur lors du chargement des sujets.",
    });
  }
};

const getSubjectById = async (req, res) => {
  try {
    const { id } = req.params;

    const subject = await prisma.subject.findUnique({
      where: {
        id,
      },
      include: {
        supervisor: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        documents: {
          orderBy: {
            createdAt: "desc",
          },
        },
        applications: applicationInclude,
      },
    });

    if (!subject) {
      return res.status(404).json({
        message: "Sujet introuvable.",
      });
    }

    if (req.user?.role === "STUDENT") {
      const eligibility = checkSubjectEligibility(req.user, subject);
      if (eligibility) {
        return res.status(404).json({
          message: "Sujet introuvable.",
        });
      }
    }

    if (req.user?.role === "STUDENT") {
      try {
        const savedScore = await getSavedScoreForStudentSubject({
          studentId: req.user.id,
          subjectId: subject.id,
        });

        return res.status(200).json({
          ...withSubjectPlaces(subject),
          score: savedScore.score ?? null,
          matchedSkills: savedScore.matchedSkills || [],
          missingSkills: savedScore.missingSkills || [],
          recommendationType: savedScore.recommendationType,
          binomeId: savedScore.binomeId,
          cvRequirement: savedScore.cvRequirement || null,
          facultyApplicationLock: await getStudentFacultyEligibility({
            userId: req.user.id,
            subjectId: subject.id,
          }),
        });
      } catch (scoreError) {
        console.error("Subject detail scoring error:", scoreError);

        return res.status(200).json({
          ...withSubjectPlaces(subject),
          score: null,
          matchedSkills: [],
          missingSkills: subject.requiredSkills || [],
          recommendationType: "UNKNOWN",
          binomeId: null,
        });
      }
    }

    return res.status(200).json(withSubjectPlaces(subject));
  } catch (error) {
    console.error("GET /subjects/:id error:", error);

    return res.status(500).json({
      message: error.message || "Erreur lors du chargement du sujet.",
    });
  }
};

const getMySubjects = async (req, res) => {
  try {
    const subjects = await prisma.subject.findMany({
      where: {
        supervisorId: req.user.id,
      },
      include: {
        documents: {
          orderBy: {
            createdAt: "desc",
          },
        },
        applications: applicationInclude,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json(withSubjectPlacesList(subjects));
  } catch (error) {
    console.error("GET /subjects/mine error:", error);

    return res.status(500).json({
      message: error.message || "Erreur lors du chargement de vos sujets.",
    });
  }
};

const createSubject = async (req, res) => {
  try {
    const {
      title,
      description,
      technologies,
      requiredSkills,
      languages,
      duration,
      places,
      educationField,
      internshipType,
      allowedDegreeLevels,
      allowedAcademicYears,
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        message: "Titre et description sont requis.",
      });
    }

    const parsedPlaces = parsePlaces(places);
    if (parsedPlaces === null) {
      return res.status(400).json({
        message: "Please enter a valid number of places.",
      });
    }

    if (!isEducationField(educationField)) {
      return res.status(400).json({
        message: "Please choose an education field for this subject.",
      });
    }

    const eligibility = validateSubjectEligibilityInput(
      { internshipType, allowedDegreeLevels, allowedAcademicYears },
      { requireInternshipType: true }
    );
    if (eligibility.errors.length) {
      return res.status(400).json({ message: eligibility.errors[0] });
    }

    const department =
      normalizeDepartment(req.user.specialty) ||
      getEducationFieldLabel(educationField) ||
      DEPARTMENTS.COMPUTER_SCIENCE;

    const subject = await prisma.subject.create({
      data: {
        title,
        description,
        technologies: parseList(technologies, []),
        requiredSkills: parseList(requiredSkills, []),
        languages: parseList(languages, []),
        duration: duration || "N/A",
        places: parsedPlaces,
        department,
        educationField,
        supervisorId: req.user.id,
        internshipType: eligibility.data.internshipType,
        allowedDegreeLevels: eligibility.data.allowedDegreeLevels || [],
        allowedAcademicYears: eligibility.data.allowedAcademicYears || [],
      },
      include: {
        documents: true,
      },
    });

    recalculateSubjectScoresLater(subject.id, "Subject create");

    await createAuditLog({
      actorId: req.user.id,
      action: "SUBJECT_CREATE",
      entity: "SUBJECT",
      entityId: subject.id,
      details: {
        title: subject.title,
        places: subject.places,
        technologies: subject.technologies,
        requiredSkills: subject.requiredSkills,
        languages: subject.languages,
      },
    });

    return res.status(201).json({
      message: "Sujet créé.",
      subject: withSubjectPlaces(subject),
    });
  } catch (error) {
    console.error("POST /subjects error:", error);

    return res.status(500).json({
      message: error.message || "Erreur lors de la création du sujet.",
    });
  }
};

const updateSubject = async (req, res) => {
  try {
    const { id } = req.params;

    const subject = await prisma.subject.findUnique({
      where: {
        id,
      },
      include: {
        applications: applicationInclude,
      },
    });

    if (!subject) {
      return res.status(404).json({
        message: "Sujet introuvable.",
      });
    }

    if (subject.supervisorId !== req.user.id) {
      return res.status(403).json({
        message: "Accès refusé.",
      });
    }

    const {
      title,
      description,
      technologies,
      requiredSkills,
      languages,
      duration,
      places,
      archived,
      educationField,
      internshipType,
      allowedDegreeLevels,
      allowedAcademicYears,
    } = req.body;

    let nextEducationField = subject.educationField;
    if (educationField !== undefined) {
      if (!isEducationField(educationField)) {
        return res.status(400).json({
          message: "Please choose a valid education field.",
        });
      }
      nextEducationField = educationField;
    }

    const eligibility = validateSubjectEligibilityInput(
      { internshipType, allowedDegreeLevels, allowedAcademicYears },
      { requireInternshipType: false }
    );
    if (eligibility.errors.length) {
      return res.status(400).json({ message: eligibility.errors[0] });
    }

    let nextPlaces = subject.places;
    if (places !== undefined) {
      const parsedPlaces = parsePlaces(places);
      if (parsedPlaces === null) {
        return res.status(400).json({
          message: "Please enter a valid number of places.",
        });
      }

      const assignedPlaces = getSubjectAssignedPlaces(subject);
      if (parsedPlaces < assignedPlaces) {
        return res.status(400).json({
          message: `This subject already has ${assignedPlaces} assigned place(s).`,
        });
      }

      nextPlaces = parsedPlaces;
    }

    const nextInternshipType =
      internshipType !== undefined
        ? eligibility.data.internshipType ?? null
        : subject.internshipType;
    const nextAllowedAcademicYears =
      allowedAcademicYears !== undefined
        ? eligibility.data.allowedAcademicYears || []
        : subject.allowedAcademicYears;
    const academicYearRule =
      normalizeSubjectAcademicYearsForInternshipType({
        internshipType: nextInternshipType,
        allowedAcademicYears: nextAllowedAcademicYears,
      });

    if (academicYearRule.errors.length > 0) {
      return res.status(400).json({
        message: academicYearRule.errors[0],
      });
    }

    const wantsArchive =
      archived !== undefined &&
      (archived === true || archived === "true") &&
      !subject.archived;

    if (wantsArchive && hasProtectedAssignedApplication(subject)) {
      return res.status(400).json({
        message: assignedSubjectActionMessage,
        code: "SUBJECT_HAS_ASSIGNED_STUDENT",
      });
    }

    const updatedSubject = await prisma.subject.update({
      where: {
        id,
      },
      data: {
        title: title ?? subject.title,
        description: description ?? subject.description,
        technologies: parseList(technologies, subject.technologies || []),
        requiredSkills: parseList(requiredSkills, subject.requiredSkills || []),
        languages: parseList(languages, subject.languages || []),
        duration: duration ?? subject.duration,
        places: nextPlaces,
        archived:
          archived !== undefined
            ? archived === true || archived === "true"
            : subject.archived,
        educationField: nextEducationField,
        internshipType: nextInternshipType,
        allowedDegreeLevels:
          allowedDegreeLevels !== undefined
            ? eligibility.data.allowedDegreeLevels || []
            : subject.allowedDegreeLevels,
        allowedAcademicYears: academicYearRule.allowedAcademicYears,
      },
      include: {
        documents: true,
        applications: applicationInclude,
      },
    });

    recalculateSubjectScoresLater(updatedSubject.id, "Subject update");

    await createAuditLog({
      actorId: req.user.id,
      action: "SUBJECT_UPDATE",
      entity: "SUBJECT",
      entityId: updatedSubject.id,
      details: {
        previousTitle: subject.title,
        title: updatedSubject.title,
        archived: updatedSubject.archived,
        places: updatedSubject.places,
      },
    });

    return res.status(200).json({
      message: "Sujet modifié.",
      subject: withSubjectPlaces(updatedSubject),
    });
  } catch (error) {
    console.error("PATCH /subjects/:id error:", error);

    return res.status(500).json({
      message: error.message || "Erreur lors de la modification du sujet.",
    });
  }
};

const archiveSubject = async (req, res) => {
  try {
    const { id } = req.params;

    const subject = await prisma.subject.findUnique({
      where: {
        id,
      },
      include: {
        applications: applicationInclude,
      },
    });

    if (!subject) {
      return res.status(404).json({
        message: "Sujet introuvable.",
      });
    }

    if (subject.supervisorId !== req.user.id) {
      return res.status(403).json({
        message: "Accès refusé.",
      });
    }

    if (hasProtectedAssignedApplication(subject)) {
      return res.status(400).json({
        message: assignedSubjectActionMessage,
        code: "SUBJECT_HAS_ASSIGNED_STUDENT",
      });
    }

    const updatedSubject = await prisma.subject.update({
      where: {
        id,
      },
      data: {
        archived: true,
      },
    });

    await createAuditLog({
      actorId: req.user.id,
      action: "SUBJECT_ARCHIVE",
      entity: "SUBJECT",
      entityId: updatedSubject.id,
      details: {
        title: updatedSubject.title,
      },
    });

    return res.status(200).json({
      message: "Sujet archivé.",
      subject: updatedSubject,
    });
  } catch (error) {
    console.error("PATCH /subjects/:id/archive error:", error);

    return res.status(500).json({
      message: error.message || "Erreur lors de l’archivage.",
    });
  }
};

const unarchiveSubject = async (req, res) => {
  try {
    const { id } = req.params;

    const subject = await prisma.subject.findUnique({
      where: {
        id,
      },
    });

    if (!subject) {
      return res.status(404).json({
        message: "Sujet introuvable.",
      });
    }

    if (subject.supervisorId !== req.user.id) {
      return res.status(403).json({
        message: "Accès refusé.",
      });
    }

    const updatedSubject = await prisma.subject.update({
      where: {
        id,
      },
      data: {
        archived: false,
      },
    });

    recalculateSubjectScoresLater(updatedSubject.id, "Subject unarchive");

    await createAuditLog({
      actorId: req.user.id,
      action: "SUBJECT_UNARCHIVE",
      entity: "SUBJECT",
      entityId: updatedSubject.id,
      details: {
        title: updatedSubject.title,
      },
    });

    return res.status(200).json({
      message: "Sujet restauré.",
      subject: updatedSubject,
    });
  } catch (error) {
    console.error("PATCH /subjects/:id/unarchive error:", error);

    return res.status(500).json({
      message: error.message || "Erreur lors de la restauration.",
    });
  }
};

const deleteSubject = async (req, res) => {
  try {
    const { id } = req.params;

    const subject = await prisma.subject.findUnique({
      where: {
        id,
      },
      include: {
        documents: true,
        applications: applicationInclude,
      },
    });

    if (!subject) {
      return res.status(404).json({
        message: "Sujet introuvable.",
      });
    }

    if (subject.supervisorId !== req.user.id) {
      return res.status(403).json({
        message: "Accès refusé.",
      });
    }

    if (hasProtectedAssignedApplication(subject)) {
      return res.status(400).json({
        message: assignedSubjectActionMessage,
        code: "SUBJECT_HAS_ASSIGNED_STUDENT",
      });
    }

    await prisma.subject.delete({
      where: {
        id,
      },
    });

    await createAuditLog({
      actorId: req.user.id,
      action: "SUBJECT_DELETE",
      entity: "SUBJECT",
      entityId: subject.id,
      details: {
        title: subject.title,
        documentsCount: subject.documents?.length || 0,
      },
    });

    for (const document of subject.documents || []) {
      try {
        const filePath = path.resolve(document.filePath || "");

        if (document.filePath && fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (fileError) {
        console.error("Subject document file delete error:", fileError.message);
      }
    }

    return res.status(200).json({
      message: "Sujet supprimé.",
    });
  } catch (error) {
    console.error("DELETE /subjects/:id error:", error);

    return res.status(500).json({
      message: error.message || "Erreur lors de la suppression.",
    });
  }
};

module.exports = {
  getSubjects,
  getSubjectById,
  getMySubjects,
  createSubject,
  updateSubject,
  archiveSubject,
  unarchiveSubject,
  deleteSubject,
};
