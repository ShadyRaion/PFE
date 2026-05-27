const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");
const subjectDocumentUpload = require("../middlewares/subjectDocument.middleware");

const {
  uploadSubjectDocuments,
  openSubjectDocument,
  deleteSubjectDocument,
} = require("../controllers/subjectDocument.controller");

router.post(
  "/:subjectId",
  authMiddleware,
  subjectDocumentUpload.array("documents"),
  uploadSubjectDocuments
);

router.get(
  "/open/:id",
  authMiddleware,
  openSubjectDocument
);

router.delete(
  "/:id",
  authMiddleware,
  deleteSubjectDocument
);

module.exports = router;