const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");

const {
  getMySubjectApplications,
  getMyInterns,
  approveApplication,
  rejectApplication,
} = require("../controllers/supervisorDashboard.controller");

router.get("/applications", authMiddleware, getMySubjectApplications);
router.get("/interns", authMiddleware, getMyInterns);
router.patch("/applications/:id/approve", authMiddleware, approveApplication);
router.patch("/applications/:id/reject", authMiddleware, rejectApplication);

module.exports = router;