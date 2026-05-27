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
<<<<<<< HEAD
import DateRangeFilter from "../../components/filters/DateRangeFilter";
import { createDateRange, matchesDateRange } from "../../utils/filters";
=======
>>>>>>> 8fd258754427456a9e996d340332bcb6a728e256

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
<<<<<<< HEAD
  const [dateFilter, setDateFilter] = useState(createDateRange("ALL"));
=======
  const [scoreFilter, setScoreFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("ALL");
>>>>>>> 8fd258754427456a9e996d340332bcb6a728e256

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

<<<<<<< HEAD
=======
  const isInDateFilter = useCallback((date) => {
    if (!date) return true;
    if (dateFilter === "ALL") return true;
    const createdAt = new Date(date);
    const now = new Date();
    if (dateFilter === "TODAY") {
      return createdAt.toDateString() === now.toDateString();
    }
    if (dateFilter === "7_DAYS") {
      return now - createdAt <= 7 * 24 * 60 * 60 * 1000;
    }
    if (dateFilter === "30_DAYS") {
      return now - createdAt <= 30 * 24 * 60 * 60 * 1000;
    }
    return true;
  }, [dateFilter]);

  const isInScoreFilter = useCallback((score) => {
    const value = Number(score || 0);
    if (scoreFilter === "ALL") return true;
    if (scoreFilter === "80") return value >= 80;
    if (scoreFilter === "60") return value >= 60 && value < 80;
    if (scoreFilter === "40") return value >= 40 && value < 60;
    if (scoreFilter === "LOW") return value < 40;
    return true;
  }, [scoreFilter]);

>>>>>>> 8fd258754427456a9e996d340332bcb6a728e256
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
<<<<<<< HEAD
      const matchesDate = matchesDateRange(application.createdAt, dateFilter);
      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [applications, search, statusFilter, dateFilter]);
=======
      const matchesScore = isInScoreFilter(application.score);
      const matchesDate = isInDateFilter(application.createdAt);
      return matchesSearch && matchesStatus && matchesScore && matchesDate;
    });
  }, [applications, search, statusFilter, isInScoreFilter, isInDateFilter]);
>>>>>>> 8fd258754427456a9e996d340332bcb6a728e256

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
<<<<<<< HEAD
          <div className="grid gap-3 lg:grid-cols-4">
            <Field label="Search" htmlFor="search" className="lg:col-span-2">
=======
          <div className="grid gap-3 lg:grid-cols-5">
            <Field htmlFor="search" className="lg:col-span-2">
>>>>>>> 8fd258754427456a9e996d340332bcb6a728e256
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
<<<<<<< HEAD
            <Field label="Status" htmlFor="statusFilter">
=======
            <Field htmlFor="statusFilter">
>>>>>>> 8fd258754427456a9e996d340332bcb6a728e256
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
<<<<<<< HEAD
            <DateRangeFilter value={dateFilter} onChange={setDateFilter} />
=======
            <Field htmlFor="scoreFilter">
              <Select
                id="scoreFilter"
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
            <Field htmlFor="dateFilter">
              <Select
                id="dateFilter"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              >
                <option value="ALL">All dates</option>
                <option value="TODAY">Today</option>
                <option value="7_DAYS">Last 7 days</option>
                <option value="30_DAYS">Last 30 days</option>
              </Select>
            </Field>
>>>>>>> 8fd258754427456a9e996d340332bcb6a728e256
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-6">
          <Card className="max-h-[90vh] w-full max-w-2xl overflow-y-auto">
            <CardBody>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="inline-flex items-center gap-2 text-2xl font-black text-slate-950">
                    <User className="h-6 w-6 text-cyan-700" strokeWidth={2.5} />
                    {selectedCandidate.fullName}
                  </h2>
                  <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-slate-600">
                    <Mail className="h-3.5 w-3.5" strokeWidth={2.5} />
                    {selectedCandidate.email}
                  </p>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  iconLeft={X}
                  onClick={() => setSelectedCandidate(null)}
                >
                  Close
                </Button>
              </div>

              <div className="mt-6 grid gap-3 md:grid-cols-2">
                <div className="rounded-xl border border-[#cfe1e8] bg-slate-50 p-4">
                  <p className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-slate-500">
                    <GraduationCap className="h-3.5 w-3.5" strokeWidth={2.5} />
                    University
                  </p>
                  <p className="mt-1.5 font-bold text-slate-950">
                    {selectedCandidate.university || "-"}
                  </p>
                </div>

                <div className="rounded-xl border border-[#cfe1e8] bg-slate-50 p-4">
                  <p className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-slate-500">
                    <Briefcase className="h-3.5 w-3.5" strokeWidth={2.5} />
                    Specialty
                  </p>
                  <p className="mt-1.5 font-bold text-slate-950">
                    {selectedCandidate.specialty || "-"}
                  </p>
                </div>

                <div className="rounded-xl border border-[#cfe1e8] bg-slate-50 p-4">
                  <p className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-slate-500">
                    <Phone className="h-3.5 w-3.5" strokeWidth={2.5} />
                    Phone
                  </p>
                  <p className="mt-1.5 font-bold text-slate-950">
                    {selectedCandidate.phone || "-"}
                  </p>
                </div>

                <div className="rounded-xl border border-[#cfe1e8] bg-slate-50 p-4">
                  <p className="text-xs font-black uppercase tracking-widest text-slate-500">
                    Compatibility score
                  </p>
                  <div className="mt-1.5">
                    <ScoreBadge
                      score={selectedCandidate.application?.score || 0}
                      size="lg"
                    />
                  </div>
                </div>
              </div>

              {selectedCandidate.cvs?.[0] ? (
                <Button
                  className="mt-6"
                  iconLeft={FileText}
                  onClick={() =>
                    openCV(
                      selectedCandidate.cvs[0].id,
                      selectedCandidate.cvs[0].originalName
                    )
                  }
                >
                  Open Resume
                </Button>
              ) : (
                <p className="mt-6 rounded-xl border border-[#cfe1e8] bg-slate-50 p-4 text-sm text-slate-600">
                  Resume not available.
                </p>
              )}
            </CardBody>
          </Card>
        </div>
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
