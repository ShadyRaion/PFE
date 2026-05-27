const path = require("path");
const fs = require("fs");
const prisma = require("../config/prisma");
const { createAuditLog } = require("../services/audit.service");

const sanitize = (report) => {
  if (!report) return null;
  const { filePath, ...safe } = report;
  return safe;
};

const sanitizeAssignment = (assignment) => {
  if (!assignment) return null;
  return {
    ...assignment,
    academicReport: sanitize(assignment.academicReport),
  };
};

const removeFile = (filePath) => {
  if (!filePath) return;
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error("Failed to remove academic report file:", error);
  }
};

const completedAssignmentInclude = {
  subject: {
    include: {
      supervisor: {
        select: { id: true, fullName: true, email: true },
      },
    },
  },
  student: true,
  binome: {
    include: {
      student1: true,
      student2: true,
    },
  },
  academicReport: {
    include: {
      user: { select: { id: true, fullName: true, email: true } },
    },
  },
};

const findCompletedAssignmentForStudent = async (userId) => {
  return prisma.application.findFirst({
    where: {
      status: "COMPLETED",
      OR: [
        { studentId: userId },
        {
          binome: {
            OR: [{ student1Id: userId }, { student2Id: userId }],
          },
        },
      ],
    },
    include: completedAssignmentInclude,
    orderBy: { completedAt: "desc" },
  });
};

const uploadAcademicReport = async (req, res) => {
  try {
    if (req.user.role !== "STUDENT") {
      if (req.file) removeFile(req.file.path);
      return res.status(403).json({ message: "Accès refusé." });
    }

    const file = req.file;

    if (!file) {
      return res.status(400).json({
        message: "Academic report file is required.",
      });
    }

    const assignment = await findCompletedAssignmentForStudent(req.user.id);

    if (!assignment) {
      if (req.file) removeFile(req.file.path);
      return res.status(403).json({
        message:
          "You can upload the final report only after your assignment is marked as completed.",
      });
    }

    const existing =
      assignment.academicReport ||
      (await prisma.academicReport.findUnique({
        where: { userId: req.user.id },
      }));

    let report;

    if (existing) {
      removeFile(existing.filePath);

      report = await prisma.academicReport.update({
        where: { id: existing.id },
        data: {
          originalName: file.originalname,
          fileName: file.filename,
          filePath: file.path,
          fileType: file.mimetype,
          fileSize: file.size,
          status: "SUBMITTED",
          submittedAt: new Date(),
          applicationId: assignment.id,
        },
      });
    } else {
      report = await prisma.academicReport.create({
        data: {
          userId: req.user.id,
          applicationId: assignment.id,
          originalName: file.originalname,
          fileName: file.filename,
          filePath: file.path,
          fileType: file.mimetype,
          fileSize: file.size,
        },
      });
    }

    await createAuditLog({
      actorId: req.user.id,
      action: existing ? "ACADEMIC_REPORT_REPLACE" : "ACADEMIC_REPORT_UPLOAD",
      entity: "ACADEMIC_REPORT",
      entityId: report.id,
      details: {
        originalName: report.originalName,
        fileSize: report.fileSize,
      },
    });

    return res.status(200).json({
      message: existing
        ? "Academic report replaced successfully."
        : "Academic report uploaded successfully.",
      report: sanitize(report),
    });
  } catch (error) {
    console.error("POST /academic-report/upload error:", error);
    if (req.file) removeFile(req.file.path);
    return res.status(500).json({
      message: "Unable to upload academic report. Please try again.",
    });
  }
};

const getMyAcademicReport = async (req, res) => {
  try {
    const assignment = await findCompletedAssignmentForStudent(req.user.id);

    if (!assignment) {
      return res.status(403).json({
        message:
          "Your final report page will be available after your assignment is marked as completed.",
      });
    }

    if (assignment.academicReport) {
      const { user, ...rest } = assignment.academicReport;
      return res.status(200).json({
        report: {
          ...sanitize(rest),
          ownedByMe: assignment.academicReport.userId === req.user.id,
          owner: user || null,
        },
        assignment: sanitizeAssignment(assignment),
      });
    }

    return res.status(200).json({
      report: null,
      assignment: sanitizeAssignment(assignment),
      message: "No final report has been submitted yet.",
    });
  } catch (error) {
    console.error("GET /academic-report/me error:", error);
    return res.status(500).json({
      message: "Unable to load academic report.",
    });
  }
};

const downloadAcademicReport = async (req, res) => {
  try {
    const { id } = req.params;

    const report = await prisma.academicReport.findUnique({
      where: { id },
    });

    if (!report) {
      return res.status(404).json({
        message: "Academic report not found.",
      });
    }

    let canOpen =
      req.user.role === "ADMIN" || report.userId === req.user.id;

    if (!canOpen && req.user.role === "STUDENT") {
      const assignment = await findCompletedAssignmentForStudent(req.user.id);
      if (assignment?.academicReport?.id === report.id) canOpen = true;
    }

    if (!canOpen && req.user.role === "COMPANY_SUPERVISOR") {
      const link = await prisma.application.findFirst({
        where: {
          status: "COMPLETED",
          subject: { supervisorId: req.user.id },
          academicReport: { id: report.id },
        },
        select: { id: true },
      });
      if (link) canOpen = true;
    }

    if (!canOpen) {
      return res.status(403).json({ message: "Accès refusé." });
    }

    if (!report.filePath || !fs.existsSync(report.filePath)) {
      return res.status(404).json({
        message: "Academic report file not found on server.",
      });
    }

    res.setHeader(
      "Content-Type",
      report.fileType || "application/octet-stream"
    );
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${report.originalName || report.fileName || "academic-report"}"`
    );

    return res.sendFile(path.resolve(report.filePath));
  } catch (error) {
    console.error("GET /academic-report/file/:id error:", error);
    return res.status(500).json({
      message: "Unable to open academic report.",
    });
  }
};

const deleteMyAcademicReport = async (req, res) => {
  try {
    const report = await prisma.academicReport.findFirst({
      where: { userId: req.user.id },
    });

    if (!report) {
      return res.status(404).json({
        message: "No academic report has been submitted yet.",
      });
    }

    removeFile(report.filePath);

    await prisma.academicReport.delete({
      where: { id: report.id },
    });

    await createAuditLog({
      actorId: req.user.id,
      action: "ACADEMIC_REPORT_DELETE",
      entity: "ACADEMIC_REPORT",
      entityId: report.id,
      details: { originalName: report.originalName },
    });

    return res.status(200).json({
      message: "Academic report deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE /academic-report/me error:", error);
    return res.status(500).json({
      message: "Unable to delete academic report.",
    });
  }
};

module.exports = {
  uploadAcademicReport,
  getMyAcademicReport,
  downloadAcademicReport,
  deleteMyAcademicReport,
};
