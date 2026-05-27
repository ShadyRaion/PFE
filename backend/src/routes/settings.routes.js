const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");
const { updateSettings } = require("../controllers/settings.controller");

router.patch("/", authMiddleware, updateSettings);

module.exports = router;