import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ShieldCheck,
  Search,
  Mail,
  Phone,
  Calendar,
  Check,
  X,
  Info,
  Clock,
} from "lucide-react";
import api from "../../api/axios";
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
  LoadingState,
} from "../../components/ui";
<<<<<<< HEAD
import DateRangeFilter from "../../components/filters/DateRangeFilter";
import { createDateRange, matchesDateRange } from "../../utils/filters";
=======
>>>>>>> 8fd258754427456a9e996d340332bcb6a728e256

function SupervisorApprovals() {
  const [supervisors, setSupervisors] = useState([]);
  const [search, setSearch] = useState("");
<<<<<<< HEAD
  const [dateFilter, setDateFilter] = useState(createDateRange("ALL"));
  const [departmentFilter, setDepartmentFilter] = useState("ALL");
  const [rankFilter, setRankFilter] = useState("ALL");
  const [divisionFilter, setDivisionFilter] = useState("ALL");
=======
  const [dateFilter, setDateFilter] = useState("ALL");
>>>>>>> 8fd258754427456a9e996d340332bcb6a728e256
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const refreshAlerts = () => {
    window.dispatchEvent(new Event("page-alerts-refresh"));
  };

  const normalizeSupervisors = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.supervisors)) return payload.supervisors;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.users)) return payload.users;
    return [];
  };

  const fetchPendingSupervisors = useCallback(async () => {
    try {
      setLoading(true);
      setMessage("");

      const res = await api.get("/admin/supervisors/pending");
      const data = normalizeSupervisors(res.data);

      setSupervisors(data);
      refreshAlerts();
    } catch (error) {
      console.error(error);
      setSupervisors([]);
      setMessage("Error while loading supervisor requests.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(fetchPendingSupervisors);
  }, [fetchPendingSupervisors]);

  const approveSupervisor = async (id) => {
    try {
      setActionLoadingId(id);
      setMessage("");

      await api.patch(`/admin/supervisors/${id}/approve`);

      setMessage("Supervisor approved.");

<<<<<<< HEAD
=======
      setSupervisors((prev) =>
        prev.filter((supervisor) => supervisor.id !== id)
      );

>>>>>>> 8fd258754427456a9e996d340332bcb6a728e256
      await fetchPendingSupervisors();
      refreshAlerts();
    } catch {
      setMessage("Error.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const rejectSupervisor = async (id) => {
    try {
      setActionLoadingId(id);
      setMessage("");

      await api.patch(`/admin/supervisors/${id}/reject`);

      setMessage("Supervisor rejected.");

      setSupervisors((prev) =>
        prev.filter((supervisor) => supervisor.id !== id)
      );

      await fetchPendingSupervisors();
      refreshAlerts();
    } catch {
      setMessage("Error.");
    } finally {
      setActionLoadingId(null);
    }
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

>>>>>>> 8fd258754427456a9e996d340332bcb6a728e256
  const filteredSupervisors = useMemo(() => {
    return supervisors.filter((supervisor) => {
      const text = [
        supervisor.fullName,
        supervisor.email,
        supervisor.phone,
        supervisor.department,
        supervisor.division,
        supervisor.rank,
        supervisor.createdAt,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return (
        text.includes(search.toLowerCase()) &&
<<<<<<< HEAD
        matchesDateRange(supervisor.createdAt, dateFilter) &&
        (departmentFilter === "ALL" || supervisor.department === departmentFilter) &&
        (rankFilter === "ALL" || supervisor.rank === rankFilter) &&
        (divisionFilter === "ALL" || supervisor.division === divisionFilter)
      );
    });
  }, [supervisors, search, dateFilter, departmentFilter, rankFilter, divisionFilter]);

  const departmentOptions = Array.from(new Set(supervisors.map((item) => item.department).filter(Boolean)));
  const rankOptions = Array.from(new Set(supervisors.map((item) => item.rank).filter(Boolean)));
  const divisionOptions = Array.from(new Set(supervisors.map((item) => item.division).filter(Boolean)));
=======
        isInDateFilter(supervisor.createdAt)
      );
    });
  }, [supervisors, search, isInDateFilter]);
>>>>>>> 8fd258754427456a9e996d340332bcb6a728e256

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          icon={ShieldCheck}
          title="Supervisor requests"
          subtitle="Approve or reject supervisor access requests."
        />
        <LoadingState label="Loading requests..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={ShieldCheck}
        title="Supervisor requests"
        subtitle="Approve or reject supervisor access requests."
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
          <div className="grid gap-4 lg:grid-cols-6">
=======
          <div className="grid gap-4 lg:grid-cols-3">
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
                  placeholder="Search by name, email, phone..."
                  className="pl-9"
                />
              </div>
            </Field>

<<<<<<< HEAD
            <Field label="Department" htmlFor="departmentFilter">
              <Select
                id="departmentFilter"
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
              >
                <option value="ALL">All departments</option>
                {departmentOptions.map((value) => (
                  <option key={value} value={value}>{value}</option>
                ))}
              </Select>
            </Field>
            <Field label="Rank" htmlFor="rankFilter">
              <Select
                id="rankFilter"
                value={rankFilter}
                onChange={(e) => setRankFilter(e.target.value)}
              >
                <option value="ALL">All ranks</option>
                {rankOptions.map((value) => (
                  <option key={value} value={value}>{value}</option>
                ))}
              </Select>
            </Field>
            <Field label="Division" htmlFor="divisionFilter">
              <Select
                id="divisionFilter"
                value={divisionFilter}
                onChange={(e) => setDivisionFilter(e.target.value)}
              >
                <option value="ALL">All divisions</option>
                {divisionOptions.map((value) => (
                  <option key={value} value={value}>{value}</option>
                ))}
              </Select>
            </Field>
            <DateRangeFilter value={dateFilter} onChange={setDateFilter} />
=======
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

      <section className="space-y-4">
        {filteredSupervisors.map((supervisor) => (
          <Card key={supervisor.id}>
            <CardBody>
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-xl font-black text-slate-950">
                      {supervisor.fullName}
                    </h2>
<<<<<<< HEAD
                    <Badge
                      variant={
                        supervisor.supervisorStatus === "REJECTED"
                          ? "danger"
                          : "warning"
                      }
                      size="sm"
                      icon={Clock}
                    >
                      {supervisor.supervisorStatus === "REJECTED"
                        ? "Rejected"
                        : "Pending"}
=======
                    <Badge variant="warning" size="sm" icon={Clock}>
                      Pending
>>>>>>> 8fd258754427456a9e996d340332bcb6a728e256
                    </Badge>
                  </div>

                  <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-slate-600">
                    <Mail className="h-3.5 w-3.5 text-slate-400" strokeWidth={2.5} />
                    {supervisor.email}
                  </p>

                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <div className="rounded-xl border border-[#e2edf2] bg-slate-50 p-4">
                      <p className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                        <Phone className="h-3.5 w-3.5" strokeWidth={2.5} />
                        Phone
                      </p>
                      <p className="mt-1.5 font-bold text-slate-950">
                        {supervisor.phone || "-"}
                      </p>
                    </div>

                    <div className="rounded-xl border border-[#e2edf2] bg-slate-50 p-4">
                      <p className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                        <Calendar className="h-3.5 w-3.5" strokeWidth={2.5} />
                        Registration date
                      </p>
                      <p className="mt-1.5 font-bold text-slate-950">
                        {supervisor.createdAt
                          ? new Date(supervisor.createdAt).toLocaleString()
                          : "-"}
                      </p>
                    </div>
                  </div>
                </div>

<<<<<<< HEAD
                {supervisor.supervisorStatus !== "REJECTED" && (
                  <div className="flex shrink-0 gap-2">
                    <Button
                      variant="success"
                      size="sm"
                      iconLeft={Check}
                      disabled={actionLoadingId === supervisor.id}
                      onClick={() => approveSupervisor(supervisor.id)}
                    >
                      {actionLoadingId === supervisor.id ? "..." : "Approve"}
                    </Button>

                    <Button
                      variant="danger"
                      size="sm"
                      iconLeft={X}
                      disabled={actionLoadingId === supervisor.id}
                      onClick={() => rejectSupervisor(supervisor.id)}
                    >
                      {actionLoadingId === supervisor.id ? "..." : "Reject"}
                    </Button>
                  </div>
                )}
=======
                <div className="flex shrink-0 gap-2">
                  <Button
                    variant="success"
                    size="sm"
                    iconLeft={Check}
                    disabled={actionLoadingId === supervisor.id}
                    onClick={() => approveSupervisor(supervisor.id)}
                  >
                    {actionLoadingId === supervisor.id ? "..." : "Approve"}
                  </Button>

                  <Button
                    variant="danger"
                    size="sm"
                    iconLeft={X}
                    disabled={actionLoadingId === supervisor.id}
                    onClick={() => rejectSupervisor(supervisor.id)}
                  >
                    {actionLoadingId === supervisor.id ? "..." : "Reject"}
                  </Button>
                </div>
>>>>>>> 8fd258754427456a9e996d340332bcb6a728e256
              </div>
            </CardBody>
          </Card>
        ))}

        {filteredSupervisors.length === 0 && (
          <EmptyState
            icon={ShieldCheck}
            title="No pending request."
            description="All supervisor requests have been processed."
          />
        )}
      </section>
    </div>
  );
}

export default SupervisorApprovals;
