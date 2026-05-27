const prisma = require("../config/prisma");

const makeRefId = (kind, id) => {
  if (!id) return null;
  if (!kind) return String(id);

  return `${kind}:${id}`;
};

const extractRefId = (refId) => {
  if (!refId) return null;

  const value = String(refId);

  if (value.startsWith("ACTION:")) return value.replace("ACTION:", "");
  if (value.startsWith("INFO:")) return value.replace("INFO:", "");

  return value;
};

const isActionRef = (refId) => {
  return String(refId || "").startsWith("ACTION:");
};

const isInfoRef = (refId) => {
  return String(refId || "").startsWith("INFO:");
};

const createPageAlert = async ({
  userId,
  pageKey,
  refId = null,
  kind = null,
}) => {
  if (!userId || !pageKey) return null;

  const finalRefId = kind ? makeRefId(kind, refId || Date.now()) : refId;

  const existingAlert = await prisma.pageAlert.findFirst({
    where: {
      userId,
      pageKey,
      refId: finalRefId,
      isResolved: false,
    },
  });

  if (existingAlert) {
    return existingAlert;
  }

  return prisma.pageAlert.create({
    data: {
      userId,
      pageKey,
      refId: finalRefId,
      isResolved: false,
    },
  });
};

const createActionPageAlert = async ({ userId, pageKey, refId }) => {
  return createPageAlert({
    userId,
    pageKey,
    refId,
    kind: "ACTION",
  });
};

const createInfoPageAlert = async ({ userId, pageKey, refId }) => {
  return createPageAlert({
    userId,
    pageKey,
    refId,
    kind: "INFO",
  });
};

const createMessagePageAlert = async ({ userId, conversationId }) => {
  if (!conversationId) return null;

  return createPageAlert({
    userId,
    pageKey: "messages",
    refId: conversationId,
  });
};

const syncAdminSupervisorAlerts = async (user) => {
  if (!user || user.role !== "ADMIN") return;

  const pendingSupervisors = await prisma.user.findMany({
    where: {
      role: "COMPANY_SUPERVISOR",
      supervisorStatus: "PENDING",
    },
    select: {
      id: true,
    },
  });

  for (const supervisor of pendingSupervisors) {
    await createActionPageAlert({
      userId: user.id,
      pageKey: "supervisors",
      refId: supervisor.id,
    });
  }
};

const syncSupervisorApplicationAlerts = async (user) => {
  if (!user || user.role !== "COMPANY_SUPERVISOR") return;

  const pendingApplications = await prisma.application.findMany({
    where: {
      status: "PENDING",
      subject: {
        supervisorId: user.id,
      },
    },
    select: {
      id: true,
    },
  });

  for (const application of pendingApplications) {
    await createActionPageAlert({
      userId: user.id,
      pageKey: "applications",
      refId: application.id,
    });
  }
};

const syncStudentBinomeAlerts = async (user) => {
  if (!user || user.role !== "STUDENT") return;

  const pendingRequests = await prisma.binome.findMany({
    where: {
      status: "PENDING",
      student2Id: user.id,
    },
    select: {
      id: true,
    },
  });

  for (const request of pendingRequests) {
    await createActionPageAlert({
      userId: user.id,
      pageKey: "binome",
      refId: request.id,
    });
  }
};

const syncActionAlertsFromDatabase = async (userId) => {
  if (!userId) return;

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      role: true,
    },
  });

  if (!user) return;

  await syncAdminSupervisorAlerts(user);
  await syncSupervisorApplicationAlerts(user);
  await syncStudentBinomeAlerts(user);
};

const cleanupStaleMessageAlerts = async (userId) => {
  const alerts = await prisma.pageAlert.findMany({
    where: {
      userId,
      pageKey: "messages",
      isResolved: false,
    },
  });

  for (const alert of alerts) {
    if (!alert.refId) {
      await prisma.pageAlert.update({
        where: {
          id: alert.id,
        },
        data: {
          isResolved: true,
        },
      });

      continue;
    }

    const conversation = await prisma.conversation.findUnique({
      where: {
        id: alert.refId,
      },
    });

    if (!conversation) {
      await prisma.pageAlert.update({
        where: {
          id: alert.id,
        },
        data: {
          isResolved: true,
        },
      });
    }
  }
};

const cleanupStaleBinomeAlerts = async (userId) => {
  const alerts = await prisma.pageAlert.findMany({
    where: {
      userId,
      pageKey: "binome",
      isResolved: false,
    },
  });

  for (const alert of alerts) {
    const realRefId = extractRefId(alert.refId);

    if (!realRefId) {
      await prisma.pageAlert.update({
        where: {
          id: alert.id,
        },
        data: {
          isResolved: true,
        },
      });

      continue;
    }

    if (isActionRef(alert.refId)) {
      const request = await prisma.binome.findFirst({
        where: {
          id: realRefId,
          status: "PENDING",
          student2Id: userId,
        },
      });

      if (!request) {
        await prisma.pageAlert.update({
          where: {
            id: alert.id,
          },
          data: {
            isResolved: true,
          },
        });
      }
    }
  }
};

