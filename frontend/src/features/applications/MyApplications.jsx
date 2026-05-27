import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ClipboardList,
  Search,
  Calendar,
  User,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Clock,
  Video,
  X,
  FileText,
} from "lucide-react";
import api from "../../api/axios";
import {
  PageHeader,
  Card,
  CardBody,
  Badge,
  ScoreBadge,
  EmptyState,
  Button,
  Field,
  Input,
  Select,
} from "../../components/ui";
<<<<<<< HEAD
import DateRangeFilter from "../../components/filters/DateRangeFilter";
import { createDateRange, matchesDateRange } from "../../utils/filters";
=======
>>>>>>> 8fd258754427456a9e996d340332bcb6a728e256

function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
<<<<<<< HEAD
  const [dateFilter, setDateFilter] = useState(createDateRange("ALL"));
=======
  const [dateFilter, setDateFilter] = useState("ALL");
>>>>>>> 8fd258754427456a9e996d340332bcb6a728e256
  const [message, setMessage] = useState("");
  const [confirmingCancelId, setConfirmingCancelId] = useState(null);
  const [confirmingCompleteId, setConfirmingCompleteId] = useState(null);

  const refreshAlerts = () => {
    window.dispatchEvent(new Event("page-alerts-refresh"));
  };

  const fetchApplications = useCallback(async () => {
    try {
      const res = await api.get("/applications/me");
      setApplications(
        Array.isArray(res.data) ? res.data : res.data?.data || []
      );
    } catch {
      setMessage("Unable to load applications.");
    }
  }, []);

  useEffect(() => {
    queueMicrotask(fetchApplications);
  }, [fetchApplications]);

  const cancelApplication = async (id) => {
    try {
      await api.patch(`/applications/${id}/cancel`);
      setMessage("Application canceled.");
      setConfirmingCancelId(null);
      fetchApplications();
      refreshAlerts();
    } catch {
      setMessage("Error while canceling.");
      setConfirmingCancelId(null);
    }
  };

  const completeAssignment = async (id) => {
    try {
      await api.patch(`/applications/${id}/complete`);
      setMessage("Assignment marked as completed.");
      setConfirmingCompleteId(null);
      fetchApplications();
      refreshAlerts();
      window.dispatchEvent(new Event("assignments-refresh"));
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Unable to complete assignment."
      );
      setConfirmingCompleteId(null);
    }
  };

  const skillMatches = (skill, application) => {
    const matchedSkills = (application?.matchedSkills || []).map((value) =>
      String(value).toLowerCase()
    );
    return matchedSkills.includes(String(skill).toLowerCase());
  };

<<<<<<< HEAD
=======
  const isInDateFilter = useCallback(
    (date) => {
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
    },
    [dateFilter]
  );

