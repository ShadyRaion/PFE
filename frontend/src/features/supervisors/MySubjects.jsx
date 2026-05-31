import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BookMarked,
  Search,
  Calendar,
  Eye,
  Edit3,
  Archive,
  ArchiveRestore,
  Trash2,
  FileText,
  Paperclip,
  X,
  Save,
  Upload,
  Info,
  Users,
  Clock,
  GraduationCap,
  Briefcase,
  Languages,
} from "lucide-react";
import api from "../../api/axios";
import {
  PageHeader,
  Card,
  CardBody,
  Button,
  Field,
  Input,
  Textarea,
  Select,
  Badge,
  EmptyState,
} from "../../components/ui";
import DateRangeFilter from "../../components/filters/DateRangeFilter";
import {
  DURATION_FILTERS,
  createDateRange,
  matchesDateRange,
  matchesDurationFilter,
} from "../../utils/filters";
import { EDUCATION_FIELD_OPTIONS, getEducationFieldLabel } from "../../constants/educationFields";
import {
  INTERNSHIP_TYPE_OPTIONS,
  DEGREE_LEVELS,
  ACADEMIC_YEAR_OPTIONS,
  getAcademicYearLabel,
  getInternshipTypeLabel,
} from "../../constants/profileFields";
import { formatManagerPlaces } from "../../utils/subjectPlaces";

