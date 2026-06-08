const bcrypt = require("bcryptjs");
const { createHash, randomBytes } = require("crypto");
const prisma = require("../config/prisma");
const generateToken = require("../utils/generateToken");
const { createNotification } = require("../services/notification.service");
const { createActionPageAlert } = require("../services/pageAlert.service");
const { createAuditLog } = require("../services/audit.service");
const { sendPasswordResetEmail } = require("../services/mail.service");
const { normalizeDepartment } = require("../utils/department");
const {
  isEducationField,
  getEducationFieldLabel,
} = require("../utils/educationField");
const {
  validateStudentProfileFields,
  validateSupervisorProfileFields,
} = require("../utils/profileFields");

const sanitizeUser = (user) => {
  if (!user) return null;

  const { password, ...safeUser } = user;
  return safeUser;
};

const MIN_PASSWORD_LENGTH = 8;
const PASSWORD_RESET_TTL_MINUTES = 60;
const PASSWORD_RESET_RESPONSE =
  "If an account exists for this email, a password reset link has been sent.";

const isPasswordTooShort = (password) =>
  typeof password !== "string" || password.length < MIN_PASSWORD_LENGTH;

const invalidCredentials = (res) => {
  return res.status(401).json({
    message: "Email ou mot de passe incorrect.",
  });
};

const checkBlacklist = async (email) => {
  const normalizedEmail = email.trim().toLowerCase();

  return prisma.blacklist.findUnique({
    where: {
      email: normalizedEmail,
    },
  });
};

const makeToken = (user) => {
  return generateToken(user);
};

const hashResetToken = (token) =>
  createHash("sha256").update(token).digest("hex");

const getFrontendBaseUrl = () => {
  const explicitUrl = process.env.FRONTEND_URL?.trim();
  if (explicitUrl) return explicitUrl.replace(/\/+$/, "");

  const firstCorsOrigin = (process.env.CORS_ORIGINS || "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim())
    .find(Boolean);

  return (firstCorsOrigin || "http://localhost:5173").replace(/\/+$/, "");
};

const buildPasswordResetUrl = (token) =>
  `${getFrontendBaseUrl()}/reset-password?token=${encodeURIComponent(token)}`;

const register = async (req, res) => {
  try {
    const {
      fullName,
      email,
      password,
      university,
      specialty,
      phone,
      educationField,
      degreeLevel,
      internshipType,
      internshipStartDate,
      desiredDuration,
    } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({
        message: "Nom, email et mot de passe requis.",
      });
    }

    if (isPasswordTooShort(password)) {
      return res.status(400).json({
        message: "Password must be at least 8 characters.",
      });
    }

    if (!isEducationField(educationField)) {
      return res.status(400).json({
        message: "Please choose your education field.",
      });
    }

    const studentFields = validateStudentProfileFields(
      {
        degreeLevel,
        academicYear: req.body.academicYear,
        internshipType,
        internshipStartDate,
        desiredDuration,
      },
      { required: true }
    );

    if (studentFields.errors.length) {
      return res.status(400).json({
        message: studentFields.errors[0],
      });
    }

    const department =
      normalizeDepartment(specialty || req.body.department) ||
      getEducationFieldLabel(educationField);

    const normalizedEmail = email.trim().toLowerCase();

    const blacklisted = await checkBlacklist(normalizedEmail);

    if (blacklisted) {
      return invalidCredentials(res);
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Un compte existe déjà avec cet email.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        fullName,
        email: normalizedEmail,
        password: hashedPassword,
        role: "STUDENT",
        university: university || null,
        specialty: department,
        educationField,
        phone: phone || null,
        ...studentFields.data,
      },
    });

    const token = makeToken(user);

    await createAuditLog({
      actorId: user.id,
      action: "STUDENT_REGISTER",
      entity: "USER",
      entityId: user.id,
      details: {
        role: user.role,
        email: user.email,
        fullName: user.fullName,
      },
    });

    return res.status(201).json({
      message: "Compte créé avec succès.",
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error("POST /auth/register error:", error);

    return res.status(500).json({
      message: error.message || "Erreur lors de l’inscription.",
    });
  }
};

