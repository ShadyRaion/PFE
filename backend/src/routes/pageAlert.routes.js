const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");

const {
  getMyPageAlerts,
  resolveMyPageAlert,
} = require("../controllers/pageAlert.controller");

router.get("/", authMiddleware, getMyPageAlerts);
router.patch("/resolve", authMiddleware, resolveMyPageAlert);

module.exports = router;