const { Parser } = require("json2csv");
const prisma = require("../config/prisma");
const { createAuditLog } = require("../services/audit.service");
const { createNotification } = require("../services/notification.service");
const {
  createInfoPageAlert,
  resolveActionAlert,
  resolveInfoAlerts,
} = require("../services/pageAlert.service");
const {
  withSubjectPlaces,
  withSubjectPlacesList,
} = require("../services/subjectPlaces.service");

const getAllUsers = async (req, res) => {
  try {
    const { role, affected } = req.query;

    if (affected === "true") {
      const applications = await prisma.application.findMany({
        where: {
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
          subject: {
            include: {
              supervisor: true,
            },
          },
        },
        orderBy: {
          updatedAt: "desc",
        },
      });

      const rows = [];

      applications.forEach((application) => {
        if (application.student) {
          rows.push({
            ...application.student,
            subject: application.subject,
            applicationId: application.id,
          });
        }

        if (application.binome) {
          rows.push({
            ...application.binome.student1,
            subject: application.subject,
            applicationId: application.id,
          });

          rows.push({
            ...application.binome.student2,
            subject: application.subject,
            applicationId: application.id,
          });
        }
      });

      return res.status(200).json(rows);
    }

    const where = {};

    if (role) {
      where.role = role;
    }

    const users = await prisma.user.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        university: true,
        specialty: true,
        phone: true,
        supervisorStatus: true,
        createdAt: true,
        degreeLevel: true,
        internshipType: true,
        internshipStartDate: true,
        desiredDuration: true,
        department: true,
        rank: true,
        division: true,
      },
    });

    return res.status(200).json(users);
  } catch (error) {
    console.error("GET /admin/users error:", error);

    return res.status(500).json({
      message: error.message || "Erreur lors du chargement des utilisateurs.",
    });
  }
};

