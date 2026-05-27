const express = require("express");
const router = express.Router();

const prisma = require("../config/prisma");
const authMiddleware = require("../middlewares/auth.middleware");

router.use(authMiddleware);

router.get("/", async (req, res) => {
  try {
    const supervisors = await prisma.user.findMany({
      where: {
        role: "COMPANY_SUPERVISOR",
        supervisorStatus: "APPROVED",
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        university: true,
        specialty: true,
        phone: true,
      },
      orderBy: {
        fullName: "asc",
      },
    });

    return res.status(200).json(supervisors);
  } catch (error) {
    console.error("GET /supervisors error:", error);

    return res.status(500).json({
      message: "Erreur lors du chargement des encadrants.",
    });
  }
});

module.exports = router;
