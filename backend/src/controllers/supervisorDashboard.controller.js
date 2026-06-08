const prisma = require("../config/prisma");
const { createNotification } = require("../services/notification.service");
const { createAuditLog } = require("../services/audit.service");
const {
  createPageAlert,
  resolvePageAlerts,
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

const ensureApprovedSupervisor = (req, res) => {
  if (req.user.role !== "COMPANY_SUPERVISOR") {
    res.status(403).json({
      message: "Supervisor access only",
    });
    return false;
  }

  if (req.user.supervisorStatus !== "APPROVED") {
    res.status(403).json({
      message: "Supervisor account is not approved",
    });
    return false;
  }

  return true;
};

const getApplicationStudentIds = (application) => {
  if (application.studentId) return [application.studentId];

  if (application.binome) {
    return [application.binome.student1Id, application.binome.student2Id];
  }

  return [];
};

const getApplicationCandidateSummary = (application) => {
  if (application.student) {
    return [
      {
        id: application.student.id,
        fullName: application.student.fullName,
        email: application.student.email,
      },
    ];
  }

  if (application.binome) {
    return [application.binome.student1, application.binome.student2]
      .filter(Boolean)
      .map((student) => ({
        id: student.id,
        fullName: student.fullName,
        email: student.email,
      }));
  }

  return [];
};

const attachScores = async (applications) => {
  return Promise.all(
    applications.map(async (application) => {
      let score = null;

      if (application.binomeId) {
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
        score: score?.score ?? null,
        matchedSkills: score?.matchedSkills || [],
        missingSkills: score?.missingSkills || [],
      };
    })
  );
};

const parseInterviewAt = (value) => {
  if (!value) return null;

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;

  return parsed;
};

const buildInterviewNotificationMessage = ({ subjectTitle, interviewAt, interviewLink }) => {
  const parts = [`Votre entretien pour "${subjectTitle}" a ete planifie.`];

  if (interviewAt) {
    parts.push(`Date et heure : ${new Date(interviewAt).toLocaleString()}.`);
  }

  if (interviewLink) {
    parts.push(`Lien : ${interviewLink}`);
  }

  return parts.join(" ");
};

const getMySubjectApplications = async (req, res) => {
  try {
    if (!ensureApprovedSupervisor(req, res)) return;

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

    const applicationsWithScores = await attachSavedScoresToApplications(applications);

    res.status(200).json(applicationsWithScores);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch supervisor applications",
    });
  }
};

const getMyInterns = async (req, res) => {
  try {
    if (!ensureApprovedSupervisor(req, res)) return;

    const applications = await prisma.application.findMany({
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
        updatedAt: "desc",
      },
    });

    const applicationsWithScores = await attachSavedScoresToApplications(applications);

    res.status(200).json(applicationsWithScores);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch interns",
    });
  }
};

