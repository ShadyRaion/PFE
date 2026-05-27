const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");

const {
  getSupervisorApplications,
  getSupervisorInterns,
  getSupervisorCompletedAssignments,
  getSupervisorDashboardSummary,
  approveApplication,
  updateApplicationInterview,
  rejectApplication,
  cancelAffectation,
  completeAffectation,
  reportStudent,
} = require("../controllers/supervisor.controller");

router.use(authMiddleware);
router.use(roleMiddleware("COMPANY_SUPERVISOR"));

router.get("/applications", getSupervisorApplications);
router.get("/interns", getSupervisorInterns);
router.get("/completed-assignments", getSupervisorCompletedAssignments);
router.get("/dashboard-summary", getSupervisorDashboardSummary);

router.patch("/applications/:id/approve", approveApplication);
router.patch("/applications/:id/interview", updateApplicationInterview);
router.patch("/applications/:id/reject", rejectApplication);
router.patch("/affectations/:id/cancel", cancelAffectation);
router.patch("/affectations/:id/complete", completeAffectation);

router.post("/reports", reportStudent);

module.exports = router;
