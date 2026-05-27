export const EDUCATION_FIELDS = {
  INFORMATION_TECHNOLOGY: "Information Technology",
  FINANCE_ACCOUNTING: "Finance and Accounting",
  DATA_ANALYSIS_BI: "Data Analysis and Business Intelligence",
  MANAGEMENT_HR: "Management and Human Resources",
  MARKETING_COMMUNICATION: "Marketing and Communication",
};

export const EDUCATION_FIELD_OPTIONS = Object.entries(EDUCATION_FIELDS).map(
  ([value, label]) => ({ value, label })
);

export const getEducationFieldLabel = (value) =>
  EDUCATION_FIELDS[value] || null;
