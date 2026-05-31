import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  BookMarked,
  Search,
  AlertCircle,
  Calendar,
  User,
  CheckCircle2,
  ClipboardList,
  Archive,
  Clock,
  ArrowRight,
  Users,
} from "lucide-react";
import api from "../../api/axios";
import ExportButton from "../../components/ExportButton";
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
} from "../../components/ui";
import DateRangeFilter from "../../components/filters/DateRangeFilter";
import {
  DURATION_FILTERS,
  createDateRange,
  matchesDateRange,
  matchesDurationFilter,
} from "../../utils/filters";
import { formatManagerPlaces } from "../../utils/subjectPlaces";

function AdminSubjects() {
  const [subjects, setSubjects] = useState([]);
  const [search, setSearch] = useState("");
  const [archiveFilter, setArchiveFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState(createDateRange("ALL"));
  const [durationFilter, setDurationFilter] = useState("ALL");
  const [applicationFilter, setApplicationFilter] = useState("ALL");
  const [assignmentFilter, setAssignmentFilter] = useState("ALL");
  const [message, setMessage] = useState("");

  const fetchSubjects = useCallback(async () => {
    try {
      const res = await api.get("/admin/subjects");
      setSubjects(res.data || []);
    } catch {
      setMessage("Error while loading.");
    }
  }, []);

  useEffect(() => {
    queueMicrotask(fetchSubjects);
  }, [fetchSubjects]);

  const countAssignments = (subject) =>
    Number(subject.assignedPlaces) ||
    (subject.applications || [])
      .filter((a) => a.status === "AFFECTED")
      .reduce(
        (total, application) =>
          total +
          (application.student
            ? 1
            : application.binome?.student1 && application.binome?.student2
            ? 2
            : application.binomeId
            ? 2
            : 0),
        0
      );

  const countApplications = (subject) => (subject.applications || []).length;

  const filteredSubjects = useMemo(() => {
    return subjects.filter((subject) => {
      const text = [
        subject.title,
        subject.description,
        subject.supervisor?.fullName,
        subject.supervisor?.email,
        ...(subject.technologies || []),
        ...(subject.requiredSkills || []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = text.includes(search.toLowerCase());
      const applicationsCount = countApplications(subject);
      const assignmentsCount = countAssignments(subject);
      const matchesDate = matchesDateRange(subject.createdAt, dateFilter);
      const matchesDuration = matchesDurationFilter(
        subject.duration,
        durationFilter
      );
      const matchesApplications =
        applicationFilter === "ALL" ||
        (applicationFilter === "HAS" && applicationsCount > 0) ||
        (applicationFilter === "NONE" && applicationsCount === 0);
      const matchesAssignments =
        assignmentFilter === "ALL" ||
        (assignmentFilter === "HAS" && assignmentsCount > 0) ||
        (assignmentFilter === "NONE" && assignmentsCount === 0);

      const matchesArchive =
        archiveFilter === "ALL" ||
        (archiveFilter === "ACTIVE" && !subject.archived) ||
        (archiveFilter === "ARCHIVED" && subject.archived);

      return (
        matchesSearch &&
        matchesDate &&
        matchesArchive &&
        matchesDuration &&
        matchesApplications &&
        matchesAssignments
      );
    });
  }, [subjects, search, archiveFilter, dateFilter, durationFilter, applicationFilter, assignmentFilter]);

  return (
    <div className="space-y-6">
      <PageHeader
        icon={BookMarked}
        title="Subjects"
        subtitle="All subjects created by supervisors."
        actions={
          <ExportButton endpoint="/exports/subjects" filename="subjects-export.csv" />
        }
      />

      {message && (
        <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2.5} />
          <span>{message}</span>
        </div>
      )}

      <Card>
        <CardBody>
          <div className="grid gap-4 lg:grid-cols-6">
            <Field label="Search" htmlFor="search" className="lg:col-span-2">
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  strokeWidth={2.5}
                />
                <Input
                  id="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by title, supervisor, technology..."
                  className="pl-9"
                />
              </div>
            </Field>

            <Field label="State" htmlFor="archiveFilter">
              <Select
                id="archiveFilter"
                value={archiveFilter}
                onChange={(e) => setArchiveFilter(e.target.value)}
              >
                <option value="ALL">All subjects</option>
                <option value="ACTIVE">Active</option>
                <option value="ARCHIVED">Archived</option>
              </Select>
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
            <Field label="Applications" htmlFor="applicationFilter">
              <Select
                id="applicationFilter"
                value={applicationFilter}
                onChange={(e) => setApplicationFilter(e.target.value)}
              >
                <option value="ALL">All applications</option>
                <option value="HAS">Has applications</option>
                <option value="NONE">No applications</option>
              </Select>
            </Field>
            <Field label="Assignments" htmlFor="assignmentFilter">
              <Select
                id="assignmentFilter"
                value={assignmentFilter}
                onChange={(e) => setAssignmentFilter(e.target.value)}
              >
                <option value="ALL">All assignments</option>
                <option value="HAS">Has assigned students</option>
                <option value="NONE">No assigned students</option>
              </Select>
            </Field>
            <DateRangeFilter value={dateFilter} onChange={setDateFilter} />
          </div>
        </CardBody>
      </Card>

      <section className="space-y-4">
        {filteredSubjects.map((subject) => (
          <Card key={subject.id}>
            <CardBody>
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <Link
                      to={`/admin/subjects/${subject.id}`}
                      className="text-xl font-black text-cyan-700 hover:underline"
                    >
                      {subject.title}
                    </Link>

                    {subject.archived && (
                      <Badge variant="neutral" size="sm" icon={Archive}>
                        Archived
                      </Badge>
                    )}
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600">
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" strokeWidth={2.5} />
                      {new Date(subject.createdAt).toLocaleDateString()}
                    </span>
                    {subject.supervisor?.id ? (
                      <Link
                        to={`/admin/users/${subject.supervisor.id}`}
                        className="inline-flex items-center gap-1.5 font-bold text-cyan-700 hover:underline"
                      >
                        <User className="h-3.5 w-3.5 text-slate-400" strokeWidth={2.5} />
                        {subject.supervisor?.fullName || "-"}
                      </Link>
                    ) : (
                      <span className="inline-flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-slate-400" strokeWidth={2.5} />
                        <span className="font-bold text-slate-900">
                          {subject.supervisor?.fullName || "-"}
                        </span>
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-slate-400" strokeWidth={2.5} />
                      {subject.duration || "N/A"}
                    </span>
                  </div>

                  <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-700">
                    {subject.description}
                  </p>

                  {subject.technologies?.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {subject.technologies.map((tech) => (
                        <Badge key={tech} variant="info" size="sm">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex shrink-0 flex-row gap-2 lg:flex-col lg:items-end">
                  <Badge variant="success" size="sm" icon={CheckCircle2}>
                    {countAssignments(subject)} assigned
                  </Badge>
                  <Badge variant="info" size="sm" icon={Users}>
                    {formatManagerPlaces(subject)}
                  </Badge>
                  <Badge variant="neutral" size="sm" icon={ClipboardList}>
                    {countApplications(subject)} application(s)
                  </Badge>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-end justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="mb-2 text-xs font-black uppercase tracking-widest text-slate-500">
                    Required skills
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {subject.requiredSkills?.length > 0 ? (
                      subject.requiredSkills.map((skill) => (
                        <Badge key={skill} variant="neutral" size="sm">
                          {skill}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm font-semibold text-slate-500">No required skills</span>
                    )}
                  </div>
                </div>

                <Link to={`/admin/subjects/${subject.id}`} className="ml-auto shrink-0">
                  <Button size="sm" variant="secondary" iconRight={ArrowRight}>
                    View details
                  </Button>
                </Link>
              </div>
            </CardBody>
          </Card>
        ))}

        {filteredSubjects.length === 0 && (
          <EmptyState
            icon={BookMarked}
            title="No subject found."
            description="Try adjusting your filters or search query."
          />
        )}
      </section>
    </div>
  );
}

export default AdminSubjects;
