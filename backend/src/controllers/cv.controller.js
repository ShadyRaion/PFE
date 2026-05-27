const fs = require("fs");
const path = require("path");
const prisma = require("../config/prisma");
const { createAuditLog } = require("../services/audit.service");

const {
  parseSkillValue,
  recalculateScoresForStudent,
} = require("../services/recommendation.service");

const {
  extractSkillsFromCV,
  extractSkillsFromText,
  uniqueSkills,
} = require("../services/cvParser.service");

const uploadsDir = path.join(__dirname, "../../uploads/cvs");

const recalculateStudentScoresLater = (studentId, context) => {
  setImmediate(async () => {
    try {
      await recalculateScoresForStudent(studentId);
    } catch (scoreError) {
      console.error(`${context} score recalculation error:`, scoreError);
    }
  });
};

const ensureUploadsDir = () => {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, {
      recursive: true,
    });
  }
};

const safeParseSkills = (value) => {
  try {
    return parseSkillValue(value);
  } catch {
    return [];
  }
};

const getUploadedFile = (req) => {
  if (req.file) return req.file;

  if (Array.isArray(req.files) && req.files.length > 0) {
    return req.files[0];
  }

  if (req.files && typeof req.files === "object") {
    const firstKey = Object.keys(req.files)[0];

    if (firstKey && Array.isArray(req.files[firstKey])) {
      return req.files[firstKey][0];
    }
  }

  return null;
};

const sanitizeFileName = (fileName) => {
  return String(fileName || "cv")
    .replace(/[^\w.\-]+/g, "_")
    .replace(/_+/g, "_");
};

const persistUploadedFileIfNeeded = async (file) => {
  ensureUploadsDir();

  if (file.path && fs.existsSync(file.path)) {
    return {
      filePath: file.path,
      fileName: file.filename || path.basename(file.path),
    };
  }

  if (file.buffer) {
    const extension =
      path.extname(file.originalname || "") ||
      (file.mimetype === "application/pdf" ? ".pdf" : "");

    const fileName = `${Date.now()}-${sanitizeFileName(
      file.originalname || `cv${extension}`
    )}`;

    const filePath = path.join(uploadsDir, fileName);

    fs.writeFileSync(filePath, file.buffer);

    return {
      filePath,
      fileName,
    };
  }

  throw new Error("The uploaded file does not include a saved path or buffer.");
};

const extractSkillsFromFile = async (filePath, fileType, body = {}) => {
  const manualSkills = [
    ...safeParseSkills(body.extractedSkills),
    ...safeParseSkills(body.skills),
    ...safeParseSkills(body.technologies),
  ];

  const parsedCV = await extractSkillsFromCV(filePath, fileType);

  const extractedSkills = uniqueSkills([...parsedCV.skills, ...manualSkills]);

  // Keep extractedData.allSkills in sync with the merged list
  const extractedData = parsedCV.extractedData || {};
  extractedData.allSkills = uniqueSkills([
    ...(extractedData.allSkills || []),
    ...manualSkills,
  ]);

  return {
    extractedSkills,
    extractedData,
    rawText: parsedCV.text || "",
  };
};

const normalizeEditableSkills = async (skills = []) => {
  const rawSkills = uniqueSkills(skills);

  if (rawSkills.length === 0) {
    return [];
  }

  try {
    const nlpResult = await extractSkillsFromText(
      `SKILLS\n${rawSkills.join(", ")}`
    );

    if (Array.isArray(nlpResult.skills) && nlpResult.skills.length > 0) {
      return uniqueSkills(nlpResult.skills);
    }
  } catch (error) {
    console.error("Manual skills NLP normalization error:", error.message);
  }

  return rawSkills;
};

const uploadCV = async (req, res) => {
  try {
    const file = getUploadedFile(req);

    if (!file) {
      return res.status(400).json({
        message: "CV file is required.",
      });
    }

    const storedFile = await persistUploadedFileIfNeeded(file);

    const { extractedSkills, extractedData, rawText } = await extractSkillsFromFile(
      storedFile.filePath,
      file.mimetype,
      req.body
    );

    const existingCV = await prisma.cV.findFirst({
      where: {
        userId: req.user.id,
      },
      orderBy: {
        uploadedAt: "desc",
      },
    });

    if (existingCV) {
      try {
        if (existingCV.filePath && fs.existsSync(existingCV.filePath)) {
          fs.unlinkSync(existingCV.filePath);
        }
      } catch (fileError) {
        console.error("Old CV delete error:", fileError.message);
      }

      await prisma.cV.delete({
        where: {
          id: existingCV.id,
        },
      });
    }

    const cv = await prisma.cV.create({
      data: {
        userId: req.user.id,
        originalName: file.originalname || storedFile.fileName,
        fileName: storedFile.fileName,
        filePath: storedFile.filePath,
        fileType: file.mimetype || "application/octet-stream",
        fileSize: file.size || fs.statSync(storedFile.filePath).size,
        extractedSkills,
        extractedData,
        rawText,
      },
    });

    const extractedSkillsCount = Array.isArray(extractedSkills) ? extractedSkills.length : 0;

    await createAuditLog({
      actorId: req.user.id,
      action: existingCV ? "CV_REPLACE" : "CV_UPLOAD",
      entity: "CV",
      entityId: cv.id,
      details: {
        originalName: cv.originalName,
        fileSize: cv.fileSize,
        extractedSkillsCount,
        replacedCvId: existingCV?.id || null,
      },
    });

    recalculateStudentScoresLater(req.user.id, "CV");

    return res.status(201).json({
      message: "CV uploaded successfully.",
      cv,
    });
  } catch (error) {
    console.error("POST /cv error:", error);

    return res.status(500).json({
      message: "Error while uploading the CV.",
    });
  }
};