const cleanupStaleApplicationAlerts = async (userId) => {
  const alerts = await prisma.pageAlert.findMany({
    where: {
      userId,
      pageKey: "applications",
      isResolved: false,
    },
  });

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  for (const alert of alerts) {
    const realRefId = extractRefId(alert.refId);

    if (!realRefId) {
      await prisma.pageAlert.update({
        where: {
          id: alert.id,
        },
        data: {
          isResolved: true,
        },
      });

      continue;
    }

    const application = await prisma.application.findUnique({
      where: {
        id: realRefId,
      },
      include: {
        subject: true,
      },
    });

    if (!application) {
      await prisma.pageAlert.update({
        where: {
          id: alert.id,
        },
        data: {
          isResolved: true,
        },
      });

      continue;
    }

    if (user?.role === "COMPANY_SUPERVISOR" && isActionRef(alert.refId)) {
      const stillNeedsAction =
        application.status === "PENDING" &&
        application.subject?.supervisorId === userId;

      if (!stillNeedsAction) {
        await prisma.pageAlert.update({
          where: {
            id: alert.id,
          },
          data: {
            isResolved: true,
          },
        });
      }
    }
  }
};

const cleanupStaleSupervisorAlerts = async (userId) => {
  const alerts = await prisma.pageAlert.findMany({
    where: {
      userId,
      pageKey: "supervisors",
      isResolved: false,
    },
  });

  for (const alert of alerts) {
    const realRefId = extractRefId(alert.refId);

    if (!realRefId) {
      await prisma.pageAlert.update({
        where: {
          id: alert.id,
        },
        data: {
          isResolved: true,
        },
      });

      continue;
    }

    const supervisor = await prisma.user.findUnique({
      where: {
        id: realRefId,
      },
    });

    const stillPending =
      supervisor &&
      supervisor.role === "COMPANY_SUPERVISOR" &&
      supervisor.supervisorStatus === "PENDING";

    if (!stillPending) {
      await prisma.pageAlert.update({
        where: {
          id: alert.id,
        },
        data: {
          isResolved: true,
        },
      });
    }
  }
};

const cleanupStaleAlerts = async (userId) => {
  if (!userId) return;

  await cleanupStaleMessageAlerts(userId);
  await cleanupStaleBinomeAlerts(userId);
  await cleanupStaleApplicationAlerts(userId);
  await cleanupStaleSupervisorAlerts(userId);
};

const getPageAlerts = async (userId) => {
  if (!userId) return [];

  await syncActionAlertsFromDatabase(userId);
  await cleanupStaleAlerts(userId);

  return prisma.pageAlert.findMany({
    where: {
      userId,
      isResolved: false,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

const resolvePageAlert = async ({ userId, pageKey, refId = undefined }) => {
  if (!userId || !pageKey) return { count: 0 };

  const where = {
    userId,
    pageKey,
    isResolved: false,
  };

  if (refId !== undefined && refId !== null && refId !== "") {
    where.OR = [
      {
        refId,
      },
      {
        refId: `ACTION:${refId}`,
      },
      {
        refId: `INFO:${refId}`,
      },
    ];
  }

  return prisma.pageAlert.updateMany({
    where,
    data: {
      isResolved: true,
    },
  });
};

const resolveActionAlert = async ({ userId, pageKey, refId }) => {
  if (!userId || !pageKey) return { count: 0 };

  const where = {
    userId,
    pageKey,
    isResolved: false,
  };

  if (refId) {
    where.OR = [
      {
        refId: `ACTION:${refId}`,
      },
      {
        refId,
      },
    ];
  } else {
    where.refId = {
      startsWith: "ACTION:",
    };
  }

  return prisma.pageAlert.updateMany({
    where,
    data: {
      isResolved: true,
    },
  });
};

const resolveInfoAlerts = async ({ userId, pageKey }) => {
  if (!userId || !pageKey) return { count: 0 };

  return prisma.pageAlert.updateMany({
    where: {
      userId,
      pageKey,
      isResolved: false,
      OR: [
        {
          refId: {
            startsWith: "INFO:",
          },
        },
        {
          refId: null,
        },
      ],
    },
    data: {
      isResolved: true,
    },
  });
};

const resolveNotificationsAlerts = async (userId) => {
  if (!userId) return { count: 0 };

  return prisma.pageAlert.updateMany({
    where: {
      userId,
      pageKey: "notifications",
      isResolved: false,
    },
    data: {
      isResolved: true,
    },
  });
};

const resolveMessageAlert = async ({ userId, conversationId }) => {
  if (!userId || !conversationId) return { count: 0 };

  return prisma.pageAlert.updateMany({
    where: {
      userId,
      pageKey: "messages",
      isResolved: false,
      OR: [
        {
          refId: conversationId,
        },
        {
          refId: null,
        },
      ],
    },
    data: {
      isResolved: true,
    },
  });
};

module.exports = {
  makeRefId,
  extractRefId,
  createPageAlert,
  createActionPageAlert,
  createInfoPageAlert,
  createMessagePageAlert,
  getPageAlerts,
  resolvePageAlert,
  resolvePageAlerts: resolvePageAlert,
  resolveActionAlert,
  resolveInfoAlerts,
  resolveNotificationsAlerts,
  resolveMessageAlert,
};
