const prisma = require("../config/prisma");

const normalizeFaculty = (value) =>
  String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

const uniqueFaculties = (values = []) => {
  const seen = new Map();

  values.forEach((value) => {
    const normalized = normalizeFaculty(value);
    if (normalized && !seen.has(normalized)) {
      seen.set(normalized, String(value).trim());
    }
  });

  return Array.from(seen.values());
};

const getCandidateFaculties = (application) => {
  return uniqueFaculties([
    application?.student?.university,
    application?.binome?.student1?.university,
    application?.binome?.student2?.university,
  ]);
};

const getCandidateIds = (application) => {
  return [
    application?.studentId,
    application?.student?.id,
    application?.binome?.student1Id,
    application?.binome?.student1?.id,
    application?.binome?.student2Id,
    application?.binome?.student2?.id,
  ].filter(Boolean);
};

const facultySetsOverlap = (left = [], right = []) => {
  const normalizedRight = new Set(right.map(normalizeFaculty).filter(Boolean));
  return left.some((value) => normalizedRight.has(normalizeFaculty(value)));
};

const applicationInclude = {
  student: true,
  binome: {
    include: {
      student1: true,
      student2: true,
    },
  },
  subject: true,
};

const findAffectedApplicationForFaculties = async ({
  subjectId,
  faculties,
  excludeApplicationId,
  client = prisma,
}) => {
  const normalizedFaculties = uniqueFaculties(faculties);
  if (!subjectId || normalizedFaculties.length === 0) return null;

  const affectedApplications = await client.application.findMany({
    where: {
      subjectId,
      status: "AFFECTED",
      ...(excludeApplicationId ? { id: { not: excludeApplicationId } } : {}),
    },
    include: applicationInclude,
  });

  return (
    affectedApplications.find((application) =>
      facultySetsOverlap(getCandidateFaculties(application), normalizedFaculties)
    ) || null
  );
};

const buildFacultyLock = (application, faculties) => {
  if (!application) {
    return {
      isLocked: false,
      message: null,
      faculties: uniqueFaculties(faculties),
    };
  }

  const affectedFaculties = getCandidateFaculties(application);
  const matchedFaculties = uniqueFaculties(faculties).filter((faculty) =>
    facultySetsOverlap([faculty], affectedFaculties)
  );

  return {
    isLocked: true,
    message:
      "You cannot apply because someone from your faculty is already working on this subject.",
    faculties: matchedFaculties.length > 0 ? matchedFaculties : affectedFaculties,
    affectedApplicationId: application.id,
  };
};

const getStudentFacultyEligibility = async ({ userId, subjectId }) => {
  if (!userId || !subjectId) {
    return buildFacultyLock(null, []);
  }

  const [student, binome] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        university: true,
      },
    }),
    prisma.binome.findFirst({
      where: {
        status: "ACCEPTED",
        OR: [{ student1Id: userId }, { student2Id: userId }],
      },
      include: {
        student1: {
          select: {
            university: true,
          },
        },
        student2: {
          select: {
            university: true,
          },
        },
      },
    }),
  ]);

  const faculties = uniqueFaculties([
    student?.university,
    binome?.student1?.university,
    binome?.student2?.university,
  ]);

  const affectedApplication = await findAffectedApplicationForFaculties({
    subjectId,
    faculties,
  });

  return buildFacultyLock(affectedApplication, faculties);
};

const autoRejectSameFacultyApplications = async ({
  subjectId,
  acceptedApplicationId,
  faculties,
  client = prisma,
}) => {
  const normalizedFaculties = uniqueFaculties(faculties);
  if (!subjectId || !acceptedApplicationId || normalizedFaculties.length === 0) {
    return [];
  }

  const competingApplications = await client.application.findMany({
    where: {
      id: {
        not: acceptedApplicationId,
      },
      subjectId,
      status: {
        in: ["PENDING", "APPROVED"],
      },
    },
    include: applicationInclude,
  });

  const rejectedApplications = competingApplications.filter((application) =>
    facultySetsOverlap(getCandidateFaculties(application), normalizedFaculties)
  );

  if (rejectedApplications.length > 0) {
    await client.application.updateMany({
      where: {
        id: {
          in: rejectedApplications.map((application) => application.id),
        },
      },
      data: {
        status: "REJECTED",
      },
    });
  }

  return rejectedApplications;
};

module.exports = {
  normalizeFaculty,
  uniqueFaculties,
  getCandidateFaculties,
  getCandidateIds,
  findAffectedApplicationForFaculties,
  getStudentFacultyEligibility,
  autoRejectSameFacultyApplications,
};