const getMyCV = async (req, res) => {
  try {
    const cv = await prisma.cV.findFirst({
      where: {
        userId: req.user.id,
      },
      orderBy: {
        uploadedAt: "desc",
      },
    });

    if (!cv) {
      return res.status(404).json({
        message: "Aucun CV trouvé.",
      });
    }

    return res.status(200).json(cv);
  } catch (error) {
    console.error("GET /cv/me error:", error);

    return res.status(500).json({
      message: error.message || "Erreur lors du chargement du CV.",
    });
  }
};

const getCVFile = async (req, res) => {
  try {
    const { id } = req.params;

    const cv = await prisma.cV.findUnique({
      where: {
        id,
      },
      include: {
        user: true,
      },
    });

    if (!cv) {
      return res.status(404).json({
        message: "CV introuvable.",
      });
    }

    const canOpen =
      req.user.role === "ADMIN" ||
      req.user.role === "COMPANY_SUPERVISOR" ||
      cv.userId === req.user.id;

    if (!canOpen) {
      return res.status(403).json({
        message: "Accès refusé.",
      });
    }

    if (!cv.filePath || !fs.existsSync(cv.filePath)) {
      return res.status(404).json({
        message: "Fichier introuvable.",
      });
    }

    res.setHeader("Content-Type", cv.fileType || "application/octet-stream");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${cv.originalName || cv.fileName || "cv"}"`
    );

    return res.sendFile(path.resolve(cv.filePath));
  } catch (error) {
    console.error("GET /cv/file/:id error:", error);

    return res.status(500).json({
      message: error.message || "Erreur lors de l’ouverture du CV.",
    });
  }
};

const updateMyCVSkills = async (req, res) => {
  try {
    const incomingSkills = [
      ...safeParseSkills(req.body.skills),
      ...safeParseSkills(req.body.extractedSkills),
    ];

    const normalizedSkills = await normalizeEditableSkills(incomingSkills);

    const cv = await prisma.cV.findFirst({
      where: {
        userId: req.user.id,
      },
      orderBy: {
        uploadedAt: "desc",
      },
    });

    if (!cv) {
      return res.status(404).json({
        message: "Aucun CV trouvé.",
      });
    }

    const updatedExtractedData = {
      ...(cv.extractedData && typeof cv.extractedData === "object" ? cv.extractedData : {}),
      allSkills: normalizedSkills,
    };

    const updatedCV = await prisma.cV.update({
      where: {
        id: cv.id,
      },
      data: {
        extractedSkills: normalizedSkills,
        extractedData: updatedExtractedData,
        uploadedAt: new Date(),
      },
    });

    await createAuditLog({
      actorId: req.user.id,
      action: "CV_SKILLS_UPDATE",
      entity: "CV",
      entityId: updatedCV.id,
      details: {
        skillsCount: normalizedSkills.length,
      },
    });

    recalculateStudentScoresLater(req.user.id, "CV skills update");

    return res.status(200).json({
      message: "Compétences mises à jour.",
      cv: updatedCV,
    });
  } catch (error) {
    console.error("PATCH /cv/skills error:", error);

    return res.status(500).json({
      message: "Erreur lors de la modification des compétences.",
    });
  }
};

const deleteMyCV = async (req, res) => {
  try {
    const cvId = req.params.id;

    const cv = cvId
      ? await prisma.cV.findFirst({
          where: {
            id: cvId,
            userId: req.user.id,
          },
        })
      : await prisma.cV.findFirst({
          where: {
            userId: req.user.id,
          },
          orderBy: {
            uploadedAt: "desc",
          },
        });

    if (!cv) {
      return res.status(404).json({
        message: "Aucun CV trouvé.",
      });
    }

    try {
      if (cv.filePath && fs.existsSync(cv.filePath)) {
        fs.unlinkSync(cv.filePath);
      }
    } catch (fileError) {
      console.error("CV file delete error:", fileError.message);
    }

    await prisma.cV.delete({
      where: {
        id: cv.id,
      },
    });

    await createAuditLog({
      actorId: req.user.id,
      action: "CV_DELETE",
      entity: "CV",
      entityId: cv.id,
      details: {
        originalName: cv.originalName,
        fileName: cv.fileName,
      },
    });

    recalculateStudentScoresLater(req.user.id, "CV delete");

    return res.status(200).json({
      message: "CV supprimé.",
    });
  } catch (error) {
    console.error("DELETE /cv error:", error);

    return res.status(500).json({
      message: "Erreur lors de la suppression.",
    });
  }
};

module.exports = {
  uploadCV,
  getMyCV,
  getCVFile,
  getCvFile: getCVFile,
  openCV: getCVFile,
  updateMyCVSkills,
  updateCVSkills: updateMyCVSkills,
  updateCvSkills: updateMyCVSkills,
  deleteMyCV,
  deleteCV: deleteMyCV,
  deleteCv: deleteMyCV,
};
