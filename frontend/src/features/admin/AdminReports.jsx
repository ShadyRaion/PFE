import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  Search,
  AlertCircle,
  Mail,
  Calendar,
  UserCog,
  BookMarked,
} from "lucide-react";
import api from "../../api/axios";
import {
  PageHeader,
  Card,
  CardBody,
  Field,
  Input,
  Badge,
  EmptyState,
} from "../../components/ui";
import DateRangeFilter from "../../components/filters/DateRangeFilter";
import { createDateRange, matchesDateRange } from "../../utils/filters";

function AdminReports() {
  const [reports, setReports] = useState([]);
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState(createDateRange("ALL"));
  const [message, setMessage] = useState("");

  const fetchReports = useCallback(async () => {
    try {
      const res = await api.get("/admin/reports");
      setReports(res.data || []);
      setMessage("");
    } catch {
      setMessage("Error while loading reports.");
    }
  }, []);

  useEffect(() => {
    queueMicrotask(fetchReports);
  }, [fetchReports]);

  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const haystack = [
        report.reason,
        report.student?.fullName,
        report.student?.email,
        report.student?.university,
        report.student?.specialty,
        report.supervisor?.fullName,
        report.supervisor?.email,
        report.application?.subject?.title,
        report.application?.subject?.description,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return (
        haystack.includes(search.toLowerCase()) &&
        matchesDateRange(report.createdAt, dateFilter)
      );
    });
  }, [reports, search, dateFilter]);

  return (
    <div className="space-y-6">
      <PageHeader
        icon={AlertTriangle}
        title="Reports"
        subtitle="Review reports submitted by supervisors."
      />

      {message && (
        <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2.5} />
          <span>{message}</span>
        </div>
      )}

      <Card>
        <CardBody>
          <div className="grid gap-4 lg:grid-cols-3">
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
                  placeholder="Search student, supervisor, subject, reason..."
                  className="pl-9"
                />
              </div>
            </Field>

            <DateRangeFilter value={dateFilter} onChange={setDateFilter} />
          </div>
        </CardBody>
      </Card>

      <section className="space-y-4">
        {filteredReports.map((report) => (
          <Card key={report.id}>
            <CardBody>
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <Link
                      to={`/admin/users/${report.student?.id}`}
                      className="text-xl font-black text-cyan-700 hover:underline"
                    >
                      {report.student?.fullName || "Student"}
                    </Link>
                    <Badge variant="danger" size="sm" icon={AlertTriangle}>
                      Reported
                    </Badge>
                  </div>

                  <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-slate-600">
                    <Mail className="h-3.5 w-3.5 text-slate-400" strokeWidth={2.5} />
                    {report.student?.email || "-"}
                  </p>

                  <div className="mt-5 grid gap-3 md:grid-cols-2">
                    <div className="rounded-xl border border-[#e2edf2] bg-slate-50 p-4">
                      <p className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                        <UserCog className="h-3.5 w-3.5" strokeWidth={2.5} />
                        Supervisor
                      </p>
                      <p className="mt-1.5 font-bold text-slate-950">
                        {report.supervisor?.fullName || "-"}
                      </p>
                      <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-slate-600">
                        <Mail className="h-3 w-3 text-slate-400" strokeWidth={2.5} />
                        {report.supervisor?.email || "-"}
                      </p>
                    </div>

                    <div className="rounded-xl border border-[#e2edf2] bg-slate-50 p-4">
                      <p className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                        <BookMarked className="h-3.5 w-3.5" strokeWidth={2.5} />
                        Subject
                      </p>
                      {report.application?.subject?.id ? (
                        <Link
                          to={`/admin/subjects/${report.application.subject.id}`}
                          className="mt-1.5 block font-bold text-cyan-700 hover:underline"
                        >
                          {report.application.subject.title}
                        </Link>
                      ) : (
                        <p className="mt-1.5 font-bold text-slate-950">-</p>
                      )}
                    </div>
                  </div>

                  <div className="report-reason-text mt-5 rounded-xl border border-rose-200 bg-rose-50 p-4">
                    <p className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-rose-700">
                      <AlertTriangle className="h-3.5 w-3.5" strokeWidth={2.5} />
                      Report reason
                    </p>
                    <p className="mt-2 whitespace-pre-wrap leading-7 text-slate-800">
                      {report.reason}
                    </p>
                  </div>
                </div>

                <Badge variant="neutral" size="sm" icon={Calendar}>
                  {report.createdAt
                    ? new Date(report.createdAt).toLocaleDateString()
                    : "-"}
                </Badge>
              </div>
            </CardBody>
          </Card>
        ))}

        {filteredReports.length === 0 && (
          <EmptyState
            icon={AlertTriangle}
            title="No report."
            description="No supervisor reports have been submitted."
          />
        )}
      </section>
    </div>
  );
}

export default AdminReports;
