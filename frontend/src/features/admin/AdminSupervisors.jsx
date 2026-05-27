import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { UserCog, Search, AlertCircle, Mail, Calendar } from "lucide-react";
import api from "../../api/axios";
import ExportButton from "../../components/ExportButton";
<<<<<<< HEAD
import DateRangeFilter from "../../components/filters/DateRangeFilter";
import { createDateRange, matchesDateRange } from "../../utils/filters";
=======
>>>>>>> 8fd258754427456a9e996d340332bcb6a728e256
import {
  PageHeader,
  Card,
  CardBody,
  Field,
  Input,
  Select,
<<<<<<< HEAD
=======
  Badge,
>>>>>>> 8fd258754427456a9e996d340332bcb6a728e256
  EmptyState,
  LoadingState,
} from "../../components/ui";

<<<<<<< HEAD
function AdminSupervisors() {
  const [supervisors, setSupervisors] = useState([]);
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState(createDateRange("ALL"));
  const [departmentFilter, setDepartmentFilter] = useState("ALL");
  const [rankFilter, setRankFilter] = useState("ALL");
  const [divisionFilter, setDivisionFilter] = useState("ALL");
=======
function approvalVariant(status) {
  if (status === "APPROVED") return "success";
  if (status === "PENDING") return "warning";
  if (status === "REJECTED") return "danger";
  return "neutral";
}

function approvalLabel(status) {
  if (status === "APPROVED") return "Approved";
  if (status === "PENDING") return "Pending";
  if (status === "REJECTED") return "Rejected";
  return status || "-";
}

function AdminSupervisors() {
  const [supervisors, setSupervisors] = useState([]);
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("ALL");
  const [approvalFilter, setApprovalFilter] = useState("ALL");
>>>>>>> 8fd258754427456a9e996d340332bcb6a728e256
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const normalizeSupervisors = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.supervisors)) return payload.supervisors;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.users)) return payload.users;
    return [];
  };

  const fetchSupervisors = useCallback(async () => {
    try {
      setLoading(true);
      setMessage("");

      const res = await api.get("/admin/users?role=COMPANY_SUPERVISOR");
      setSupervisors(normalizeSupervisors(res.data));
    } catch (error) {
      console.error(error);
      setSupervisors([]);
      setMessage("Error while loading.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(fetchSupervisors);
  }, [fetchSupervisors]);

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
  const getApprovalStatus = (supervisor) => {
    return (
      supervisor.supervisorStatus ||
      supervisor.status ||
      supervisor.approvalStatus ||
      "APPROVED"
    );
  };

  const filteredSupervisors = useMemo(() => {
    return supervisors.filter((supervisor) => {
      const status = getApprovalStatus(supervisor);

      const text = [
        supervisor.fullName,
        supervisor.email,
        supervisor.phone,
<<<<<<< HEAD
        supervisor.department,
        supervisor.rank,
        supervisor.division,
=======
        status,
>>>>>>> 8fd258754427456a9e996d340332bcb6a728e256
        supervisor.createdAt,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = text.includes(search.toLowerCase());

<<<<<<< HEAD
      const matchesDate = matchesDateRange(supervisor.createdAt, dateFilter);

      const matchesApproval = status === "APPROVED";
      const matchesDepartment =
        departmentFilter === "ALL" || supervisor.department === departmentFilter;
      const matchesRank = rankFilter === "ALL" || supervisor.rank === rankFilter;
      const matchesDivision =
        divisionFilter === "ALL" || supervisor.division === divisionFilter;

      return (
        matchesSearch &&
        matchesDate &&
        matchesApproval &&
        matchesDepartment &&
        matchesRank &&
        matchesDivision
      );
    });
  }, [supervisors, search, dateFilter, departmentFilter, rankFilter, divisionFilter]);

  const departmentOptions = Array.from(new Set(supervisors.map((item) => item.department).filter(Boolean)));
  const rankOptions = Array.from(new Set(supervisors.map((item) => item.rank).filter(Boolean)));
  const divisionOptions = Array.from(new Set(supervisors.map((item) => item.division).filter(Boolean)));
=======
      const matchesDate = isInDateFilter(supervisor.createdAt);

      const matchesApproval =
        approvalFilter === "ALL" || status === approvalFilter;

      return matchesSearch && matchesDate && matchesApproval;
    });
  }, [supervisors, search, isInDateFilter, approvalFilter]);
