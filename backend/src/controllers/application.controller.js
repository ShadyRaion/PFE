const prisma = require("../config/prisma");
const { createNotification } = require("../services/notification.service");
const { createAuditLog } = require("../services/audit.service");
const { cleanupInactiveConversations } = require("../services/conversationCleanup.service");
const {
  createActionPageAlert,
  resolveInfoAlerts,
} = require("../services/pageAlert.service");

const {
  getActiveBinome,
  getSavedScoreForStudentSubject,
  attachSavedScoresToApplications,
  recalculateScoresForStudent,
} = require("../services/recommendation.service");
const {
  uniqueFaculties,
  findAffectedApplicationForFaculties,
} = require("../services/facultySubject.service");
const { checkSubjectEligibility } = require("../utils/subjectEligibility");

const MIN_APPLICATION_SCORE = 60;
const ACTIVE_APPLICATION_STATUSES = ["PENDING", "AFFECTED", "APPROVED"];

const getUserAffectedApplication = async (userId) => {
  return prisma.application.findFirst({
    where: {
      status: "AFFECTED",
      OR: [
        {
          studentId: userId,
        },
        {
          binome: {
            OR: [
              {
                student1Id: userId,
              },
              {
                student2Id: userId,
              },
            ],
          },
        },
      ],
    },
  });
};

