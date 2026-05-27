const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = "uploads/subjects";

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const baseName = path
      .basename(file.originalname, ext)
      .replace(/[^\w.-]+/g, "-");

    cb(null, `${Date.now()}-${baseName}${ext}`);
  },
});

const subjectDocumentUpload = multer({
  storage,
});

module.exports = subjectDocumentUpload;