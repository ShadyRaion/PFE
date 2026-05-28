import {
  LayoutDashboard,
  Inbox,
  UserCheck,
  CheckCircle2,
  BookMarked,
  PlusCircle,
  MessageSquare,
  Bell,
  User,
} from "lucide-react";
import SidebarLayout from "../components/layouts/SidebarLayout";

const sections = [
  {
    label: "Home",
    items: [
      {
        to: "/encadrant/dashboard",
        label: "Dashboard",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    label: "Applications",
    items: [
      {
        to: "/encadrant/applications",
        label: "Received requests",
        icon: Inbox,
        alertKey: "applications",
      },
      {
        to: "/encadrant/interns",
        label: "My interns",
        icon: UserCheck,
      },
      {
        to: "/encadrant/completed-assignments",
        label: "Completed assignments",
        icon: CheckCircle2,
      },
    ],
  },
  {
    label: "Subjects",
    items: [
      {
        to: "/encadrant/my-subjects",
        label: "My subjects",
        icon: BookMarked,
      },
      {
        to: "/encadrant/create-subject",
        label: "Create subject",
        icon: PlusCircle,
      },
    ],
  },
  {
    label: "Communication",
    items: [
      {
        to: "/encadrant/messages",
        label: "Messages",
        icon: MessageSquare,
        alertKey: "messages",
      },
      {
        to: "/encadrant/notifications",
        label: "Notifications",
        icon: Bell,
        alertKey: "notifications",
      },
    ],
  },
  {
    label: "Account",
    items: [
      { to: "/encadrant/mon-profile", label: "My profile", icon: User },
    ],
  },
];

export default function SupervisorLayout() {
  return (
    <SidebarLayout
      title="Supervisor"
      sections={sections}
      logoutRedirect="/encadrant"
    />
  );
}
