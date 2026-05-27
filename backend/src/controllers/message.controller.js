const { Prisma } = require("@prisma/client");
const { randomUUID } = require("crypto");
const prisma = require("../config/prisma");

const { createNotification } = require("../services/notification.service");
const { createMessagePageAlert } = require("../services/pageAlert.service");
const { createAuditLog } = require("../services/audit.service");
const { cleanupInactiveConversations } = require("../services/conversationCleanup.service");

const unique = (arr) => Array.from(new Set(arr.filter(Boolean)));

const rowsByIds = async (tableName, ids) => {
  const cleanIds = unique(ids);

  if (cleanIds.length === 0) return [];

  return prisma.$queryRaw(
    Prisma.sql`SELECT * FROM ${Prisma.raw(`"${tableName}"`)} WHERE "id" IN (${Prisma.join(
      cleanIds
    )})`
  );
};

const oneById = async (tableName, id) => {
  if (!id) return null;

  const rows = await prisma.$queryRaw(
    Prisma.sql`SELECT * FROM ${Prisma.raw(`"${tableName}"`)} WHERE "id" = ${id} LIMIT 1`
  );

  return rows[0] || null;
};

const userView = (user) => {
  if (!user) return null;

  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
  };
};

const hydrateConversations = async (rawConversations) => {
  const conversations = Array.isArray(rawConversations) ? rawConversations : [];

  const applicationIds = unique(
    conversations.map((conversation) => conversation.applicationId)
  );

  const conversationBinomeIds = unique(
    conversations.map((conversation) => conversation.binomeId)
  );

  const applications = await rowsByIds("Application", applicationIds);

  const applicationMap = new Map(
    applications.map((application) => [application.id, application])
  );

  const applicationBinomeIds = unique(
    applications.map((application) => application.binomeId)
  );

  const binomeIds = unique([...conversationBinomeIds, ...applicationBinomeIds]);

  const binomes = await rowsByIds("Binome", binomeIds);

  const subjectIds = unique(
    applications.map((application) => application.subjectId)
  );

  const subjects = await rowsByIds("Subject", subjectIds);

  const userIds = unique([
    ...conversations.map((conversation) => conversation.studentId),
    ...conversations.map((conversation) => conversation.supervisorId),
    ...applications.map((application) => application.studentId),
    ...subjects.map((subject) => subject.supervisorId),
    ...binomes.map((binome) => binome.student1Id),
    ...binomes.map((binome) => binome.student2Id),
  ]);

  const users = await rowsByIds("User", userIds);
  const userMap = new Map(users.map((user) => [user.id, user]));

  const subjectMap = new Map(
    subjects.map((subject) => [
      subject.id,
      {
        ...subject,
        supervisor: userView(userMap.get(subject.supervisorId)),
      },
    ])
  );

  const binomeMap = new Map(
    binomes.map((binome) => [
      binome.id,
      {
        ...binome,
        student1: userView(userMap.get(binome.student1Id)),
        student2: userView(userMap.get(binome.student2Id)),
      },
    ])
  );

  const conversationIds = unique(
    conversations.map((conversation) => conversation.id)
  );

  const allMessages =
    conversationIds.length === 0
      ? []
      : await prisma.$queryRaw(
          Prisma.sql`SELECT * FROM "Message" WHERE "conversationId" IN (${Prisma.join(
            conversationIds
          )}) ORDER BY "createdAt" DESC`
        );

  const senderIds = unique(allMessages.map((message) => message.senderId));
  const senders = await rowsByIds("User", senderIds);
  const senderMap = new Map(senders.map((user) => [user.id, user]));

  const lastMessageMap = new Map();

  for (const message of allMessages) {
    if (!lastMessageMap.has(message.conversationId)) {
      lastMessageMap.set(message.conversationId, {
        ...message,
        sender: userView(senderMap.get(message.senderId)),
      });
    }
  }

  return conversations.map((conversation) => {
    const rawApplication = conversation.applicationId
      ? applicationMap.get(conversation.applicationId)
      : null;

    const hydratedApplication = rawApplication
      ? {
          ...rawApplication,
          student: userView(userMap.get(rawApplication.studentId)),
          binome: rawApplication.binomeId
            ? binomeMap.get(rawApplication.binomeId) || null
            : null,
          subject: rawApplication.subjectId
            ? subjectMap.get(rawApplication.subjectId) || null
            : null,
        }
      : null;

    const lastMessage = lastMessageMap.get(conversation.id);

    return {
      ...conversation,
      student: userView(userMap.get(conversation.studentId)),
      supervisor: userView(userMap.get(conversation.supervisorId)),
      binome: conversation.binomeId
        ? binomeMap.get(conversation.binomeId) || null
        : null,
      application: hydratedApplication,
      messages: lastMessage ? [lastMessage] : [],
    };
  });
};

