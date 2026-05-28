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
  Badge,
  EmptyState,
  LoadingState,
} from "../../components/ui";
import DateRangeFilter from "../../components/filters/DateRangeFilter";
import { createDateRange, matchesDateRange } from "../../utils/filters";

function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState(createDateRange("ALL"));
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

      const matchesDate = matchesDateRange(log.createdAt, dateFilter);

      return matchesSearch && matchesDate;
    });
  }, [logs, search, dateFilter]);

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
                  placeholder="Search logs..."
                  className="pl-9"
                />
              </div>
            </Field>

            <DateRangeFilter value={dateFilter} onChange={setDateFilter} />
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
                <tr key={log.id} className="admin-hover-row transition hover:bg-cyan-50/50">
                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center gap-1.5 text-sm text-slate-600">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" strokeWidth={2.5} />
                      {log.createdAt
                        ? new Date(log.createdAt).toLocaleString()
                        : "-"}
                    </span>
                  </td>

                  <td className="px-5 py-3.5">
                    <Badge variant="info" size="sm" className="audit-action-badge">
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
