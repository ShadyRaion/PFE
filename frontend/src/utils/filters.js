export const DURATION_FILTERS = [
  { value: "ALL", label: "All durations" },
  { value: "1", label: "1 month" },
  { value: "2", label: "2 months" },
  { value: "3", label: "3 months" },
  { value: "4", label: "4 months" },
  { value: "5", label: "5 months" },
  { value: "6", label: "6 months" },
  { value: "6_PLUS", label: "6+ months" },
];

export const normalizeDurationMonths = (duration) => {
  const text = String(duration || "").toLowerCase();
  const match = text.match(/\d+/);
  return match ? Number(match[0]) : null;
};

export const matchesDurationFilter = (duration, filter) => {
  if (!filter || filter === "ALL") return true;
  const months = normalizeDurationMonths(duration);
  if (!months) return false;
  if (filter === "6_PLUS") return months > 6;
  return months === Number(filter);
};

export const createDateRange = (mode, from = "", to = "") => ({
  mode,
  from,
  to,
});

export const matchesDateRange = (date, range) => {
  if (!date) return true;
  const mode = range?.mode || "ALL";
  if (mode === "ALL") return true;

  const value = new Date(date);
  if (Number.isNaN(value.getTime())) return false;

  const startOfDay = (input) => {
    const next = new Date(input);
    next.setHours(0, 0, 0, 0);
    return next;
  };

  const endOfDay = (input) => {
    const next = new Date(input);
    next.setHours(23, 59, 59, 999);
    return next;
  };

  const now = new Date();
  if (mode === "TODAY") {
    return value >= startOfDay(now) && value <= endOfDay(now);
  }
  if (mode === "7_DAYS") {
    return now - value <= 7 * 24 * 60 * 60 * 1000;
  }
  if (mode === "30_DAYS") {
    return now - value <= 30 * 24 * 60 * 60 * 1000;
  }
  if (mode === "CUSTOM") {
    const from = range?.from ? startOfDay(range.from) : null;
    const to = range?.to ? endOfDay(range.to) : null;
    if (from && value < from) return false;
    if (to && value > to) return false;
    return Boolean(from || to);
  }
  return true;
};
