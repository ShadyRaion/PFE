const fs = require("fs");
const path = require("path");
const prisma = require("../config/prisma");
const { createAuditLog } = require("../services/audit.service");

const canManageSubject = async (user, subjectId) => {
  const subject = await prisma.subject.findUnique({
    where: { id: subjectId },
  });

  if (!subject) return { allowed: false, subject: null };

  if (user.role === "ADMIN") return { allowed: true, subject };

  if (
    user.role === "COMPANY_SUPERVISOR" &&
    subject.supervisorId === user.id
  ) {
    return { allowed: true, subject };
  }

  return { allowed: false, subject };
};

const uploadSubjectDocuments = async (req, res) => {
  try {
    const { subjectId } = req.params;

    const { allowed, subject } = await canManageSubject(req.user, subjectId);

    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    if (!allowed) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    const documents = await Promise.all(
      req.files.map((file) =>
        prisma.subjectDocument.create({
          data: {
            subjectId,
            uploadedById: req.user.id,
            originalName: file.originalname,
            fileName: file.filename,
            filePath: file.path,
            fileType: file.mimetype,
            fileSize: file.size,
          },
        })
      )
    );

    for (const document of documents) {
      await createAuditLog({
        actorId: req.user.id,
        action: "SUBJECT_DOCUMENT_UPLOAD",
        entity: "SUBJECT_DOCUMENT",
        entityId: document.id,
        details: {
          subjectId,
          subjectTitle: subject.title,
          originalName: document.originalName,
          fileSize: document.fileSize,
        },
      });
    }

    res.status(201).json({
      message: "Documents uploaded successfully",
      documents,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to upload documents" });
  }
};

const openSubjectDocument = async (req, res) => {
  try {
    const { id } = req.params;

    const document = await prisma.subjectDocument.findUnique({
      where: { id },
      include: {
        subject: true,
      },
    });

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    const user = req.user;
    let allowed = false;

    if (user.role === "ADMIN") {
      allowed = true;
    } else if (
      user.role === "COMPANY_SUPERVISOR" &&
      document.subject?.supervisorId === user.id
    ) {
      allowed = true;
    } else if (user.role === "STUDENT") {
      const application = await prisma.application.findFirst({
        where: {
          subjectId: document.subjectId,
          OR: [
            { studentId: user.id },
            { binome: { OR: [{ student1Id: user.id }, { student2Id: user.id }] } },
          ],
        },
        select: { id: true },
      });
      allowed = Boolean(application);
    }

    if (!allowed) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (!fs.existsSync(document.filePath)) {
      return res.status(404).json({ message: "File not found" });
    }

    const absolutePath = path.resolve(document.filePath);

    res.setHeader(
      "Content-Disposition",
      `inline; filename="${encodeURIComponent(document.originalName)}"`
    );

    res.setHeader(
      "Content-Type",
      document.fileType || "application/octet-stream"
    );

    return res.sendFile(absolutePath);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to open document" });
  }
};

const deleteSubjectDocument = async (req, res) => {
  try {
    const { id } = req.params;

    const document = await prisma.subjectDocument.findUnique({
      where: { id },
      include: {
        subject: true,
      },
    });

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    const { allowed } = await canManageSubject(req.user, document.subjectId);

    if (!allowed) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (document.filePath && fs.existsSync(document.filePath)) {
      fs.unlinkSync(document.filePath);
    }

    await prisma.subjectDocument.delete({
      where: { id },
    });

    await createAuditLog({
      actorId: req.user.id,
      action: "SUBJECT_DOCUMENT_DELETE",
      entity: "SUBJECT_DOCUMENT",
      entityId: document.id,
      details: {
        subjectId: document.subjectId,
        subjectTitle: document.subject?.title,
        originalName: document.originalName,
      },
    });

    res.status(200).json({
      message: "Document deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete document" });
  }
};

module.exports = {
  uploadSubjectDocuments,
  openSubjectDocument,
  deleteSubjectDocument,
};