const getParticipants = (conversation) => {
  const ids = [];

  if (conversation.studentId) ids.push(conversation.studentId);
  if (conversation.supervisorId) ids.push(conversation.supervisorId);

  if (conversation.student?.id) ids.push(conversation.student.id);
  if (conversation.supervisor?.id) ids.push(conversation.supervisor.id);

  if (conversation.binome?.student1Id) ids.push(conversation.binome.student1Id);
  if (conversation.binome?.student2Id) ids.push(conversation.binome.student2Id);
  if (conversation.binome?.student1?.id) ids.push(conversation.binome.student1.id);
  if (conversation.binome?.student2?.id) ids.push(conversation.binome.student2.id);

  if (conversation.application?.studentId) {
    ids.push(conversation.application.studentId);
  }

  if (conversation.application?.student?.id) {
    ids.push(conversation.application.student.id);
  }

  if (conversation.application?.subject?.supervisorId) {
    ids.push(conversation.application.subject.supervisorId);
  }

  if (conversation.application?.subject?.supervisor?.id) {
    ids.push(conversation.application.subject.supervisor.id);
  }

  if (conversation.application?.binome?.student1Id) {
    ids.push(conversation.application.binome.student1Id);
  }

  if (conversation.application?.binome?.student2Id) {
    ids.push(conversation.application.binome.student2Id);
  }

  if (conversation.application?.binome?.student1?.id) {
    ids.push(conversation.application.binome.student1.id);
  }

  if (conversation.application?.binome?.student2?.id) {
    ids.push(conversation.application.binome.student2.id);
  }

  return unique(ids);
};

const canAccessConversation = (conversation, user) => {
  if (!conversation || !user) return false;
  if (user.role === "ADMIN") return true;

  return getParticipants(conversation).includes(user.id);
};

const ensureBinomeConversations = async (userId) => {
  const binomes = await prisma.$queryRaw(
    Prisma.sql`
      SELECT *
      FROM "Binome"
      WHERE "status" = 'ACCEPTED'
      AND ("student1Id" = ${userId} OR "student2Id" = ${userId})
    `
  );

  for (const binome of binomes) {
    const existing = await prisma.$queryRaw(
      Prisma.sql`
        SELECT *
        FROM "Conversation"
        WHERE "binomeId" = ${binome.id}
        LIMIT 1
      `
    );

    if (!existing[0]) {
      await prisma.$executeRaw(
        Prisma.sql`
          INSERT INTO "Conversation" ("id", "type", "studentId", "binomeId", "createdAt", "updatedAt")
          VALUES (${randomUUID()}, 'BINOME', ${binome.student1Id}, ${binome.id}, NOW(), NOW())
        `
      );
    }
  }
};

const ensureApplicationConversations = async (user) => {
  let applications = [];

  if (user.role === "STUDENT") {
    const binomes = await prisma.$queryRaw(
      Prisma.sql`
        SELECT *
        FROM "Binome"
        WHERE "status" = 'ACCEPTED'
        AND ("student1Id" = ${user.id} OR "student2Id" = ${user.id})
      `
    );

    const binomeIds = unique(binomes.map((binome) => binome.id));

    if (binomeIds.length > 0) {
      applications = await prisma.$queryRaw(
        Prisma.sql`
          SELECT *
          FROM "Application"
          WHERE "status" = 'AFFECTED'
          AND ("studentId" = ${user.id} OR "binomeId" IN (${Prisma.join(
            binomeIds
          )}))
        `
      );
    } else {
      applications = await prisma.$queryRaw(
        Prisma.sql`
          SELECT *
          FROM "Application"
          WHERE "status" = 'AFFECTED'
          AND "studentId" = ${user.id}
        `
      );
    }
  } else if (user.role === "COMPANY_SUPERVISOR") {
    applications = await prisma.$queryRaw(
      Prisma.sql`
        SELECT a.*
        FROM "Application" a
        JOIN "Subject" s ON s."id" = a."subjectId"
        WHERE a."status" = 'AFFECTED'
        AND s."supervisorId" = ${user.id}
      `
    );
  } else {
    applications = await prisma.$queryRaw(
      Prisma.sql`
        SELECT *
        FROM "Application"
        WHERE "status" = 'AFFECTED'
      `
    );
  }

  const subjectIds = unique(applications.map((application) => application.subjectId));
  const subjects = await rowsByIds("Subject", subjectIds);
  const subjectMap = new Map(subjects.map((subject) => [subject.id, subject]));

  for (const application of applications) {
    const existing = await prisma.$queryRaw(
      Prisma.sql`
        SELECT *
        FROM "Conversation"
        WHERE "applicationId" = ${application.id}
        LIMIT 1
      `
    );

    if (!existing[0]) {
      const subject = subjectMap.get(application.subjectId);

      if (subject) {
        await prisma.$executeRaw(
          Prisma.sql`
            INSERT INTO "Conversation" ("id", "type", "studentId", "supervisorId", "applicationId", "createdAt", "updatedAt")
            VALUES (${randomUUID()}, 'APPLICATION', ${application.studentId}, ${subject.supervisorId}, ${application.id}, NOW(), NOW())
          `
        );
      }
    }
  }
};

