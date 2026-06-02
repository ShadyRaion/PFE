const bcrypt = require("bcryptjs");
const prisma = require("../config/prisma");
const generateToken = require("../utils/generateToken");
const { createNotification } = require("../services/notification.service");
const { createActionPageAlert } = require("../services/pageAlert.service");
const { createAuditLog } = require("../services/audit.service");
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
  me,
};