const supervisorRegister = async (req, res) => {
  try {
    const {
      fullName,
      email,
      password,
      phone,
      department,
      rank,
      division,
    } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({
        message: "Nom, email et mot de passe requis.",
      });
    }

    if (isPasswordTooShort(password)) {
      return res.status(400).json({
        message: "Password must be at least 8 characters.",
      });
    }

    const supervisorFields = validateSupervisorProfileFields(
      { department, rank, division },
      { required: true }
    );

    if (supervisorFields.errors.length) {
      return res.status(400).json({
        message: supervisorFields.errors[0],
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const blacklisted = await checkBlacklist(normalizedEmail);

    if (blacklisted) {
      return invalidCredentials(res);
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Un compte existe déjà avec cet email.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const supervisor = await prisma.user.create({
      data: {
        fullName,
        email: normalizedEmail,
        password: hashedPassword,
        role: "COMPANY_SUPERVISOR",
        phone: phone || null,
        supervisorStatus: "PENDING",
        ...supervisorFields.data,
      },
    });

    const admins = await prisma.user.findMany({
      where: {
        role: "ADMIN",
      },
      select: {
        id: true,
      },
    });

    for (const admin of admins) {
      try {
        await createNotification({
          recipientId: admin.id,
          title: "Nouvelle demande encadrant",
          message: `${supervisor.fullName} a demandé un accès encadrant.`,
          type: "SUPERVISOR_REQUEST",
        });

        await createActionPageAlert({
          userId: admin.id,
          pageKey: "supervisors",
          refId: supervisor.id,
        });
      } catch (alertError) {
        console.error("Supervisor request alert error:", alertError);
      }
    }

    await createAuditLog({
      actorId: supervisor.id,
      action: "SUPERVISOR_REGISTER",
      entity: "USER",
      entityId: supervisor.id,
      details: {
        role: supervisor.role,
        email: supervisor.email,
        fullName: supervisor.fullName,
        supervisorStatus: supervisor.supervisorStatus,
      },
    });

    return res.status(201).json({
      message:
        "Demande envoyée. Votre compte doit être approuvé par l’administrateur.",
      user: sanitizeUser(supervisor),
    });
  } catch (error) {
    console.error("POST /auth/supervisor/register error:", error);

    return res.status(500).json({
      message: error.message || "Erreur lors de l’inscription encadrant.",
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return invalidCredentials(res);
    }

    const normalizedEmail = email.trim().toLowerCase();

    const blacklisted = await checkBlacklist(normalizedEmail);

    if (blacklisted) {
      return invalidCredentials(res);
    }

    const user = await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    if (!user || user.role !== "STUDENT") {
      return invalidCredentials(res);
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return invalidCredentials(res);
    }

    const token = makeToken(user);

    await createAuditLog({
      actorId: user.id,
      action: "STUDENT_LOGIN",
      entity: "USER",
      entityId: user.id,
      details: {
        email: user.email,
      },
    });

    return res.status(200).json({
      message: "Connexion réussie.",
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error("POST /auth/login error:", error);

    return res.status(500).json({
      message: error.message || "Erreur lors de la connexion.",
    });
  }
};

const supervisorLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return invalidCredentials(res);
    }

    const normalizedEmail = email.trim().toLowerCase();

    const blacklisted = await checkBlacklist(normalizedEmail);

    if (blacklisted) {
      return invalidCredentials(res);
    }

    const user = await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    if (!user || user.role !== "COMPANY_SUPERVISOR") {
      return invalidCredentials(res);
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return invalidCredentials(res);
    }

    if (user.supervisorStatus !== "APPROVED") {
      return res.status(403).json({
        message: "Votre compte encadrant n’est pas encore approuvé.",
      });
    }

    const token = makeToken(user);

    await createAuditLog({
      actorId: user.id,
      action: "SUPERVISOR_LOGIN",
      entity: "USER",
      entityId: user.id,
      details: {
        email: user.email,
      },
    });

    return res.status(200).json({
      message: "Connexion réussie.",
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error("POST /auth/supervisor/login error:", error);

    return res.status(500).json({
      message: error.message || "Erreur lors de la connexion encadrant.",
    });
  }
};

const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return invalidCredentials(res);
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    if (!user || user.role !== "ADMIN") {
      return invalidCredentials(res);
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return invalidCredentials(res);
    }

    const token = makeToken(user);

    await createAuditLog({
      actorId: user.id,
      action: "ADMIN_LOGIN",
      entity: "USER",
      entityId: user.id,
      details: {
        email: user.email,
      },
    });

    return res.status(200).json({
      message: "Connexion réussie.",
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error("POST /auth/admin/login error:", error);

    return res.status(500).json({
      message: error.message || "Erreur lors de la connexion admin.",
    });
  }
};

const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body || {};

    if (!email) {
      return res.status(400).json({
        message: "Email is required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const [blacklisted, user] = await Promise.all([
      checkBlacklist(normalizedEmail),
      prisma.user.findUnique({
        where: {
          email: normalizedEmail,
        },
      }),
    ]);

    if (!blacklisted && user) {
      const rawToken = randomBytes(32).toString("hex");
      const tokenHash = hashResetToken(rawToken);
      const expiresAt = new Date(
        Date.now() + PASSWORD_RESET_TTL_MINUTES * 60 * 1000
      );

      await prisma.$transaction([
        prisma.passwordResetToken.updateMany({
          where: {
            userId: user.id,
            usedAt: null,
          },
          data: {
            usedAt: new Date(),
          },
        }),
        prisma.passwordResetToken.create({
          data: {
            userId: user.id,
            tokenHash,
            expiresAt,
          },
        }),
      ]);

      const resetUrl = buildPasswordResetUrl(rawToken);

      try {
        await sendPasswordResetEmail({
          to: user.email,
          fullName: user.fullName,
          resetUrl,
        });
      } catch (mailError) {
        console.error("Password reset email error:", mailError);
      }

      await createAuditLog({
        actorId: user.id,
        action: "PASSWORD_RESET_REQUEST",
        entity: "USER",
        entityId: user.id,
        details: {
          email: user.email,
          expiresAt,
        },
      });
    }

    return res.status(200).json({
      message: PASSWORD_RESET_RESPONSE,
    });
  } catch (error) {
    console.error("POST /auth/password-reset/request error:", error);

    return res.status(500).json({
      message: error.message || "Error while requesting password reset.",
    });
  }
};

const confirmPasswordReset = async (req, res) => {
  try {
    const { token, password, newPassword } = req.body || {};
    const nextPassword = password || newPassword;

    if (!token || !nextPassword) {
      return res.status(400).json({
        message: "Token and new password are required.",
      });
    }

    if (isPasswordTooShort(nextPassword)) {
      return res.status(400).json({
        message: "Password must be at least 8 characters.",
      });
    }

    const tokenHash = hashResetToken(token);
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: {
        tokenHash,
      },
      include: {
        user: true,
      },
    });

    if (
      !resetToken ||
      resetToken.usedAt ||
      resetToken.expiresAt.getTime() < Date.now()
    ) {
      return res.status(400).json({
        message: "Password reset link is invalid or expired.",
      });
    }

    const hashedPassword = await bcrypt.hash(nextPassword, 10);

    await prisma.$transaction([
      prisma.user.update({
        where: {
          id: resetToken.userId,
        },
        data: {
          password: hashedPassword,
        },
      }),
      prisma.passwordResetToken.update({
        where: {
          id: resetToken.id,
        },
        data: {
          usedAt: new Date(),
        },
      }),
      prisma.passwordResetToken.updateMany({
        where: {
          userId: resetToken.userId,
          usedAt: null,
          id: {
            not: resetToken.id,
          },
        },
        data: {
          usedAt: new Date(),
        },
      }),
    ]);

    await createAuditLog({
      actorId: resetToken.userId,
      action: "PASSWORD_RESET_CONFIRM",
      entity: "USER",
      entityId: resetToken.userId,
      details: {
        email: resetToken.user.email,
      },
    });

    return res.status(200).json({
      message: "Password has been reset successfully.",
    });
  } catch (error) {
    console.error("POST /auth/password-reset/confirm error:", error);

    return res.status(500).json({
      message: error.message || "Error while resetting password.",
    });
  }
};

const me = async (req, res) => {
  try {
    return res.status(200).json({
      user: sanitizeUser(req.user),
    });
  } catch (error) {
    console.error("GET /auth/me error:", error);

    return res.status(500).json({
      message: "Erreur utilisateur.",
    });
  }
};

module.exports = {
  register,
  login,
  supervisorRegister,
  supervisorLogin,
  adminLogin,
  requestPasswordReset,
  confirmPasswordReset,
  me,
};
