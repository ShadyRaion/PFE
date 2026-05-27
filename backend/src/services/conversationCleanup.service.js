const prisma = require("../config/prisma");

const cleanupInactiveConversations = async () => {
  const applicationConversations = await prisma.conversation.findMany({
    where: {
      applicationId: {
        not: null,
      },
    },
    include: {
      application: true,
    },
  });

  const inactiveApplicationConversationIds = applicationConversations
    .filter((conversation) => conversation.application?.status !== "AFFECTED")
    .map((conversation) => conversation.id);

  if (inactiveApplicationConversationIds.length > 0) {
    await prisma.conversation.deleteMany({
      where: {
        id: {
          in: inactiveApplicationConversationIds,
        },
      },
    });
  }

  const binomeConversations = await prisma.conversation.findMany({
    where: {
      binomeId: {
        not: null,
      },
    },
    include: {
      binome: true,
    },
  });

  const inactiveBinomeConversationIds = binomeConversations
    .filter((conversation) => conversation.binome?.status !== "ACCEPTED")
    .map((conversation) => conversation.id);

  if (inactiveBinomeConversationIds.length > 0) {
    await prisma.conversation.deleteMany({
      where: {
        id: {
          in: inactiveBinomeConversationIds,
        },
      },
    });
  }
};

module.exports = {
  cleanupInactiveConversations,
};
