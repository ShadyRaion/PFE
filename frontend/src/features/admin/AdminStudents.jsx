import { useCallback, useEffect, useMemo, useState } from "react";
import { Users, Search, AlertCircle, GraduationCap, Mail, Calendar } from "lucide-react";
import api from "../../api/axios";
import AdminStudentDetails from "./AdminStudentDetails";
import ExportButton from "../../components/ExportButton";
<<<<<<< HEAD
import DateRangeFilter from "../../components/filters/DateRangeFilter";
import { DEGREE_LEVELS, INTERNSHIP_TYPES } from "../../constants/profileFields";
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
  EmptyState,
} from "../../components/ui";

function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [search, setSearch] = useState("");
<<<<<<< HEAD
  const [dateFilter, setDateFilter] = useState(createDateRange("ALL"));
  const [degreeFilter, setDegreeFilter] = useState("ALL");
  const [internshipFilter, setInternshipFilter] = useState("ALL");
=======
  const [dateFilter, setDateFilter] = useState("ALL");
  const [profileFilter, setProfileFilter] = useState("ALL");
>>>>>>> 8fd258754427456a9e996d340332bcb6a728e256
  const [message, setMessage] = useState("");

  const fetchStudents = useCallback(async () => {
    try {
      const res = await api.get("/admin/users?role=STUDENT");
      setStudents(res.data || []);
    } catch {
      setMessage("Error while loading.");
    }
  }, []);

  useEffect(() => {
    queueMicrotask(fetchStudents);
  }, [fetchStudents]);

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
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const text = [
        student.fullName,
        student.email,
        student.university,
        student.specialty,
        student.phone,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = text.includes(search.toLowerCase());
<<<<<<< HEAD
      const matchesDate = matchesDateRange(student.createdAt, dateFilter);
      const matchesDegree =
        degreeFilter === "ALL" || student.degreeLevel === degreeFilter;
      const matchesInternship =
        internshipFilter === "ALL" ||
        student.internshipType === internshipFilter;

      return matchesSearch && matchesDate && matchesDegree && matchesInternship;
    });
  }, [students, search, dateFilter, degreeFilter, internshipFilter]);
=======
      const matchesDate = isInDateFilter(student.createdAt);

      const completedProfile =
        Boolean(student.university) && Boolean(student.specialty);

      const matchesProfile =
        profileFilter === "ALL" ||
        (profileFilter === "COMPLETE" && completedProfile) ||
        (profileFilter === "INCOMPLETE" && !completedProfile);

      return matchesSearch && matchesDate && matchesProfile;
    });
  }, [students, search, isInDateFilter, profileFilter]);
>>>>>>> 8fd258754427456a9e996d340332bcb6a728e256

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Users}
        title="Students"
        subtitle="List of students with search and filters."
        actions={
          <ExportButton endpoint="/exports/students" filename="students-export.csv" />
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
                  placeholder="Search by name, email, university..."
                  className="pl-9"
                />
              </div>
            </Field>

<<<<<<< HEAD
            <Field label="Degree" htmlFor="degreeFilter">
              <Select
                id="degreeFilter"
                value={degreeFilter}
                onChange={(e) => setDegreeFilter(e.target.value)}
              >
                <option value="ALL">All degrees</option>
                {DEGREE_LEVELS.map((value) => (
                  <option key={value} value={value}>{value}</option>
                ))}
              </Select>
            </Field>

            <Field label="Internship type" htmlFor="internshipFilter">
              <Select
                id="internshipFilter"
                value={internshipFilter}
                onChange={(e) => setInternshipFilter(e.target.value)}
              >
                <option value="ALL">All types</option>
                {INTERNSHIP_TYPES.map((value) => (
                  <option key={value} value={value}>{value}</option>
                ))}
              </Select>
            </Field>

            <DateRangeFilter value={dateFilter} onChange={setDateFilter} />
=======
            <Field label="Profile" htmlFor="profileFilter">
              <Select
                id="profileFilter"
                value={profileFilter}
                onChange={(e) => setProfileFilter(e.target.value)}
              >
                <option value="ALL">All profiles</option>
                <option value="COMPLETE">Complete profile</option>
                <option value="INCOMPLETE">Incomplete profile</option>
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
                <th className="px-5 py-3.5">University</th>
                <th className="px-5 py-3.5">Degree</th>
                <th className="px-5 py-3.5">Internship</th>
                <th className="px-5 py-3.5">Date</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#e2edf2]">
              {filteredStudents.map((student) => (
<<<<<<< HEAD
                <tr key={student.id} className="admin-hover-row transition hover:bg-cyan-50/50">
=======
                <tr key={student.id} className="transition hover:bg-cyan-50/50">
>>>>>>> 8fd258754427456a9e996d340332bcb6a728e256
                  <td className="px-5 py-3.5">
                    <button
                      onClick={() => openUser(student.id)}
                      className="font-bold text-cyan-700 hover:underline"
                    >
                      {student.fullName}
                    </button>
                  </td>

                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center gap-1.5 text-sm text-slate-600">
                      <Mail className="h-3.5 w-3.5 text-slate-400" strokeWidth={2.5} />
                      {student.email}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center gap-1.5 text-sm text-slate-600">
                      {student.university ? (
                        <>
                          <GraduationCap className="h-3.5 w-3.5 text-slate-400" strokeWidth={2.5} />
                          {student.university}
                        </>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-sm text-slate-600">
                      {student.degreeLevel || (
                        <span className="text-slate-400">-</span>
                      )}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-sm text-slate-600">
                      {student.internshipType || (
                        <span className="text-slate-400">-</span>
                      )}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center gap-1.5 text-sm text-slate-600">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" strokeWidth={2.5} />
                      {new Date(student.createdAt).toLocaleDateString()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredStudents.length === 0 && (
          <EmptyState
            icon={Users}
            title="No student found."
            description="Try adjusting your filters or search query."
          />
        )}
      </Card>

      {selectedUser && (
        <AdminStudentDetails
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </div>
  );
}

export default AdminStudents;
