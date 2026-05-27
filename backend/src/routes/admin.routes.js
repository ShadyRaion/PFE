const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");

const {
  getAllUsers,
  getDashboardSummary,
  getUserDetails,
  getAdminSubjects,
  getAdminSubjectDetails,
  getAffectations,
  getCompletedAssignments,
  getStudentReports,
  getAcademicReports,
  getPendingSupervisors,
  approveSupervisor,
  rejectSupervisor,
  banUser,
  unbanUser,
  getBlacklist,
  getAuditLogs,
  exportUsers,
} = require("../controllers/admin.controller");

router.use(authMiddleware);
router.use(roleMiddleware("ADMIN"));

router.get("/dashboard-summary", getDashboardSummary);

router.get("/users", getAllUsers);
router.get("/users/:id", getUserDetails);

router.get("/subjects", getAdminSubjects);
router.get("/subjects/:id", getAdminSubjectDetails);

router.get("/affectations", getAffectations);
router.get("/completed-assignments", getCompletedAssignments);
router.get("/reports", getStudentReports);
router.get("/academic-reports", getAcademicReports);

router.get("/supervisors/pending", getPendingSupervisors);
router.patch("/supervisors/:id/approve", approveSupervisor);
router.patch("/supervisors/:id/reject", rejectSupervisor);

router.get("/blacklist", getBlacklist);
router.post("/blacklist", banUser);
router.delete("/blacklist/:id", unbanUser);
router.delete("/blacklist", unbanUser);

router.get("/audit-logs", getAuditLogs);

router.get("/exports/users", exportUsers);

module.exports = router;
