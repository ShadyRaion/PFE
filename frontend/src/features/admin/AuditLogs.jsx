import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ScrollText,
  Search,
  AlertCircle,
  Calendar,
  User,
  Database,
} from "lucide-react";
import api from "../../api/axios";
import ExportButton from "../../components/ExportButton";
import {
  PageHeader,
  Card,
  CardBody,
  Field,
  Input,
<<<<<<< HEAD
=======
  Select,
>>>>>>> 8fd258754427456a9e996d340332bcb6a728e256
  Badge,
  EmptyState,
  LoadingState,
} from "../../components/ui";
<<<<<<< HEAD
import DateRangeFilter from "../../components/filters/DateRangeFilter";
import { createDateRange, matchesDateRange } from "../../utils/filters";
=======
>>>>>>> 8fd258754427456a9e996d340332bcb6a728e256

function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState("");
<<<<<<< HEAD
  const [dateFilter, setDateFilter] = useState(createDateRange("ALL"));
=======
  const [actionFilter, setActionFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("ALL");
>>>>>>> 8fd258754427456a9e996d340332bcb6a728e256
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const normalizeLogs = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.logs)) return payload.logs;
    if (Array.isArray(payload?.data)) return payload.data;
    return [];
  };

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setMessage("");

      const res = await api.get("/admin/audit-logs");
      setLogs(normalizeLogs(res.data));
    } catch (error) {
      console.error(error);
      setLogs([]);
      setMessage("Error while loading.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(fetchLogs);
  }, [fetchLogs]);

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

  const actions = useMemo(() => {
    const values = logs.map((log) => log.action).filter(Boolean);
    return ["ALL", ...Array.from(new Set(values))];
  }, [logs]);

>>>>>>> 8fd258754427456a9e996d340332bcb6a728e256
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const actor = log.actor || {};

      const text = [
        log.action,
        log.entity,
        log.entityId,
        log.details,
        actor.fullName,
        actor.email,
        actor.role,
        log.createdAt,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = text.includes(search.toLowerCase());

<<<<<<< HEAD
      const matchesDate = matchesDateRange(log.createdAt, dateFilter);

      return matchesSearch && matchesDate;
    });
  }, [logs, search, dateFilter]);
=======
      const matchesAction =
        actionFilter === "ALL" || log.action === actionFilter;

      const matchesDate = isInDateFilter(log.createdAt);

      return matchesSearch && matchesAction && matchesDate;
    });
  }, [logs, search, actionFilter, isInDateFilter]);
>>>>>>> 8fd258754427456a9e996d340332bcb6a728e256

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          icon={ScrollText}
          title="Audit logs"
          subtitle="Review important actions performed on the platform."
        />
        <LoadingState label="Loading audit logs..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={ScrollText}
        title="Audit logs"
        subtitle="Review important actions performed on the platform."
        actions={
          <ExportButton
            endpoint="/exports/audit-logs"
            filename="audit-logs-export.csv"
          />
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
<<<<<<< HEAD
          <div className="grid gap-4 lg:grid-cols-3">
=======
          <div className="grid gap-4 lg:grid-cols-4">
>>>>>>> 8fd258754427456a9e996d340332bcb6a728e256
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
                  placeholder="Search logs..."
                  className="pl-9"
                />
              </div>
            </Field>

<<<<<<< HEAD
            <DateRangeFilter value={dateFilter} onChange={setDateFilter} />
=======
            <Field label="Action" htmlFor="actionFilter">
              <Select
                id="actionFilter"
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
              >
                {actions.map((action) => (
                  <option key={action} value={action}>
                    {action === "ALL" ? "All actions" : action}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Date" htmlFor="dateFilter">
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

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-[#e2edf2] bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-600">
              <tr>
                <th className="px-5 py-3.5">Date</th>
                <th className="px-5 py-3.5">Action</th>
                <th className="px-5 py-3.5">Actor</th>
                <th className="px-5 py-3.5">Entity</th>
                <th className="px-5 py-3.5">Details</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#e2edf2]">
              {filteredLogs.map((log) => (
<<<<<<< HEAD
                <tr key={log.id} className="admin-hover-row transition hover:bg-cyan-50/50">
=======
                <tr key={log.id} className="transition hover:bg-cyan-50/50">
>>>>>>> 8fd258754427456a9e996d340332bcb6a728e256
                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center gap-1.5 text-sm text-slate-600">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" strokeWidth={2.5} />
                      {log.createdAt
                        ? new Date(log.createdAt).toLocaleString()
                        : "-"}
                    </span>
                  </td>

                  <td className="px-5 py-3.5">
<<<<<<< HEAD
                    <Badge variant="info" size="sm" className="audit-action-badge">
=======
                    <Badge variant="info" size="sm">
>>>>>>> 8fd258754427456a9e996d340332bcb6a728e256
                      {log.action || "-"}
                    </Badge>
                  </td>

                  <td className="px-5 py-3.5">
                    {log.actor ? (
                      <span className="inline-flex items-center gap-1.5 text-sm text-slate-600">
                        <User className="h-3.5 w-3.5 text-slate-400" strokeWidth={2.5} />
                        <span className="font-bold text-slate-900">
                          {log.actor.fullName || "-"}
                        </span>
                        <span className="text-slate-500">
                          ({log.actor.email || "-"})
                        </span>
                      </span>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>

                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center gap-1.5 text-sm text-slate-600">
                      <Database className="h-3.5 w-3.5 text-slate-400" strokeWidth={2.5} />
                      {log.entity || "-"}
                      {log.entityId ? (
                        <span className="text-slate-400"> / {log.entityId}</span>
                      ) : null}
                    </span>
                  </td>

                  <td className="px-5 py-3.5 text-sm text-slate-600">
                    {log.details || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredLogs.length === 0 && (
          <EmptyState
            icon={ScrollText}
            title="No log found."
            description="Try adjusting your filters or search query."
          />
        )}
      </Card>
    </div>
  );
}

export default AuditLogs;