function SubjectDetailsModal({ subject, onClose, onOpenDocument }) {
  if (!subject) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-6">
      <Card className="max-h-[90vh] w-full max-w-4xl overflow-y-auto">
        <CardBody>
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-2xl font-black text-slate-950">
                {subject.title}
              </h2>
              <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-slate-500">
                <Calendar className="h-3.5 w-3.5" strokeWidth={2.5} />
                Created on {new Date(subject.createdAt).toLocaleString()}
              </p>
              <p className="mt-1 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                <Clock className="h-3.5 w-3.5" strokeWidth={2.5} />
                Duration: {subject.duration || "N/A"}
              </p>
              <p className="mt-1 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                <Users className="h-3.5 w-3.5" strokeWidth={2.5} />
                Places: {formatManagerPlaces(subject)}
              </p>
            </div>
            <Button variant="secondary" size="sm" iconLeft={X} onClick={onClose}>
              Close
            </Button>
          </div>

          <div className="mt-6 space-y-5">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-slate-500">
                Description
              </p>
              <p className="mt-2 leading-7 text-slate-700">
                {subject.description}
              </p>
            </div>

            <div>
              <p className="text-xs font-black uppercase tracking-widest text-slate-500">
                Eligibility
              </p>
              <div className="mt-2 grid gap-2 md:grid-cols-2">
                <div className="rounded-xl border border-[#cfe1e8] bg-slate-50 p-3">
                  <p className="text-xs font-bold text-cyan-700">Education field</p>
                  <p className="mt-1 text-sm font-bold text-slate-950">
                    {getEducationFieldLabel(subject.educationField) || "-"}
                  </p>
                </div>
                <div className="rounded-xl border border-[#cfe1e8] bg-slate-50 p-3">
                  <p className="text-xs font-bold text-cyan-700">Internship type</p>
                  <p className="mt-1 text-sm font-bold text-slate-950">
                    {getInternshipTypeLabel(subject.internshipType) || "-"}
                  </p>
                </div>
                <div className="rounded-xl border border-[#cfe1e8] bg-slate-50 p-3">
                  <p className="text-xs font-bold text-cyan-700">Allowed degree levels</p>
                  <p className="mt-1 text-sm font-bold text-slate-950">
                    {subject.allowedDegreeLevels?.length
                      ? subject.allowedDegreeLevels.join(", ")
                      : "All"}
                  </p>
                </div>
                <div className="rounded-xl border border-[#cfe1e8] bg-slate-50 p-3">
                  <p className="text-xs font-bold text-cyan-700">Allowed academic years</p>
                  <p className="mt-1 text-sm font-bold text-slate-950">
                    {subject.allowedAcademicYears?.length
                      ? subject.allowedAcademicYears.map(getAcademicYearLabel).join(", ")
                      : "All"}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs font-black uppercase tracking-widest text-slate-500">
                Technologies
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {subject.technologies?.map((tech) => (
                  <Badge key={tech} variant="info" size="md">
                    {tech}
                  </Badge>
                ))}
                {(!subject.technologies || subject.technologies.length === 0) && (
                  <p className="text-sm text-slate-500">No technology.</p>
                )}
              </div>
            </div>

            <div>
              <p className="text-xs font-black uppercase tracking-widest text-slate-500">
                Required skills
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {subject.requiredSkills?.map((skill) => (
                  <Badge key={skill} variant="neutral" size="md">
                    {skill}
                  </Badge>
                ))}
                {(!subject.requiredSkills || subject.requiredSkills.length === 0) && (
                  <p className="text-sm text-slate-500">No skills.</p>
                )}
              </div>
            </div>

            <div>
              <p className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-slate-500">
                <Languages className="h-3.5 w-3.5" strokeWidth={2.5} />
                Languages
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {subject.languages?.map((language) => (
                  <Badge key={language} variant="info" size="md">
                    {language}
                  </Badge>
                ))}
                {(!subject.languages || subject.languages.length === 0) && (
                  <p className="text-sm text-slate-500">No language.</p>
                )}
              </div>
            </div>

            <div>
              <p className="text-xs font-black uppercase tracking-widest text-slate-500">
                Documents
              </p>
              <div className="mt-2 space-y-1.5">
                {subject.documents?.map((document) => (
                  <button
                    key={document.id}
                    onClick={() => onOpenDocument(document)}
                    className="flex w-full items-center gap-2 rounded-xl border border-[#cfe1e8] bg-slate-50 px-4 py-3 text-left text-sm font-semibold text-cyan-700 transition hover:border-cyan-300 hover:bg-cyan-50"
                  >
                    <FileText className="h-4 w-4 shrink-0" strokeWidth={2.5} />
                    <span className="truncate">{document.originalName}</span>
                  </button>
                ))}
                {(!subject.documents || subject.documents.length === 0) && (
                  <p className="text-sm text-slate-500">No document.</p>
                )}
              </div>
            </div>

            <div>
              <p className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-slate-500">
                <Users className="h-3.5 w-3.5" strokeWidth={2.5} />
                Applications
              </p>
              <div className="mt-2 space-y-1.5">
                {subject.applications?.map((application) => (
                  <div
                    key={application.id}
                    className="rounded-xl border border-[#cfe1e8] bg-slate-50 p-4"
                  >
                    <p className="font-bold text-slate-950">
                      {application.student
                        ? application.student.fullName
                        : `${application.binome?.student1?.fullName} & ${application.binome?.student2?.fullName}`}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {application.status} —{" "}
                      {new Date(application.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}
                {(!subject.applications || subject.applications.length === 0) && (
                  <p className="text-sm text-slate-500">No application.</p>
                )}
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

function MySubjects() {
  const [subjects, setSubjects] = useState([]);
  const [message, setMessage] = useState("");
  const [editingSubject, setEditingSubject] = useState(null);
  const [detailsSubject, setDetailsSubject] = useState(null);
  const [archiveMode, setArchiveMode] = useState(false);
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState(createDateRange("ALL"));
  const [durationFilter, setDurationFilter] = useState("ALL");
  const [educationFieldFilter, setEducationFieldFilter] = useState("ALL");
  const [internshipTypeFilter, setInternshipTypeFilter] = useState("ALL");
  const [degreeFilter, setDegreeFilter] = useState("ALL");
  const [academicYearFilter, setAcademicYearFilter] = useState("ALL");
  const [editDocuments, setEditDocuments] = useState([]);
  const [savingSubject, setSavingSubject] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [confirmDeleteDoc, setConfirmDeleteDoc] = useState(null);

  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    duration: "",
    places: "1",
    educationField: "",
    internshipType: "",
    allowedDegreeLevels: [],
    allowedAcademicYears: [],
    technologies: "",
    requiredSkills: "",
    languages: "",
  });

  const fetchSubjects = useCallback(async () => {
    try {
      const res = await api.get("/subjects/my");
      setSubjects(res.data || []);
    } catch {
      setMessage("Error while loading.");
    }
  }, []);

  useEffect(() => {
    queueMicrotask(fetchSubjects);
  }, [fetchSubjects]);

  const visibleSubjects = useMemo(() => {
    return subjects
      .filter((subject) => Boolean(subject.archived) === archiveMode)
      .filter((subject) => {
        const text = [
          subject.title,
          subject.description,
          ...(subject.technologies || []),
          ...(subject.requiredSkills || []),
        ]
          .join(" ")
          .toLowerCase();

        return (
          text.includes(search.toLowerCase()) &&
          matchesDateRange(subject.createdAt, dateFilter) &&
          matchesDurationFilter(subject.duration, durationFilter) &&
          (educationFieldFilter === "ALL" ||
            subject.educationField === educationFieldFilter) &&
          (internshipTypeFilter === "ALL" ||
            subject.internshipType === internshipTypeFilter) &&
          (degreeFilter === "ALL" ||
            !subject.allowedDegreeLevels?.length ||
            subject.allowedDegreeLevels.includes(degreeFilter)) &&
          (academicYearFilter === "ALL" ||
            !subject.allowedAcademicYears?.length ||
            subject.allowedAcademicYears.includes(academicYearFilter))
        );
      });
  }, [
    subjects,
    archiveMode,
    search,
    dateFilter,
    durationFilter,
    educationFieldFilter,
    internshipTypeFilter,
    degreeFilter,
    academicYearFilter,
  ]);

  const refreshSelectedSubjects = (updatedSubjects) => {
    if (editingSubject) {
      const fresh = updatedSubjects.find((s) => s.id === editingSubject.id);
      if (fresh) setEditingSubject(fresh);
    }

    if (detailsSubject) {
      const fresh = updatedSubjects.find((s) => s.id === detailsSubject.id);
      if (fresh) setDetailsSubject(fresh);
    }
  };

  const fetchSubjectsAndSync = async () => {
    const res = await api.get("/subjects/my");
    const data = res.data || [];
    setSubjects(data);
    refreshSelectedSubjects(data);
  };

  const openEdit = (subject) => {
    setEditingSubject(subject);
    setEditDocuments([]);

    setEditForm({
      title: subject.title || "",
      description: subject.description || "",
      duration: subject.duration || "",
      places: String(subject.places || 1),
      educationField: subject.educationField || "",
      internshipType: subject.internshipType || "",
      allowedDegreeLevels: subject.allowedDegreeLevels || [],
      allowedAcademicYears: subject.allowedAcademicYears || [],
      technologies: (subject.technologies || []).join(", "),
      requiredSkills: (subject.requiredSkills || []).join(", "),
      languages: (subject.languages || []).join(", "),
    });
  };

  const toggleEditMultiValue = (field, value) => {
    setEditForm((prev) => {
      const current = prev[field] || [];
      return {
        ...prev,
        [field]: current.includes(value)
          ? current.filter((item) => item !== value)
          : [...current, value],
      };
    });
  };

  const uploadDocuments = async (subjectId, files) => {
    if (!files || files.length === 0) return;

    const formData = new FormData();

    Array.from(files).forEach((file) => {
      formData.append("documents", file);
    });

    await api.post(`/subject-documents/${subjectId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  };

  const updateSubject = async () => {
    if (savingSubject) return;

    try {
      setSavingSubject(true);
      await api.patch(`/subjects/${editingSubject.id}`, {
        title: editForm.title,
        description: editForm.description,
        duration: editForm.duration,
        places: Number(editForm.places),
        educationField: editForm.educationField,
        internshipType: editForm.internshipType,
        allowedDegreeLevels: editForm.allowedDegreeLevels,
        allowedAcademicYears: editForm.allowedAcademicYears,
        technologies: editForm.technologies
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        requiredSkills: editForm.requiredSkills
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        languages: editForm.languages
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      });

      await uploadDocuments(editingSubject.id, editDocuments);

      setMessage("Subject updated.");
      setEditDocuments([]);
      await fetchSubjectsAndSync();
      setEditingSubject(null);
    } catch {
      setMessage("Error while editing.");
    } finally {
      setSavingSubject(false);
    }
  };

  const archiveSubject = async (subjectId) => {
    try {
      await api.patch(`/subjects/${subjectId}/archive`);
      setMessage("Subject archived.");
      fetchSubjects();
    } catch {
      setMessage("Error while archiving.");
    }
  };

  const unarchiveSubject = async (subjectId) => {
    try {
      await api.patch(`/subjects/${subjectId}/unarchive`);
      setMessage("Subject restored.");
      fetchSubjects();
    } catch {
      setMessage("Error while restoring.");
    }
  };

  const deleteSubject = async () => {
    if (!confirmDelete) return;
    const subjectId = confirmDelete;
    setConfirmDelete(null);
    try {
      await api.delete(`/subjects/${subjectId}`);
      setMessage("Subject deleted.");
      fetchSubjects();
    } catch {
      setMessage("Error while deleting.");
    }
  };

  const openDocument = async (document) => {
    try {
      const res = await api.get(`/subject-documents/open/${document.id}`, {
        responseType: "blob",
      });

      const contentType =
        res.headers["content-type"] ||
        document.fileType ||
        "application/octet-stream";

      const blob = new Blob([res.data], {
        type: contentType,
      });

      const fileURL = window.URL.createObjectURL(blob);

      if (contentType.includes("pdf") || contentType.includes("image")) {
        window.open(fileURL, "_blank");
        return;
      }

      const link = window.document.createElement("a");
      link.href = fileURL;
      link.download = document.originalName || "document";
      window.document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(fileURL);
    } catch {
      setMessage("Error while opening.");
    }
  };

  const deleteDocument = async () => {
    if (!confirmDeleteDoc) return;
    const documentId = confirmDeleteDoc;
    setConfirmDeleteDoc(null);
    try {
      await api.delete(`/subject-documents/${documentId}`);
      setMessage("Document deleted.");
      await fetchSubjectsAndSync();
    } catch {
      setMessage("Error while deleting.");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        icon={BookMarked}
        title="My subjects"
        subtitle="Manage your subjects, documents, and archives."
        actions={
          <Button
            variant="secondary"
            iconLeft={archiveMode ? BookMarked : Archive}
            onClick={() => setArchiveMode((prev) => !prev)}
          >
            {archiveMode ? "View active subjects" : "View archives"}
          </Button>
        }
      />

      {message && (
        <div className="flex items-start gap-2 rounded-xl border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm font-semibold text-cyan-700">
          <Info className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2.5} />
          <span>{message}</span>
        </div>
      )}

      <Card>
        <CardBody>
          <div className="grid gap-3 md:grid-cols-4">
            <Field label="Search" htmlFor="search" className="md:col-span-2">
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  strokeWidth={2.5}
                />
                <Input
                  id="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search a subject..."
                  className="pl-9"
                />
              </div>
            </Field>
            <Field label="Duration" htmlFor="durationFilter">
              <Select
                id="durationFilter"
                value={durationFilter}
                onChange={(e) => setDurationFilter(e.target.value)}
              >
                {DURATION_FILTERS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Education field" htmlFor="educationFieldFilter">
              <Select
                id="educationFieldFilter"
                value={educationFieldFilter}
                onChange={(e) => setEducationFieldFilter(e.target.value)}
              >
                <option value="ALL">All fields</option>
                {EDUCATION_FIELD_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Internship type" htmlFor="internshipTypeFilter">
              <Select
                id="internshipTypeFilter"
                value={internshipTypeFilter}
                onChange={(e) => setInternshipTypeFilter(e.target.value)}
              >
                <option value="ALL">All types</option>
                {INTERNSHIP_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Degree level" htmlFor="degreeFilter">
              <Select
                id="degreeFilter"
                value={degreeFilter}
                onChange={(e) => setDegreeFilter(e.target.value)}
              >
                <option value="ALL">All degrees</option>
                {DEGREE_LEVELS.map((degree) => (
                  <option key={degree} value={degree}>
                    {degree}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Academic year" htmlFor="academicYearFilter">
              <Select
                id="academicYearFilter"
                value={academicYearFilter}
                onChange={(e) => setAcademicYearFilter(e.target.value)}
              >
                <option value="ALL">All academic years</option>
                {ACADEMIC_YEAR_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </Field>
            <DateRangeFilter value={dateFilter} onChange={setDateFilter} />
          </div>
        </CardBody>
      </Card>

      <section className="space-y-4">
        {visibleSubjects.map((subject) => (
          <Card key={subject.id}>
            <CardBody>
              <div className="flex flex-wrap items-start justify-between gap-5">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-black text-slate-950">
                      {subject.title}
                    </h2>
                    {subject.archived && (
                      <Badge variant="neutral" size="sm" icon={Archive}>
                        Archive
                      </Badge>
                    )}
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" strokeWidth={2.5} />
                      Created on {new Date(subject.createdAt).toLocaleString()}
                    </span>
                    <span className="inline-flex items-center gap-1.5 font-semibold">
                      <Clock className="h-3.5 w-3.5" strokeWidth={2.5} />
                      Duration: {subject.duration || "N/A"}
                    </span>
                    <span className="inline-flex items-center gap-1.5 font-semibold">
                      <Users className="h-3.5 w-3.5" strokeWidth={2.5} />
                      Places: {formatManagerPlaces(subject)}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <Badge variant="info" size="sm" icon={Briefcase}>
                      {getInternshipTypeLabel(subject.internshipType) || "Internship N/A"}
                    </Badge>
                    <Badge variant="neutral" size="sm" icon={GraduationCap}>
                      {subject.allowedDegreeLevels?.length
                        ? subject.allowedDegreeLevels.join(", ")
                        : "All degrees"}
                    </Badge>
                  </div>

                  <p className="mt-3 line-clamp-2 leading-7 text-sm text-slate-600">
                    {subject.description}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {subject.technologies?.map((tech) => (
                      <Badge key={tech} variant="info" size="sm">
                        {tech}
                      </Badge>
                    ))}
                  </div>

                  <div className="mt-4 rounded-xl border border-[#cfe1e8] bg-slate-50 p-4">
                    <h3 className="inline-flex items-center gap-1.5 text-sm font-black text-slate-950">
                      <Paperclip className="h-4 w-4 text-cyan-700" strokeWidth={2.5} />
                      Documents
                    </h3>
                    <div className="mt-3 space-y-1.5">
                      {subject.documents?.map((document) => (
                        <button
                          key={document.id}
                          onClick={() => openDocument(document)}
                          className="flex w-full items-center gap-2 rounded-lg bg-white px-3 py-2 text-left text-sm font-semibold text-cyan-700 transition hover:bg-cyan-50"
                        >
                          <FileText className="h-4 w-4 shrink-0" strokeWidth={2.5} />
                          <span className="truncate">{document.originalName}</span>
                        </button>
                      ))}
                      {(!subject.documents || subject.documents.length === 0) && (
                        <p className="text-sm text-slate-500">
                          No document added.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex shrink-0 flex-col gap-2">
                  <Button
                    size="sm"
                    iconLeft={Eye}
                    onClick={() => setDetailsSubject(subject)}
                  >
                    View details
                  </Button>
                  {!archiveMode && (
                    <>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="border-2 border-current text-[#062633]"
                        iconLeft={Edit3}
                        onClick={() => openEdit(subject)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="my-subjects-archive-button border border-slate-500"
                        iconLeft={Archive}
                        onClick={() => archiveSubject(subject.id)}
                      >
                        Archive
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        iconLeft={Trash2}
                        onClick={() => setConfirmDelete(subject.id)}
                      >
                        Delete
                      </Button>
                    </>
                  )}
                  {archiveMode && (
                    <Button
                      size="sm"
                      variant="success"
                      iconLeft={ArchiveRestore}
                      onClick={() => unarchiveSubject(subject.id)}
                    >
                      Restore
                    </Button>
                  )}
                </div>
              </div>
            </CardBody>
          </Card>
        ))}

        {visibleSubjects.length === 0 && (
          <EmptyState
            icon={BookMarked}
            title="No subject found"
            description={
              archiveMode
                ? "You have no archived subject."
                : "Create your first PFE subject to get started."
            }
          />
        )}
      </section>

      {editingSubject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-6">
          <Card className="max-h-[90vh] w-full max-w-3xl overflow-y-auto">
            <CardBody>
              <div className="flex items-start justify-between gap-4">
                <h2 className="inline-flex items-center gap-2 text-2xl font-black text-slate-950">
                  <Edit3 className="h-5 w-5 text-cyan-700" strokeWidth={2.5} />
                  Edit subject
                </h2>
                <Button
                  variant="secondary"
                  size="sm"
                  iconLeft={X}
                  onClick={() => setEditingSubject(null)}
                >
                  Close
                </Button>
              </div>

              <div className="mt-6 space-y-5">
                <Field label="Title" htmlFor="editTitle">
                  <Input
                    id="editTitle"
                    value={editForm.title}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, title: e.target.value }))
                    }
                  />
                </Field>

                <Field label="Description" htmlFor="editDesc">
                  <Textarea
                    id="editDesc"
                    rows={6}
                    value={editForm.description}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                  />
                </Field>

                <Field label="Duration" htmlFor="editDuration">
                  <Select
                    id="editDuration"
                    value={editForm.duration}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        duration: e.target.value,
                      }))
                    }
                  >
                    <option value="">Select a duration</option>
                    {DURATION_FILTERS.filter((option) => option.value !== "ALL").map(
                      (option) => (
                        <option key={option.value} value={option.label}>
                          {option.label}
                        </option>
                      )
                    )}
                  </Select>
                </Field>

                <Field label="Places" htmlFor="editPlaces">
                  <Input
                    id="editPlaces"
                    type="number"
                    min="1"
                    step="1"
                    value={editForm.places}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        places: e.target.value,
                      }))
                    }
                  />
                </Field>

                <Field
                  label="Education field"
                  htmlFor="editEducationField"
                  hint="Only students in this field will see and be able to apply."
                >
                  <Select
                    id="editEducationField"
                    value={editForm.educationField}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        educationField: e.target.value,
                      }))
                    }
                  >
                    <option value="">Select an education field</option>
                    {EDUCATION_FIELD_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                </Field>

                <Field
                  label="Internship type"
                  htmlFor="editInternshipType"
                  hint="Only students whose internship matches this type can apply."
                >
                  <Select
                    id="editInternshipType"
                    value={editForm.internshipType}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        internshipType: e.target.value,
                      }))
                    }
                  >
                    <option value="">Select an internship type</option>
                    {INTERNSHIP_TYPE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                </Field>

                <Field
                  label="Allowed degree levels"
                  hint="Leave all unchecked to allow every degree level."
                >
                  <div className="flex flex-wrap gap-3">
                    {DEGREE_LEVELS.map((level) => (
                      <label
                        key={level}
                        className="inline-flex items-center gap-2 rounded-lg border border-[#cfe1e8] bg-white px-3 py-1.5 text-sm font-semibold text-slate-700"
                      >
                        <input
                          type="checkbox"
                          checked={editForm.allowedDegreeLevels.includes(level)}
                          onChange={() =>
                            toggleEditMultiValue("allowedDegreeLevels", level)
                          }
                        />
                        {level}
                      </label>
                    ))}
                  </div>
                </Field>

                <Field
                  label="Allowed academic years"
                  hint="Leave all unchecked to allow every academic year."
                >
                  <div className="flex flex-wrap gap-3">
                    {ACADEMIC_YEAR_OPTIONS.map((option) => (
                      <label
                        key={option.value}
                        className="inline-flex items-center gap-2 rounded-lg border border-[#cfe1e8] bg-white px-3 py-1.5 text-sm font-semibold text-slate-700"
                      >
                        <input
                          type="checkbox"
                          checked={editForm.allowedAcademicYears.includes(
                            option.value
                          )}
                          onChange={() =>
                            toggleEditMultiValue(
                              "allowedAcademicYears",
                              option.value
                            )
                          }
                        />
                        {option.label}
                      </label>
                    ))}
                  </div>
                </Field>

                <Field
                  label="Technologies"
                  htmlFor="editTech"
                  hint="Separated by commas"
                >
                  <Input
                    id="editTech"
                    value={editForm.technologies}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        technologies: e.target.value,
                      }))
                    }
                  />
                </Field>

                <Field
                  label="Skills"
                  htmlFor="editSkills"
                  hint="Separated by commas"
                >
                  <Input
                    id="editSkills"
                    value={editForm.requiredSkills}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        requiredSkills: e.target.value,
                      }))
                    }
                  />
                </Field>

                <Field
                  label="Languages"
                  htmlFor="editLanguages"
                  hint="Separated by commas"
                >
                  <Input
                    id="editLanguages"
                    value={editForm.languages}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        languages: e.target.value,
                      }))
                    }
                  />
                </Field>

                <div className="rounded-2xl border border-[#cfe1e8] bg-slate-50 p-5">
                  <p className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-950">
                    <Paperclip className="h-4 w-4 text-cyan-700" strokeWidth={2.5} />
                    Existing documents
                  </p>

                  <div className="mt-3 space-y-1.5">
                    {editingSubject.documents?.map((document) => (
                      <div
                        key={document.id}
                        className="flex items-center justify-between gap-3 rounded-lg bg-white px-4 py-2.5"
                      >
                        <button
                          onClick={() => openDocument(document)}
                          className="flex min-w-0 items-center gap-2 truncate text-left text-sm font-semibold text-cyan-700 hover:underline"
                        >
                          <FileText className="h-4 w-4 shrink-0" strokeWidth={2.5} />
                          <span className="truncate">{document.originalName}</span>
                        </button>
                        <Button
                          size="sm"
                          variant="danger"
                          iconLeft={Trash2}
                          onClick={() => setConfirmDeleteDoc(document.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    ))}

                    {(!editingSubject.documents ||
                      editingSubject.documents.length === 0) && (
                      <p className="text-sm text-slate-500">
                        No existing document.
                      </p>
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border-2 border-dashed border-[#cfe1e8] bg-slate-50 p-5">
                  <p className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-950">
                    <Upload className="h-4 w-4 text-cyan-700" strokeWidth={2.5} />
                    Add documents
                  </p>

                  <input
                    type="file"
                    multiple
                    onChange={(e) => setEditDocuments(e.target.files)}
                    className="mt-3 block w-full rounded-xl border border-[#cfe1e8] bg-white px-4 py-2.5 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-cyan-700 file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-white hover:file:bg-cyan-800"
                  />

                  {editDocuments?.length > 0 && (
                    <div className="mt-3 space-y-1.5">
                      {Array.from(editDocuments).map((file) => (
                        <div
                          key={file.name}
                          className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-slate-700"
                        >
                          <Paperclip className="h-3 w-3 text-slate-400" strokeWidth={2.5} />
                          {file.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    variant="secondary"
                    onClick={() => setEditingSubject(null)}
                    disabled={savingSubject}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={updateSubject}
                    disabled={savingSubject}
                    iconLeft={savingSubject ? undefined : Save}
                  >
                    {savingSubject ? "Saving..." : "Save"}
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {detailsSubject && (
        <SubjectDetailsModal
          subject={detailsSubject}
          onClose={() => setDetailsSubject(null)}
          onOpenDocument={openDocument}
        />
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-6">
          <Card className="w-full max-w-md">
            <CardBody>
              <h2 className="text-xl font-black text-slate-950">
                Delete subject?
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                This action permanently deletes the subject. This cannot be undone.
              </p>
              <div className="mt-6 flex justify-end gap-2">
                <Button
                  variant="secondary"
                  onClick={() => setConfirmDelete(null)}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  iconLeft={Trash2}
                  onClick={deleteSubject}
                >
                  Confirm
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {confirmDeleteDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-6">
          <Card className="w-full max-w-md">
            <CardBody>
              <h2 className="text-xl font-black text-slate-950">
                Delete document?
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                This document will be permanently deleted from the subject.
              </p>
              <div className="mt-6 flex justify-end gap-2">
                <Button
                  variant="secondary"
                  onClick={() => setConfirmDeleteDoc(null)}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  iconLeft={Trash2}
                  onClick={deleteDocument}
                >
                  Confirm
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
}

export default MySubjects;
