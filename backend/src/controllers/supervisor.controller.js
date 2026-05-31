const prisma = require("../config/prisma");
const { randomUUID } = require("crypto");
const { createNotification } = require("../services/notification.service");
const { createAuditLog } = require("../services/audit.service");
const { cleanupInactiveConversations } = require("../services/conversationCleanup.service");
const {
  createInfoPageAlert,
  resolveActionAlert,
} = require("../services/pageAlert.service");

const {
  attachSavedScoresToApplications,
} = require("../services/recommendation.service");
const {
  getCandidateFaculties,
  getCandidateIds,
  autoRejectSameFacultyApplications,
} = require("../services/facultySubject.service");
const {
  getApplicationPlacesUsed,
  getSubjectAssignedPlacesById,
} = require("../services/subjectPlaces.service");

const getSupervisorApplications = async (req, res) => {
  try {
    const applications = await prisma.application.findMany({
      where: {
        subject: {
          supervisorId: req.user.id,
        },
      },
      include: {
        student: {
          include: {
            cvs: {
              orderBy: {
                uploadedAt: "desc",
              },
              take: 1,
            },
          },
        },
        binome: {
          include: {
            student1: {
              include: {
                cvs: {
                  orderBy: {
                    uploadedAt: "desc",
                  },
                  take: 1,
                },
              },
            },
            student2: {
              include: {
                cvs: {
                  orderBy: {
                    uploadedAt: "desc",
                  },
                  take: 1,
                },
              },
            },
          },
        },
        subject: {
          include: {
            documents: {
              orderBy: {
                createdAt: "desc",
              },
            },
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
    console.error("GET /supervisor/applications error:", error);

    return res.status(500).json({
      message: error.message || "Erreur lors du chargement des candidatures.",
    });
  }
};

const getSupervisorInterns = async (req, res) => {
  try {
    const interns = await prisma.application.findMany({
      where: {
        status: "AFFECTED",
        subject: {
          supervisorId: req.user.id,
        },
      },
      include: {
        student: {
          include: {
            cvs: {
              orderBy: {
                uploadedAt: "desc",
              },
              take: 1,
            },
            academicReport: {
              select: {
                id: true,
                originalName: true,
                fileName: true,
                fileType: true,
                fileSize: true,
                status: true,
                submittedAt: true,
              },
            },
          },
        },
        binome: {
          include: {
            student1: {
              include: {
                cvs: {
                  orderBy: {
                    uploadedAt: "desc",
                  },
                  take: 1,
                },
                academicReport: {
              select: {
                id: true,
                originalName: true,
                fileName: true,
                fileType: true,
                fileSize: true,
                status: true,
                submittedAt: true,
              },
            },
              },
            },
            student2: {
              include: {
                cvs: {
                  orderBy: {
                    uploadedAt: "desc",
                  },
                  take: 1,
                },
                academicReport: {
              select: {
                id: true,
                originalName: true,
                fileName: true,
                fileType: true,
                fileSize: true,
                status: true,
                submittedAt: true,
              },
            },
              },
            },
          },
        },
        subject: {
          include: {
            documents: {
              orderBy: {
                createdAt: "desc",
              },
            },
            supervisor: {
              select: {
                id: true,
                fullName: true,
                email: true,
              },
            },
          },
        },
        conversation: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const scoredInterns = await attachSavedScoresToApplications(interns);

    return res.status(200).json(scoredInterns);
  } catch (error) {
    console.error("GET /supervisor/interns error:", error);

    return res.status(500).json({
      message: error.message || "Erreur lors du chargement des stagiaires.",
    });
  }
};

const getSupervisorCompletedAssignments = async (req, res) => {
  try {
    const assignments = await prisma.application.findMany({
      where: {
        status: "COMPLETED",
        subject: {
          supervisorId: req.user.id,
        },
      },
      include: {
        student: true,
        binome: {
          include: {
            student1: true,
            student2: true,
          },
        },
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
        academicReport: {
          select: {
            id: true,
            userId: true,
            applicationId: true,
            originalName: true,
            fileName: true,
            fileType: true,
            fileSize: true,
            status: true,
            submittedAt: true,
            updatedAt: true,
            user: {
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
        completedAt: "desc",
      },
    });

    return res.status(200).json(assignments);
  } catch (error) {
    console.error("GET /supervisor/completed-assignments error:", error);

    return res.status(500).json({
      message: error.message || "Unable to load completed assignments.",
    });
  }
};

const getSupervisorDashboardSummary = async (req, res) => {
  try {
    const [subjects, applications, notifications] = await Promise.all([
      prisma.subject.findMany({
        where: {
          supervisorId: req.user.id,
        },
        include: {
          applications: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.application.findMany({
        where: {
          subject: {
            supervisorId: req.user.id,
          },
        },
        include: {
          subject: true,
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
    ]);

    return res.status(200).json({
      subjects,
      applications,
      notifications,
      stats: {
        subjects: subjects.length,
        applications: applications.length,
        assigned: applications.filter(
          (application) => application.status === "AFFECTED"
        ).length,
        notifications: notifications.length,
      },
    });
  } catch (error) {
    console.error("GET /supervisor/dashboard-summary error:", error);

    return res.status(500).json({
      message: error.message || "Erreur lors du chargement du tableau de bord.",
    });
  }
};

const getCandidateUserIds = (application) => {
  const ids = [];

  if (application.studentId) ids.push(application.studentId);
  if (application.binome?.student1Id) ids.push(application.binome.student1Id);
  if (application.binome?.student2Id) ids.push(application.binome.student2Id);

  return ids.filter(Boolean);
};

const getCandidateUsers = (application) => {
  if (application.student) return [application.student].filter(Boolean);

  if (application.binome) {
    return [application.binome.student1, application.binome.student2].filter(
      Boolean
    );
  }

  return [];
};

const getCandidateSummary = (application) =>
  getCandidateUsers(application).map((candidate) => ({
    id: candidate.id,
    fullName: candidate.fullName,
    email: candidate.email,
  }));

const ensureApplicationConversation = async (application) => {
  const existing = await prisma.conversation.findFirst({
    where: {
      applicationId: application.id,
    },
  });

  if (existing) return existing;

  try {
    return await prisma.conversation.create({
      data: {
        type: "APPLICATION",
        applicationId: application.id,
        studentId: application.studentId || null,
        supervisorId: application.subject.supervisorId,
      },
    });
  } catch (error) {
    if (error.code === "P2002") {
      return prisma.conversation.findFirst({
        where: {
          applicationId: application.id,
        },
      });
    }

    throw error;
  }
};

const parseInterviewAt = (value) => {
  if (!value) return null;

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;

  return parsed;
};

const updateApplicationInterview = async (req, res) => {
  try {
    const { id } = req.params;
    const { interviewLink, interviewAt } = req.body || {};

    const application = await prisma.application.findUnique({
      where: {
        id,
      },
      include: {
        student: true,
        binome: {
          include: {
            student1: true,
            student2: true,
          },
        },
        subject: true,
      },
    });

    if (!application) {
      return res.status(404).json({
        message: "Candidature introuvable.",
      });
    }

    if (application.subject.supervisorId !== req.user.id) {
      return res.status(403).json({
        message: "Acces refuse.",
      });
    }

    if (application.status !== "APPROVED") {
      return res.status(400).json({
        message: "L'entretien est modifiable uniquement apres la premiere acceptation.",
      });
    }

    const cleanInterviewLink = String(interviewLink || "").trim();
    const parsedInterviewAt = parseInterviewAt(interviewAt);

    if (!cleanInterviewLink || !parsedInterviewAt) {
      return res.status(400).json({
        message: "Lien, date et heure d'entretien requis.",
      });
    }

    const updatedApplication = await prisma.application.update({
      where: {
        id: application.id,
      },
      data: {
        interviewLink: cleanInterviewLink,
        interviewAt: parsedInterviewAt,
      },
      include: {
        student: true,
        binome: {
          include: {
            student1: true,
            student2: true,
          },
        },
        subject: true,
      },
    });

    const candidateIds = getCandidateUserIds(updatedApplication);

    for (const candidateId of candidateIds) {
      try {
        await createNotification({
          recipientId: candidateId,
          title: "Entretien planifie",
          message: `Votre entretien pour le sujet "${updatedApplication.subject.title}" a ete planifie.`,
          type: "APPLICATION_INTERVIEW",
        });

        await createInfoPageAlert({
          userId: candidateId,
          pageKey: "applications",
          refId: updatedApplication.id,
        });
      } catch (notificationError) {
        console.error("Interview notification error:", notificationError);
      }
    }

    await createAuditLog({
      actorId: req.user.id,
      action: "APPLICATION_INTERVIEW_UPDATE",
      entity: "APPLICATION",
      entityId: updatedApplication.id,
      details: {
        subjectId: updatedApplication.subjectId,
        subjectTitle: updatedApplication.subject.title,
        status: updatedApplication.status,
        interviewAt: updatedApplication.interviewAt,
        candidates: getCandidateSummary(updatedApplication),
      },
    });

    return res.status(200).json({
      message: "Entretien enregistre.",
      application: updatedApplication,
    });
  } catch (error) {
    console.error("PATCH /supervisor/applications/:id/interview error:", error);

    return res.status(500).json({
      message: error.message || "Erreur lors de l'enregistrement de l'entretien.",
    });
  }
};

const approveApplication = async (req, res) => {
  try {
    const { id } = req.params;

    const application = await prisma.application.findUnique({
      where: {
        id,
      },
      include: {
        student: true,
        binome: {
          include: {
            student1: true,
            student2: true,
          },
        },
        subject: true,
      },
    });

    if (!application) {
      await resolveActionAlert({
        userId: req.user.id,
        pageKey: "applications",
        refId: id,
      });

      return res.status(200).json({
        message: "Candidature déjà traitée.",
      });
    }

    if (application.subject.supervisorId !== req.user.id) {
      return res.status(403).json({
        message: "Accès refusé.",
      });
    }

    if (application.status === "AFFECTED") {
      try {
        await ensureApplicationConversation(application);
      } catch (conversationError) {
        console.error("Conversation repair error:", conversationError);
      }

      await resolveActionAlert({
        userId: req.user.id,
        pageKey: "applications",
        refId: application.id,
      });

      return res.status(200).json({
        message: "Candidature déjà acceptée.",
        application,
      });
    }

    if (!["PENDING", "APPROVED"].includes(application.status)) {
      await resolveActionAlert({
        userId: req.user.id,
        pageKey: "applications",
        refId: application.id,
      });

      return res.status(200).json({
        message: "Candidature déjà traitée.",
        application,
      });
    }

    if (application.status === "PENDING") {
      const updatedApplication = await prisma.application.update({
        where: {
          id: application.id,
        },
        data: {
          status: "APPROVED",
        },
        include: {
          student: true,
          binome: {
            include: {
              student1: true,
              student2: true,
            },
          },
          subject: true,
        },
      });

      const candidateIds = getCandidateUserIds(updatedApplication);

      for (const candidateId of candidateIds) {
        try {
          await createNotification({
            recipientId: candidateId,
            title: "Candidature acceptee",
            message: `Votre candidature au sujet "${updatedApplication.subject.title}" a ete acceptee pour un entretien.`,
            type: "APPLICATION_ACCEPTED",
          });

          await createInfoPageAlert({
            userId: candidateId,
            pageKey: "applications",
            refId: updatedApplication.id,
          });
        } catch (notificationError) {
          console.error("Interview notification error:", notificationError);
        }
      }

      await resolveActionAlert({
        userId: req.user.id,
        pageKey: "applications",
        refId: updatedApplication.id,
      });

      await createAuditLog({
        actorId: req.user.id,
        action: "APPLICATION_ACCEPT_FIRST_PHASE",
        entity: "APPLICATION",
        entityId: updatedApplication.id,
        details: {
          subjectId: updatedApplication.subjectId,
          subjectTitle: updatedApplication.subject.title,
          previousStatus: application.status,
          status: updatedApplication.status,
          candidates: getCandidateSummary(updatedApplication),
        },
      });

      return res.status(200).json({
        message: "Candidature acceptee pour entretien.",
        application: updatedApplication,
      });
    }

    const acceptedFaculties = getCandidateFaculties(application);
    const requestedPlaces = getApplicationPlacesUsed(application);

    const result = await prisma.$transaction(async (tx) => {
      const assignedPlaces = await getSubjectAssignedPlacesById({
        client: tx,
        subjectId: application.subjectId,
      });
      const totalPlaces = Number(application.subject.places || 0);

      if (assignedPlaces + requestedPlaces > totalPlaces) {
        throw new Error("NO_REMAINING_PLACES");
      }

      const updatedApplication = await tx.application.update({
        where: {
          id: application.id,
        },
        data: {
          status: "AFFECTED",
        },
        include: {
          student: true,
          binome: {
            include: {
              student1: true,
              student2: true,
            },
          },
          subject: true,
        },
      });

      const autoRejectedApplications = await autoRejectSameFacultyApplications({
        subjectId: application.subjectId,
        acceptedApplicationId: application.id,
        faculties: acceptedFaculties,
        client: tx,
      });

      return {
        updatedApplication,
        autoRejectedApplications,
      };
    });

    const updatedApplication = result.updatedApplication;

    try {
      await ensureApplicationConversation(updatedApplication);
    } catch (conversationError) {
      console.error("Conversation creation error after affectation:", conversationError);
    }

    const candidateIds = getCandidateUserIds(updatedApplication);

    for (const candidateId of candidateIds) {
      try {
        await createNotification({
          recipientId: candidateId,
          title: "Candidature acceptée",
          message: `Votre candidature au sujet "${updatedApplication.subject.title}" a été acceptée.`,
          type: "APPLICATION_ACCEPTED",
        });

        await createInfoPageAlert({
          userId: candidateId,
          pageKey: "applications",
          refId: updatedApplication.id,
        });
      } catch (notificationError) {
        console.error("Candidate notification error:", notificationError);
      }
    }

    await resolveActionAlert({
      userId: req.user.id,
      pageKey: "applications",
      refId: updatedApplication.id,
    });

    await createAuditLog({
      actorId: req.user.id,
      action: "APPLICATION_ACCEPT",
      entity: "APPLICATION",
      entityId: updatedApplication.id,
      details: {
        subjectId: updatedApplication.subjectId,
        subjectTitle: updatedApplication.subject.title,
        previousStatus: application.status,
        status: updatedApplication.status,
        candidates: getCandidateSummary(updatedApplication),
      },
    });

    return res.status(200).json({
      message: "Candidature acceptée.",
      application: updatedApplication,
    });
  } catch (error) {
    if (error.message === "NO_REMAINING_PLACES") {
      return res.status(400).json({
        message: "This subject has no remaining places.",
      });
    }

    console.error("PATCH /supervisor/applications/:id/approve error:", error);

    return res.status(500).json({
      message: error.message || "Erreur lors de l’acceptation.",
    });
  }
};

const rejectApplication = async (req, res) => {
  try {
    const { id } = req.params;

    const application = await prisma.application.findUnique({
      where: {
        id,
      },
      include: {
        student: true,
        binome: {
          include: {
            student1: true,
            student2: true,
          },
        },
        subject: true,
      },
    });

    if (!application) {
      await resolveActionAlert({
        userId: req.user.id,
        pageKey: "applications",
        refId: id,
      });

      return res.status(200).json({
        message: "Candidature déjà traitée.",
      });
    }

    if (application.subject.supervisorId !== req.user.id) {
      return res.status(403).json({
        message: "Accès refusé.",
      });
    }

    if (application.status === "REJECTED") {
      await resolveActionAlert({
        userId: req.user.id,
        pageKey: "applications",
        refId: application.id,
      });

      return res.status(200).json({
        message: "Candidature déjà refusée.",
        application,
      });
    }

    if (!["PENDING", "APPROVED"].includes(application.status)) {
      await resolveActionAlert({
        userId: req.user.id,
        pageKey: "applications",
        refId: application.id,
      });

      return res.status(200).json({
        message: "Candidature déjà traitée.",
        application,
      });
    }

    const updatedApplication = await prisma.application.update({
      where: {
        id: application.id,
      },
      data: {
        status: "REJECTED",
      },
      include: {
        student: true,
        binome: {
          include: {
            student1: true,
            student2: true,
          },
        },
        subject: true,
      },
    });

    const candidateIds = getCandidateUserIds(updatedApplication);

    for (const candidateId of candidateIds) {
      try {
        await createNotification({
          recipientId: candidateId,
          title: "Candidature refusée",
          message: `Votre candidature au sujet "${updatedApplication.subject.title}" a été refusée.`,
          type: "APPLICATION_REJECTED",
        });

        await createInfoPageAlert({
          userId: candidateId,
          pageKey: "applications",
          refId: updatedApplication.id,
        });
      } catch (notificationError) {
        console.error("Reject notification error:", notificationError);
      }
    }

    await resolveActionAlert({
      userId: req.user.id,
      pageKey: "applications",
      refId: updatedApplication.id,
    });

    await createAuditLog({
      actorId: req.user.id,
      action: "APPLICATION_REJECT",
      entity: "APPLICATION",
      entityId: updatedApplication.id,
      details: {
        subjectId: updatedApplication.subjectId,
        subjectTitle: updatedApplication.subject.title,
        previousStatus: application.status,
        status: updatedApplication.status,
        candidates: getCandidateSummary(updatedApplication),
      },
    });

    await cleanupInactiveConversations();

    return res.status(200).json({
      message: "Candidature refusée.",
      application: updatedApplication,
    });
  } catch (error) {
    console.error("PATCH /supervisor/applications/:id/reject error:", error);

    return res.status(500).json({
      message: error.message || "Erreur lors du refus.",
    });
  }
};

const cancelAffectation = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body || {};

    const application = await prisma.application.findUnique({
      where: {
        id,
      },
      include: {
        student: true,
        binome: {
          include: {
            student1: true,
            student2: true,
          },
        },
        subject: true,
      },
    });

    if (!application) {
      return res.status(404).json({
        message: "Affectation introuvable.",
      });
    }

    if (application.subject.supervisorId !== req.user.id) {
      return res.status(403).json({
        message: "Accès refusé.",
      });
    }

    if (application.status !== "AFFECTED") {
      return res.status(400).json({
        message: "Cette affectation n'est pas annulable.",
      });
    }

    const updatedApplication = await prisma.application.update({
      where: {
        id: application.id,
      },
      data: {
        status: "CANCELLED",
      },
      include: {
        student: true,
        binome: {
          include: {
            student1: true,
            student2: true,
          },
        },
        subject: true,
      },
    });

    const candidateIds = getCandidateUserIds(application);
    const reasonText = reason?.trim();

    for (const candidateId of candidateIds) {
      try {
        await createNotification({
          recipientId: candidateId,
          title: "Affectation annulée",
          message: reasonText
            ? `Votre affectation au sujet "${application.subject.title}" a été annulée. Raison : ${reasonText}`
            : `Votre affectation au sujet "${application.subject.title}" a été annulée.`,
          type: "AFFECTATION_CANCELLED",
        });

        await createInfoPageAlert({
          userId: candidateId,
          pageKey: "applications",
          refId: application.id,
        });
      } catch (notificationError) {
        console.error("Affectation cancellation notification error:", notificationError);
      }
    }

    for (const rejectedApplication of result.autoRejectedApplications) {
      const rejectedCandidateIds = getCandidateIds(rejectedApplication);

      for (const candidateId of rejectedCandidateIds) {
        try {
          await createNotification({
            recipientId: candidateId,
            title: "Candidature refusée",
            message: `Votre candidature au sujet "${updatedApplication.subject.title}" a été refusée car un étudiant de votre faculté travaille déjà sur ce sujet.`,
            type: "APPLICATION_REJECTED",
          });

          await createInfoPageAlert({
            userId: candidateId,
            pageKey: "applications",
            refId: rejectedApplication.id,
          });
        } catch (notificationError) {
          console.error("Auto-reject notification error:", notificationError);
        }
      }
    }

    await createAuditLog({
      actorId: req.user.id,
      action: "AFFECTATION_CANCEL",
      entity: "APPLICATION",
      entityId: updatedApplication.id,
      details: {
        subjectId: updatedApplication.subjectId,
        subjectTitle: updatedApplication.subject.title,
        previousStatus: application.status,
        status: updatedApplication.status,
        reason: reasonText || null,
        candidates: getCandidateSummary(updatedApplication),
      },
    });

    if (result.autoRejectedApplications.length > 0) {
      await createAuditLog({
        actorId: req.user.id,
        action: "APPLICATION_AUTO_REJECT_SAME_FACULTY",
        entity: "APPLICATION",
        entityId: updatedApplication.id,
        details: {
          acceptedApplicationId: updatedApplication.id,
          subjectId: updatedApplication.subjectId,
          subjectTitle: updatedApplication.subject.title,
          faculties: acceptedFaculties,
          rejectedApplicationIds: result.autoRejectedApplications.map(
            (rejectedApplication) => rejectedApplication.id
          ),
        },
      });
    }

    await cleanupInactiveConversations();

    return res.status(200).json({
      message: "Affectation annulée.",
      application: updatedApplication,
    });
  } catch (error) {
    console.error("PATCH /supervisor/affectations/:id/cancel error:", error);

    return res.status(500).json({
      message: error.message || "Erreur lors de l'annulation.",
    });
  }
};

const completeAffectation = async (req, res) => {
  try {
    const { id } = req.params;

    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        student: true,
        binome: {
          include: {
            student1: true,
            student2: true,
          },
        },
        subject: true,
      },
    });

    if (!application) {
      return res.status(404).json({
        message: "Assignment not found.",
      });
    }

    if (application.subject.supervisorId !== req.user.id) {
      return res.status(403).json({
        message: "Access denied.",
      });
    }

    if (application.status !== "AFFECTED") {
      return res.status(400).json({
        message: "Only active assignments can be marked as completed.",
      });
    }

    const updatedApplication = await prisma.application.update({
      where: { id: application.id },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
      },
      include: {
        student: true,
        binome: {
          include: {
            student1: true,
            student2: true,
          },
        },
        subject: true,
        academicReport: true,
      },
    });

    const candidateIds = getCandidateUserIds(application);
    for (const candidateId of candidateIds) {
      try {
        await createNotification({
          recipientId: candidateId,
          title: "Assignment completed",
          message: `Your assignment for "${application.subject.title}" has been marked as completed. You can now upload your final report.`,
          type: "ASSIGNMENT_COMPLETED",
        });

        await createInfoPageAlert({
          userId: candidateId,
          pageKey: "applications",
          refId: application.id,
        });
      } catch (notificationError) {
        console.error("Assignment completion notification error:", notificationError);
      }
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
        candidates: getCandidateSummary(updatedApplication),
      },
    });

    return res.status(200).json({
      message: "Assignment marked as completed.",
      application: updatedApplication,
    });
  } catch (error) {
    console.error("PATCH /supervisor/affectations/:id/complete error:", error);

    return res.status(500).json({
      message: error.message || "Unable to complete assignment.",
    });
  }
};

const reportStudent = async (req, res) => {
  try {
    const { studentId, reason } = req.body || {};
    const cleanReason = reason?.trim();

    if (!studentId || !cleanReason) {
      return res.status(400).json({
        message: "Etudiant et raison requis.",
      });
    }

    const application = await prisma.application.findFirst({
      where: {
        status: {
          in: ["AFFECTED", "COMPLETED"],
        },
        subject: {
          supervisorId: req.user.id,
        },
        OR: [
          { studentId },
          {
            binome: {
              OR: [{ student1Id: studentId }, { student2Id: studentId }],
            },
          },
        ],
      },
      include: {
        student: true,
        binome: {
          include: {
            student1: true,
            student2: true,
          },
        },
        subject: true,
      },
    });

    if (!application) {
      return res.status(404).json({
        message: "Etudiant introuvable parmi vos stagiaires.",
      });
    }

    const candidateIds = getCandidateUserIds(application);

    if (!candidateIds.includes(studentId)) {
      return res.status(400).json({
        message: "Cet étudiant ne fait pas partie de cette affectation.",
      });
    }

    const [report] = await prisma.$queryRaw`
      INSERT INTO "IncidentReport" (
        "id",
        "supervisorId",
        "studentId",
        "reason",
        "createdAt"
      )
      VALUES (
        ${randomUUID()},
        ${req.user.id},
        ${studentId},
        ${cleanReason},
        NOW()
      )
      RETURNING *
    `;

    const admins = await prisma.user.findMany({
      where: {
        role: "ADMIN",
      },
      select: {
        id: true,
      },
    });

    const reportedStudent = getCandidateUsers(application).find(
      (candidate) => candidate.id === studentId
    );

    for (const admin of admins) {
      try {
        await createNotification({
          recipientId: admin.id,
          title: "Nouveau signalement",
          message: `${req.user.fullName} a signalé ${
            reportedStudent?.fullName || "un étudiant"
          }.`,
          type: "STUDENT_REPORTED",
        });

        await createInfoPageAlert({
          userId: admin.id,
          pageKey: "reports",
          refId: report.id,
        });
      } catch (notificationError) {
        console.error("Report notification error:", notificationError);
      }
    }

    await createAuditLog({
      actorId: req.user.id,
      action: "STUDENT_REPORT_CREATE",
      entity: "STUDENT_REPORT",
      entityId: report.id,
      details: {
        studentId,
        studentName: reportedStudent?.fullName || null,
        reason: cleanReason,
      },
    });

    return res.status(201).json({
      message: "Signalement envoyé.",
      report,
    });
  } catch (error) {
    console.error("POST /supervisor/reports error:", error);

    return res.status(500).json({
      message: error.message || "Erreur lors du signalement.",
    });
  }
};

module.exports = {
  getSupervisorApplications,
  getApplications: getSupervisorApplications,
  getMyApplications: getSupervisorApplications,
  getReceivedApplications: getSupervisorApplications,

  getSupervisorInterns,
  getInterns: getSupervisorInterns,
  getMyInterns: getSupervisorInterns,
  getSupervisorCompletedAssignments,
  getSupervisorDashboardSummary,

  approveApplication,
  acceptApplication: approveApplication,
  updateApplicationInterview,

  rejectApplication,
  cancelAffectation,
  completeAffectation,
  reportStudent,
};
