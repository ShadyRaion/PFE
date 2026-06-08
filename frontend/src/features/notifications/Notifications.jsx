import { useCallback, useEffect, useMemo, useState } from "react";
import { Bell, Clock, AlertCircle } from "lucide-react";
import api from "../../api/axios";
import { useLanguage } from "../../i18n/LanguageProvider";
import { translateNotification } from "../../utils/notificationTranslations";
import {
  PageHeader,
  Card,
  CardBody,
  EmptyState,
  LoadingState,
} from "../../components/ui";

function Notifications() {
  const { language } = useLanguage();
  const [notifications, setNotifications] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const refreshAlerts = () => {
    window.dispatchEvent(new Event("page-alerts-refresh"));
  };

  const normalizeNotifications = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.notifications)) return payload.notifications;
    if (Array.isArray(payload?.data)) return payload.data;
    return [];
  };

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/notifications");
      setNotifications(normalizeNotifications(res.data));
      refreshAlerts();
    } catch (error) {
      console.error(error);
      setNotifications([]);
      setMessage("Error while loading notifications.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(fetchNotifications);
  }, [fetchNotifications]);

  const visibleNotifications = useMemo(
    () =>
      notifications.map((notification) =>
        translateNotification(notification, language)
      ),
    [notifications, language]
  );

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Bell}
        title="Notifications"
        subtitle="Review the latest updates in your space."
      />

      {message && (
        <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2.5} />
          <span>{message}</span>
        </div>
      )}

      {loading && <LoadingState label="Loading notifications..." />}

      {!loading && visibleNotifications.length === 0 && (
        <EmptyState
          icon={Bell}
          title="No notifications yet"
          description="You will see updates about your applications and team here."
        />
      )}

      {!loading && visibleNotifications.length > 0 && (
        <section className="space-y-3">
          {visibleNotifications.map((notification) => (
            <Card
              key={notification.id}
              className="transition hover:shadow-card-hover"
            >
              <CardBody>
                <div className="flex items-start gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700">
                    <Bell className="h-4 w-4" strokeWidth={2.5} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-base font-black text-slate-950">
                      {notification.title || "Notification"}
                    </h2>
                    <p className="mt-1.5 text-sm leading-6 text-slate-700">
                      {notification.message}
                    </p>
                    <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-slate-500">
                      <Clock className="h-3 w-3" strokeWidth={2.5} />
                      {notification.createdAt
                        ? new Date(notification.createdAt).toLocaleString()
                        : "-"}
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </section>
      )}
    </div>
  );
}

export default Notifications;
