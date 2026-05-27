const DEGREE_LEVELS = ["Licence", "Master", "Ingénieur"];

const ACADEMIC_YEAR_VALUES = ["FIRST_YEAR", "SECOND_YEAR", "FINAL_YEAR"];

const ACADEMIC_YEARS_BY_DEGREE = {
  Licence: ["FIRST_YEAR", "SECOND_YEAR", "FINAL_YEAR"],
  Master: ["FIRST_YEAR", "FINAL_YEAR"],
  Ingénieur: ["FIRST_YEAR", "SECOND_YEAR", "FINAL_YEAR"],
};

const INTERNSHIP_TYPES = ["PFE", "Été", "Immersion"];

const DESIRED_DURATIONS = [
  "1 month",
  "2 months",
  "3 months",
  "4 months",
  "6 months",
];

const SUPERVISOR_DEPARTMENTS = [
  "Information Technology",
  "Finance and Accounting",
  "Data Analysis and Business Intelligence",
  "Management and Human Resources",
  "Marketing and Communication",
];

const SUPERVISOR_RANKS = [
  "Junior Supervisor",
  "Senior Supervisor",
  "Project Manager",
  "Department Manager",
  "Division Manager",
  "Expert",
];

const SUPERVISOR_DIVISIONS_BY_DEPARTMENT = {
  "Information Technology": [
    "Information Systems Division",
    "Digital Transformation Division",
    "Cybersecurity and Infrastructure Division",
  ],
  "Finance and Accounting": [
    "Finance Division",
    "Accounting and Financial Control Division",
    "Risk Management Division",
  ],
  "Data Analysis and Business Intelligence": [
    "Data and Business Intelligence Division",
    "Reporting and Analytics Division",
    "Data Governance Division",
  ],
  "Management and Human Resources": [
    "Human Resources Division",
    "Administrative Management Division",
    "Training and Talent Development Division",
  ],
  "Marketing and Communication": [
    "Marketing and Communication Division",
    "Customer Experience Division",
    "Commercial Development Division",
  ],
};

const SUPERVISOR_DIVISIONS = Object.values(
  SUPERVISOR_DIVISIONS_BY_DEPARTMENT
).flat();

const isOneOf = (value, list) =>
  typeof value === "string" && list.includes(value.trim());

const parseStartDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date;
};

const validateStudentProfileFields = (data, { required = false } = {}) => {
  const errors = [];
  const out = {};

  let degreeLevelValue = null;

  if (data.degreeLevel !== undefined) {
    if (!isOneOf(data.degreeLevel, DEGREE_LEVELS)) {
      errors.push("Invalid degree level.");
    } else {
      degreeLevelValue = data.degreeLevel.trim();
      out.degreeLevel = degreeLevelValue;
    }
  } else if (required) {
    errors.push("Degree level is required.");
  }

  if (data.academicYear !== undefined) {
    if (
      typeof data.academicYear !== "string" ||
      !ACADEMIC_YEAR_VALUES.includes(data.academicYear.trim())
    ) {
      errors.push("Invalid academic year.");
    } else {
      const academicYearValue = data.academicYear.trim();
      if (degreeLevelValue) {
        const allowed = ACADEMIC_YEARS_BY_DEGREE[degreeLevelValue] || [];
        if (!allowed.includes(academicYearValue)) {
          errors.push(
            "Academic year is not valid for the selected degree level."
          );
        } else {
          out.academicYear = academicYearValue;
        }
      } else {
        out.academicYear = academicYearValue;
      }
    }
  } else if (required) {
    errors.push("Academic year is required.");
  }

  if (data.internshipType !== undefined) {
    if (!isOneOf(data.internshipType, INTERNSHIP_TYPES)) {
      errors.push("Invalid internship type.");
    } else {
      out.internshipType = data.internshipType.trim();
    }
  } else if (required) {
    errors.push("Internship type is required.");
  }

  if (data.internshipStartDate !== undefined) {
    const parsed = parseStartDate(data.internshipStartDate);
    if (!parsed) {
      errors.push("Invalid internship start date.");
    } else {
      out.internshipStartDate = parsed;
    }
  } else if (required) {
    errors.push("Internship start date is required.");
  }

  if (data.desiredDuration !== undefined) {
    if (
      typeof data.desiredDuration !== "string" ||
      !data.desiredDuration.trim()
    ) {
      errors.push("Invalid desired duration.");
    } else {
      out.desiredDuration = data.desiredDuration.trim();
    }
  } else if (required) {
    errors.push("Desired duration is required.");
  }

  return { errors, data: out };
};

const validateSupervisorProfileFields = (data, { required = false } = {}) => {
  const errors = [];
  const out = {};

  let departmentValue = null;

  if (data.department !== undefined) {
    if (typeof data.department !== "string" || !data.department.trim()) {
      errors.push("Invalid department.");
    } else {
      departmentValue = data.department.trim();
      if (!SUPERVISOR_DEPARTMENTS.includes(departmentValue)) {
        errors.push("Invalid department.");
      } else {
        out.department = departmentValue;
      }
    }
  } else if (required) {
    errors.push("Department is required.");
  }

  if (data.rank !== undefined) {
    if (typeof data.rank !== "string" || !data.rank.trim()) {
      errors.push("Invalid rank.");
    } else {
      const rankValue = data.rank.trim();
      if (!SUPERVISOR_RANKS.includes(rankValue)) {
        errors.push("Invalid rank.");
      } else {
        out.rank = rankValue;
      }
    }
  } else if (required) {
    errors.push("Rank is required.");
  }

  if (data.division !== undefined) {
    if (typeof data.division !== "string" || !data.division.trim()) {
      errors.push("Invalid division.");
    } else {
      const divisionValue = data.division.trim();
      const allowedForDept = departmentValue
        ? SUPERVISOR_DIVISIONS_BY_DEPARTMENT[departmentValue] || []
        : SUPERVISOR_DIVISIONS;
      if (!allowedForDept.includes(divisionValue)) {
        errors.push(
          departmentValue
            ? "Division does not match the selected department."
            : "Invalid division."
        );
      } else {
        out.division = divisionValue;
      }
    }
  } else if (required) {
    errors.push("Division is required.");
  }

  return { errors, data: out };
};

module.exports = {
  DEGREE_LEVELS,
  ACADEMIC_YEAR_VALUES,
  ACADEMIC_YEARS_BY_DEGREE,
  INTERNSHIP_TYPES,
  DESIRED_DURATIONS,
  SUPERVISOR_DEPARTMENTS,
  SUPERVISOR_RANKS,
  SUPERVISOR_DIVISIONS,
  SUPERVISOR_DIVISIONS_BY_DEPARTMENT,
  validateStudentProfileFields,
  validateSupervisorProfileFields,
};
