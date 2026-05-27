import { useCallback, useEffect, useMemo, useState } from "react";
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
import api from "../api/axios";

const buildSections = (showFinalReport) => [
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
      ...(showFinalReport
        ? [{ to: "/academic-report", label: "Final report", icon: GraduationCap }]
        : []),
      { to: "/binome", label: "Team", icon: Users, alertKey: "binome" },
      { to: "/subjects", label: "Catalog", icon: BookMarked },
      { to: "/recommendations", label: "Recommendations", icon: Sparkles },
      {
        to: "/applications",
        label: "Assignment tracking",
        icon: ClipboardList,
        alertKey: "applications",
      },
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
  const [showFinalReport, setShowFinalReport] = useState(false);

  const checkCompletedAssignment = useCallback(async () => {
    try {
      const res = await api.get("/applications/me");
      const applications = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setShowFinalReport(
        applications.some((application) => application.status === "COMPLETED")
      );
    } catch {
      setShowFinalReport(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(checkCompletedAssignment);
    window.addEventListener("assignments-refresh", checkCompletedAssignment);
    return () =>
      window.removeEventListener("assignments-refresh", checkCompletedAssignment);
  }, [checkCompletedAssignment]);

  const sections = useMemo(
    () => buildSections(showFinalReport),
    [showFinalReport]
  );

  return (
    <SidebarLayout
      title="Student"
      sections={sections}
      logoutRedirect="/login"
    />
  );
}