const getMyConversations = async (req, res) => {
  try {
    await cleanupInactiveConversations();

    if (req.user.role === "STUDENT") {
      await ensureBinomeConversations(req.user.id);
    }

    await ensureApplicationConversations(req.user);

    const rawConversations = await prisma.$queryRaw(
      Prisma.sql`
        SELECT *
        FROM "Conversation"
        ORDER BY "createdAt" DESC
      `
    );

    const hydrated = await hydrateConversations(rawConversations);

    const accessible =
      req.user.role === "ADMIN"
        ? hydrated
        : hydrated.filter((conversation) => canAccessConversation(conversation, req.user));

    const alerts = await prisma.$queryRaw(
      Prisma.sql`
        SELECT *
        FROM "PageAlert"
        WHERE "userId" = ${req.user.id}
        AND "pageKey" = 'messages'
        AND "isResolved" = false
      `
    );

    const unreadConversationIds = new Set(
      alerts.map((alert) => alert.refId).filter(Boolean)
    );

    const result = accessible.map((conversation) => ({
      ...conversation,
      hasUnread: unreadConversationIds.has(conversation.id),
      unreadCount: unreadConversationIds.has(conversation.id) ? 1 : 0,
    }));

    return res.status(200).json(result);
  } catch (error) {
    console.error("GET /messages/conversations error:", error);

    return res.status(500).json({
      message:
        error.message || "Erreur lors du chargement des conversations.",
    });
  }
};

const getConversationMessages = async (req, res) => {
  try {
    const { id } = req.params;

    const rawConversation = await oneById("Conversation", id);

    if (!rawConversation) {
      return res.status(404).json({
        message: "Conversation introuvable.",
      });
    }

    const [conversation] = await hydrateConversations([rawConversation]);

    if (!canAccessConversation(conversation, req.user)) {
      return res.status(403).json({
        message: "Accès refusé.",
      });
    }

    const messages = await prisma.$queryRaw(
      Prisma.sql`
        SELECT *
        FROM "Message"
        WHERE "conversationId" = ${id}
        ORDER BY "createdAt" ASC
      `
    );

    const senderIds = unique(messages.map((message) => message.senderId));
    const senders = await rowsByIds("User", senderIds);
    const senderMap = new Map(senders.map((sender) => [sender.id, sender]));

    const hydratedMessages = messages.map((message) => ({
      ...message,
      sender: userView(senderMap.get(message.senderId)),
    }));

    await prisma.$executeRaw(
      Prisma.sql`
        UPDATE "PageAlert"
        SET "isResolved" = true
        WHERE "userId" = ${req.user.id}
        AND "pageKey" = 'messages'
        AND "isResolved" = false
        AND ("refId" = ${id} OR "refId" IS NULL)
      `
    );

    return res.status(200).json(hydratedMessages);
  } catch (error) {
    console.error("GET /messages/conversations/:id/messages error:", error);

    return res.status(500).json({
      message: error.message || "Erreur lors du chargement des messages.",
    });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { conversationId, content } = req.body;

    if (!conversationId || !content?.trim()) {
      return res.status(400).json({
        message: "Message vide.",
      });
    }

    const rawConversation = await oneById("Conversation", conversationId);

    if (!rawConversation) {
      return res.status(404).json({
        message: "Conversation introuvable.",
      });
    }

    const [conversation] = await hydrateConversations([rawConversation]);

    if (!canAccessConversation(conversation, req.user)) {
      return res.status(403).json({
        message: "Accès refusé.",
      });
    }

    const inserted = await prisma.$queryRaw(
      Prisma.sql`
        INSERT INTO "Message" ("id", "conversationId", "senderId", "content", "createdAt")
        VALUES (${randomUUID()}, ${conversationId}, ${req.user.id}, ${content.trim()}, NOW())
        RETURNING *
      `
    );

    const createdMessage = inserted[0];

    const sender = await oneById("User", req.user.id);

    const messageWithSender = {
      ...createdMessage,
      sender: userView(sender),
    };

    const recipientIds = getParticipants(conversation).filter(
      (id) => id && id !== req.user.id
    );

    for (const recipientId of recipientIds) {
      try {
        await createNotification({
          recipientId,
          title: "Nouveau message",
          message: `${req.user.fullName} vous a envoyé un message.`,
          type: "MESSAGE",
        });

        await createMessagePageAlert({
          userId: recipientId,
          conversationId,
        });
      } catch (notificationError) {
        console.error("Message notification error:", notificationError);
      }
    }

    await createAuditLog({
      actorId: req.user.id,
      action: "MESSAGE_SEND",
      entity: "MESSAGE",
      entityId: createdMessage.id,
      details: {
        conversationId,
        recipientIds,
        contentLength: content.trim().length,
      },
    });

    return res.status(201).json(messageWithSender);
  } catch (error) {
    console.error("POST /messages/messages error:", error);

    return res.status(500).json({
      message: error.message || "Erreur lors de l’envoi du message.",
    });
  }
};

module.exports = {
  getMyConversations,
  getConversationMessages,
  sendMessage,
};
