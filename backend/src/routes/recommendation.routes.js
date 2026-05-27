const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");

const {
  getRecommendations,
} = require("../controllers/recommendation.controller");

router.use(authMiddleware);
router.use(roleMiddleware("STUDENT"));

router.get("/", getRecommendations);

module.exports = router;