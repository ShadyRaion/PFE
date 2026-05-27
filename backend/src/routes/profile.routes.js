const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");

const {
  getMyProfile,
  updateMyProfile,
} = require("../controllers/profile.controller");

router.get("/me", authMiddleware, getMyProfile);
router.patch("/me", authMiddleware, updateMyProfile);
router.put("/me", authMiddleware, updateMyProfile);
router.post("/", authMiddleware, updateMyProfile);

module.exports = router;