>>>>>>> 8fd258754427456a9e996d340332bcb6a728e256

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          icon={UserCog}
          title="Supervisors"
          subtitle="Complete list of company supervisors."
        />
        <LoadingState label="Loading supervisors..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={UserCog}
        title="Supervisors"
        subtitle="Complete list of company supervisors."
        actions={
          <ExportButton
            endpoint="/exports/supervisors"
            filename="supervisors-export.csv"
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
          <div className="grid gap-4 lg:grid-cols-6">
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
            <Field label="Status" htmlFor="approvalFilter">
              <Select
                id="approvalFilter"
                value={approvalFilter}
                onChange={(e) => setApprovalFilter(e.target.value)}
              >
                <option value="ALL">All statuses</option>
                <option value="APPROVED">Approved</option>
                <option value="PENDING">Pending</option>
                <option value="REJECTED">Rejected</option>
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
                <th className="px-5 py-3.5">Name</th>
                <th className="px-5 py-3.5">Email</th>
                <th className="px-5 py-3.5">Department</th>
                <th className="px-5 py-3.5">Rank</th>
<<<<<<< HEAD
                <th className="px-5 py-3.5">Division</th>
=======
                <th className="px-5 py-3.5">Status</th>
>>>>>>> 8fd258754427456a9e996d340332bcb6a728e256
                <th className="px-5 py-3.5">Registration date</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#e2edf2]">
<<<<<<< HEAD
              {filteredSupervisors.map((supervisor) => (
                  <tr key={supervisor.id} className="admin-hover-row transition hover:bg-cyan-50/50">
=======
              {filteredSupervisors.map((supervisor) => {
                const status = getApprovalStatus(supervisor);

                return (
                  <tr key={supervisor.id} className="transition hover:bg-cyan-50/50">
>>>>>>> 8fd258754427456a9e996d340332bcb6a728e256
                    <td className="px-5 py-3.5">
                      <Link
                        to={`/admin/users/${supervisor.id}`}
                        className="font-bold text-cyan-700 hover:underline"
                      >
                        {supervisor.fullName}
                      </Link>
                    </td>

                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1.5 text-sm text-slate-600">
                        <Mail className="h-3.5 w-3.5 text-slate-400" strokeWidth={2.5} />
                        {supervisor.email}
                      </span>
                    </td>

                    <td className="px-5 py-3.5">
                      <span className="text-sm text-slate-600">
                        {supervisor.department || (
                          <span className="text-slate-400">-</span>
                        )}
                      </span>
                    </td>

                    <td className="px-5 py-3.5">
                      <span className="text-sm text-slate-600">
                        {supervisor.rank || (
                          <span className="text-slate-400">-</span>
                        )}
                      </span>
                    </td>

                    <td className="px-5 py-3.5">
<<<<<<< HEAD
                      <span className="text-sm text-slate-600">
                        {supervisor.division || (
                          <span className="text-slate-400">-</span>
                        )}
                      </span>
=======
                      <Badge variant={approvalVariant(status)} size="sm">
                        {approvalLabel(status)}
                      </Badge>
>>>>>>> 8fd258754427456a9e996d340332bcb6a728e256
                    </td>

                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1.5 text-sm text-slate-600">
                        {supervisor.createdAt ? (
                          <>
                            <Calendar className="h-3.5 w-3.5 text-slate-400" strokeWidth={2.5} />
                            {new Date(supervisor.createdAt).toLocaleDateString()}
                          </>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </span>
                    </td>
                  </tr>
<<<<<<< HEAD
              ))}
=======
                );
              })}
>>>>>>> 8fd258754427456a9e996d340332bcb6a728e256
            </tbody>
          </table>
        </div>

        {filteredSupervisors.length === 0 && (
          <EmptyState
            icon={UserCog}
            title="No supervisor found."
            description="Try adjusting your filters or search query."
          />
        )}
      </Card>
    </div>
  );
}

export default AdminSupervisors;
