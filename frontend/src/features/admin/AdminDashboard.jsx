import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  UserCog,
  BookMarked,
  CheckCircle2,
  ArrowUpRight,
  Mail,
  AlertCircle,
  Clock,
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

function AdminDashboard() {
  const [stats, setStats] = useState({
    students: 0,
    supervisors: 0,
    subjects: 0,
    assignments: 0,
  });
  const [subjects, setSubjects] = useState([]);
  const [pendingSupervisors, setPendingSupervisors] = useState([]);
  const [message, setMessage] = useState("");

  const normalizeArray = (payload, key) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.[key])) return payload[key];
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.users)) return payload.users;
    if (Array.isArray(payload?.subjects)) return payload.subjects;
    if (Array.isArray(payload?.applications)) return payload.applications;
    if (Array.isArray(payload?.supervisors)) return payload.supervisors;
    return [];
  };

  const fetchDashboardData = useCallback(async () => {
    try {
      const res = await api.get("/admin/dashboard-summary");
      const data = res.data || {};

      setStats({
        students: Number(data.stats?.students || 0),
        supervisors: Number(data.stats?.supervisors || 0),
        subjects: Number(data.stats?.subjects || 0),
        assignments: Number(data.stats?.assignments || 0),
      });
      setSubjects(normalizeArray(data.latestSubjects || data.subjects, "subjects"));
      setPendingSupervisors(
        normalizeArray(data.pendingSupervisors, "supervisors")
      );
      setMessage("");
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to load dashboard.");
    }
  }, []);

  useEffect(() => {
    queueMicrotask(fetchDashboardData);
  }, [fetchDashboardData]);

  return (
    <div className="space-y-6">
      <PageHeader
        icon={LayoutDashboard}
        title="Dashboard"
        subtitle="General platform overview."
      />

      {message && (
        <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2.5} />
          <span>{message}</span>
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Link to="/admin/students" className="block">
          <StatCard
            icon={Users}
            label="Students"
            value={stats.students}
            accent="cyan"
          />
        </Link>
        <Link to="/admin/supervisors" className="block">
          <StatCard
            icon={UserCog}
            label="Supervisors"
            value={stats.supervisors}
            accent="indigo"
          />
        </Link>
        <Link to="/admin/subjects" className="block">
          <StatCard
            icon={BookMarked}
            label="Subjects"
            value={stats.subjects}
            accent="amber"
          />
        </Link>
        <Link to="/admin/affectations" className="block">
          <StatCard
            icon={CheckCircle2}
            label="Assignments"
            value={stats.assignments}
            accent="emerald"
          />
        </Link>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <h2 className="inline-flex items-center gap-2 text-lg font-black text-slate-950">
              <Clock className="h-5 w-5 text-cyan-700" strokeWidth={2.5} />
              Pending supervisors
            </h2>
          </CardHeader>
          <CardBody>
            <div className="space-y-2">
              {pendingSupervisors.map((supervisor) => (
                <div
                  key={supervisor.id}
                  className="rounded-xl border border-[#e2edf2] bg-slate-50 p-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-bold text-slate-950">
                        {supervisor.fullName}
                      </p>
                      <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-slate-600">
                        <Mail className="h-3 w-3" strokeWidth={2.5} />
                        {supervisor.email}
                      </p>
                    </div>
                    <Badge variant="warning" size="sm">
                      Pending
                    </Badge>
                  </div>
                </div>
              ))}

              {pendingSupervisors.length === 0 && (
                <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                  No pending supervisor.
                </p>
              )}
            </div>
          </CardBody>
        </Card>

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
                  to={`/admin/subjects/${subject.id}`}
                  className="group flex items-start justify-between gap-3 rounded-xl border border-[#e2edf2] bg-slate-50 p-4 transition hover:border-cyan-300 hover:bg-cyan-50"
                >
                  <div className="min-w-0">
                    <p className="truncate font-bold text-slate-950">
                      {subject.title}
                    </p>
                    <p className="mt-1 text-xs text-slate-600">
                      {subject.supervisor?.fullName}
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
                  No subject yet.
                </p>
              )}
            </div>
          </CardBody>
        </Card>
      </section>
    </div>
  );
}

export default AdminDashboard;
