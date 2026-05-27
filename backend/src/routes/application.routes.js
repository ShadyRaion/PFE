const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");

const {
  getMyApplications,
  getStudentDashboardSummary,
  createApplication,
  cancelApplication,
  completeAssignment,
} = require("../controllers/application.controller");

router.use(authMiddleware);
router.use(roleMiddleware("STUDENT"));

router.get("/dashboard-summary", getStudentDashboardSummary);
router.get("/me", getMyApplications);
router.post("/", createApplication);
router.patch("/:id/complete", completeAssignment);
router.patch("/:id/cancel", cancelApplication);

module.exports = router;