>>>>>>> 8fd258754427456a9e996d340332bcb6a728e256
  const filteredApplications = useMemo(() => {
    return applications.filter((application) => {
      const text = [
        application.subject?.title,
        application.subject?.description,
        application.subject?.supervisor?.fullName,
        application.status,
        ...(application.subject?.technologies || []),
        ...(application.subject?.requiredSkills || []),
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
      const matchesDate = isInDateFilter(application.createdAt);
      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [applications, search, statusFilter, isInDateFilter]);
>>>>>>> 8fd258754427456a9e996d340332bcb6a728e256

  const statusConfig = (status) => {
    if (status === "AFFECTED")
      return { label: "Assigned", variant: "success", icon: CheckCircle2 };
    if (status === "COMPLETED")
      return { label: "Completed", variant: "success", icon: CheckCircle2 };
    if (status === "PENDING")
      return { label: "Pending", variant: "warning", icon: Clock };
    if (status === "APPROVED")
      return { label: "Interview", variant: "info", icon: Video };
    if (status === "REJECTED")
      return { label: "Rejected", variant: "danger", icon: XCircle };
    if (status === "CANCELLED")
      return { label: "Canceled", variant: "neutral", icon: X };
    return { label: status, variant: "neutral" };
  };

  const formatInterviewAt = (value) =>
    !value ? "-" : new Date(value).toLocaleString();

  return (
    <div className="space-y-6">
      <PageHeader
        icon={ClipboardList}
        title="Assignment tracking"
        subtitle="Review the status of your applications and assignments."
      />

      {message && (
        <div className="flex items-start gap-2 rounded-xl border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm font-semibold text-cyan-700">
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
                  placeholder="Subject, supervisor, technology..."
                  className="pl-9"
                />
              </div>
            </Field>

            <Field label="Status" htmlFor="status">
              <Select
                id="status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">All statuses</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Interview</option>
                <option value="AFFECTED">Assigned</option>
                <option value="COMPLETED">Completed</option>
                <option value="REJECTED">Rejected</option>
                <option value="CANCELLED">Canceled</option>
              </Select>
            </Field>

<<<<<<< HEAD
            <DateRangeFilter value={dateFilter} onChange={setDateFilter} />
=======
            <Field label="Date" htmlFor="date">
              <Select
                id="date"
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

      {filteredApplications.length === 0 && (
        <EmptyState
          icon={ClipboardList}
          title="No application found"
          description="Apply to subjects in the catalog and they will appear here."
        />
      )}

      <section className="space-y-4">
        {filteredApplications.map((application) => {
          const status = statusConfig(application.status);
          const StatusIcon = status.icon;
          return (
            <Card
              key={application.id}
              className="transition hover:shadow-card-hover"
            >
              <CardBody>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <Link
                      to={`/subjects/${application.subject?.id}`}
                      className="text-xl font-black text-slate-950 hover:text-cyan-700"
                    >
                      {application.subject?.title}
                    </Link>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <Badge
                        variant={status.variant}
                        icon={StatusIcon}
                        size="md"
                      >
                        {status.label}
                      </Badge>
                      {application.score !== null &&
                        application.score !== undefined && (
                          <ScoreBadge score={application.score} />
                        )}
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar
                          className="h-3.5 w-3.5"
                          strokeWidth={2.5}
                        />
                        Sent {new Date(application.createdAt).toLocaleDateString()}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5" strokeWidth={2.5} />
                        {application.subject?.supervisor?.fullName || "-"}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {application.status === "AFFECTED" && (
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => setConfirmingCompleteId(application.id)}
                        iconLeft={CheckCircle2}
                      >
                        Mark completed
                      </Button>
                    )}
                    {application.status === "COMPLETED" && (
                      <Link to="/academic-report">
                        <Button variant="secondary" size="sm" iconLeft={FileText}>
                          Final report
                        </Button>
                      </Link>
                    )}
                    {application.status === "PENDING" && (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => setConfirmingCancelId(application.id)}
                        iconLeft={X}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>

                <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-700">
                  {application.subject?.description}
                </p>

                {application.status === "APPROVED" && (
                  <div className="mt-4 rounded-xl border border-cyan-200 bg-cyan-50 p-4 text-sm">
                    <p className="inline-flex items-center gap-2 font-black text-cyan-800">
                      <Video className="h-4 w-4" strokeWidth={2.5} />
                      Interview scheduled
                    </p>
                    <p className="mt-1.5 text-cyan-900">
                      Date:{" "}
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
                        Open meeting link
                      </a>
                    )}
                  </div>
                )}

                {application.subject?.requiredSkills?.length > 0 && (
                  <div className="mt-4">
                    <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Required skills
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {application.subject.requiredSkills.map((skill) => {
                        const matched = skillMatches(skill, application);
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

                {application.subject?.technologies?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {application.subject.technologies.map((tech) => {
                      const matched = skillMatches(tech, application);
                      return (
                        <Badge
                          key={tech}
                          variant={matched ? "success" : "info"}
                          icon={matched ? CheckCircle2 : undefined}
                        >
                          {tech}
                        </Badge>
                      );
                    })}
                  </div>
                )}
              </CardBody>
            </Card>
          );
        })}
      </section>

      {confirmingCancelId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-md">
            <CardBody>
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                  <XCircle className="h-5 w-5" strokeWidth={2.5} />
                </span>
                <div>
                  <h3 className="text-lg font-black text-slate-950">
                    Cancel this application?
                  </h3>
                  <p className="mt-1 text-sm text-slate-600">
                    This action cannot be undone.
                  </p>
                </div>
              </div>
              <div className="mt-5 flex justify-end gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  iconLeft={X}
                  onClick={() => setConfirmingCancelId(null)}
                >
                  Keep
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  iconLeft={XCircle}
                  onClick={() => cancelApplication(confirmingCancelId)}
                >
                  Cancel application
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {confirmingCompleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-md">
            <CardBody>
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <CheckCircle2 className="h-5 w-5" strokeWidth={2.5} />
                </span>
                <div>
                  <h3 className="text-lg font-black text-slate-950">
                    Mark assignment as completed?
                  </h3>
                  <p className="mt-1 text-sm text-slate-600">
                    The final report page will become available after completion.
                  </p>
                </div>
              </div>
              <div className="mt-5 flex justify-end gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  iconLeft={X}
                  onClick={() => setConfirmingCompleteId(null)}
                >
                  Keep active
                </Button>
                <Button
                  variant="success"
                  size="sm"
                  iconLeft={CheckCircle2}
                  onClick={() => completeAssignment(confirmingCompleteId)}
                >
                  Mark completed
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
}

export default MyApplications;
