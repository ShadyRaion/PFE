import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Users,
  BookMarked,
  Sparkles,
  Target,
  MessageSquare,
  Bell,
  ArrowUpRight,
} from "lucide-react";
import api from "../../api/axios";
import { PageHeader, Card, CardBody, Badge } from "../../components/ui";

function StudentDashboard() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [applications, setApplications] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [cv, setCv] = useState(null);
  const [binome, setBinome] = useState(null);
  const [conversations, setConversations] = useState([]);

  const normalizeArray = (payload, key) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.[key])) return payload[key];
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.applications)) return payload.applications;
    if (Array.isArray(payload?.notifications)) return payload.notifications;
    if (Array.isArray(payload?.conversations)) return payload.conversations;
    return [];
  };

  const fetchDashboardData = useCallback(async () => {
    const res = await api.get("/applications/dashboard-summary");
    const data = res.data || {};

    setApplications(normalizeArray(data.applications, "applications"));
    setNotifications(normalizeArray(data.notifications, "notifications"));
    setCv(data.cv || null);
    setBinome(data.binome || null);
    setConversations(normalizeArray(data.conversations, "conversations"));
  }, []);

  useEffect(() => {
    queueMicrotask(fetchDashboardData);
  }, [fetchDashboardData]);

  const affectedApplication = applications.find(
    (app) => app.status === "AFFECTED"
  );

  const cards = [
    {
      title: "Resume",
      icon: FileText,
      status: cv ? "Complete" : "Not uploaded",
      variant: cv ? "success" : "warning",
      text: cv ? cv.originalName : "Upload your Resume to get started",
      to: "/mon-cv",
    },
    {
      title: "Team",
      icon: Users,
      status: binome ? "Team" : "Solo",
      variant: binome ? "info" : "neutral",
      text: binome
        ? "You are working with a partner"
        : "You are solo for now",
      to: "/binome",
    },
    {
      title: "Catalog",
      icon: BookMarked,
      status: "Available",
      variant: "info",
      text: "Explore subjects",
      to: "/subjects",
    },
    {
      title: "Recommendations",
      icon: Sparkles,
      status: cv ? "Available" : "Resume required",
      variant: cv ? "success" : "warning",
      text: cv ? "View compatible subjects" : "Upload a Resume to activate",
      to: "/recommendations",
    },
    {
      title: "My Subject",
      icon: Target,
      status: affectedApplication ? "Assigned" : "Not assigned",
      variant: affectedApplication ? "success" : "neutral",
      text: affectedApplication?.subject?.title || "No assignment yet",
      to: "/applications",
    },
    {
      title: "Messages",
      icon: MessageSquare,
      status: `${conversations.length}`,
      variant: conversations.length > 0 ? "info" : "neutral",
      text: `Conversation${conversations.length !== 1 ? "s" : ""}`,
      to: "/messages",
    },
    {
      title: "Notifications",
      icon: Bell,
      status: `${notifications.length}`,
      variant: notifications.length > 0 ? "info" : "neutral",
      text: "Recent activity",
      to: "/notifications",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        icon={LayoutDashboard}
        title="Dashboard"
        subtitle={`Welcome, ${user?.fullName || ""}. Here is an overview of your space.`}
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.title} to={card.to} className="group">
              <Card className="h-full transition group-hover:-translate-y-0.5 group-hover:shadow-card-hover">
                <CardBody>
                  <div className="flex items-start justify-between gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700">
                      <Icon className="h-5 w-5" strokeWidth={2.5} />
                    </span>
                    <ArrowUpRight
                      className="h-4 w-4 text-slate-400 transition group-hover:text-cyan-700"
                      strokeWidth={2.5}
                    />
                  </div>

                  <p className="mt-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    {card.title}
                  </p>

                  <div className="mt-2 flex items-center gap-2">
                    <h2 className="truncate text-2xl font-black text-slate-950">
                      {card.status}
                    </h2>
                  </div>

                  <p className="mt-2 truncate text-sm text-slate-600">
                    {card.text}
                  </p>

                  <div className="mt-3">
                    <Badge variant={card.variant} size="sm">
                      Open
                    </Badge>
                  </div>
                </CardBody>
              </Card>
            </Link>
          );
        })}
      </section>
    </div>
  );
}

export default StudentDashboard;
