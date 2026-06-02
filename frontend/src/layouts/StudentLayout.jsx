import { useMemo } from "react";
import {
  LayoutDashboard,
  FileText,
  GraduationCap,
  Users,
  BookMarked,
  Sparkles,
  ClipboardList,
  MessageSquare,
  Bell,
  User,
} from "lucide-react";
import SidebarLayout from "../components/layouts/SidebarLayout";

const buildSections = () => [
  {
    label: "Home",
    items: [
      { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "Journey",
    items: [
      { to: "/mon-cv", label: "My Resume", icon: FileText },
      { to: "/binome", label: "Team", icon: Users, alertKey: "binome" },
      { to: "/subjects", label: "Catalog", icon: BookMarked },
      { to: "/recommendations", label: "Recommendations", icon: Sparkles },
      {
        to: "/applications",
        label: "Assignment tracking",
        icon: ClipboardList,
        alertKey: "applications",
      },
      { to: "/academic-report", label: "Final report", icon: GraduationCap },
    ],
  },
  {
    label: "Communication",
    items: [
      {
        to: "/messages",
        label: "Messages",
        icon: MessageSquare,
        alertKey: "messages",
      },
      {
        to: "/notifications",
        label: "Notifications",
        icon: Bell,
        alertKey: "notifications",
      },
    ],
  },
  {
    label: "Account",
    items: [
      { to: "/mon-profile", label: "My profile", icon: User },
    ],
  },
];

export default function StudentLayout() {
  const sections = useMemo(() => buildSections(), []);

  return (
    <SidebarLayout
      title="Student"
      sections={sections}
      logoutRedirect="/login"
    />
  );
}
