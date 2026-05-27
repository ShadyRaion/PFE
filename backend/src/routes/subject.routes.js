const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");

const {
  getSubjects,
  getSubjectById,
  getMySubjects,
  createSubject,
  updateSubject,
  archiveSubject,
  unarchiveSubject,
  deleteSubject,
} = require("../controllers/subject.controller");

router.get("/", authMiddleware, getSubjects);

router.get(
  "/mine",
  authMiddleware,
  roleMiddleware("COMPANY_SUPERVISOR"),
  getMySubjects
);

router.get(
  "/my",
  authMiddleware,
  roleMiddleware("COMPANY_SUPERVISOR"),
  getMySubjects
);

router.get(
  "/my-subjects",
  authMiddleware,
  roleMiddleware("COMPANY_SUPERVISOR"),
  getMySubjects
);

router.get("/:id", authMiddleware, getSubjectById);

router.post(
  "/",
  authMiddleware,
  roleMiddleware("COMPANY_SUPERVISOR"),
  createSubject
);

router.patch(
  "/:id",
  authMiddleware,
  roleMiddleware("COMPANY_SUPERVISOR"),
  updateSubject
);

router.patch(
  "/:id/archive",
  authMiddleware,
  roleMiddleware("COMPANY_SUPERVISOR"),
  archiveSubject
);

router.patch(
  "/:id/unarchive",
  authMiddleware,
  roleMiddleware("COMPANY_SUPERVISOR"),
  unarchiveSubject
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("COMPANY_SUPERVISOR"),
  deleteSubject
);

module.exports = router;
