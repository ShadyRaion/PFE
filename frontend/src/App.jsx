import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { ArrowRight, GraduationCap, Briefcase, FileText, BookMarked, ClipboardList } from "lucide-react";
import CatalogueSubjects from "./features/subjects/CatalogueSubjects";
import Login from "./features/auth/Login";
import Register from "./features/auth/Register";
import PasswordResetRequest from "./features/auth/PasswordResetRequest";
import PasswordResetConfirm from "./features/auth/PasswordResetConfirm";
import MonCV from "./features/cv/MonCV";
import AcademicReport from "./features/academic-report/AcademicReport";
import SubjectDetails from "./features/subjects/SubjectDetails";
import MonProfile from "./features/profile/MonProfile";
import Recommendations from "./features/recommendations/Recommendations";
import AdminDashboard from "./features/admin/AdminDashboard";
import SupervisorDashboard from "./features/supervisors/SupervisorDashboard";
import AdminLogin from "./features/admin/AdminLogin";
import SupervisorLogin from "./features/supervisors/SupervisorLogin";
import ProtectedRoute from "./components/ProtectedRoute";
import Notifications from "./features/notifications/Notifications";
import Messages from "./features/messages/Messages";
import Binome from "./features/binome/Binome";
import StudentLayout from "./layouts/StudentLayout";
import SupervisorLayout from "./layouts/SupervisorLayout";
import AdminLayout from "./layouts/AdminLayout";
import MyApplications from "./features/applications/MyApplications";
import SupervisorApplications from "./features/supervisors/SupervisorApplications";
import SupervisorApprovals from "./features/admin/SupervisorApprovals";
import BlacklistManagement from "./features/admin/BlacklistManagement";
import AuditLogs from "./features/admin/AuditLogs";
import CreateSubject from "./features/supervisors/CreateSubject";
import MySubjects from "./features/supervisors/MySubjects";
import SupervisorRegister from "./features/supervisors/SupervisorRegister";
import StudentDashboard from "./features/student/StudentDashboard";
import SupervisorLanding from "./features/supervisors/SupervisorLanding";
import Settings from "./features/settings/Settings";
import AdminStudents from "./features/admin/AdminStudents";
import AdminSupervisors from "./features/admin/AdminSupervisors";
import AdminSubjects from "./features/admin/AdminSubjects";
import AdminAffectations from "./features/admin/AdminAffectations";
import AdminSubjectDetails from "./features/admin/AdminSubjectDetails";
import AdminUserDetails from "./features/admin/AdminUserDetails";
import SupervisorInterns from "./features/supervisors/SupervisorInterns";
import AdminReports from "./features/admin/AdminReports";
import AdminAcademicReports from "./features/admin/AdminAcademicReports";
import CompletedAssignments from "./features/completed-assignments/CompletedAssignments";
import BrandLogo from "./components/BrandLogo";
import HeaderControls from "./components/HeaderControls";

function PlatformHome() {
  const spaces = [
    {
      icon: GraduationCap,
      title: "Intern Space",
      text: "Access the student portal to manage your Resume, browse final-year project subjects, and track your applications and messages.",
      to: "/intern",
      action: "Continue as intern",
    },
    {
      icon: Briefcase,
      title: "Supervisor Space",
      text: "Access the supervisor portal to publish subjects, manage applications, and follow assigned interns.",
      to: "/encadrant",
      action: "Continue as supervisor",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f1f8fc]">
      <header className="flex items-center justify-between border-b border-[#cfe1e8] bg-white px-6 py-5 sm:px-10">
        <BrandLogo size="md" />
        <HeaderControls />
      </header>

      <main className="mx-auto flex min-h-[calc(100vh-82px)] max-w-6xl flex-col justify-center px-6 py-14 sm:px-10">
        <section className="max-w-3xl">
          <p className="text-xs font-black uppercase tracking-widest text-cyan-700">
            Interns Platform
          </p>

          <h1 className="mt-4 text-4xl font-black leading-tight text-slate-950 sm:text-6xl">
            Choose your space.
          </h1>

          <p className="mt-5 text-lg leading-8 text-slate-600 sm:text-xl">
            A platform connecting interns and supervisors through
            subjects, applications, assignments, and conversations.
          </p>
        </section>

        <section className="mt-10 grid gap-6 md:grid-cols-2">
          {spaces.map((space) => {
            const Icon = space.icon;
            return (
              <Link
                key={space.title}
                to={space.to}
                className="group rounded-2xl border border-[#cfe1e8] bg-white p-7 shadow-card transition hover:-translate-y-1 hover:border-cyan-200 hover:shadow-card-hover"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700">
                  <Icon className="h-6 w-6" strokeWidth={2.25} />
                </span>

                <p className="mt-5 text-xs font-black uppercase tracking-widest text-cyan-700">
                  {space.title}
                </p>

                <h2 className="mt-3 text-3xl font-black text-slate-950">
                  {space.action}
                </h2>

                <p className="mt-3 min-h-20 text-base leading-7 text-slate-600">
                  {space.text}
                </p>

                <span className="mt-5 inline-flex items-center gap-2 rounded-lg bg-cyan-700 px-5 py-2.5 text-sm font-bold text-white transition group-hover:bg-cyan-800">
                  Open space
                  <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
                </span>
              </Link>
            );
          })}
        </section>
      </main>
    </div>
  );
}