const getDashboardSummary = async (req, res) => {
  try {
    const [
      students,
      supervisors,
      subjects,
      assignments,
      pendingSupervisors,
      latestSubjects,
    ] = await Promise.all([
      prisma.user.count({
        where: {
          role: "STUDENT",
        },
      }),
      prisma.user.count({
        where: {
          role: "COMPANY_SUPERVISOR",
        },
      }),
      prisma.subject.count(),
      prisma.application.count({
        where: {
          status: "AFFECTED",
        },
      }),
      prisma.user.findMany({
        where: {
          role: "COMPANY_SUPERVISOR",
          supervisorStatus: "PENDING",
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      }),
      prisma.subject.findMany({
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
        include: {
          supervisor: {
            select: {
              fullName: true,
            },
          },
        },
      }),
    ]);

    return res.status(200).json({
      stats: {
        students,
        supervisors,
        subjects,
        assignments,
      },
      pendingSupervisors,
      latestSubjects,
    });
  } catch (error) {
    console.error("GET /admin/dashboard-summary error:", error);

    return res.status(500).json({
      message: error.message || "Erreur lors du chargement du tableau de bord.",
    });
  }
};

const getUserDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        cvs: {
          orderBy: {
            uploadedAt: "desc",
          },
          take: 1,
        },
        applications: {
          include: {
            subject: {
              include: {
                supervisor: true,
                documents: {
                  orderBy: {
                    createdAt: "desc",
                  },
                },
              },
            },
            binome: {
              include: {
                student1: true,
                student2: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        subjects: {
          include: {
            applications: true,
            documents: {
              orderBy: {
                createdAt: "desc",
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        student1Binomes: {
          where: {
            status: "ACCEPTED",
          },
          include: {
            student2: true,
          },
        },
        student2Binomes: {
          where: {
            status: "ACCEPTED",
          },
          include: {
            student1: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({
        message: "Utilisateur introuvable.",
      });
    }

    if (user.role === "STUDENT") {
      const applications = await prisma.application.findMany({
        where: {
          OR: [
            { studentId: id },
            {
              binome: {
                OR: [{ student1Id: id }, { student2Id: id }],
              },
            },
          ],
        },
        include: {
          subject: {
            include: {
              supervisor: true,
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
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      const activeBinome =
        user.student1Binomes?.[0] || user.student2Binomes?.[0] || null;
      const partner =
        activeBinome?.student1Id === id
          ? activeBinome?.student2
          : activeBinome?.student1;
      const affectedApplication =
        applications.find((application) => application.status === "AFFECTED") ||
        null;

      return res.status(200).json({
        ...user,
        applications,
        teamMode: partner ? "TEAM" : "SOLO",
        partner: partner || null,
        affectedApplication,
      });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error("GET /admin/users/:id error:", error);

    return res.status(500).json({
      message:
        error.message || "Erreur lors du chargement du détail utilisateur.",
    });
  }
};

const getAdminSubjects = async (req, res) => {
  try {
    const subjects = await prisma.subject.findMany({
      include: {
        supervisor: true,
        documents: {
          orderBy: {
            createdAt: "desc",
          },
        },
        applications: {
          include: {
            student: true,
            binome: {
              include: {
                student1: true,
                student2: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json(withSubjectPlacesList(subjects));
  } catch (error) {
    console.error("GET /admin/subjects error:", error);

    return res.status(500).json({
      message: error.message || "Erreur lors du chargement des sujets.",
    });
  }
};

const getAdminSubjectDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const subject = await prisma.subject.findUnique({
      where: { id },
      include: {
        supervisor: true,
        documents: {
          orderBy: {
            createdAt: "desc",
          },
        },
        applications: {
          include: {
            student: true,
            binome: {
              include: {
                student1: true,
                student2: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!subject) {
      return res.status(404).json({
        message: "Sujet introuvable.",
      });
    }

    return res.status(200).json(withSubjectPlaces(subject));
  } catch (error) {
    console.error("GET /admin/subjects/:id error:", error);

    return res.status(500).json({
      message: error.message || "Erreur lors du chargement du sujet.",
    });
  }
};

const getAffectations = async (req, res) => {
  try {
    const applications = await prisma.application.findMany({
      where: {
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
        subject: {
          include: {
            supervisor: true,
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

    return res.status(200).json(applications);
  } catch (error) {
    console.error("GET /admin/affectations error:", error);

    return res.status(500).json({
      message: error.message || "Erreur lors du chargement des affectations.",
    });
  }
};

const getCompletedAssignments = async (req, res) => {
  try {
    const applications = await prisma.application.findMany({
      where: {
        status: "COMPLETED",
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
            supervisor: true,
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

    return res.status(200).json(applications);
  } catch (error) {
    console.error("GET /admin/completed-assignments error:", error);

    return res.status(500).json({
      message: error.message || "Unable to load completed assignments.",
    });
  }
};

const getStudentReports = async (req, res) => {
  try {
    const rows = await prisma.$queryRaw`
      SELECT
        r."id",
        r."supervisorId",
        r."studentId",
        r."reason",
        r."createdAt",
        supervisor."fullName" AS "supervisorFullName",
        supervisor."email" AS "supervisorEmail",
        supervisor."phone" AS "supervisorPhone",
        student."fullName" AS "studentFullName",
        student."email" AS "studentEmail",
        student."university" AS "studentUniversity",
        student."specialty" AS "studentSpecialty",
        student."phone" AS "studentPhone"
      FROM "IncidentReport" r
      JOIN "User" supervisor ON supervisor."id" = r."supervisorId"
      JOIN "User" student ON student."id" = r."studentId"
      ORDER BY r."createdAt" DESC
    `;

    const reports = rows.map((row) => ({
      id: row.id,
      supervisorId: row.supervisorId,
      studentId: row.studentId,
      reason: row.reason,
      createdAt: row.createdAt,
      supervisor: {
        id: row.supervisorId,
        fullName: row.supervisorFullName,
        email: row.supervisorEmail,
        phone: row.supervisorPhone,
      },
      student: {
        id: row.studentId,
        fullName: row.studentFullName,
        email: row.studentEmail,
        university: row.studentUniversity,
        specialty: row.studentSpecialty,
        phone: row.studentPhone,
      },
    }));

    await resolveInfoAlerts({
      userId: req.user.id,
      pageKey: "reports",
    });

    return res.status(200).json(reports);
  } catch (error) {
    console.error("GET /admin/reports error:", error);

    return res.status(500).json({
      message: error.message || "Erreur lors du chargement des signalements.",
    });
  }
};

const getPendingSupervisors = async (req, res) => {
  try {
    const supervisors = await prisma.user.findMany({
      where: {
        role: "COMPANY_SUPERVISOR",
        supervisorStatus: {
          in: ["PENDING", "REJECTED"],
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json(supervisors);
  } catch (error) {
    console.error("GET /admin/supervisors/pending error:", error);

    return res.status(500).json({
      message:
        error.message || "Erreur lors du chargement des demandes encadrants.",
    });
  }
};

const approveSupervisor = async (req, res) => {
  try {
    const { id } = req.params;

    const supervisor = await prisma.user.findUnique({
      where: { id },
    });

    if (!supervisor) {
      await resolveActionAlert({
        userId: req.user.id,
        pageKey: "supervisors",
        refId: id,
      });

      return res.status(200).json({
        message: "Demande déjà traitée.",
      });
    }

    if (supervisor.supervisorStatus === "APPROVED") {
      await resolveActionAlert({
        userId: req.user.id,
        pageKey: "supervisors",
        refId: supervisor.id,
      });

      return res.status(200).json({
        message: "Encadrant déjà approuvé.",
      });
    }

    const updatedSupervisor = await prisma.user.update({
      where: { id },
      data: {
        supervisorStatus: "APPROVED",
      },
    });

    await createNotification({
      recipientId: updatedSupervisor.id,
      title: "Compte encadrant approuvé",
      message:
        "Votre compte encadrant a été approuvé. Vous pouvez maintenant accéder à la plateforme.",
      type: "SUPERVISOR_APPROVED",
    });

    await createInfoPageAlert({
      userId: updatedSupervisor.id,
      pageKey: "notifications",
      refId: updatedSupervisor.id,
    });

    await resolveActionAlert({
      userId: req.user.id,
      pageKey: "supervisors",
      refId: updatedSupervisor.id,
    });

    await createAuditLog({
      actorId: req.user.id,
      action: "APPROVE_SUPERVISOR",
      entity: "USER",
      entityId: id,
      details: `Approved supervisor ${updatedSupervisor.email}`,
    });

    return res.status(200).json({
      message: "Encadrant approuvé.",
    });
  } catch (error) {
    console.error("PATCH /admin/supervisors/:id/approve error:", error);

    return res.status(500).json({
      message: error.message || "Erreur lors de l’approbation.",
    });
  }
};

const rejectSupervisor = async (req, res) => {
  try {
    const { id } = req.params;

    const supervisor = await prisma.user.findUnique({
      where: { id },
    });

    if (!supervisor) {
      await resolveActionAlert({
        userId: req.user.id,
        pageKey: "supervisors",
        refId: id,
      });

      return res.status(200).json({
        message: "Demande déjà traitée.",
      });
    }

    if (supervisor.supervisorStatus === "REJECTED") {
      await resolveActionAlert({
        userId: req.user.id,
        pageKey: "supervisors",
        refId: supervisor.id,
      });

      return res.status(200).json({
        message: "Encadrant déjà refusé.",
      });
    }

    const updatedSupervisor = await prisma.user.update({
      where: { id },
      data: {
        supervisorStatus: "REJECTED",
      },
    });

    await createNotification({
      recipientId: updatedSupervisor.id,
      title: "Compte encadrant refusé",
      message: "Votre demande de compte encadrant a été refusée.",
      type: "SUPERVISOR_REJECTED",
    });

    await createInfoPageAlert({
      userId: updatedSupervisor.id,
      pageKey: "notifications",
      refId: updatedSupervisor.id,
    });

    await resolveActionAlert({
      userId: req.user.id,
      pageKey: "supervisors",
      refId: updatedSupervisor.id,
    });

    await createAuditLog({
      actorId: req.user.id,
      action: "REJECT_SUPERVISOR",
      entity: "USER",
      entityId: id,
      details: `Rejected supervisor ${updatedSupervisor.email}`,
    });

    return res.status(200).json({
      message: "Encadrant refusé.",
    });
  } catch (error) {
    console.error("PATCH /admin/supervisors/:id/reject error:", error);

    return res.status(500).json({
      message: error.message || "Erreur lors du refus.",
    });
  }
};

const removeBinomesForBannedStudent = async ({ user, adminId }) => {
  if (!user || user.role !== "STUDENT") {
    return {
      removedCount: 0,
      partnerIds: [],
      preservedAffectedCount: 0,
      preservedPartnerIds: [],
    };
  }

  const binomes = await prisma.binome.findMany({
    where: {
      OR: [{ student1Id: user.id }, { student2Id: user.id }],
    },
    include: {
      student1: true,
      student2: true,
      applications: {
        where: {
          status: "AFFECTED",
        },
        select: {
          id: true,
          subjectId: true,
        },
      },
    },
  });

  if (binomes.length === 0) {
    return {
      removedCount: 0,
      partnerIds: [],
      preservedAffectedCount: 0,
      preservedPartnerIds: [],
    };
  }

  const binomeIds = binomes.map((binome) => binome.id);

  const partnerIds = Array.from(
    new Set(
      binomes
        .map((binome) =>
          binome.student1Id === user.id ? binome.student2Id : binome.student1Id
        )
        .filter(Boolean)
    )
  );

  let preservedAffectedCount = 0;
  const preservedPartnerIds = new Set();

  await prisma.$transaction(async (tx) => {
    for (const binome of binomes) {
      const partnerId =
        binome.student1Id === user.id ? binome.student2Id : binome.student1Id;

      if (!partnerId) continue;

      for (const application of binome.applications || []) {
        const existingPartnerApplication = await tx.application.findFirst({
          where: {
            id: {
              not: application.id,
            },
            studentId: partnerId,
            subjectId: application.subjectId,
          },
          select: {
            id: true,
            status: true,
          },
        });

        if (existingPartnerApplication?.status === "AFFECTED") {
          await tx.conversation.updateMany({
            where: {
              applicationId: existingPartnerApplication.id,
            },
            data: {
              studentId: partnerId,
              binomeId: null,
            },
          });

          preservedPartnerIds.add(partnerId);
          continue;
        }

        if (existingPartnerApplication) {
          await tx.application.delete({
            where: {
              id: existingPartnerApplication.id,
            },
          });
        }

        await tx.application.update({
          where: {
            id: application.id,
          },
          data: {
            studentId: partnerId,
            binomeId: null,
          },
        });

        await tx.conversation.updateMany({
          where: {
            applicationId: application.id,
          },
          data: {
            studentId: partnerId,
            binomeId: null,
          },
        });

        preservedAffectedCount += 1;
        preservedPartnerIds.add(partnerId);
      }
    }

    await tx.conversation.deleteMany({
      where: {
        binomeId: {
          in: binomeIds,
        },
      },
    });

    await tx.recommendationScore.deleteMany({
      where: {
        binomeId: {
          in: binomeIds,
        },
      },
    });

    await tx.binome.deleteMany({
      where: {
        id: {
          in: binomeIds,
        },
      },
    });
  });

  for (const partnerId of partnerIds) {
    try {
      const preservedAffectation = preservedPartnerIds.has(partnerId);

      await createNotification({
        recipientId: partnerId,
        title: "Binôme supprimé",
        message: preservedAffectation
          ? "Votre binôme a été automatiquement supprimé car l’autre étudiant a été banni. Votre affectation est conservée."
          : "Votre binôme a été automatiquement supprimé car l’autre étudiant a été banni.",
        type: "BINOME_REMOVED",
      });

      await createInfoPageAlert({
        userId: partnerId,
        pageKey: "binome",
        refId: user.id,
      });

      if (preservedAffectation) {
        await createInfoPageAlert({
          userId: partnerId,
          pageKey: "applications",
          refId: user.id,
        });
      }
    } catch (notificationError) {
      console.error("Binome removal notification error:", notificationError);
    }
  }

  await createAuditLog({
    actorId: adminId,
    action: "REMOVE_BINOME_AFTER_BAN",
    entity: "BINOME",
    entityId: null,
    details: `Removed ${binomes.length} binome(s) after banning ${user.email}; preserved ${preservedAffectedCount} affected application(s) for partner(s)`,
  });

  return {
    removedCount: binomes.length,
    partnerIds,
    preservedAffectedCount,
    preservedPartnerIds: Array.from(preservedPartnerIds),
  };
};

const cancelAffectedApplicationsForBannedStudent = async ({ user, adminId }) => {
  if (!user || user.role !== "STUDENT") {
    return {
      cancelledCount: 0,
      applicationIds: [],
    };
  }

  const applications = await prisma.application.findMany({
    where: {
      status: "AFFECTED",
      studentId: user.id,
    },
    include: {
      subject: {
        include: {
          supervisor: true,
        },
      },
    },
  });

  if (applications.length === 0) {
    return {
      cancelledCount: 0,
      applicationIds: [],
    };
  }

  const applicationIds = applications.map((application) => application.id);

  await prisma.application.updateMany({
    where: {
      id: {
        in: applicationIds,
      },
    },
    data: {
      status: "CANCELLED",
    },
  });

  for (const application of applications) {
    try {
      if (!application.subject?.supervisorId) continue;

      await createNotification({
        recipientId: application.subject.supervisorId,
        title: "Affectation retirée",
        message: `L'affectation de ${user.fullName} au sujet "${application.subject.title}" a été retirée car l'étudiant a été banni.`,
        type: "AFFECTATION_REMOVED",
      });

      await createInfoPageAlert({
        userId: application.subject.supervisorId,
        pageKey: "applications",
        refId: application.id,
      });
    } catch (notificationError) {
      console.error("Affected application removal notification error:", notificationError);
    }
  }

  await createAuditLog({
    actorId: adminId,
    action: "REMOVE_AFFECTATION_AFTER_BAN",
    entity: "APPLICATION",
    entityId: null,
    details: `Cancelled ${applications.length} affected application(s) after banning ${user.email}`,
  });

  return {
    cancelledCount: applications.length,
    applicationIds,
  };
};

const banUser = async (req, res) => {
  try {
    const { email, reason } = req.body || {};

    if (!email) {
      return res.status(400).json({
        message: "Email requis.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingBlacklist = await prisma.blacklist.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    if (existingBlacklist) {
      return res.status(400).json({
        message: "Utilisateur déjà banni.",
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    if (user?.role === "ADMIN") {
      return res.status(400).json({
        message: "Impossible de bannir un admin.",
      });
    }

    await prisma.blacklist.create({
      data: {
        email: normalizedEmail,
        reason: reason || null,
        bannedById: req.user.id,
      },
    });

    let removedBinomes = {
      removedCount: 0,
      partnerIds: [],
      preservedAffectedCount: 0,
      preservedPartnerIds: [],
    };
    let removedAffectations = {
      cancelledCount: 0,
      applicationIds: [],
    };

    if (user?.role === "STUDENT") {
      removedBinomes = await removeBinomesForBannedStudent({
        user,
        adminId: req.user.id,
      });

      removedAffectations = await cancelAffectedApplicationsForBannedStudent({
        user,
        adminId: req.user.id,
      });
    }

    if (user) {
      await createNotification({
        recipientId: user.id,
        title: "Compte banni",
        message:
          "Votre compte a été banni. Vous ne pouvez plus accéder à la plateforme.",
        type: "ACCOUNT_BANNED",
      });
    }

    await createAuditLog({
      actorId: req.user.id,
      action: "BAN_USER",
      entity: "USER",
      entityId: user?.id || null,
      details: `Banned email ${normalizedEmail}`,
    });

    const banMessage =
      removedAffectations.cancelledCount > 0
        ? "Utilisateur banni et affectation retirée."
        : null;

    const binomeBanMessage =
      removedBinomes.removedCount > 0 &&
      removedBinomes.preservedAffectedCount > 0
        ? "Utilisateur banni, binôme supprimé et affectation du partenaire conservée."
        : null;

    return res.status(200).json({
      message:
        banMessage ||
        binomeBanMessage ||
        (removedBinomes.removedCount > 0
          ? "Utilisateur banni et binôme supprimé."
          : "Utilisateur banni."),
      removedBinomes: removedBinomes.removedCount,
      preservedAffectedApplications: removedBinomes.preservedAffectedCount,
      removedAffectations: removedAffectations.cancelledCount,
    });
  } catch (error) {
    console.error("POST /admin/blacklist error:", error);

    return res.status(500).json({
      message: error.message || "Erreur lors du bannissement.",
    });
  }
};

const unbanUser = async (req, res) => {
  try {
    const { id } = req.params || {};
    const { email } = req.body || {};
    const queryEmail = req.query?.email;

    const requestedEmail = email || queryEmail;

    if (!id && !requestedEmail) {
      return res.status(400).json({
        message: "Email ou identifiant requis.",
      });
    }

    const blacklistEntry = id
      ? await prisma.blacklist.findUnique({
          where: {
            id,
          },
        })
      : await prisma.blacklist.findUnique({
          where: {
            email: requestedEmail.trim().toLowerCase(),
          },
        });

    if (!blacklistEntry) {
      return res.status(404).json({
        message: "Entrée blacklist introuvable.",
      });
    }

    const normalizedEmail = blacklistEntry.email;

    await prisma.blacklist.delete({
      where: {
        id: blacklistEntry.id,
      },
    });

    const user = await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    if (user) {
      await createNotification({
        recipientId: user.id,
        title: "Compte réactivé",
        message: "Votre compte a été réactivé.",
        type: "ACCOUNT_UNBANNED",
      });
    }

    await createAuditLog({
      actorId: req.user.id,
      action: "UNBAN_USER",
      entity: "USER",
      entityId: user?.id || null,
      details: `Unbanned email ${normalizedEmail}`,
    });

    return res.status(200).json({
      message: "Utilisateur débanni.",
    });
  } catch (error) {
    console.error("DELETE /admin/blacklist error:", error);

    return res.status(500).json({
      message: error.message || "Erreur lors du débannissement.",
    });
  }
};

const getBlacklist = async (req, res) => {
  try {
    const blacklist = await prisma.blacklist.findMany({
      include: {
        bannedBy: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json(blacklist);
  } catch (error) {
    console.error("GET /admin/blacklist error:", error);

    return res.status(500).json({
      message: error.message || "Erreur lors du chargement de la blacklist.",
    });
  }
};

const getAuditLogs = async (req, res) => {
  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 300,
    });

    const actorIds = Array.from(
      new Set(logs.map((log) => log.actorId).filter(Boolean))
    );

    const actors =
      actorIds.length > 0
        ? await prisma.user.findMany({
            where: {
              id: {
                in: actorIds,
              },
            },
            select: {
              id: true,
              fullName: true,
              email: true,
              role: true,
            },
          })
        : [];

    const actorMap = new Map(actors.map((actor) => [actor.id, actor]));

    const hydratedLogs = logs.map((log) => ({
      ...log,
      actor: actorMap.get(log.actorId) || null,
    }));

    return res.status(200).json(hydratedLogs);
  } catch (error) {
    console.error("GET /admin/audit-logs error:", error);

    return res.status(500).json({
      message: error.message || "Erreur lors du chargement des logs.",
    });
  }
};

const exportUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    const parser = new Parser();
    const csv = parser.parse(users);

    res.header("Content-Type", "text/csv");
    res.attachment("users.csv");
    return res.send(csv);
  } catch (error) {
    console.error("GET /admin/exports/users error:", error);

    return res.status(500).json({
      message: error.message || "Erreur export utilisateurs.",
    });
  }
};

const getAcademicReports = async (req, res) => {
  try {
    const reports = await prisma.academicReport.findMany({
      orderBy: { submittedAt: "desc" },
      select: {
        id: true,
        originalName: true,
        fileName: true,
        fileType: true,
        fileSize: true,
        status: true,
        submittedAt: true,
        updatedAt: true,
        application: {
          select: {
            id: true,
            status: true,
            completedAt: true,
            subject: {
              select: {
                id: true,
                title: true,
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
        },
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            university: true,
            specialty: true,
            phone: true,
            educationField: true,
            internshipType: true,
          },
        },
      },
    });

    return res.status(200).json({ reports });
  } catch (error) {
    console.error("GET /admin/academic-reports error:", error);
    return res.status(500).json({
      message: "Unable to load academic reports.",
    });
  }
};

module.exports = {
  getDashboardSummary,
  getAllUsers,
  getUserDetails,
  getAdminSubjects,
  getAdminSubjectDetails,
  getAffectations,
  getCompletedAssignments,
  getStudentReports,
  getAcademicReports,
  getPendingSupervisors,
  approveSupervisor,
  rejectSupervisor,
  banUser,
  unbanUser,
  getBlacklist,
  getAuditLogs,
  exportUsers,
};
