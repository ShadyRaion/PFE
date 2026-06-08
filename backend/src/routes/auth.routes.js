const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");

const {
  register,
  login,
  supervisorRegister,
  supervisorLogin,
  adminLogin,
  requestPasswordReset,
  confirmPasswordReset,
  me,
} = require("../controllers/auth.controller");

router.post("/register", register);
router.post("/login", login);

router.post("/supervisor/register", supervisorRegister);
router.post("/supervisor/login", supervisorLogin);

router.post("/admin/login", adminLogin);

router.post("/password-reset/request", requestPasswordReset);
router.post("/password-reset/confirm", confirmPasswordReset);

router.get("/me", authMiddleware, me);

module.exports = router;
