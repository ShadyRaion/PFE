const prisma = require("../config/prisma");

const serializeDetails = (details) => {
  if (details === undefined || details === null) return null;
  if (typeof details === "string") return details;

  try {
    return JSON.stringify(details);
  } catch {
    return String(details);
  }
};

const createAuditLog = async ({
  actorId = null,
  action,
  entity,
  entityId = null,
  details = null,
}) => {
  try {
    await prisma.auditLog.create({
      data: {
        actorId,
        action,
        entity,
        entityId,
        details: serializeDetails(details),
      },
    });
  } catch (error) {
    console.error("Audit log failed:", error);
  }
};

module.exports = {
  createAuditLog,
};
