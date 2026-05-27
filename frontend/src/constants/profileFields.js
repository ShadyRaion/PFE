export const DEGREE_LEVELS = ["Licence", "Master", "Ingénieur"];

export const ACADEMIC_YEAR_OPTIONS = [
  { value: "FIRST_YEAR", label: "1st year", labelFr: "1ère année" },
  { value: "SECOND_YEAR", label: "2nd year", labelFr: "2ème année" },
  { value: "FINAL_YEAR", label: "Final year", labelFr: "Année terminale" },
];

export const ACADEMIC_YEARS_BY_DEGREE = {
  Licence: ["FIRST_YEAR", "SECOND_YEAR", "FINAL_YEAR"],
  Master: ["FIRST_YEAR", "FINAL_YEAR"],
  Ingénieur: ["FIRST_YEAR", "SECOND_YEAR", "FINAL_YEAR"],
};

export const getAcademicYearOptions = (degreeLevel) => {
  const allowed = ACADEMIC_YEARS_BY_DEGREE[degreeLevel] || [];
  return ACADEMIC_YEAR_OPTIONS.filter((opt) => allowed.includes(opt.value));
};

export const INTERNSHIP_TYPES = ["PFE", "Été", "Immersion"];

export const DESIRED_DURATIONS = [
  "1 month",
  "2 months",
  "3 months",
  "4 months",
  "6 months",
];

export const SUPERVISOR_DEPARTMENTS = [
  "Information Technology",
  "Finance and Accounting",
  "Data Analysis and Business Intelligence",
  "Management and Human Resources",
  "Marketing and Communication",
];

export const SUPERVISOR_RANKS = [
  "Junior Supervisor",
  "Senior Supervisor",
  "Project Manager",
  "Department Manager",
  "Division Manager",
  "Expert",
];

export const SUPERVISOR_DIVISIONS_BY_DEPARTMENT = {
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

export const SUPERVISOR_DIVISIONS = Object.values(
  SUPERVISOR_DIVISIONS_BY_DEPARTMENT
).flat();

export const INTERNSHIP_TYPE_OPTIONS = [
  { value: "PFE", label: "Final-year project (PFE)", labelFr: "Projet de fin d'études (PFE)" },
  { value: "Été", label: "Summer internship", labelFr: "Stage d'été" },
  { value: "Immersion", label: "Immersion / discovery", labelFr: "Immersion / découverte" },
];

export const getInternshipTypeLabel = (value) => {
  const opt = INTERNSHIP_TYPE_OPTIONS.find((o) => o.value === value);
  return opt ? opt.label : value || "";
};

export const getAcademicYearLabel = (value) => {
  const opt = ACADEMIC_YEAR_OPTIONS.find((o) => o.value === value);
  return opt ? opt.label : value || "";
};

export const getDegreeLevelLabel = (value) => value || "";
