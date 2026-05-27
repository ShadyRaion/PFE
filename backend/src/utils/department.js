const DEPARTMENTS = {
  COMPUTER_SCIENCE: "Computer Science",
  FINANCE: "Finance",
};

const normalizeDepartment = (value) => {
  const compact = String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");

  if (!compact) return null;

  if (
    [
      "finance",
      "finances",
      "accounting",
      "comptabilite",
      "banque",
      "banking",
    ].some((hint) => compact.includes(hint))
  ) {
    return DEPARTMENTS.FINANCE;
  }

  if (
    [
      "computerscience",
      "informatique",
      "info",
      "cs",
      "software",
      "web",
      "developpement",
      "development",
      "data",
      "devops",
      "network",
      "reseau",
      "cyber",
    ].some((hint) => compact.includes(hint))
  ) {
    return DEPARTMENTS.COMPUTER_SCIENCE;
  }

  return null;
};

module.exports = {
  DEPARTMENTS,
  normalizeDepartment,
};
