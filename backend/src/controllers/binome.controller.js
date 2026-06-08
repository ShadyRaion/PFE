const prisma = require("../config/prisma");

const { createNotification } = require("../services/notification.service");
const { createAuditLog } = require("../services/audit.service");
const { cleanupInactiveConversations } = require("../services/conversationCleanup.service");
const {
  createActionPageAlert,
  createInfoPageAlert,
  resolveActionAlert,
  resolveInfoAlerts,
} = require("../services/pageAlert.service");

const BINOME_PROFILE_REQUIREMENT_MESSAGE =
  "You can only create a team with a student from the same university, degree level, and academic year.";

const normalizeComparableProfileValue = (value) =>
  String(value || "").trim().toLowerCase();

const getBinomeProfileMismatch = (studentA, studentB) => {
  if (!studentA || !studentB) return BINOME_PROFILE_REQUIREMENT_MESSAGE;

  const requiredFields = ["university", "degreeLevel", "academicYear"];
  const hasMissingField = requiredFields.some(
    (field) =>
      !normalizeComparableProfileValue(studentA[field]) ||
      !normalizeComparableProfileValue(studentB[field])
  );

  if (hasMissingField) return BINOME_PROFILE_REQUIREMENT_MESSAGE;

  const sameUniversity =
    normalizeComparableProfileValue(studentA.university) ===
    normalizeComparableProfileValue(studentB.university);
  const sameDegreeLevel =
    normalizeComparableProfileValue(studentA.degreeLevel) ===
    normalizeComparableProfileValue(studentB.degreeLevel);
  const sameAcademicYear =
    normalizeComparableProfileValue(studentA.academicYear) ===
    normalizeComparableProfileValue(studentB.academicYear);

  if (!sameUniversity || !sameDegreeLevel || !sameAcademicYear) {
    return BINOME_PROFILE_REQUIREMENT_MESSAGE;
  }

  return null;
};

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
    include: {
      subject: true,
      binome: true,
    },
  });
};

const getCurrentBinome = async (req, res) => {
  try {
    const binome = await prisma.binome.findFirst({
      where: {
        status: "ACCEPTED",
        OR: [{ student1Id: req.user.id }, { student2Id: req.user.id }],
      },
      include: {
        student1: {
          select: {
            id: true,
            fullName: true,
            email: true,
            university: true,
            specialty: true,
            phone: true,
          },
        },
        student2: {
          select: {
            id: true,
            fullName: true,
            email: true,
            university: true,
            specialty: true,
            phone: true,
          },
        },
        applications: {
          where: {
            status: "AFFECTED",
          },
          include: {
            subject: true,
          },
        },
      },
    });

    await resolveInfoAlerts({
      userId: req.user.id,
      pageKey: "binome",
    });

    if (!binome) {
      return res.status(404).json({
        message: "Aucun binôme actif.",
      });
    }

    const isAffected = binome.applications?.length > 0;

    return res.status(200).json({
      ...binome,
      isAffected,
      canRemove: !isAffected,
    });
  } catch (error) {
    console.error("GET /binome/me error:", error);

    return res.status(500).json({
      message: "Erreur lors du chargement du binôme.",
    });
  }
};

