import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BookMarked,
  Search,
  Calendar,
  FileText,
  AlertCircle,
  CheckCircle2,
  User,
  ArrowRight,
  GraduationCap,
  Clock,
} from "lucide-react";
import api from "../../api/axios";
import useSessionUser from "../../hooks/useSessionUser";
import { getEducationFieldLabel } from "../../constants/educationFields";
import {
  getInternshipTypeLabel,
  getAcademicYearLabel,
} from "../../constants/profileFields";
import {
  PageHeader,
  Card,
  CardBody,
  Badge,
  EmptyState,
  LoadingState,
  Field,
  Input,
  Select,
  Button,
} from "../../components/ui";
import {
  DURATION_FILTERS,
  matchesDurationFilter,
} from "../../utils/filters";

function CatalogSubjects() {
  const navigate = useNavigate();
  const user = useSessionUser();
  const isStudent = user?.role === "STUDENT";
  const educationFieldLabel = getEducationFieldLabel(user?.educationField);
  const profileComplete = Boolean(
    user?.educationField &&
      user?.degreeLevel &&
      user?.academicYear &&
      user?.internshipType
  );

  const [subjects, setSubjects] = useState([]);
  const [search, setSearch] = useState("");
  const [durationFilter, setDurationFilter] = useState("ALL");
  const [scoreFilter, setScoreFilter] = useState("ALL");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const normalizeSubjects = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.subjects)) return payload.subjects;
    if (Array.isArray(payload?.data)) return payload.data;
    return [];
  };

  const fetchSubjects = useCallback(async () => {
    try {
      setLoading(true);
      setMessage("");
      const res = await api.get("/subjects");
      setSubjects(normalizeSubjects(res.data));
    } catch (error) {
      setSubjects([]);
      setMessage(
        error.response?.data?.message ||
          "Unable to load subjects. Make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(fetchSubjects);
  }, [fetchSubjects]);

  const skillMatches = (skill, subject) => {
    const matchedSkills = (subject?.matchedSkills || []).map((value) =>
      String(value).toLowerCase()
    );
    return matchedSkills.includes(String(skill).toLowerCase());
  };

  const isInScoreFilter = useCallback(
    (score) => {
      const value = Number(score || 0);
      if (scoreFilter === "ALL") return true;
      if (scoreFilter === "80") return value >= 80;
      if (scoreFilter === "60") return value >= 60 && value < 80;
      if (scoreFilter === "40") return value >= 40 && value < 60;
      if (scoreFilter === "LOW") return value < 40;
      return true;
    },
    [scoreFilter]
  );

  const filteredSubjects = useMemo(() => {
    return subjects.filter((subject) => {
      const text = [
        subject.title,
        subject.description,
        subject.supervisor?.fullName,
        ...(subject.technologies || []),
        ...(subject.requiredSkills || []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = text.includes(search.toLowerCase());
      const matchesScore = isInScoreFilter(subject.score);
      const matchesDuration = matchesDurationFilter(
        subject.duration,
        durationFilter
      );

      return matchesSearch && matchesScore && matchesDuration;
    });
  }, [subjects, search, isInScoreFilter, durationFilter]);

  return (
    <div className="space-y-6">
      <PageHeader
        icon={BookMarked}
        title="Subject catalog"
        subtitle="Browse available subjects and apply."
      />

      {isStudent && profileComplete && (
        <div className="rounded-xl border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm text-cyan-900">
          <p className="font-bold">Filtered for your profile</p>
          <p className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs font-semibold">
            <span>Field: {educationFieldLabel}</span>
            <span>Degree: {user.degreeLevel}</span>
            <span>Year: {getAcademicYearLabel(user.academicYear)}</span>
            <span>Internship: {getInternshipTypeLabel(user.internshipType)}</span>
          </p>
        </div>
      )}

      {isStudent && !profileComplete && !loading && (
        <EmptyState
          icon={GraduationCap}
          title="Complete your profile"
          description="Please complete your education field, degree level, academic year, and internship type to view available subjects."
          action={
            <Link to="/profil">
              <Button iconRight={ArrowRight}>Go to profile</Button>
            </Link>
          }
        />
      )}

      {message && (
        <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2.5} />
          <span>{message}</span>
        </div>
      )}

      <Card>
        <CardBody>
          <div className="grid gap-4 lg:grid-cols-4">
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
                  placeholder="Title, technology, supervisor..."
                  className="pl-9"
                />
              </div>
            </Field>

            <Field label="Score" htmlFor="score">
              <Select
                id="score"
                value={scoreFilter}
                onChange={(e) => setScoreFilter(e.target.value)}
              >
                <option value="ALL">All scores</option>
                <option value="80">80% and above</option>
                <option value="60">60% to 79%</option>
                <option value="40">40% to 59%</option>
                <option value="LOW">Less than 40%</option>
              </Select>
            </Field>

            <Field label="Duration" htmlFor="duration">
              <Select
                id="duration"
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
          </div>
        </CardBody>
      </Card>

      {loading && <LoadingState label="Loading subjects..." />}

      {!loading && filteredSubjects.length === 0 && (
        <EmptyState
          icon={BookMarked}
          title="No subjects found"
          description="Try adjusting your filters or check back later."
        />
      )}

      {!loading && filteredSubjects.length > 0 && (
        <section className="grid gap-4 xl:grid-cols-2">
          {filteredSubjects.map((subject) => (
            <Card
              key={subject.id}
              onClick={() => navigate(`/subjects/${subject.id}`)}
              className="flex min-h-[280px] cursor-pointer flex-col transition hover:-translate-y-0.5 hover:shadow-card-hover"
            >
              <CardBody className="flex flex-1 flex-col">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-base font-bold leading-snug text-slate-950 hover:text-cyan-700">
                    {subject.title}
                  </h3>

                </div>

                <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                  <User className="h-3.5 w-3.5" strokeWidth={2.5} />
                  Supervisor:{" "}
                  <span className="font-bold text-slate-700">
                    {subject.supervisor?.fullName || "-"}
                  </span>
                </p>

                <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">
                  {subject.description}
                </p>

                {subject.requiredSkills?.length > 0 && (
                  <div className="mt-4">
                    <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Required skills
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {subject.requiredSkills.map((skill) => {
                        const matched = skillMatches(skill, subject);
                        return (
                          <Badge
                            key={skill}
                            variant={matched ? "success" : "neutral"}
                            icon={matched ? CheckCircle2 : undefined}
                          >
                            {skill}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-5">
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                    <p className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                      <Calendar className="h-3.5 w-3.5" strokeWidth={2.5} />
                      {new Date(subject.createdAt).toLocaleDateString()}
                    </p>
                    <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                      <Clock className="h-3.5 w-3.5" strokeWidth={2.5} />
                      {subject.duration || "N/A"}
                    </p>
                    {subject.documents?.length > 0 && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-700">
                        <FileText className="h-3.5 w-3.5" strokeWidth={2.5} />
                        {subject.documents.length} doc
                        {subject.documents.length > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                  <Link to={`/subjects/${subject.id}`}>
                    <Button
                      size="sm"
                      variant="secondary"
                      iconRight={ArrowRight}
                    >
                      View details
                    </Button>
                  </Link>
                </div>
              </CardBody>
            </Card>
          ))}
        </section>
      )}
    </div>
  );
}

export default CatalogSubjects;
