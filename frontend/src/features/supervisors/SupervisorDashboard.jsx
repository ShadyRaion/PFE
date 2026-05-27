import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  BookMarked,
  FileText,
  CheckCircle2,
  Bell,
  ArrowUpRight,
} from "lucide-react";
import api from "../../api/axios";
import {
  PageHeader,
  Card,
  CardHeader,
  CardBody,
  StatCard,
  Badge,
} from "../../components/ui";

function SupervisorDashboard() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [subjects, setSubjects] = useState([]);
  const [applications, setApplications] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const normalizeArray = (payload, key) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.[key])) return payload[key];
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.subjects)) return payload.subjects;
    if (Array.isArray(payload?.applications)) return payload.applications;
    if (Array.isArray(payload?.notifications)) return payload.notifications;
    return [];
  };

  const fetchData = useCallback(async () => {
    const res = await api.get("/supervisor/dashboard-summary");
    const data = res.data || {};

    setSubjects(normalizeArray(data.subjects, "subjects"));
    setApplications(normalizeArray(data.applications, "applications"));
    setNotifications(normalizeArray(data.notifications, "notifications"));
  }, []);

  useEffect(() => {
    queueMicrotask(fetchData);
  }, [fetchData]);

  const affected = applications.filter((app) => app.status === "AFFECTED");

  const statusVariant = (status) => {
    switch (status) {
      case "AFFECTED":
        return "success";
      case "APPROVED":
        return "info";
      case "PENDING":
        return "warning";
      case "REJECTED":
        return "danger";
      default:
        return "neutral";
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        icon={LayoutDashboard}
        title="Dashboard"
        subtitle={`Welcome, ${user?.fullName || "Supervisor"}. Here is an overview of your space.`}
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Link to="/encadrant/my-subjects" className="block">
          <StatCard
            icon={BookMarked}
            label="Subjects"
            value={subjects.length}
            hint="Active subjects"
            accent="cyan"
          />
        </Link>

        <Link to="/encadrant/applications" className="block">
          <StatCard
            icon={FileText}
            label="Applications"
            value={applications.length}
            hint="Received requests"
            accent="indigo"
          />
        </Link>

        <Link to="/encadrant/applications" className="block">
          <StatCard
            icon={CheckCircle2}
            label="Assigned"
            value={affected.length}
            hint="Accepted interns"
            accent="emerald"
          />
        </Link>

        <Link to="/encadrant/notifications" className="block">
          <StatCard
            icon={Bell}
            label="Notifications"
            value={notifications.length}
            hint="Recent activity"
            accent="amber"
          />
        </Link>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <h2 className="inline-flex items-center gap-2 text-lg font-black text-slate-950">
              <BookMarked className="h-5 w-5 text-cyan-700" strokeWidth={2.5} />
              Latest subjects
            </h2>
          </CardHeader>
          <CardBody>
            <div className="space-y-2">
              {subjects.slice(0, 5).map((subject) => (
                <Link
                  key={subject.id}
                  to="/encadrant/my-subjects"
                  className="group flex items-start justify-between gap-3 rounded-xl border border-[#e2edf2] bg-slate-50 p-4 transition hover:border-cyan-300 hover:bg-cyan-50"
                >
                  <div className="min-w-0">
                    <p className="truncate font-bold text-slate-950">
                      {subject.title}
                    </p>
                    <p className="mt-1 text-xs text-slate-600">
                      {subject.applications?.length || 0} application(s)
                    </p>
                  </div>
                  <ArrowUpRight
                    className="h-4 w-4 shrink-0 text-slate-400 transition group-hover:text-cyan-700"
                    strokeWidth={2.5}
                  />
                </Link>
              ))}

              {subjects.length === 0 && (
                <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                  No subject created.
                </p>
              )}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="inline-flex items-center gap-2 text-lg font-black text-slate-950">
              <FileText className="h-5 w-5 text-cyan-700" strokeWidth={2.5} />
              Latest applications
            </h2>
          </CardHeader>
          <CardBody>
            <div className="space-y-2">
              {applications.slice(0, 5).map((application) => (
                <Link
                  key={application.id}
                  to="/encadrant/applications"
                  className="group flex items-start justify-between gap-3 rounded-xl border border-[#e2edf2] bg-slate-50 p-4 transition hover:border-cyan-300 hover:bg-cyan-50"
                >
                  <div className="min-w-0">
                    <p className="truncate font-bold text-slate-950">
                      {application.subject?.title}
                    </p>
                    <div className="mt-1.5">
                      <Badge variant={statusVariant(application.status)} size="sm">
                        {application.status}
                      </Badge>
                    </div>
                  </div>
                  <ArrowUpRight
                    className="h-4 w-4 shrink-0 text-slate-400 transition group-hover:text-cyan-700"
                    strokeWidth={2.5}
                  />
                </Link>
              ))}

              {applications.length === 0 && (
                <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                  No application.
                </p>
              )}
            </div>
          </CardBody>
        </Card>
      </section>
    </div>
  );
}

export default SupervisorDashboard;
