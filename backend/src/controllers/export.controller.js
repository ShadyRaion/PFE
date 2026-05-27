const { Parser } = require("json2csv");
const prisma = require("../config/prisma");

const sendCsv = (res, rows, filename) => {
  const parser = new Parser();
  const csv = parser.parse(rows);

  res.header("Content-Type", "text/csv");
  res.attachment(filename);
  return res.send(csv);
};

const requireAdmin = (req, res) => {
  if (req.user.role !== "ADMIN") {
    res.status(403).json({ message: "Admin access only" });
    return false;
  }
  return true;
};

const exportUsersByRole = (role, filename) => async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return;

    const users = await prisma.user.findMany({
      where: role ? { role } : {},
      orderBy: { createdAt: "desc" },
    });

    return sendCsv(
      res,
      users.map((user) => ({
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        department: user.specialty,
        university: user.university,
        phone: user.phone,
        supervisorStatus: user.supervisorStatus,
        createdAt: user.createdAt,
      })),
      filename
    );
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to export users" });
  }
};

const exportUsers = exportUsersByRole(null, "users-export.csv");
const exportStudents = exportUsersByRole("STUDENT", "students-export.csv");
const exportSupervisors = exportUsersByRole(
  "COMPANY_SUPERVISOR",
  "supervisors-export.csv"
);

const exportSubjects = async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return;

    const subjects = await prisma.subject.findMany({
      include: { supervisor: true, applications: true },
      orderBy: { createdAt: "desc" },
    });

    return sendCsv(
      res,
      subjects.map((subject) => ({
        title: subject.title,
        department: subject.department,
        supervisorName: subject.supervisor?.fullName,
        supervisorEmail: subject.supervisor?.email,
        technologies: (subject.technologies || []).join(", "),
        requiredSkills: (subject.requiredSkills || []).join(", "),
        places: subject.places,
        archived: subject.archived,
        applicationsCount: subject.applications?.length || 0,
        createdAt: subject.createdAt,
      })),
      "subjects-export.csv"
    );
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to export subjects" });
  }
};

const exportAuditLogs = async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return;

    const logs = await prisma.auditLog.findMany({
      include: { actor: true },
      orderBy: { createdAt: "desc" },
    });

    return sendCsv(
      res,
      logs.map((log) => ({
        action: log.action,
        entity: log.entity,
        entityId: log.entityId,
        actorName: log.actor?.fullName,
        actorEmail: log.actor?.email,
        details: log.details,
        createdAt: log.createdAt,
      })),
      "audit-logs-export.csv"
    );
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to export audit logs" });
  }
};

const exportBlacklist = async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return;

    const blacklist = await prisma.blacklist.findMany({
      include: { bannedBy: true },
      orderBy: { createdAt: "desc" },
    });

    return sendCsv(
      res,
      blacklist.map((entry) => ({
        email: entry.email,
        reason: entry.reason,
        bannedBy: entry.bannedBy?.email,
        createdAt: entry.createdAt,
      })),
      "blacklist-export.csv"
    );
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to export blacklist" });
  }
};

const exportApplications = async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return;

    const applications = await prisma.application.findMany({
      include: {
        student: true,
        binome: {
          include: {
            student1: true,
            student2: true,
          },
        },
        subject: {
          include: {
            supervisor: {
              select: {
                fullName: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const rows = applications.map((app) => {
      const candidates = app.binome
        ? [app.binome.student1, app.binome.student2].filter(Boolean)
        : [app.student].filter(Boolean);

      return {
        candidateName: candidates.map((candidate) => candidate.fullName).join(" & "),
        candidateEmail: candidates.map((candidate) => candidate.email).join(" / "),
        university: candidates
          .map((candidate) => candidate.university)
          .filter(Boolean)
          .join(" / "),
        specialty: candidates
          .map((candidate) => candidate.specialty)
          .filter(Boolean)
          .join(" / "),
        subjectTitle: app.subject.title,
        supervisorName: app.subject.supervisor.fullName,
        supervisorEmail: app.subject.supervisor.email,
        status: app.status,
        appliedAt: app.createdAt,
      };
    });

    return sendCsv(res, rows, "applications-export.csv");
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to export applications" });
  }
};

const exportAffectations = async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return;

    const affectations = await prisma.application.findMany({
      where: {
        status: "AFFECTED",
      },
      include: {
        student: true,
        binome: {
          include: {
            student1: true,
            student2: true,
          },
        },
        subject: {
          include: {
            supervisor: {
              select: {
                fullName: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    const rows = affectations.map((app) => {
      const candidates = app.binome
        ? [app.binome.student1, app.binome.student2].filter(Boolean)
        : [app.student].filter(Boolean);

      return {
        candidateName: candidates.map((candidate) => candidate.fullName).join(" & "),
        candidateEmail: candidates.map((candidate) => candidate.email).join(" / "),
        university: candidates
          .map((candidate) => candidate.university)
          .filter(Boolean)
          .join(" / "),
        specialty: candidates
          .map((candidate) => candidate.specialty)
          .filter(Boolean)
          .join(" / "),
        subjectTitle: app.subject.title,
        supervisorName: app.subject.supervisor.fullName,
        supervisorEmail: app.subject.supervisor.email,
        affectationDate: app.updatedAt,
      };
    });

    return sendCsv(res, rows, "affectations-export.csv");
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to export affectations" });
  }
};


module.exports = {
  exportUsers,
  exportStudents,
  exportSupervisors,
  exportSubjects,
  exportApplications,
  exportAffectations,
  exportAuditLogs,
  exportBlacklist,
};
