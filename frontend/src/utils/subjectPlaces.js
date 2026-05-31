export const getRemainingPlaces = (subject) => {
  const total = Number(subject?.places || 0);
  const remaining =
    subject?.remainingPlaces !== undefined
      ? Number(subject.remainingPlaces)
      : Math.max(total - Number(subject?.assignedPlaces || 0), 0);

  return Number.isFinite(remaining) ? Math.max(remaining, 0) : 0;
};

export const getPlacesTotal = (subject) => {
  const total = Number(subject?.places || 0);
  return Number.isFinite(total) ? Math.max(total, 0) : 0;
};

export const formatStudentPlaces = (subject) =>
  `${getRemainingPlaces(subject)} remaining place${getRemainingPlaces(subject) === 1 ? "" : "s"}`;

export const formatManagerPlaces = (subject) =>
  `${getRemainingPlaces(subject)}/${getPlacesTotal(subject)} remaining`;