const getBinomeRequests = async (req, res) => {
  try {
    await resolveInfoAlerts({
      userId: req.user.id,
      pageKey: "binome",
    });

    const requests = await prisma.binome.findMany({
      where: {
        status: "PENDING",
        OR: [{ student1Id: req.user.id }, { student2Id: req.user.id }],
      },
      include: {
        student1: {
          select: {
            id: true,
            fullName: true,
            email: true,
            university: true,
            specialty: true,
            phone: true,
          },
        },
        student2: {
          select: {
            id: true,
            fullName: true,
            email: true,
            university: true,
            specialty: true,
            phone: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json(requests);
  } catch (error) {
    console.error("GET /binome/requests error:", error);

    return res.status(500).json({
      message: "Erreur lors du chargement des invitations.",
    });
  }
};

const createBinomeRequest = async (req, res) => {
  try {
    const { receiverEmail } = req.body;

    if (!receiverEmail) {
      return res.status(400).json({
        message: "Email étudiant requis.",
      });
    }

    const senderAffected = await getUserAffectedApplication(req.user.id);

    if (senderAffected) {
      return res.status(400).json({
        message:
          "Vous êtes déjà affecté à un sujet. Vous ne pouvez plus créer un binôme.",
      });
    }

    const receiver = await prisma.user.findUnique({
      where: {
        email: receiverEmail.trim().toLowerCase(),
      },
    });

    if (!receiver || receiver.role !== "STUDENT") {
      return res.status(404).json({
        message: "Étudiant introuvable.",
      });
    }

    if (receiver.id === req.user.id) {
      return res.status(400).json({
        message: "Vous ne pouvez pas vous inviter vous-même.",
      });
    }

    const profileMismatch = getBinomeProfileMismatch(req.user, receiver);
    if (profileMismatch) {
      return res.status(400).json({
        message: profileMismatch,
        code: "BINOME_PROFILE_MISMATCH",
      });
    }

    const receiverAffected = await getUserAffectedApplication(receiver.id);

    if (receiverAffected) {
      return res.status(400).json({
        message:
          "Cet étudiant est déjà affecté à un sujet. Il ne peut plus rejoindre un binôme.",
      });
    }

    const senderActiveBinome = await prisma.binome.findFirst({
      where: {
        status: "ACCEPTED",
        OR: [{ student1Id: req.user.id }, { student2Id: req.user.id }],
      },
    });

    if (senderActiveBinome) {
      return res.status(400).json({
        message: "Vous avez déjà un binôme actif.",
      });
    }

    const receiverActiveBinome = await prisma.binome.findFirst({
      where: {
        status: "ACCEPTED",
        OR: [{ student1Id: receiver.id }, { student2Id: receiver.id }],
      },
    });

    if (receiverActiveBinome) {
      return res.status(400).json({
        message: "Cet étudiant a déjà un binôme actif.",
      });
    }

    const existingPendingRequest = await prisma.binome.findFirst({
      where: {
        status: "PENDING",
        OR: [
          {
            student1Id: req.user.id,
            student2Id: receiver.id,
          },
          {
            student1Id: receiver.id,
            student2Id: req.user.id,
          },
        ],
      },
    });

    if (existingPendingRequest) {
      return res.status(400).json({
        message: "Une invitation est déjà en attente avec cet étudiant.",
      });
    }

    const request = await prisma.binome.create({
      data: {
        student1Id: req.user.id,
        student2Id: receiver.id,
        requestedById: req.user.id,
        status: "PENDING",
      },
      include: {
        student1: true,
        student2: true,
      },
    });

    await createNotification({
      recipientId: receiver.id,
      title: "Nouvelle invitation binôme",
      message: `${req.user.fullName} vous a envoyé une invitation binôme.`,
      type: "BINOME_REQUEST",
    });

    await createActionPageAlert({
      userId: receiver.id,
      pageKey: "binome",
      refId: request.id,
    });

    await createAuditLog({
      actorId: req.user.id,
      action: "BINOME_REQUEST_CREATE",
      entity: "BINOME",
      entityId: request.id,
      details: {
        requesterId: req.user.id,
        requesterName: req.user.fullName,
        receiverId: receiver.id,
        receiverName: receiver.fullName,
      },
    });

    return res.status(201).json({
      message: "Invitation envoyée.",
      request,
    });
  } catch (error) {
    console.error("POST /binome/requests error:", error);

    return res.status(500).json({
      message: error.message || "Erreur lors de l’envoi de l’invitation.",
    });
  }
};

const acceptBinomeRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const request = await prisma.binome.findUnique({
      where: {
        id,
      },
      include: {
        student1: true,
        student2: true,
      },
    });

    if (!request) {
      await resolveActionAlert({
        userId: req.user.id,
        pageKey: "binome",
        refId: id,
      });

      return res.status(200).json({
        message: "Invitation déjà traitée.",
      });
    }

    if (request.student2Id !== req.user.id) {
      return res.status(403).json({
        message: "Vous ne pouvez pas accepter cette invitation.",
      });
    }

    if (request.status === "ACCEPTED") {
      await resolveActionAlert({
        userId: req.user.id,
        pageKey: "binome",
        refId: id,
      });

      return res.status(200).json({
        message: "Invitation déjà acceptée.",
        binome: request,
      });
    }

    if (request.status !== "PENDING") {
      await resolveActionAlert({
        userId: req.user.id,
        pageKey: "binome",
        refId: id,
      });

      return res.status(200).json({
        message: "Invitation déjà traitée.",
      });
    }

    const profileMismatch = getBinomeProfileMismatch(
      request.student1,
      request.student2
    );
    if (profileMismatch) {
      await resolveActionAlert({
        userId: req.user.id,
        pageKey: "binome",
        refId: request.id,
      });

      return res.status(400).json({
        message: profileMismatch,
        code: "BINOME_PROFILE_MISMATCH",
      });
    }

    const receiverAffected = await getUserAffectedApplication(request.student2Id);
    const senderAffected = await getUserAffectedApplication(request.student1Id);

    if (receiverAffected || senderAffected) {
      await resolveActionAlert({
        userId: req.user.id,
        pageKey: "binome",
        refId: request.id,
      });

      return res.status(400).json({
        message:
          "Impossible d’accepter cette invitation car l’un des deux étudiants est déjà affecté.",
      });
    }

    const activeForReceiver = await prisma.binome.findFirst({
      where: {
        status: "ACCEPTED",
        id: {
          not: request.id,
        },
        OR: [{ student1Id: req.user.id }, { student2Id: req.user.id }],
      },
    });

    if (activeForReceiver) {
      return res.status(400).json({
        message: "Vous avez déjà un binôme actif.",
      });
    }

    const activeForSender = await prisma.binome.findFirst({
      where: {
        status: "ACCEPTED",
        id: {
          not: request.id,
        },
        OR: [{ student1Id: request.student1Id }, { student2Id: request.student1Id }],
      },
    });

    if (activeForSender) {
      return res.status(400).json({
        message: "L’étudiant a déjà un binôme actif.",
      });
    }

    const acceptedBinome = await prisma.binome.update({
      where: {
        id: request.id,
      },
      data: {
        status: "ACCEPTED",
      },
      include: {
        student1: true,
        student2: true,
      },
    });

    const pendingCleanupWhere = {
      status: "PENDING",
      id: {
        not: acceptedBinome.id,
      },
      OR: [
        { student1Id: acceptedBinome.student1Id },
        { student2Id: acceptedBinome.student1Id },
        { student1Id: acceptedBinome.student2Id },
        { student2Id: acceptedBinome.student2Id },
      ],
    };

    const pendingRequestsToRemove = await prisma.binome.findMany({
      where: pendingCleanupWhere,
      select: {
        id: true,
        student1Id: true,
        student2Id: true,
        requestedById: true,
      },
    });

    await prisma.binome.deleteMany({
      where: pendingCleanupWhere,
    });

    const existingConversation = await prisma.conversation.findFirst({
      where: {
        binomeId: acceptedBinome.id,
      },
    });

    if (!existingConversation) {
      await prisma.conversation.create({
        data: {
          type: "BINOME",
          binomeId: acceptedBinome.id,
          studentId: acceptedBinome.student1Id,
        },
      });
    }

    await createNotification({
      recipientId: acceptedBinome.student1Id,
      title: "Invitation binôme acceptée",
      message: `${acceptedBinome.student2.fullName} a accepté votre invitation binôme.`,
      type: "BINOME_ACCEPTED",
    });

    await createInfoPageAlert({
      userId: acceptedBinome.student1Id,
      pageKey: "binome",
      refId: acceptedBinome.id,
    });

    await resolveActionAlert({
      userId: req.user.id,
      pageKey: "binome",
      refId: acceptedBinome.id,
    });

    await createAuditLog({
      actorId: req.user.id,
      action: "BINOME_REQUEST_ACCEPT",
      entity: "BINOME",
      entityId: acceptedBinome.id,
      details: {
        student1Id: acceptedBinome.student1Id,
        student1Name: acceptedBinome.student1.fullName,
        student2Id: acceptedBinome.student2Id,
        student2Name: acceptedBinome.student2.fullName,
        removedPendingRequests: pendingRequestsToRemove,
      },
    });

    return res.status(200).json({
      message: "Invitation acceptée.",
      binome: acceptedBinome,
    });
  } catch (error) {
    console.error("PATCH /binome/requests/:id/accept error:", error);

    return res.status(500).json({
      message: error.message || "Erreur lors de l’acceptation.",
    });
  }
};

const rejectBinomeRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const request = await prisma.binome.findUnique({
      where: {
        id,
      },
      include: {
        student1: true,
        student2: true,
      },
    });

    if (!request) {
      await resolveActionAlert({
        userId: req.user.id,
        pageKey: "binome",
        refId: id,
      });

      return res.status(200).json({
        message: "Invitation déjà traitée.",
      });
    }

    if (request.student2Id !== req.user.id) {
      return res.status(403).json({
        message: "Vous ne pouvez pas refuser cette invitation.",
      });
    }

    if (request.status !== "PENDING") {
      await resolveActionAlert({
        userId: req.user.id,
        pageKey: "binome",
        refId: id,
      });

      return res.status(200).json({
        message: "Invitation déjà traitée.",
      });
    }

    await prisma.binome.delete({
      where: {
        id: request.id,
      },
    });

    await cleanupInactiveConversations();

    await createNotification({
      recipientId: request.student1Id,
      title: "Invitation binôme refusée",
      message: `${request.student2.fullName} a refusé votre invitation binôme.`,
      type: "BINOME_REJECTED",
    });

    await createInfoPageAlert({
      userId: request.student1Id,
      pageKey: "binome",
      refId: request.id,
    });

    await resolveActionAlert({
      userId: req.user.id,
      pageKey: "binome",
      refId: request.id,
    });

    await createAuditLog({
      actorId: req.user.id,
      action: "BINOME_REQUEST_REJECT",
      entity: "BINOME",
      entityId: request.id,
      details: {
        requesterId: request.student1Id,
        requesterName: request.student1.fullName,
        receiverId: request.student2Id,
        receiverName: request.student2.fullName,
      },
    });

    return res.status(200).json({
      message: "Invitation refusée.",
    });
  } catch (error) {
    console.error("PATCH /binome/requests/:id/reject error:", error);

    return res.status(500).json({
      message: error.message || "Erreur lors du refus.",
    });
  }
};

const removeMyBinome = async (req, res) => {
  try {
    const binome = await prisma.binome.findFirst({
      where: {
        status: "ACCEPTED",
        OR: [{ student1Id: req.user.id }, { student2Id: req.user.id }],
      },
      include: {
        student1: true,
        student2: true,
        applications: {
          where: {
            status: "AFFECTED",
          },
        },
      },
    });

    if (!binome) {
      return res.status(404).json({
        message: "Aucun binôme actif trouvé.",
      });
    }

    if (binome.applications.length > 0) {
      return res.status(400).json({
        message: "Impossible de supprimer un binôme déjà affecté.",
      });
    }

    await prisma.conversation.deleteMany({
      where: {
        binomeId: binome.id,
      },
    });

    await prisma.binome.delete({
      where: {
        id: binome.id,
      },
    });

    await cleanupInactiveConversations();

    await resolveInfoAlerts({
      userId: req.user.id,
      pageKey: "binome",
    });

    await createAuditLog({
      actorId: req.user.id,
      action: "BINOME_REMOVE",
      entity: "BINOME",
      entityId: binome.id,
      details: {
        student1Id: binome.student1Id,
        student1Name: binome.student1?.fullName,
        student2Id: binome.student2Id,
        student2Name: binome.student2?.fullName,
      },
    });

    return res.status(200).json({
      message: "Binôme supprimé.",
    });
  } catch (error) {
    console.error("DELETE /binome/me error:", error);

    return res.status(500).json({
      message: error.message || "Erreur lors de la suppression.",
    });
  }
};

module.exports = {
  getCurrentBinome,
  getBinomeRequests,
  createBinomeRequest,
  acceptBinomeRequest,
  rejectBinomeRequest,
  removeMyBinome,
};
