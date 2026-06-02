import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FileText,
  Search,
  Check,
  X,
  Video,
  Calendar,
  Link as LinkIcon,
  ExternalLink,
  Save,
  GraduationCap,
  Briefcase,
  Phone,
  Mail,
  User,
  CheckCircle2,
  Languages,
  Clock,
  XCircle,
  Inbox,
  Info,
  Paperclip,
} from "lucide-react";
import api from "../../api/axios";
import {
  PageHeader,
  Card,
  CardBody,
  Button,
  Field,
  Input,
  Select,
  Badge,
  ScoreBadge,
  EmptyState,
  LoadingState,
} from "../../components/ui";
import DateRangeFilter from "../../components/filters/DateRangeFilter";
import { createDateRange, matchesDateRange } from "../../utils/filters";

const formatExtractedLabel = (value) =>
  String(value || "")
    .replace(/([A-Z])/g, " $1")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^./, (letter) => letter.toUpperCase());

const formatExtractedValue = (value) => {
  if (value === null || value === undefined || value === "") return "-";
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === "object" && item !== null) {
          return Object.entries(item)
            .filter(([, entryValue]) => entryValue !== null && entryValue !== undefined && entryValue !== "")
            .map(([key, entryValue]) => `${formatExtractedLabel(key)}: ${formatExtractedValue(entryValue)}`)
            .join(" | ");
        }
        return String(item);
      })
      .filter(Boolean)
      .join(", ");
  }
  if (typeof value === "object") {
    return Object.entries(value)
      .filter(([, entryValue]) => entryValue !== null && entryValue !== undefined && entryValue !== "")
      .map(([key, entryValue]) => `${formatExtractedLabel(key)}: ${formatExtractedValue(entryValue)}`)
      .join(" | ");
  }
  return String(value);
};

function DetailCard({ icon: Icon, label, children }) {
  return (
    <div className="rounded-xl border border-[#cfe1e8] bg-slate-50 p-4">
      <p className="detail-card-label inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest">
        {Icon && <Icon className="h-3.5 w-3.5" strokeWidth={2.5} />}
        {label}
      </p>
      <div className="mt-1.5 font-bold text-slate-950">{children}</div>
    </div>
  );
}

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
                Created on{" "}
                {subject.createdAt
                  ? new Date(subject.createdAt).toLocaleString()
                  : "-"}
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
                {subject.description || "No description."}
              </p>
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
                <Paperclip className="h-3.5 w-3.5" strokeWidth={2.5} />
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
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