const getMyApplications = async (req, res) => {
  try {
    await resolveInfoAlerts({
      userId: req.user.id,
      pageKey: "applications",
    });

    const applications = await prisma.application.findMany({
      where: {
        OR: [
          {
            studentId: req.user.id,
          },
          {
            binome: {
              OR: [
                {
                  student1Id: req.user.id,
                },
                {
                  student2Id: req.user.id,
                },
              ],
            },
          },
        ],
      },
      include: {
        subject: {
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
          },
        },
        student: true,
        binome: {
          include: {
            student1: true,
            student2: true,
          },
        },
        conversation: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const scoredApplications = await attachSavedScoresToApplications(
      applications
    );

    return res.status(200).json(scoredApplications);
  } catch (error) {
    console.error("GET /applications/me error:", error);

    return res.status(500).json({
      message: error.message || "Erreur lors du chargement des candidatures.",
    });
  }
};

const getStudentDashboardSummary = async (req, res) => {
  try {
    const [applications, notifications, cv, binome, conversations] =
      await Promise.all([
        prisma.application.findMany({
          where: {
            OR: [
              {
                studentId: req.user.id,
              },
              {
                binome: {
                  OR: [
                    {
                      student1Id: req.user.id,
                    },
                    {
                      student2Id: req.user.id,
                    },
                  ],
                },
              },
            ],
          },
          include: {
            subject: {
              include: {
                supervisor: {
                  select: {
                    id: true,
                    fullName: true,
                    email: true,
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        }),
        prisma.notification.findMany({
          where: {
            recipientId: req.user.id,
          },
          orderBy: {
            createdAt: "desc",
          },
        }),
        prisma.cV.findFirst({
          where: {
            userId: req.user.id,
          },
          orderBy: {
            uploadedAt: "desc",
          },
        }),
        prisma.binome.findFirst({
          where: {
            status: "ACCEPTED",
            OR: [
              {
                student1Id: req.user.id,
              },
              {
                student2Id: req.user.id,
              },
            ],
          },
        }),
        prisma.conversation.findMany({
          where: {
            OR: [
              {
                studentId: req.user.id,
              },
              {
                binome: {
                  OR: [
                    {
                      student1Id: req.user.id,
                    },
                    {
                      student2Id: req.user.id,
                    },
                  ],
                },
              },
            ],
          },
        }),
      ]);

    return res.status(200).json({
      applications,
      notifications,
      cv,
      binome,
      conversations,
    });
  } catch (error) {
    console.error("GET /applications/dashboard-summary error:", error);

    return res.status(500).json({
      message: error.message || "Erreur lors du chargement du tableau de bord.",
    });
  }
};

const createApplication = async (req, res) => {
  try {
    const { subjectId, binomeId } = req.body;

    if (!subjectId) {
      return res.status(400).json({
        message: "Sujet requis.",
      });
    }

    const affectedApplication = await getUserAffectedApplication(req.user.id);

    if (affectedApplication) {
      return res.status(400).json({
        message: "Vous êtes déjà affecté à un sujet.",
      });
    }

    const subject = await prisma.subject.findUnique({
      where: {
        id: subjectId,
      },
      include: {
        supervisor: true,
      },
    });

    if (!subject) {
      return res.status(404).json({
        message: "Sujet introuvable.",
      });
    }

    if (
      subject.educationField &&
      req.user.educationField &&
      subject.educationField !== req.user.educationField
    ) {
      return res.status(403).json({
        message:
          "You can only apply to subjects that match your education field.",
        code: "EDUCATION_FIELD_MISMATCH",
      });
    }

    const eligibility = checkSubjectEligibility(req.user, subject);
    if (eligibility) {
      return res.status(403).json({
        message: eligibility.message,
        code: eligibility.code,
      });
    }

    await recalculateScoresForStudent(req.user.id);

    const activeBinome = await getActiveBinome(req.user.id);

    let finalBinome = null;

    if (binomeId) {
      finalBinome = await prisma.binome.findFirst({
        where: {
          id: binomeId,
          status: "ACCEPTED",
          OR: [
            {
              student1Id: req.user.id,
            },
            {
              student2Id: req.user.id,
            },
          ],
        },
        include: {
          student1: true,
          student2: true,
        },
      });

      if (!finalBinome) {
        return res.status(400).json({
          message: "Binôme invalide.",
        });
      }
    } else if (activeBinome) {
      finalBinome = await prisma.binome.findUnique({
        where: {
          id: activeBinome.id,
        },
        include: {
          student1: true,
          student2: true,
        },
      });
    }

    if (finalBinome) {
      const partnerId =
        finalBinome.student1Id === req.user.id
          ? finalBinome.student2Id
          : finalBinome.student1Id;

      const partnerAffected = await getUserAffectedApplication(partnerId);

      if (partnerAffected) {
        return res.status(400).json({
          message: "Votre binôme est déjà affecté à un sujet.",
        });
      }
    }

    const candidateFaculties = uniqueFaculties([
      req.user.university,
      finalBinome?.student1?.university,
      finalBinome?.student2?.university,
    ]);

    const facultyConflict = await findAffectedApplicationForFaculties({
      subjectId,
      faculties: candidateFaculties,
    });

    if (facultyConflict) {
      return res.status(400).json({
        message:
          "You cannot apply because someone from your faculty is already working on this subject.",
        code: "SUBJECT_LOCKED_BY_FACULTY",
      });
    }

    const alreadyApplied = await prisma.application.findFirst({
      where: {
        subjectId,
        status: {
          in: ACTIVE_APPLICATION_STATUSES,
        },
        OR: [
          {
            studentId: req.user.id,
          },
          finalBinome
            ? {
                binomeId: finalBinome.id,
              }
            : {
                id: "__never__",
              },
          {
            binome: {
              OR: [
                {
                  student1Id: req.user.id,
                },
                {
                  student2Id: req.user.id,
                },
              ],
            },
          },
        ],
      },
    });

    if (alreadyApplied) {
      return res.status(400).json({
        message: "Vous avez déjà candidaté à ce sujet.",
      });
    }

    const savedScore = await getSavedScoreForStudentSubject({
      studentId: req.user.id,
      subjectId,
    });

    if ((savedScore.score || 0) < MIN_APPLICATION_SCORE) {
      return res.status(400).json({
        message: `Votre score est de ${savedScore.score || 0}%. Vous devez avoir au moins ${MIN_APPLICATION_SCORE}% pour candidater à ce sujet.`,
        score: savedScore.score || 0,
        matchedSkills: savedScore.matchedSkills || [],
        missingSkills: savedScore.missingSkills || [],
      });
    }

    const applicationInclude = {
      subject: true,
      student: true,
      binome: {
        include: {
          student1: true,
          student2: true,
        },
      },
    };

    const applicationData = finalBinome
      ? {
          subjectId,
          studentId: null,
          binomeId: finalBinome.id,
          status: "PENDING",
        }
      : {
          subjectId,
          studentId: req.user.id,
          binomeId: null,
          status: "PENDING",
        };

    let application;

    try {
      application = await prisma.application.create({
        data: applicationData,
        include: applicationInclude,
      });
    } catch (createError) {
      if (createError.code === "P2002") {
        return res.status(400).json({
          message: "Vous avez déjà candidaté à ce sujet.",
        });
      }

      throw createError;
    }

    await createNotification({
      recipientId: subject.supervisorId,
      title: "Nouvelle candidature",
      message: finalBinome
        ? `Une nouvelle candidature en binôme a été reçue pour le sujet "${subject.title}".`
        : `Une nouvelle candidature a été reçue pour le sujet "${subject.title}".`,
      type: "APPLICATION_RECEIVED",
    });

    await createActionPageAlert({
      userId: subject.supervisorId,
      pageKey: "applications",
      refId: application.id,
    });

    await createAuditLog({
      actorId: req.user.id,
      action: finalBinome ? "BINOME_APPLICATION_CREATE" : "APPLICATION_CREATE",
      entity: "APPLICATION",
      entityId: application.id,
      details: {
        subjectId,
        subjectTitle: subject.title,
        studentId: application.studentId,
        binomeId: application.binomeId,
        score: savedScore.score || 0,
      },
    });

    return res.status(201).json({
      message: finalBinome
        ? "Candidature envoyée pour votre binôme."
        : "Candidature envoyée.",
      application: {
        ...application,
        score: savedScore.score || 0,
        matchedSkills: savedScore.matchedSkills || [],
        missingSkills: savedScore.missingSkills || [],
      },
    });
  } catch (error) {
    console.error("POST /applications error:", error);

    return res.status(500).json({
      message: error.message || "Erreur lors de l’envoi de la candidature.",
    });
  }
};

const cancelApplication = async (req, res) => {
  try {
    const { id } = req.params;

    const application = await prisma.application.findFirst({
      where: {
        id,
        status: "PENDING",
        OR: [
          {
            studentId: req.user.id,
          },
          {
            binome: {
              OR: [
                {
                  student1Id: req.user.id,
                },
                {
                  student2Id: req.user.id,
                },
              ],
            },
          },
        ],
      },
      include: {
        subject: true,
      },
    });

    if (!application) {
      return res.status(404).json({
        message: "Candidature introuvable ou non annulable.",
      });
    }

    const updatedApplication = await prisma.application.update({
      where: {
        id,
      },
      data: {
        status: "CANCELLED",
      },
      include: {
        subject: true,
      },
    });

    await cleanupInactiveConversations();

    await createAuditLog({
      actorId: req.user.id,
      action: "APPLICATION_CANCEL",
      entity: "APPLICATION",
      entityId: updatedApplication.id,
      details: {
        subjectId: updatedApplication.subjectId,
        subjectTitle: updatedApplication.subject?.title,
        previousStatus: application.status,
        status: updatedApplication.status,
      },
    });

    return res.status(200).json({
      message: "Candidature annulée.",
      application: updatedApplication,
    });
  } catch (error) {
    console.error("PATCH /applications/:id/cancel error:", error);

    return res.status(500).json({
      message: error.message || "Erreur lors de l’annulation.",
    });
  }
};

const completeAssignment = async (req, res) => {
  try {
    const { id } = req.params;

    const application = await prisma.application.findFirst({
      where: {
        id,
        status: "AFFECTED",
        OR: [
          { studentId: req.user.id },
          {
            binome: {
              OR: [{ student1Id: req.user.id }, { student2Id: req.user.id }],
            },
          },
        ],
      },
      include: {
        subject: true,
        student: true,
        binome: {
          include: {
            student1: true,
            student2: true,
          },
        },
      },
    });

    if (!application) {
      return res.status(404).json({
        message: "Active assignment not found.",
      });
    }

    const updatedApplication = await prisma.application.update({
      where: { id: application.id },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
      },
      include: {
        subject: {
          include: {
            supervisor: {
              select: { id: true, fullName: true, email: true },
            },
          },
        },
        student: true,
        binome: {
          include: {
            student1: true,
            student2: true,
          },
        },
        academicReport: true,
      },
    });

    if (application.subject?.supervisorId) {
      await createNotification({
        recipientId: application.subject.supervisorId,
        title: "Assignment completed",
        message: `The assignment for "${application.subject.title}" has been marked as completed.`,
        type: "ASSIGNMENT_COMPLETED",
      });
    }

    await createAuditLog({
      actorId: req.user.id,
      action: "ASSIGNMENT_COMPLETE",
      entity: "APPLICATION",
      entityId: updatedApplication.id,
      details: {
        subjectId: updatedApplication.subjectId,
        subjectTitle: updatedApplication.subject?.title,
        previousStatus: application.status,
        status: updatedApplication.status,
      },
    });

    return res.status(200).json({
      message: "Assignment marked as completed.",
      application: updatedApplication,
    });
  } catch (error) {
    console.error("PATCH /applications/:id/complete error:", error);

    return res.status(500).json({
      message: error.message || "Unable to complete assignment.",
    });
  }
};

module.exports = {
  getMyApplications,
  getStudentDashboardSummary,
  createApplication,
  cancelApplication,
  completeAssignment,
};
