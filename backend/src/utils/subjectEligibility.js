const {
  DEGREE_LEVELS,
  ACADEMIC_YEAR_VALUES,
  INTERNSHIP_TYPES,
} = require("./profileFields");

const REQUIRED_STUDENT_PROFILE_FIELDS = [
  "educationField",
  "degreeLevel",
  "academicYear",
  "internshipType",
];

const isStudentProfileComplete = (student) => {
  if (!student) return false;
  return REQUIRED_STUDENT_PROFILE_FIELDS.every((key) => {
    const v = student[key];
    return typeof v === "string" && v.trim().length > 0;
  });
};

const missingStudentProfileFields = (student) => {
  if (!student) return [...REQUIRED_STUDENT_PROFILE_FIELDS];
  return REQUIRED_STUDENT_PROFILE_FIELDS.filter((key) => {
    const v = student[key];
    return !(typeof v === "string" && v.trim().length > 0);
  });
};

// Returns null when eligible. Otherwise an object { code, message } naming the failed criterion.
// Empty arrays on the subject mean "no restriction on that criterion".
const checkSubjectEligibility = (student, subject) => {
  if (!student || !subject) {
    return { code: "INVALID", message: "Invalid student or subject." };
  }

  if (!isStudentProfileComplete(student)) {
    return {
      code: "INCOMPLETE_PROFILE",
      message: "Please complete your profile before applying.",
    };
  }

  if (subject.educationField && subject.educationField !== student.educationField) {
    return {
      code: "EDUCATION_FIELD",
      message: "This subject is not available for your education field.",
    };
  }

  if (subject.internshipType && subject.internshipType !== student.internshipType) {
    return {
      code: "INTERNSHIP_TYPE",
      message: "This subject is not available for your internship type.",
    };
  }

  const degrees = Array.isArray(subject.allowedDegreeLevels)
    ? subject.allowedDegreeLevels
    : [];
  if (degrees.length > 0 && !degrees.includes(student.degreeLevel)) {
    return {
      code: "DEGREE_LEVEL",
      message: "This subject is not available for your degree level.",
    };
  }

  const years = Array.isArray(subject.allowedAcademicYears)
    ? subject.allowedAcademicYears
    : [];
  if (years.length > 0 && !years.includes(student.academicYear)) {
    return {
      code: "ACADEMIC_YEAR",
      message: "This subject is not available for your academic year.",
    };
  }

  return null;
};

// Returns a Prisma `where` fragment that restricts subjects to ones eligible for the student.
// Used in catalogue listing & recommendation candidate query.
// Implements the same logic as checkSubjectEligibility, expressed as SQL filters.
const buildEligibilityWhere = (student) => {
  if (!isStudentProfileComplete(student)) {
    // No profile → return a filter that matches nothing so the catalogue is empty.
    return { id: "__never__" };
  }
  return {
    AND: [
      {
        OR: [
          { educationField: null },
          { educationField: student.educationField },
        ],
      },
      {
        OR: [
          { internshipType: null },
          { internshipType: student.internshipType },
        ],
      },
      {
        OR: [
          { allowedDegreeLevels: { isEmpty: true } },
          { allowedDegreeLevels: { has: student.degreeLevel } },
        ],
      },
      {
        OR: [
          { allowedAcademicYears: { isEmpty: true } },
          { allowedAcademicYears: { has: student.academicYear } },
        ],
      },
    ],
  };
};

const validateSubjectEligibilityInput = (data, { requireInternshipType = false } = {}) => {
  const errors = [];
  const out = {};

  if (data.internshipType !== undefined && data.internshipType !== null && data.internshipType !== "") {
    if (!INTERNSHIP_TYPES.includes(data.internshipType)) {
      errors.push("Invalid internship type.");
    } else {
      out.internshipType = data.internshipType;
    }
  } else if (requireInternshipType) {
    errors.push("Internship type is required.");
  }

  if (data.allowedDegreeLevels !== undefined) {
    if (!Array.isArray(data.allowedDegreeLevels)) {
      errors.push("Allowed degree levels must be a list.");
    } else {
      const cleaned = data.allowedDegreeLevels
        .map((v) => (typeof v === "string" ? v.trim() : ""))
        .filter(Boolean);
      const bad = cleaned.find((v) => !DEGREE_LEVELS.includes(v));
      if (bad) {
        errors.push(`Invalid degree level: ${bad}`);
      } else {
        out.allowedDegreeLevels = Array.from(new Set(cleaned));
      }
    }
  }

  if (data.allowedAcademicYears !== undefined) {
    if (!Array.isArray(data.allowedAcademicYears)) {
      errors.push("Allowed academic years must be a list.");
    } else {
      const cleaned = data.allowedAcademicYears
        .map((v) => (typeof v === "string" ? v.trim() : ""))
        .filter(Boolean);
      const bad = cleaned.find((v) => !ACADEMIC_YEAR_VALUES.includes(v));
      if (bad) {
        errors.push(`Invalid academic year: ${bad}`);
      } else {
        out.allowedAcademicYears = Array.from(new Set(cleaned));
      }
    }
  }

  return { errors, data: out };
};

module.exports = {
  REQUIRED_STUDENT_PROFILE_FIELDS,
  isStudentProfileComplete,
  missingStudentProfileFields,
  checkSubjectEligibility,
  buildEligibilityWhere,
  validateSubjectEligibilityInput,
};