function StudentDetailsModal({ student, application, onClose, onOpenCV }) {
  if (!student) return null;

  const cv = student.cvs?.[0];
  const extractedSkills = cv?.extractedSkills || [];
  const extractedData = cv?.extractedData || {};
  const resumeLanguages = Array.isArray(extractedData.languages)
    ? extractedData.languages
    : [];
  const infoCards = [
    ["University", student.university, GraduationCap],
    ["Specialty", student.specialty, Briefcase],
    ["Phone", student.phone, Phone],
    ["Education field", student.educationField, GraduationCap],
    ["Degree level", student.degreeLevel, GraduationCap],
    ["Academic year", student.academicYear, Calendar],
    ["Internship type", student.internshipType, Briefcase],
    [
      "Desired start date",
      student.internshipStartDate
        ? new Date(student.internshipStartDate).toLocaleDateString()
        : "-",
      Calendar,
    ],
    ["Desired duration", student.desiredDuration, Clock],
  ];
  const extractedEntries = Object.entries(extractedData || {}).filter(
    ([key, value]) =>
      key !== "skills" &&
      key !== "allSkills" &&
      key !== "technicalSkills" &&
      key !== "detectedSkills" &&
      key !== "extractedSkills" &&
      key !== "languages" &&
      key !== "language" &&
      key !== "detectedLanguage" &&
      key !== "resumeLanguage" &&
      key !== "languageDetected" &&
      value !== null &&
      value !== undefined &&
      !(Array.isArray(value) && value.length === 0) &&
      !(typeof value === "object" && !Array.isArray(value) && Object.keys(value).length === 0)
  );
  const visibleExtractedEntries = [
    ...(resumeLanguages.length > 0 ? [["languages", resumeLanguages]] : []),
    ...extractedEntries,
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-6">
      <Card className="max-h-[90vh] w-full max-w-2xl overflow-y-auto">
        <CardBody>
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 className="inline-flex items-center gap-2 text-2xl font-black text-slate-950">
                <User className="h-6 w-6 text-cyan-700" strokeWidth={2.5} />
                {student.fullName}
              </h2>
              <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-slate-600">
                <Mail className="h-3.5 w-3.5" strokeWidth={2.5} />
                {student.email}
              </p>
            </div>
            <Button variant="secondary" size="sm" iconLeft={X} onClick={onClose}>
              Close
            </Button>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-2">
            {infoCards
              .filter(([label]) => ["University", "Specialty", "Phone"].includes(label))
              .map(([label, value, Icon]) => (
                <DetailCard key={label} label={label} icon={Icon}>
                  {value || "-"}
                </DetailCard>
              ))}

            <DetailCard label="Score" icon={CheckCircle2}>
              <div className="mt-1.5">
                {application?.score !== null && application?.score !== undefined ? (
                  <ScoreBadge score={application.score} size="lg" />
                ) : (
                  <p className="font-bold text-slate-500">-</p>
                )}
              </div>
            </DetailCard>
          </div>

          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {infoCards
              .filter(([label]) => !["University", "Specialty", "Phone"].includes(label))
              .map(([label, value, Icon]) => (
                <DetailCard key={label} label={label} icon={Icon}>
                  {value || "-"}
                </DetailCard>
              ))}
          </div>

          {extractedSkills.length > 0 && (
            <div className="mt-6 rounded-xl border border-[#cfe1e8] bg-slate-50 p-4">
              <p className="detail-card-label inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest">
                <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2.5} />
                Extracted skills
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {extractedSkills.map((skill) => (
                  <Badge key={skill} variant="info">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {visibleExtractedEntries.length > 0 && (
            <div className="mt-4">
              <p className="detail-card-label mb-3 inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest">
                <FileText className="h-3.5 w-3.5" strokeWidth={2.5} />
                Extracted Resume data
              </p>
              <div className="grid gap-3 md:grid-cols-2">
                {visibleExtractedEntries.map(([key, value]) => (
                  <DetailCard
                    key={key}
                    label={formatExtractedLabel(key)}
                    icon={key === "languages" ? Languages : FileText}
                  >
                    {key === "languages" && Array.isArray(value) ? (
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        {value.map((language, index) => (
                          <Badge key={`${formatExtractedValue(language)}-${index}`} variant="neutral">
                            {formatExtractedValue(language)}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm leading-6">{formatExtractedValue(value)}</p>
                    )}
                  </DetailCard>
                ))}
              </div>
            </div>
          )}

          {cv ? (
            <div className="mt-6 flex flex-wrap gap-2">
              <Button
                iconLeft={FileText}
                onClick={() => onOpenCV(cv.id, cv.originalName || cv.fileName)}
              >
                Open Resume
              </Button>
            </div>
          ) : (
            <p className="mt-6 rounded-xl border border-[#cfe1e8] bg-slate-50 p-4 text-sm text-slate-600">
              Resume unavailable.
            </p>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

function SupervisorApplications() {
  const [applications, setApplications] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [interviewForms, setInterviewForms] = useState({});

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState(createDateRange("ALL"));

  const refreshAlerts = () => {
    window.dispatchEvent(new Event("page-alerts-refresh"));
  };

  const normalizeApplications = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.applications)) return payload.applications;
    if (Array.isArray(payload?.data)) return payload.data;
    return [];
  };

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/supervisor/applications");
      setApplications(normalizeApplications(res.data));
    } catch (error) {
      console.error(error);
      setApplications([]);
      setMessage("Unable to load applications.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(fetchApplications);
  }, [fetchApplications]);

  const setInterviewField = (id, field, value) => {
    setInterviewForms((forms) => ({
      ...forms,
      [id]: {
        ...(forms[id] || {}),
        [field]: value,
      },
    }));
  };

  const toDateTimeLocal = (value) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return offsetDate.toISOString().slice(0, 16);
  };

  const getInterviewForm = (application) => {
    return (
      interviewForms[application.id] || {
        interviewLink: application.interviewLink || "",
        interviewAt: toDateTimeLocal(application.interviewAt),
      }
    );
  };

  const approveApplication = async (application) => {
    const id = application.id;
    try {
      setActionLoadingId(id);
      setMessage("");
      await api.patch(`/supervisor/applications/${id}/approve`);
      setMessage(
        application.status === "PENDING"
          ? "Application accepted."
          : "Application affected."
      );
      await fetchApplications();
      refreshAlerts();
    } catch (error) {
      setMessage(error.response?.data?.message || "Error.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const saveInterview = async (application) => {
    const form = getInterviewForm(application);
    try {
      setActionLoadingId(application.id);
      setMessage("");
      await api.patch(`/supervisor/applications/${application.id}/interview`, {
        interviewLink: form.interviewLink,
        interviewAt: form.interviewAt,
      });
      setMessage("Interview saved.");
      await fetchApplications();
      refreshAlerts();
    } catch (error) {
      setMessage(error.response?.data?.message || "Error.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const rejectApplication = async (id) => {
    try {
      setActionLoadingId(id);
      setMessage("");
      await api.patch(`/supervisor/applications/${id}/reject`);
      setMessage("Application rejected.");
      await fetchApplications();
      refreshAlerts();
    } catch {
      setMessage("Error.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const getCandidates = (application) => {
    if (application.binome) {
      return [application.binome.student1, application.binome.student2].filter(
        Boolean
      );
    }
    if (application.student) return [application.student];
    return [];
  };

  const statusConfig = (status) => {
    switch (status) {
      case "AFFECTED":
        return { label: "Assigned", variant: "success", icon: CheckCircle2 };
      case "APPROVED":
        return { label: "Interview", variant: "info", icon: Video };
      case "PENDING":
        return { label: "Pending", variant: "warning", icon: Clock };
      case "REJECTED":
        return { label: "Rejected", variant: "danger", icon: XCircle };
      case "CANCELLED":
        return { label: "Canceled", variant: "neutral", icon: X };
      default:
        return { label: status || "-", variant: "neutral", icon: Info };
    }
  };

  const formatInterviewAt = (value) => {
    if (!value) return "-";
    return new Date(value).toLocaleString();
  };

  const skillMatches = (skill, application) => {
    const matchedSkills = (application?.matchedSkills || []).map((value) =>
      String(value).toLowerCase()
    );
    return matchedSkills.includes(String(skill).toLowerCase());
  };

  const filteredApplications = useMemo(() => {
    return applications.filter((application) => {
      const candidates = getCandidates(application);
      const text = [
        application.subject?.title,
        application.subject?.description,
        application.status,
        ...(application.subject?.technologies || []),
        ...(application.subject?.requiredSkills || []),
        ...candidates.map((candidate) => candidate.fullName),
        ...candidates.map((candidate) => candidate.email),
        ...candidates.map((candidate) => candidate.university),
        ...candidates.map((candidate) => candidate.specialty),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = text.includes(search.toLowerCase());
      const matchesStatus =
        statusFilter === "ALL" || application.status === statusFilter;
      const matchesDate = matchesDateRange(application.createdAt, dateFilter);
      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [applications, search, statusFilter, dateFilter]);

  const openCV = async (cvId, fileName) => {
    try {
      const res = await api.get(`/cv/file/${cvId}`, { responseType: "blob" });
      const contentType =
        res.headers["content-type"] || "application/octet-stream";
      const blob = new Blob([res.data], { type: contentType });
      const fileURL = window.URL.createObjectURL(blob);
      if (contentType.includes("pdf")) {
        window.open(fileURL, "_blank");
        return;
      }
      const link = window.document.createElement("a");
      link.href = fileURL;
      link.download = fileName || "cv";
      window.document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(fileURL);
    } catch {
      setMessage("Error while opening the Resume.");
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
      const blob = new Blob([res.data], { type: contentType });
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
      setMessage("Error document.");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          icon={Inbox}
          title="Received requests"
          subtitle="Review applications and candidate profiles."
        />
        <LoadingState label="Loading applications..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Inbox}
        title="Received requests"
        subtitle="Review applications and candidate profiles."
      />

      {message && (
        <div className="flex items-start gap-2 rounded-xl border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm font-semibold text-cyan-700">
          <Info className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2.5} />
          <span>{message}</span>
        </div>
      )}

      <Card>
        <CardBody>
          <div className="grid gap-3 lg:grid-cols-4">
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
                  placeholder="Search candidate, subject, skill..."
                  className="pl-9"
                />
              </div>
            </Field>
            <Field label="Status" htmlFor="statusFilter">
              <Select
                id="statusFilter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">All statuses</option>
                <option value="PENDING">Pending</option>
                <option value="AFFECTED">Assigned</option>
                <option value="APPROVED">Interviews</option>
                <option value="REJECTED">Rejected</option>
                <option value="CANCELLED">Canceled</option>
              </Select>
            </Field>
            <DateRangeFilter value={dateFilter} onChange={setDateFilter} />
          </div>
        </CardBody>
      </Card>

      <section className="space-y-4">
        {filteredApplications.map((application) => {
          const sCfg = statusConfig(application.status);
          const isLoadingThis = actionLoadingId === application.id;
          return (
            <Card key={application.id}>
              <CardBody>
                <div className="flex flex-wrap items-start justify-between gap-5">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => setSelectedSubject(application.subject)}
                        className="text-left text-xl font-black text-cyan-700 hover:underline"
                      >
                        {application.subject?.title || "Subject"}
                      </button>

                      {application.score !== null &&
                        application.score !== undefined && (
                          <ScoreBadge score={application.score} />
                        )}

                      <Badge variant={sCfg.variant} size="md" icon={sCfg.icon}>
                        {sCfg.label}
                      </Badge>
                    </div>

                    <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-slate-500">
                      <Calendar className="h-3.5 w-3.5" strokeWidth={2.5} />
                      Received on{" "}
                      {application.createdAt
                        ? new Date(application.createdAt).toLocaleString()
                        : "-"}
                    </p>

                    <p className="mt-3 line-clamp-2 text-sm leading-7 text-slate-600">
                      {application.subject?.description || "No description."}
                    </p>

                    <div className="mt-4">
                      <p className="text-xs font-black uppercase tracking-widest text-slate-500">
                        Candidates
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {getCandidates(application).map((candidate) => (
                          <button
                            key={candidate.id}
                            onClick={() =>
                              setSelectedCandidate({
                                ...candidate,
                                application,
                              })
                            }
                            className="inline-flex items-center gap-2 rounded-lg bg-cyan-50 px-3 py-1.5 text-sm font-bold text-cyan-700 transition hover:bg-cyan-100"
                          >
                            <User className="h-3.5 w-3.5" strokeWidth={2.5} />
                            {candidate.fullName}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4">
                      <p className="text-xs font-black uppercase tracking-widest text-slate-500">
                        Required skills
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {application.subject?.requiredSkills?.map((skill) => {
                          const matched = skillMatches(skill, application);
                          return (
                            <Badge
                              key={skill}
                              variant={matched ? "success" : "neutral"}
                              size="sm"
                              icon={matched ? CheckCircle2 : undefined}
                            >
                              {skill}
                            </Badge>
                          );
                        })}
                        {(!application.subject?.requiredSkills ||
                          application.subject.requiredSkills.length === 0) && (
                          <p className="text-sm text-slate-500">
                            No required skills.
                          </p>
                        )}
                      </div>
                    </div>

                    {application.subject?.technologies?.length > 0 && (
                      <div className="mt-4">
                        <p className="text-xs font-black uppercase tracking-widest text-slate-500">
                          Technologies
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {application.subject.technologies.map((tech) => {
                            const matched = skillMatches(tech, application);
                            return (
                              <Badge
                                key={tech}
                                variant={matched ? "success" : "info"}
                                size="sm"
                                icon={matched ? CheckCircle2 : undefined}
                              >
                                {tech}
                              </Badge>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {application.status === "APPROVED" && (
                      <div className="mt-4 rounded-xl border border-cyan-200 bg-cyan-50 p-4 text-sm text-slate-700">
                        <p className="inline-flex items-center gap-1.5 font-bold text-cyan-800">
                          <Video className="h-4 w-4" strokeWidth={2.5} />
                          Interview
                        </p>
                        <p className="mt-1.5 inline-flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-slate-500" strokeWidth={2.5} />
                          <span className="font-semibold">
                            {formatInterviewAt(application.interviewAt)}
                          </span>
                        </p>
                        {application.interviewLink && (
                          <a
                            href={application.interviewLink}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-2 inline-flex items-center gap-1.5 font-bold text-cyan-700 hover:underline"
                          >
                            <ExternalLink className="h-3.5 w-3.5" strokeWidth={2.5} />
                            Open meeting link
                          </a>
                        )}
                      </div>
                    )}
                  </div>

                  {["PENDING", "APPROVED"].includes(application.status) && (
                    <div className="flex w-full shrink-0 flex-col gap-2 sm:w-72">
                      {application.status === "APPROVED" && (
                        <div className="space-y-2 rounded-xl border border-[#cfe1e8] bg-slate-50 p-3">
                          <Field htmlFor={`link-${application.id}`}>
                            <div className="relative">
                              <LinkIcon
                                className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
                                strokeWidth={2.5}
                              />
                              <Input
                                id={`link-${application.id}`}
                                value={getInterviewForm(application).interviewLink}
                                onChange={(e) =>
                                  setInterviewField(
                                    application.id,
                                    "interviewLink",
                                    e.target.value
                                  )
                                }
                                placeholder="Meet link"
                                className="pl-9 text-sm"
                              />
                            </div>
                          </Field>
                          <Field htmlFor={`when-${application.id}`}>
                            <Input
                              id={`when-${application.id}`}
                              type="datetime-local"
                              value={getInterviewForm(application).interviewAt}
                              onChange={(e) =>
                                setInterviewField(
                                  application.id,
                                  "interviewAt",
                                  e.target.value
                                )
                              }
                              className="text-sm"
                            />
                          </Field>
                          <Button
                            size="sm"
                            fullWidth
                            iconLeft={Save}
                            disabled={isLoadingThis}
                            onClick={() => saveInterview(application)}
                          >
                            {isLoadingThis ? "..." : "Save"}
                          </Button>
                        </div>
                      )}

                      {(application.status === "PENDING" ||
                        (application.status === "APPROVED" &&
                          application.interviewLink &&
                          application.interviewAt)) && (
                        <Button
                          variant="success"
                          iconLeft={Check}
                          disabled={isLoadingThis}
                          onClick={() => approveApplication(application)}
                        >
                          {isLoadingThis ? "..." : "Accept"}
                        </Button>
                      )}

                      {(application.status === "PENDING" ||
                        (application.status === "APPROVED" &&
                          application.interviewLink &&
                          application.interviewAt)) && (
                        <Button
                          variant="danger"
                          iconLeft={X}
                          disabled={isLoadingThis}
                          onClick={() => rejectApplication(application.id)}
                        >
                          {isLoadingThis ? "..." : "Reject"}
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>
          );
        })}

        {filteredApplications.length === 0 && (
          <EmptyState
            icon={Inbox}
            title="No application found"
            description="No applications match your current filters."
          />
        )}
      </section>

      {selectedCandidate && (
        <StudentDetailsModal
          student={selectedCandidate}
          application={selectedCandidate.application}
          onClose={() => setSelectedCandidate(null)}
          onOpenCV={openCV}
        />
      )}

      {selectedSubject && (
        <SubjectDetailsModal
          subject={selectedSubject}
          onClose={() => setSelectedSubject(null)}
          onOpenDocument={openDocument}
        />
      )}
    </div>
  );
}

export default SupervisorApplications;