const approveApplication = async (req, res) => {
  try {
    if (!ensureApprovedSupervisor(req, res)) return;

    const { id } = req.params;
    const { interviewLink, interviewAt } = req.body || {};

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
        message: "Application not found",
      });
    }

    if (application.subject.supervisorId !== req.user.id) {
      return res.status(403).json({
        message: "You can only review your own subjects",
      });
    }

    if (!["PENDING", "APPROVED"].includes(application.status)) {
      return res.status(400).json({
        message: "Application cannot be approved from this status",
      });
    }

    const studentIds = getApplicationStudentIds(application);

    if (application.status === "PENDING") {
      const cleanInterviewLink = String(interviewLink || "").trim();
      const parsedInterviewAt = parseInterviewAt(interviewAt);

      if (!cleanInterviewLink || !parsedInterviewAt) {
        return res.status(400).json({
          message: "Interview link, date and time are required",
        });
      }

      const approved = await prisma.application.update({
        where: { id },
        data: {
          status: "APPROVED",
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

      for (const studentId of studentIds) {
        await createNotification({
          recipientId: studentId,
          title: "Entretien planifie",
          message: buildInterviewNotificationMessage({
            subjectTitle: approved.subject.title,
            interviewAt: approved.interviewAt,
            interviewLink: approved.interviewLink,
          }),
          type: "APPLICATION_INTERVIEW",
        });

        await createPageAlert({
          userId: studentId,
          pageKey: "applications",
          refId: id,
        });
      }

      await resolvePageAlerts({
        userId: req.user.id,
        pageKey: "applications",
        refId: id,
      });

      await createAuditLog({
        actorId: req.user.id,
        action: "APPLICATION_INTERVIEW_SCHEDULE",
        entity: "APPLICATION",
        entityId: approved.id,
        details: {
          subjectId: approved.subjectId,
          subjectTitle: approved.subject.title,
          previousStatus: application.status,
          status: approved.status,
          interviewAt: approved.interviewAt,
          candidates: getApplicationCandidateSummary(approved),
        },
      });

      return res.status(200).json({
        message: "Interview scheduled successfully",
        application: approved,
      });
    }

    if (application.status !== "APPROVED") {
      return res.status(400).json({
        message: "Application cannot be affected from this status",
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

      const affected = await tx.application.update({
        where: { id },
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

      const conversation = await tx.conversation.upsert({
        where: {
          applicationId: id,
        },
        update: {},
        create: {
          type: "APPLICATION",
          studentId: studentIds[0],
          supervisorId: req.user.id,
          applicationId: id,
        },
      });

      const autoRejectedApplications = await autoRejectSameFacultyApplications({
        subjectId: application.subjectId,
        acceptedApplicationId: id,
        faculties: acceptedFaculties,
        client: tx,
      });

      return {
        affected,
        conversation,
        autoRejectedApplications,
      };
    });

    for (const studentId of studentIds) {
      await createNotification({
        recipientId: studentId,
        title: "Candidature acceptée",
        message: `Votre candidature pour "${result.affected.subject.title}" a été acceptée.`,
        type: "APPLICATION_AFFECTED",
      });

      await createPageAlert({
        userId: studentId,
        pageKey: "applications",
        refId: id,
      });

      await createPageAlert({
        userId: studentId,
        pageKey: "messages",
        refId: result.conversation.id,
      });
    }

    for (const rejectedApplication of result.autoRejectedApplications) {
      const rejectedStudentIds = getCandidateIds(rejectedApplication);

      for (const studentId of rejectedStudentIds) {
        await createNotification({
          recipientId: studentId,
          title: "Candidature refusée",
          message: `Votre candidature pour "${result.affected.subject.title}" a été refusée car un étudiant de votre faculté travaille déjà sur ce sujet.`,
          type: "APPLICATION_REJECTED",
        });

        await createPageAlert({
          userId: studentId,
          pageKey: "applications",
          refId: rejectedApplication.id,
        });
      }
    }

    await resolvePageAlerts({
      userId: req.user.id,
      pageKey: "applications",
      refId: id,
    });

    await createAuditLog({
      actorId: req.user.id,
      action: "APPLICATION_ACCEPT",
      entity: "APPLICATION",
      entityId: result.affected.id,
      details: {
        subjectId: result.affected.subjectId,
        subjectTitle: result.affected.subject.title,
        previousStatus: application.status,
        status: result.affected.status,
        candidates: getApplicationCandidateSummary(result.affected),
      },
    });

    if (result.autoRejectedApplications.length > 0) {
      await createAuditLog({
        actorId: req.user.id,
        action: "APPLICATION_AUTO_REJECT_AFTER_AFFECTATION",
        entity: "APPLICATION",
        entityId: result.affected.id,
        details: {
          acceptedApplicationId: result.affected.id,
          subjectId: result.affected.subjectId,
          subjectTitle: result.affected.subject.title,
          faculties: acceptedFaculties,
          rejectedApplications: result.autoRejectedApplications.map(
            (rejectedApplication) => ({
              id: rejectedApplication.id,
              subjectId: rejectedApplication.subjectId,
              studentId: rejectedApplication.studentId,
              binomeId: rejectedApplication.binomeId,
            })
          ),
        },
      });
    }

    res.status(200).json({
      message: "Application approved successfully",
      application: result.affected,
      conversation: result.conversation,
    });
  } catch (error) {
    if (error.message === "NO_REMAINING_PLACES") {
      return res.status(400).json({
        message: "This subject has no remaining places.",
      });
    }

    console.error(error);
    res.status(500).json({
      message: "Failed to approve application",
    });
  }
};

const rejectApplication = async (req, res) => {
  try {
    if (!ensureApprovedSupervisor(req, res)) return;

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
        message: "Application not found",
      });
    }

    if (application.subject.supervisorId !== req.user.id) {
      return res.status(403).json({
        message: "You can only review your own subjects",
      });
    }

    if (!["PENDING", "APPROVED"].includes(application.status)) {
      return res.status(400).json({
        message: "Application cannot be rejected from this status",
      });
    }

    const studentIds = getApplicationStudentIds(application);

    const updatedApplication = await prisma.application.update({
      where: { id },
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

    for (const studentId of studentIds) {
      await createNotification({
        recipientId: studentId,
        title: "Candidature refusée",
        message: `Votre candidature pour "${updatedApplication.subject.title}" a été refusée.`,
        type: "APPLICATION_REJECTED",
      });

      await createPageAlert({
        userId: studentId,
        pageKey: "applications",
        refId: id,
      });
    }

    await resolvePageAlerts({
      userId: req.user.id,
      pageKey: "applications",
      refId: id,
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
        candidates: getApplicationCandidateSummary(updatedApplication),
      },
    });

    res.status(200).json({
      message: "Application rejected successfully",
      application: updatedApplication,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to reject application",
    });
  }
};

module.exports = {
  getMySubjectApplications,
  getMyInterns,
  approveApplication,
  rejectApplication,
};
