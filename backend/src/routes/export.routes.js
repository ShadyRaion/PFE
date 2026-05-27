const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");

const {
  exportUsers,
  exportStudents,
  exportSupervisors,
  exportSubjects,
  exportApplications,
  exportAffectations,
  exportAuditLogs,
  exportBlacklist,
} = require("../controllers/export.controller");

router.get("/users", authMiddleware, exportUsers);
router.get("/students", authMiddleware, exportStudents);
router.get("/supervisors", authMiddleware, exportSupervisors);
router.get("/subjects", authMiddleware, exportSubjects);
router.get("/applications", authMiddleware, exportApplications);
router.get("/affectations", authMiddleware, exportAffectations);
router.get("/audit-logs", authMiddleware, exportAuditLogs);
router.get("/blacklist", authMiddleware, exportBlacklist);

module.exports = router;
