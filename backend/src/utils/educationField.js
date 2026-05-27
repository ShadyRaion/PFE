const EDUCATION_FIELDS = {
  INFORMATION_TECHNOLOGY: "Information Technology",
  FINANCE_ACCOUNTING: "Finance and Accounting",
  DATA_ANALYSIS_BI: "Data Analysis and Business Intelligence",
  MANAGEMENT_HR: "Management and Human Resources",
  MARKETING_COMMUNICATION: "Marketing and Communication",
};

const EDUCATION_FIELD_VALUES = Object.keys(EDUCATION_FIELDS);

const isEducationField = (value) =>
  typeof value === "string" && EDUCATION_FIELD_VALUES.includes(value);

const getEducationFieldLabel = (value) => EDUCATION_FIELDS[value] || null;

module.exports = {
  EDUCATION_FIELDS,
  EDUCATION_FIELD_VALUES,
  isEducationField,
  getEducationFieldLabel,
};
