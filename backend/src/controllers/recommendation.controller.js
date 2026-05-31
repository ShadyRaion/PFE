const prisma = require("../config/prisma");

const {
  attachSavedScoresToSubjectsForStudent,
} = require("../services/recommendation.service");
const { withSubjectPlacesList } = require("../services/subjectPlaces.service");
const { normalizeDepartment } = require("../utils/department");
const {
  buildEligibilityWhere,
  isStudentProfileComplete,
} = require("../utils/subjectEligibility");

const MIN_RECOMMENDATION_SCORE = 60;
const MAX_RECOMMENDATIONS = 5;

const getRecommendations = async (req, res) => {
  try {
    if (!isStudentProfileComplete(req.user)) {
      res.setHeader("X-Profile-Incomplete", "true");
      return res.status(200).json([]);
    }

    const subjects = await prisma.subject.findMany({
      where: {
        archived: false,
        ...buildEligibilityWhere(req.user),
      },
      include: {
        supervisor: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        documents: {
          orderBy: {
            createdAt: "desc",
          },
        },
        applications: {
          include: {
            binome: {
              select: {
                student1Id: true,
                student2Id: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const scoredSubjects = await attachSavedScoresToSubjectsForStudent({
      studentId: req.user.id,
      subjects,
    });

    const recommendations = withSubjectPlacesList(scoredSubjects)
      .filter((subject) => (subject.score || 0) >= MIN_RECOMMENDATION_SCORE)
      .sort((a, b) => {
        const scoreDiff = (b.score || 0) - (a.score || 0);

        if (scoreDiff !== 0) return scoreDiff;

        return new Date(b.createdAt) - new Date(a.createdAt);
      })
      .slice(0, MAX_RECOMMENDATIONS);

    return res.status(200).json(recommendations);
  } catch (error) {
    console.error("GET /recommendations error:", error);

    return res.status(500).json({
      message: error.message || "Erreur lors du chargement des recommandations.",
    });
  }
};

module.exports = {
  getRecommendations,
};
