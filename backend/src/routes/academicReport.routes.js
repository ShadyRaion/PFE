const express = require("express");
const multer = require("multer");
const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");
const upload = require("../middlewares/academicReport.middleware");

const {
  uploadAcademicReport,
  getMyAcademicReport,
  downloadAcademicReport,
  deleteMyAcademicReport,
} = require("../controllers/academicReport.controller");

router.use(authMiddleware);

router.get("/me", getMyAcademicReport);
router.get("/file/:id", downloadAcademicReport);

const handleUpload = (req, res, next) => {
  upload.single("report")(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({
            message: "File size exceeds the maximum allowed limit (10 MB).",
          });
        }
        return res.status(400).json({ message: err.message });
      }
      return res.status(400).json({
        message: err.message || "Unable to upload academic report.",
      });
    }
    return next();
  });
};

router.post(
  "/upload",
  roleMiddleware("STUDENT"),
  handleUpload,
  uploadAcademicReport
);

router.delete("/me", roleMiddleware("STUDENT"), deleteMyAcademicReport);

module.exports = router;
