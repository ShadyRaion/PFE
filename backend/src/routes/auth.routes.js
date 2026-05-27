const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");

const {
  register,
  login,
  supervisorRegister,
  supervisorLogin,
  adminLogin,
  me,
} = require("../controllers/auth.controller");

router.post("/register", register);
router.post("/login", login);

router.post("/supervisor/register", supervisorRegister);
router.post("/supervisor/login", supervisorLogin);

router.post("/admin/login", adminLogin);

router.get("/me", authMiddleware, me);

module.exports = router;