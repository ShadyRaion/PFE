const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");
const upload = require("../middlewares/upload.middleware");

const {
  uploadCV,
  getMyCV,
  getCVFile,
  updateMyCVSkills,
  deleteMyCV,
} = require("../controllers/cv.controller");

router.use(authMiddleware);

router.get("/me", getMyCV);
router.get("/file/:id", getCVFile);

router.post("/", upload.any(), uploadCV);
router.post("/upload", upload.any(), uploadCV);

router.patch("/skills", updateMyCVSkills);
router.patch("/me/skills", updateMyCVSkills);
router.put("/skills", updateMyCVSkills);
router.put("/me/skills", updateMyCVSkills);

router.delete("/", deleteMyCV);
router.delete("/me", deleteMyCV);
router.delete("/:id", deleteMyCV);

module.exports = router;