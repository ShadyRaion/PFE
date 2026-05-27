const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");

const {
  getMyConversations,
  getConversationMessages,
  sendMessage,
} = require("../controllers/message.controller");

router.get("/conversations", authMiddleware, getMyConversations);

router.get(
  "/conversations/:id/messages",
  authMiddleware,
  getConversationMessages
);

router.post("/messages", authMiddleware, sendMessage);

module.exports = router;