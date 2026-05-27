const bcrypt = require("bcrypt");
const prisma = require("../config/prisma");
const { createAuditLog } = require("../services/audit.service");

const sanitizeUser = (user) => {
  if (!user) return null;

  const { password, ...safeUser } = user;
  return safeUser;
};

const updateSettings = async (req, res) => {
  try {
    const { email, currentPassword, newPassword } = req.body;

    const data = {};

    if (email && email.trim().toLowerCase() !== req.user.email) {
      const normalizedEmail = email.trim().toLowerCase();

      const existing = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });

      if (existing) {
        return res.status(400).json({ message: "Email already exists" });
      }

      const blacklisted = await prisma.blacklist.findUnique({
        where: { email: normalizedEmail },
      });

      if (blacklisted) {
        return res.status(403).json({ message: "This email is banned" });
      }

      data.email = normalizedEmail;
    }

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ message: "Current password is required" });
      }

      const isMatch = await bcrypt.compare(currentPassword, req.user.password);

      if (!isMatch) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }

      data.password = await bcrypt.hash(newPassword, 10);
    }

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data,
    });

    await createAuditLog({
      actorId: req.user.id,
      action: "SETTINGS_UPDATE",
      entity: "USER",
      entityId: req.user.id,
      details: {
        changedEmail: Boolean(data.email),
        changedPassword: Boolean(data.password),
        previousEmail: data.email ? req.user.email : undefined,
        email: data.email || req.user.email,
      },
    });

    res.status(200).json({
      message: "Settings updated successfully",
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update settings" });
  }
};

module.exports = {
  updateSettings,
};
