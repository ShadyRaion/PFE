import { useCallback, useEffect, useState } from "react";
import api from "../api/axios";

function usePageAlerts() {
  const [alerts, setAlerts] = useState({});

  const fetchAlerts = useCallback(async () => {
    try {
      const res = await api.get("/page-alerts");
      setAlerts(res.data || {});
    } catch {
      setAlerts({});
    }
  }, []);

  useEffect(() => {
    queueMicrotask(fetchAlerts);

    const interval = setInterval(fetchAlerts, 2000);

    const refresh = () => fetchAlerts();

    window.addEventListener("page-alerts-refresh", refresh);
    window.addEventListener("focus", refresh);

    return () => {
      clearInterval(interval);
      window.removeEventListener("page-alerts-refresh", refresh);
      window.removeEventListener("focus", refresh);
    };
  }, [fetchAlerts]);

  return {
    alerts,
    refreshAlerts: fetchAlerts,
  };
}

export default usePageAlerts;
