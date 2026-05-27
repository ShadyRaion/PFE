import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  CheckCircle2,
  Search,
  AlertCircle,
  User,
  Users,
  Calendar,
  FileText,
<<<<<<< HEAD
  Clock,
=======
>>>>>>> 8fd258754427456a9e996d340332bcb6a728e256
} from "lucide-react";
import api from "../../api/axios";
import AdminStudentDetails from "./AdminStudentDetails";
import ExportButton from "../../components/ExportButton";
import {
  PageHeader,
  Card,
  CardBody,
  Field,
  Input,
  Select,
  Badge,
  EmptyState,
} from "../../components/ui";
<<<<<<< HEAD
import DateRangeFilter from "../../components/filters/DateRangeFilter";
import {
  DURATION_FILTERS,
  createDateRange,
  matchesDateRange,
  matchesDurationFilter,
} from "../../utils/filters";
=======
>>>>>>> 8fd258754427456a9e996d340332bcb6a728e256

function AdminAffectations() {
  const [assignments, setAssignments] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
<<<<<<< HEAD
  const [durationFilter, setDurationFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState(createDateRange("ALL"));
=======
  const [dateFilter, setDateFilter] = useState("ALL");
>>>>>>> 8fd258754427456a9e996d340332bcb6a728e256
  const [message, setMessage] = useState("");

  const fetchAssignments = useCallback(async () => {
    try {
      const res = await api.get("/admin/affectations");
      setAssignments(res.data || []);
    } catch {
      setMessage("Error while loading.");
    }
  }, []);

  useEffect(() => {
    queueMicrotask(fetchAssignments);
  }, [fetchAssignments]);

  const openUser = async (id) => {
    try {
      const res = await api.get(`/admin/users/${id}`);
      setSelectedUser(res.data);
    } catch {
      setMessage("Error user.");
    }
  };

<<<<<<< HEAD
=======
  const isInDateFilter = useCallback((date) => {
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
  const filteredAssignments = useMemo(() => {
    return assignments.filter((assignment) => {
      const isBinome = Boolean(assignment.binome);

      const haystack = [
        assignment.subject?.title,
        assignment.subject?.description,
        assignment.subject?.supervisor?.fullName,
        assignment.subject?.supervisor?.email,
        assignment.student?.fullName,
        assignment.student?.email,
        assignment.binome?.student1?.fullName,
        assignment.binome?.student1?.email,
        assignment.binome?.student2?.fullName,
        assignment.binome?.student2?.email,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = haystack.includes(search.toLowerCase());
<<<<<<< HEAD
      const matchesDate = matchesDateRange(assignment.updatedAt, dateFilter);
      const matchesDuration = matchesDurationFilter(
        assignment.subject?.duration,
        durationFilter
      );
=======
      const matchesDate = isInDateFilter(assignment.updatedAt);
>>>>>>> 8fd258754427456a9e996d340332bcb6a728e256

      const matchesType =
        typeFilter === "ALL" ||
        (typeFilter === "BINOME" && isBinome) ||
        (typeFilter === "SOLO" && !isBinome);

<<<<<<< HEAD
      return matchesSearch && matchesDate && matchesType && matchesDuration;
    });
  }, [assignments, search, typeFilter, dateFilter, durationFilter]);
=======
      return matchesSearch && matchesDate && matchesType;
    });
  }, [assignments, search, typeFilter, isInDateFilter]);
>>>>>>> 8fd258754427456a9e996d340332bcb6a728e256

  return (
    <div className="space-y-6">
      <PageHeader
        icon={CheckCircle2}
        title="Assignments"
        subtitle="List of assigned students and teams."
        actions={
          <ExportButton
            endpoint="/exports/affectations"
            filename="assignments-export.csv"
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
          <div className="grid gap-4 lg:grid-cols-5">
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
                  placeholder="Search by student, subject, supervisor..."
                  className="pl-9"
                />
              </div>
            </Field>

            <Field label="Type" htmlFor="typeFilter">
              <Select
                id="typeFilter"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="ALL">All types</option>
                <option value="SOLO">Solo student</option>
                <option value="BINOME">Team</option>
              </Select>
            </Field>

<<<<<<< HEAD
            <Field label="Duration" htmlFor="durationFilter">
              <Select
                id="durationFilter"
                value={durationFilter}
                onChange={(e) => setDurationFilter(e.target.value)}
              >
                {DURATION_FILTERS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
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
        {filteredAssignments.map((assignment) => {
          const isBinome = Boolean(assignment.binome);

          return (
            <Card key={assignment.id}>
              <CardBody>
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <Link
                      to={`/admin/subjects/${assignment.subject?.id}`}
                      className="text-xl font-black text-cyan-700 hover:underline"
                    >
                      {assignment.subject?.title}
                    </Link>

                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600">
                      <span className="inline-flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-slate-400" strokeWidth={2.5} />
                        <span className="font-bold text-slate-900">
                          {assignment.subject?.supervisor?.fullName || "-"}
                        </span>
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" strokeWidth={2.5} />
                        {new Date(assignment.updatedAt).toLocaleDateString()}
                      </span>
<<<<<<< HEAD
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-slate-400" strokeWidth={2.5} />
                        {assignment.subject?.duration || "N/A"}
                      </span>
=======
>>>>>>> 8fd258754427456a9e996d340332bcb6a728e256
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {isBinome ? (
                        <>
                          <button
                            onClick={() => openUser(assignment.binome.student1.id)}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-50 px-3 py-1.5 text-sm font-bold text-cyan-700 transition hover:bg-cyan-100"
                          >
                            <User className="h-3.5 w-3.5" strokeWidth={2.5} />
                            {assignment.binome.student1.fullName}
                          </button>

                          <button
                            onClick={() => openUser(assignment.binome.student2.id)}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-50 px-3 py-1.5 text-sm font-bold text-cyan-700 transition hover:bg-cyan-100"
                          >
                            <User className="h-3.5 w-3.5" strokeWidth={2.5} />
                            {assignment.binome.student2.fullName}
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => openUser(assignment.student.id)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-50 px-3 py-1.5 text-sm font-bold text-cyan-700 transition hover:bg-cyan-100"
                        >
                          <User className="h-3.5 w-3.5" strokeWidth={2.5} />
                          {assignment.student.fullName}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-row gap-2 lg:flex-col lg:items-end">
                    <Badge
                      variant={isBinome ? "info" : "success"}
                      size="sm"
                      icon={isBinome ? Users : User}
                    >
                      {isBinome ? "Team" : "Solo student"}
                    </Badge>
                    <Badge variant="neutral" size="sm" icon={FileText}>
                      {assignment.subject?.documents?.length || 0} document(s)
                    </Badge>
                  </div>
                </div>
              </CardBody>
            </Card>
          );
        })}

        {filteredAssignments.length === 0 && (
          <EmptyState
            icon={CheckCircle2}
            title="No assignment."
            description="Try adjusting your filters or search query."
          />
        )}
      </section>

      {selectedUser && (
        <AdminStudentDetails
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </div>
  );
}

export default AdminAffectations;
