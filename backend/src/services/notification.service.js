const prisma = require("../config/prisma");
const { createInfoPageAlert } = require("./pageAlert.service");

const createNotification = async ({
  recipientId,
  title,
  message,
  type = "GENERAL",
  createAlert = true,
}) => {
  if (!recipientId || !title || !message) return null;

  const notification = await prisma.notification.create({
    data: {
      recipientId,
      title,
      message,
      type,
    },
  });

  if (createAlert) {
    await createInfoPageAlert({
      userId: recipientId,
      pageKey: "notifications",
      refId: notification.id,
    });
  }

  return notification;
};

const createNotifications = async ({
  recipientIds = [],
  title,
  message,
  type = "GENERAL",
  createAlert = true,
}) => {
  const uniqueRecipientIds = Array.from(new Set(recipientIds.filter(Boolean)));

  const notifications = [];

  for (const recipientId of uniqueRecipientIds) {
    const notification = await createNotification({
      recipientId,
      title,
      message,
      type,
      createAlert,
    });

    if (notification) notifications.push(notification);
  }

  return notifications;
};

module.exports = {
  createNotification,
  createNotifications,
};