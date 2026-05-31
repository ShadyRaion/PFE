const getApplicationPlacesUsed = (application) => {
  if (!application) return 0;
  if (application.studentId || application.student) return 1;

  if (application.binome) {
    return [application.binome.student1Id, application.binome.student2Id, application.binome.student1, application.binome.student2].filter(Boolean)
      .length >= 2
      ? 2
      : 1;
  }

  if (application.binomeId) return 2;

  return 0;
};

const getSubjectAssignedPlaces = (subject) =>
  (subject?.applications || [])
    .filter((application) => application.status === "AFFECTED")
    .reduce((total, application) => total + getApplicationPlacesUsed(application), 0);

const withSubjectPlaces = (subject) => {
  if (!subject) return subject;

  const places = Math.max(0, Number(subject.places || 0));
  const assignedPlaces = getSubjectAssignedPlaces(subject);

  return {
    ...subject,
    places,
    assignedPlaces,
    remainingPlaces: Math.max(places - assignedPlaces, 0),
  };
};

const withSubjectPlacesList = (subjects) => subjects.map(withSubjectPlaces);

const getSubjectAssignedPlacesById = async ({ client, subjectId }) => {
  const applications = await client.application.findMany({
    where: {
      subjectId,
      status: "AFFECTED",
    },
    include: {
      binome: {
        select: {
          student1Id: true,
          student2Id: true,
        },
      },
    },
  });

  return applications.reduce(
    (total, application) => total + getApplicationPlacesUsed(application),
    0
  );
};

module.exports = {
  getApplicationPlacesUsed,
  getSubjectAssignedPlaces,
  getSubjectAssignedPlacesById,
  withSubjectPlaces,
  withSubjectPlacesList,
};
