import {
  LayoutDashboard,
  GraduationCap,
  Briefcase,
  UserCheck,
  BookMarked,
  ClipboardCheck,
  Flag,
  ShieldAlert,
  FileSearch,
  Bell,
  Settings,
} from "lucide-react";
import SidebarLayout from "../components/layouts/SidebarLayout";

const sections = [
  {
    label: "Home",
    items: [
      {
        to: "/admin/dashboard",
        label: "Dashboard",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    label: "Users",
    items: [
      { to: "/admin/students", label: "Students", icon: GraduationCap },
      { to: "/admin/supervisors", label: "Supervisors", icon: Briefcase },
      {
        to: "/admin/supervisor-approvals",
        label: "Supervisor requests",
        icon: UserCheck,
        alertKey: "supervisors",
      },
    ],
  },
  {
    label: "Internships",
    items: [
      { to: "/admin/subjects", label: "Subjects", icon: BookMarked },
      {
        to: "/admin/affectations",
        label: "Assignments",
        icon: ClipboardCheck,
      },
      {
        to: "/admin/completed-assignments",
        label: "Completed assignments",
        icon: GraduationCap,
      },
    ],
  },
  {
    label: "Security",
    items: [
      {
        to: "/admin/reports",
        label: "Reports",
        icon: Flag,
        alertKey: "reports",
      },
      { to: "/admin/blacklist", label: "Blacklist", icon: ShieldAlert },
      { to: "/admin/audit-logs", label: "Audit logs", icon: FileSearch },
      {
        to: "/admin/notifications",
        label: "Notifications",
        icon: Bell,
        alertKey: "notifications",
      },
    ],
  },
  {
    label: "Account",
    items: [{ to: "/admin/settings", label: "Settings", icon: Settings }],
  },
];

export default function AdminLayout() {
  return (
    <SidebarLayout
      title="Admin"
      sections={sections}
      logoutRedirect="/admin"
    />
  );
}