function StudentLanding() {
  const features = [
    {
      icon: FileText,
      title: "Smart Resume",
      text: "Upload your Resume and activate recommendations.",
    },
    {
      icon: BookMarked,
      title: "Subject catalog",
      text: "Browse available subjects and apply.",
    },
    {
      icon: ClipboardList,
      title: "Complete tracking",
      text: "Track your applications, messages, and notifications.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f1f8fc]">
      <header className="flex items-center justify-between border-b border-[#cfe1e8] bg-white px-6 py-5 sm:px-10">
        <BrandLogo size="md" />
        <HeaderControls />
      </header>

      <main className="mx-auto grid min-h-[calc(100vh-82px)] max-w-7xl items-center gap-12 px-6 py-16 sm:px-10 lg:grid-cols-2">
        <section>
          <p className="text-xs font-black uppercase tracking-widest text-cyan-700">
            Interns Platform
          </p>

          <h1 className="mt-4 text-5xl font-black leading-tight text-slate-950 sm:text-6xl">
            Start your intenship journey with STB.
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
            A platform dedicated to interns for managing CVs,
            recommendations, subjects, applications, team setup, and
            communication.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded-lg bg-cyan-700 px-6 py-3 text-sm font-bold text-white transition hover:bg-cyan-800"
            >
              Get started
              <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
            </Link>

            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-lg border border-[#cfe1e8] bg-white px-6 py-3 text-sm font-bold text-[#062633] transition hover:bg-cyan-50 hover:text-cyan-700"
            >
              Log in
            </Link>
          </div>
        </section>

        <section className="rounded-2xl border border-[#cfe1e8] bg-white p-8 shadow-card">
          <p className="text-xs font-black uppercase tracking-widest text-cyan-700">
            Intern Space
          </p>

          <h2 className="mt-2 text-3xl font-black text-slate-950">
            Your full intenship journey in one place.
          </h2>

          <div className="mt-6 space-y-3">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="flex items-start gap-4 rounded-xl border border-[#cfe1e8] bg-[#f1f8fc] p-4"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-cyan-700">
                    <Icon className="h-5 w-5" strokeWidth={2.5} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-black text-slate-950">{feature.title}</p>
                    <p className="mt-0.5 text-sm leading-6 text-slate-600">
                      {feature.text}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PlatformHome />} />
        <Route path="/intern" element={<StudentLanding />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<PasswordResetRequest />} />
        <Route path="/reset-password" element={<PasswordResetConfirm />} />

        <Route path="/encadrant" element={<SupervisorLanding />} />
        <Route path="/encadrant/login" element={<SupervisorLogin />} />
        <Route path="/encadrant/register" element={<SupervisorRegister />} />

        <Route path="/admin" element={<AdminLogin />} />

        <Route
          element={
            <ProtectedRoute allowedRoles={["STUDENT"]} redirectTo="/login">
              <StudentLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<StudentDashboard />} />
          <Route path="/mon-cv" element={<MonCV />} />
          <Route path="/academic-report" element={<AcademicReport />} />
          <Route path="/subjects" element={<CatalogueSubjects />} />
          <Route path="/subjects/:id" element={<SubjectDetails />} />
          <Route path="/applications" element={<MyApplications />} />
          <Route path="/recommendations" element={<Recommendations />} />
          <Route path="/binome" element={<Binome />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/mon-profile" element={<MonProfile />} />
        </Route>

        <Route
          element={
            <ProtectedRoute
              allowedRoles={["COMPANY_SUPERVISOR"]}
              redirectTo="/encadrant"
            >
              <SupervisorLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/encadrant/dashboard" element={<SupervisorDashboard />} />

          <Route
            path="/encadrant/applications"
            element={<SupervisorApplications />}
          />

          <Route path="/encadrant/interns" element={<SupervisorInterns />} />
          <Route
            path="/encadrant/completed-assignments"
            element={
              <CompletedAssignments
                endpoint="/supervisor/completed-assignments"
                subjectBasePath=""
              />
            }
          />
          <Route path="/encadrant/create-subject" element={<CreateSubject />} />
          <Route path="/encadrant/my-subjects" element={<MySubjects />} />
          <Route path="/encadrant/messages" element={<Messages />} />
          <Route path="/encadrant/notifications" element={<Notifications />} />
          <Route path="/encadrant/mon-profile" element={<MonProfile />} />
        </Route>

        <Route
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]} redirectTo="/admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/admin/dashboard" element={<AdminDashboard />} />

          <Route path="/admin/users/:id" element={<AdminUserDetails />} />

          <Route path="/admin/students" element={<AdminStudents />} />

          <Route path="/admin/supervisors" element={<AdminSupervisors />} />

          <Route
            path="/admin/supervisor-approvals"
            element={<SupervisorApprovals />}
          />

          <Route path="/admin/subjects" element={<AdminSubjects />} />
          <Route path="/admin/subjects/:id" element={<AdminSubjectDetails />} />

          <Route path="/admin/affectations" element={<AdminAffectations />} />
          <Route path="/admin/reports" element={<AdminReports />} />
          <Route
            path="/admin/academic-reports"
            element={<AdminAcademicReports />}
          />
          <Route
            path="/admin/completed-assignments"
            element={
              <CompletedAssignments
                endpoint="/admin/completed-assignments"
                subjectBasePath="/admin/subjects"
                userBasePath="/admin/users"
                supervisorBasePath="/admin/users"
              />
            }
          />

          <Route path="/admin/blacklist" element={<BlacklistManagement />} />
          <Route path="/admin/audit-logs" element={<AuditLogs />} />
          <Route path="/admin/notifications" element={<Notifications />} />
          <Route path="/admin/settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
