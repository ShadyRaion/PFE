const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");

const {
  getCurrentBinome,
  getBinomeRequests,
  createBinomeRequest,
  acceptBinomeRequest,
  rejectBinomeRequest,
  removeMyBinome,
} = require("../controllers/binome.controller");

router.use(authMiddleware);
router.use(roleMiddleware("STUDENT"));

router.get("/me", getCurrentBinome);
router.delete("/me", removeMyBinome);

router.get("/requests", getBinomeRequests);
router.post("/requests", createBinomeRequest);
router.patch("/requests/:id/accept", acceptBinomeRequest);
router.patch("/requests/:id/reject", rejectBinomeRequest);

module.exports = router;