import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  CheckCircle2,
  Search,
  AlertCircle,
  User,
  Users,
  Calendar,
  FileText,
  Eye,
  Clock,
} from "lucide-react";
import api from "../../api/axios";
import {
  PageHeader,
  Card,
  CardBody,
  Field,
  Input,
  Select,
  Badge,
  Button,
  EmptyState,
  LoadingState,
} from "../../components/ui";
import DateRangeFilter from "../../components/filters/DateRangeFilter";
import {
  DURATION_FILTERS,
  createDateRange,
  matchesDateRange,
  matchesDurationFilter,
} from "../../utils/filters";
import { EDUCATION_FIELD_OPTIONS } from "../../constants/educationFields";
import {
  ACADEMIC_YEAR_OPTIONS,
  DEGREE_LEVELS,
  INTERNSHIP_TYPE_OPTIONS,
} from "../../constants/profileFields";

const formatSize = (bytes) => {
  if (bytes === null || bytes === undefined) return "-";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

function CompletedAssignments({
  endpoint,
  title = "Completed assignments",
  subtitle = "Completed assignments and uploaded final reports.",
  subjectBasePath = "/admin/subjects",
}) {
  const [assignments, setAssignments] = useState([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [durationFilter, setDurationFilter] = useState("ALL");
  const [educationFieldFilter, setEducationFieldFilter] = useState("ALL");
  const [internshipTypeFilter, setInternshipTypeFilter] = useState("ALL");
  const [degreeFilter, setDegreeFilter] = useState("ALL");
  const [academicYearFilter, setAcademicYearFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState(createDateRange("ALL"));
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchAssignments = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(endpoint);
      setAssignments(Array.isArray(res.data) ? res.data : res.data?.data || []);
      setMessage("");
    } catch {
      setAssignments([]);
      setMessage("Unable to load completed assignments.");
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    queueMicrotask(fetchAssignments);
  }, [fetchAssignments]);

  const filteredAssignments = useMemo(() => {
    return assignments.filter((assignment) => {
      const isBinome = Boolean(assignment.binome);
      const haystack = [
        assignment.subject?.title,
        assignment.subject?.description,
        assignment.subject?.supervisor?.fullName,
        assignment.student?.fullName,
        assignment.student?.email,
        assignment.binome?.student1?.fullName,
        assignment.binome?.student1?.email,
        assignment.binome?.student2?.fullName,
        assignment.binome?.student2?.email,
        assignment.academicReport?.originalName,
        assignment.academicReport?.user?.fullName,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = haystack.includes(search.toLowerCase());
      const matchesDate = matchesDateRange(
        assignment.completedAt || assignment.updatedAt,
        dateFilter
      );
      const matchesDuration = matchesDurationFilter(
        assignment.subject?.duration,
        durationFilter
      );
      const subject = assignment.subject || {};
      const matchesEducationField =
        educationFieldFilter === "ALL" ||
        subject.educationField === educationFieldFilter;
      const matchesInternshipType =
        internshipTypeFilter === "ALL" ||
        subject.internshipType === internshipTypeFilter;
      const matchesDegree =
        degreeFilter === "ALL" ||
        !subject.allowedDegreeLevels?.length ||
        subject.allowedDegreeLevels.includes(degreeFilter);
      const matchesAcademicYear =
        academicYearFilter === "ALL" ||
        !subject.allowedAcademicYears?.length ||
        subject.allowedAcademicYears.includes(academicYearFilter);
      const matchesType =
        typeFilter === "ALL" ||
        (typeFilter === "BINOME" && isBinome) ||
        (typeFilter === "SOLO" && !isBinome);

      return (
        matchesSearch &&
        matchesDate &&
        matchesType &&
        matchesDuration &&
        matchesEducationField &&
        matchesInternshipType &&
        matchesDegree &&
        matchesAcademicYear
      );
    });
  }, [
    assignments,
    search,
    typeFilter,
    dateFilter,
    durationFilter,
    educationFieldFilter,
    internshipTypeFilter,
    degreeFilter,
    academicYearFilter,
  ]);

  const openReport = async (reportId) => {
    if (!reportId) return;
    try {
      const res = await api.get(`/academic-report/file/${reportId}`, {
        responseType: "blob",
      });
      const contentType = res.headers["content-type"] || "application/octet-stream";
      const blob = new Blob([res.data], { type: contentType });
      const fileURL = window.URL.createObjectURL(blob);
      window.open(fileURL, "_blank");
    } catch {
      setMessage("Unable to open the final report.");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader icon={CheckCircle2} title={title} subtitle={subtitle} />
        <LoadingState label="Loading completed assignments..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader icon={CheckCircle2} title={title} subtitle={subtitle} />

      {message && (
        <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2.5} />
          <span>{message}</span>
        </div>
      )}

      <Card>
        <CardBody>
          <div className="grid gap-4 lg:grid-cols-10">
            <Field label="Search" htmlFor="search" className="lg:col-span-6">
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  strokeWidth={2.5}
                />
                <Input
                  id="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search student, subject, report..."
                  className="pl-9"
                />
              </div>
            </Field>

            <Field label="Type" htmlFor="typeFilter" className="lg:col-span-2">
              <Select
                id="typeFilter"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="ALL">All types</option>
                <option value="SOLO">Solo student</option>
                <option value="BINOME">Team</option>
              </Select>
            </Field>

            <DateRangeFilter
              value={dateFilter}
              onChange={setDateFilter}
              className="lg:col-span-2"
            />

            <Field label="Duration" htmlFor="durationFilter" className="lg:col-span-2">
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
            <Field label="Education field" htmlFor="educationFieldFilter" className="lg:col-span-2">
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
            <Field label="Internship type" htmlFor="internshipTypeFilter" className="lg:col-span-2">
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
            <Field label="Degree level" htmlFor="degreeFilter" className="lg:col-span-2">
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
            <Field label="Academic year" htmlFor="academicYearFilter" className="lg:col-span-2">
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
          </div>
        </CardBody>
      </Card>

      <section className="space-y-4">
        {filteredAssignments.map((assignment) => {
          const isBinome = Boolean(assignment.binome);
          const report = assignment.academicReport;
          return (
            <Card key={assignment.id}>
              <CardBody>
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    {subjectBasePath ? (
                      <Link
                        to={`${subjectBasePath}/${assignment.subject?.id}`}
                        className="text-xl font-black text-cyan-700 hover:underline"
                      >
                        {assignment.subject?.title || "Untitled subject"}
                      </Link>
                    ) : (
                      <h2 className="text-xl font-black text-cyan-700">
                        {assignment.subject?.title || "Untitled subject"}
                      </h2>
                    )}

                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600">
                      <span className="inline-flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-slate-400" strokeWidth={2.5} />
                        <span className="font-bold text-slate-900">
                          {assignment.subject?.supervisor?.fullName || "-"}
                        </span>
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" strokeWidth={2.5} />
                        Completed{" "}
                        {assignment.completedAt
                          ? new Date(assignment.completedAt).toLocaleDateString()
                          : "-"}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-slate-400" strokeWidth={2.5} />
                        {assignment.subject?.duration || "N/A"}
                      </span>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {isBinome ? (
                        <>
                          <Badge variant="info" icon={Users}>
                            {assignment.binome.student1.fullName}
                          </Badge>
                          <Badge variant="info" icon={Users}>
                            {assignment.binome.student2.fullName}
                          </Badge>
                        </>
                      ) : (
                        <Badge variant="success" icon={User}>
                          {assignment.student?.fullName || "-"}
                        </Badge>
                      )}
                    </div>

                    <div className="mt-5 rounded-xl border border-[#e2edf2] bg-slate-50 p-4">
                      <p className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                        <FileText className="h-3.5 w-3.5" strokeWidth={2.5} />
                        Final report
                      </p>
                      {report ? (
                        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="font-bold text-slate-950">
                              {report.originalName || report.fileName}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              Uploaded by {report.user?.fullName || "-"} ·{" "}
                              {formatSize(report.fileSize)}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="secondary"
                            iconLeft={Eye}
                            onClick={() => openReport(report.id)}
                          >
                            Open report
                          </Button>
                        </div>
                      ) : (
                        <p className="mt-2 text-sm font-semibold text-amber-700">
                          Final report not uploaded yet.
                        </p>
                      )}
                    </div>
                  </div>

                  <Badge variant="success" size="sm" icon={CheckCircle2}>
                    Completed
                  </Badge>
                </div>
              </CardBody>
            </Card>
          );
        })}

        {filteredAssignments.length === 0 && (
          <EmptyState
            icon={CheckCircle2}
            title="No completed assignment."
            description="Completed assignments will appear here after they are marked as completed."
          />
        )}
      </section>
    </div>
  );
}

export default CompletedAssignments;
