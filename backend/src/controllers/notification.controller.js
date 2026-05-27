const prisma = require("../config/prisma");
const { resolveNotificationsAlerts } = require("../services/pageAlert.service");
const { createAuditLog } = require("../services/audit.service");

const getMyNotifications = async (req, res) => {
  try {
    await resolveNotificationsAlerts(req.user.id);

    const notifications = await prisma.notification.findMany({
      where: {
        recipientId: req.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json(notifications);
  } catch (error) {
    console.error("GET /notifications error:", error);

    return res.status(500).json({
      message: "Erreur lors du chargement des notifications.",
    });
  }
};

const markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await prisma.notification.findFirst({
      where: {
        id,
        recipientId: req.user.id,
      },
    });

    if (!notification) {
      return res.status(404).json({
        message: "Notification introuvable.",
      });
    }

    const updatedNotification = await prisma.notification.update({
      where: {
        id,
      },
      data: {
        isRead: true,
      },
    });

    await createAuditLog({
      actorId: req.user.id,
      action: "NOTIFICATION_READ",
      entity: "NOTIFICATION",
      entityId: updatedNotification.id,
      details: {
        type: updatedNotification.type,
        title: updatedNotification.title,
      },
    });

    return res.status(200).json(updatedNotification);
  } catch (error) {
    console.error("PATCH /notifications/:id/read error:", error);

    return res.status(500).json({
      message: "Erreur notification.",
    });
  }
};

const markAllNotificationsRead = async (req, res) => {
  try {
    const result = await prisma.notification.updateMany({
      where: {
        recipientId: req.user.id,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    await resolveNotificationsAlerts(req.user.id);

    await createAuditLog({
      actorId: req.user.id,
      action: "NOTIFICATIONS_READ_ALL",
      entity: "NOTIFICATION",
      entityId: null,
      details: {
        count: result.count,
      },
    });

    return res.status(200).json({
      message: "Notifications marquées comme lues.",
    });
  } catch (error) {
    console.error("PATCH /notifications/read-all error:", error);

    return res.status(500).json({
      message: "Erreur notifications.",
    });
  }
};

module.exports = {
  getMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
};
