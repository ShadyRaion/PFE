import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  GraduationCap,
<<<<<<< HEAD
=======
  Search,
>>>>>>> 8fd258754427456a9e996d340332bcb6a728e256
  AlertCircle,
  Mail,
  Calendar,
  FileText,
  Eye,
} from "lucide-react";
import api from "../../api/axios";
import {
  PageHeader,
  Card,
  CardBody,
<<<<<<< HEAD
=======
  Field,
  Input,
  Select,
>>>>>>> 8fd258754427456a9e996d340332bcb6a728e256
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

const formatSize = (bytes) => {
  if (bytes === null || bytes === undefined) return "-";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

function AdminAcademicReports() {
  const [reports, setReports] = useState([]);
<<<<<<< HEAD
  const [dateFilter, setDateFilter] = useState(createDateRange("ALL"));
=======
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("ALL");
  const [fieldFilter, setFieldFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
>>>>>>> 8fd258754427456a9e996d340332bcb6a728e256
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/academic-reports");
      setReports(res.data?.reports || []);
      setMessage("");
    } catch {
      setMessage("Error while loading academic reports.");
      setReports([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(fetchReports);
  }, [fetchReports]);

<<<<<<< HEAD
  const filteredReports = useMemo(() => {
    return reports.filter((report) =>
      matchesDateRange(report.submittedAt, dateFilter)
    );
  }, [reports, dateFilter]);
=======
  const isInDateFilter = useCallback(
    (date) => {
      if (!date || dateFilter === "ALL") return true;
      const submittedAt = new Date(date);
      const now = new Date();
      if (dateFilter === "TODAY") {
        return submittedAt.toDateString() === now.toDateString();
      }
      if (dateFilter === "7_DAYS") {
        return now - submittedAt <= 7 * 24 * 60 * 60 * 1000;
      }
      if (dateFilter === "30_DAYS") {
        return now - submittedAt <= 30 * 24 * 60 * 60 * 1000;
      }
      return true;
    },
    [dateFilter]
  );

  const educationFields = useMemo(() => {
    const set = new Set();
    reports.forEach((report) => {
      if (report.user?.educationField) set.add(report.user.educationField);
    });
    return Array.from(set).sort();
  }, [reports]);

  const internshipTypes = useMemo(() => {
    const set = new Set();
    reports.forEach((report) => {
      if (report.user?.internshipType) set.add(report.user.internshipType);
    });
    return Array.from(set).sort();
  }, [reports]);

  const filteredReports = useMemo(() => {
    const text = search.toLowerCase();
    return reports.filter((report) => {
      const haystack = [
        report.originalName,
        report.fileName,
        report.user?.fullName,
        report.user?.email,
        report.user?.university,
        report.user?.specialty,
        report.user?.educationField,
        report.user?.internshipType,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = haystack.includes(text);
      const matchesDate = isInDateFilter(report.submittedAt);
      const matchesField =
        fieldFilter === "ALL" || report.user?.educationField === fieldFilter;
      const matchesType =
        typeFilter === "ALL" || report.user?.internshipType === typeFilter;

      return matchesSearch && matchesDate && matchesField && matchesType;
    });
  }, [reports, search, isInDateFilter, fieldFilter, typeFilter]);
>>>>>>> 8fd258754427456a9e996d340332bcb6a728e256

  const openReport = async (reportId) => {
    try {
      const res = await api.get(`/academic-report/file/${reportId}`, {
        responseType: "blob",
      });
      const contentType =
        res.headers["content-type"] || "application/octet-stream";
      const blob = new Blob([res.data], { type: contentType });
      const fileURL = window.URL.createObjectURL(blob);
      window.open(fileURL, "_blank");
    } catch {
      setMessage("Unable to open the academic report.");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          icon={GraduationCap}
          title="Academic reports"
          subtitle="Browse academic reports uploaded by students."
        />
        <LoadingState label="Loading academic reports..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={GraduationCap}
        title="Academic reports"
        subtitle="Browse academic reports uploaded by students."
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
          <div className="max-w-md">
            <DateRangeFilter value={dateFilter} onChange={setDateFilter} />
=======
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
                  placeholder="Search student, email, file..."
                  className="pl-9"
                />
              </div>
            </Field>

            <Field label="Education field" htmlFor="fieldFilter">
              <Select
                id="fieldFilter"
                value={fieldFilter}
                onChange={(e) => setFieldFilter(e.target.value)}
              >
                <option value="ALL">All fields</option>
                {educationFields.map((field) => (
                  <option key={field} value={field}>
                    {field}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Internship type" htmlFor="typeFilter">
              <Select
                id="typeFilter"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="ALL">All types</option>
                {internshipTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
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

      <section className="space-y-4">
        {filteredReports.map((report) => (
          <Card key={report.id}>
            <CardBody>
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    {report.user?.id ? (
                      <Link
                        to={`/admin/users/${report.user.id}`}
                        className="text-xl font-black text-cyan-700 hover:underline"
                      >
                        {report.user.fullName || "Student"}
                      </Link>
                    ) : (
                      <h2 className="text-xl font-black text-slate-950">
                        {report.user?.fullName || "Student"}
                      </h2>
                    )}
                    <Badge variant="success" size="sm">
                      {report.status || "SUBMITTED"}
                    </Badge>
                  </div>

                  <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-slate-600">
                    <Mail
                      className="h-3.5 w-3.5 text-slate-400"
                      strokeWidth={2.5}
                    />
                    {report.user?.email || "-"}
                  </p>

                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <div className="rounded-xl border border-[#e2edf2] bg-slate-50 p-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        University
                      </p>
                      <p className="mt-1.5 font-bold text-slate-950">
                        {report.user?.university || "-"}
                      </p>
                    </div>
                    <div className="rounded-xl border border-[#e2edf2] bg-slate-50 p-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Specialty
                      </p>
                      <p className="mt-1.5 font-bold text-slate-950">
                        {report.user?.specialty || "-"}
                      </p>
                    </div>
                    {report.user?.educationField && (
                      <div className="rounded-xl border border-[#e2edf2] bg-slate-50 p-4">
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                          Education field
                        </p>
                        <p className="mt-1.5 font-bold text-slate-950">
                          {report.user.educationField}
                        </p>
                      </div>
                    )}
                    {report.user?.internshipType && (
                      <div className="rounded-xl border border-[#e2edf2] bg-slate-50 p-4">
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                          Internship type
                        </p>
                        <p className="mt-1.5 font-bold text-slate-950">
                          {report.user.internshipType}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 inline-flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700">
                    <FileText
                      className="h-3.5 w-3.5 text-slate-400"
                      strokeWidth={2.5}
                    />
                    {report.originalName || report.fileName || "report"}
                    {" — "}
                    {formatSize(report.fileSize)}
                  </div>

                  <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                    <Calendar className="h-3.5 w-3.5" strokeWidth={2.5} />
                    Submitted on{" "}
                    {report.submittedAt
                      ? new Date(report.submittedAt).toLocaleString()
                      : "-"}
                  </p>
                </div>

                <Button
                  variant="secondary"
                  iconLeft={Eye}
                  onClick={() => openReport(report.id)}
                >
                  Open
                </Button>
              </div>
            </CardBody>
          </Card>
        ))}

        {filteredReports.length === 0 && (
          <EmptyState
            icon={GraduationCap}
            title="No academic report"
            description="No academic reports have been submitted yet."
          />
        )}
      </section>
    </div>
  );
}

export default AdminAcademicReports;
