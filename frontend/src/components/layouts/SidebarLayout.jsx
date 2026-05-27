import { useCallback, useEffect, useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { ArrowLeft, Menu, X, LogOut } from "lucide-react";
import api from "../../api/axios";
import BrandLogo from "../BrandLogo";
import HeaderControls from "../HeaderControls";
import useSessionUser from "../../hooks/useSessionUser";

const Dot = ({ show }) =>
  show ? (
    <span className="ml-2 h-2 w-2 shrink-0 rounded-full bg-amber-400 ring-2 ring-amber-100" />
  ) : null;

function SidebarLayout({ title, sections = [], logoutRedirect = "/login" }) {
  const navigate = useNavigate();
  const user = useSessionUser();

  const [alerts, setAlerts] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window === "undefined") return true;
    if (window.innerWidth < 1024) return false;
    const saved = localStorage.getItem("sidebarOpen");
    return saved === null ? true : saved === "true";
  });

  useEffect(() => {
    localStorage.setItem("sidebarOpen", String(sidebarOpen));
  }, [sidebarOpen]);

  const fetchAlerts = useCallback(async () => {
    try {
      const res = await api.get("/page-alerts");
      const data = Array.isArray(res.data)
        ? res.data
        : res.data?.alerts || res.data?.data || [];
      setAlerts(data);
    } catch {
      setAlerts([]);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(fetchAlerts);
    const interval = setInterval(fetchAlerts, 3000);
    const refresh = () => fetchAlerts();
    window.addEventListener("page-alerts-refresh", refresh);
    return () => {
      clearInterval(interval);
      window.removeEventListener("page-alerts-refresh", refresh);
    };
  }, [fetchAlerts]);

  const hasAlert = (pageKey) =>
    !!pageKey &&
    alerts.some(
      (alert) =>
        alert.pageKey === pageKey &&
        alert.isResolved !== true &&
        alert.resolved !== true
    );

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate(logoutRedirect);
  };

  const dashboardPath =
    user?.role === "ADMIN"
      ? "/admin/dashboard"
      : user?.role === "COMPANY_SUPERVISOR"
      ? "/encadrant/dashboard"
      : "/dashboard";

  const goBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(dashboardPath);
    }
  };

  const linkClass = ({ isActive }) =>
    `group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-bold transition ${
      isActive
        ? "bg-cyan-700 text-white shadow-sm"
        : "text-slate-700 hover:bg-cyan-50 hover:text-cyan-700"
    }`;

  return (
    <div className="min-h-screen bg-[#f1f8fc]">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-slate-900/30 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-30 flex w-72 flex-col border-r border-[#cfe1e8] bg-white transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-72"
        }`}
      >
        <div className="flex items-center justify-between border-b border-[#cfe1e8] px-6 py-5">
          <div className="min-w-0">
            <Link
              to={dashboardPath}
              className="inline-block transition hover:opacity-80"
              aria-label="Go to dashboard"
            >
              <BrandLogo size="md" />
            </Link>
            {title && (
              <p className="mt-2 text-xs font-black uppercase tracking-wider text-cyan-700">
                {title}
              </p>
            )}
            {user && (
              <p className="mt-1 truncate text-base font-bold capitalize text-slate-900">
                {user.fullName || user.email}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" strokeWidth={2.5} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {sections.map((section) => (
            <div key={section.label} className="mb-2">
              <p className="px-3 pb-1.5 pt-3 text-[0.65rem] font-black uppercase tracking-widest text-slate-400">
                {section.label}
              </p>
              <div className="flex flex-col gap-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink key={item.to} to={item.to} className={linkClass} end={item.end}>
                      {Icon && (
                        <Icon className="h-4 w-4 shrink-0" strokeWidth={2.25} />
                      )}
                      <span className="flex-1 truncate">{item.label}</span>
                      <Dot show={hasAlert(item.alertKey)} />
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-[#cfe1e8] p-3">
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-sm font-bold text-rose-600 transition hover:bg-rose-50"
          >
            <LogOut className="h-4 w-4" strokeWidth={2.5} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <div
        className={`min-h-screen transition-all duration-300 ease-in-out ${
          sidebarOpen ? "lg:ml-72" : "ml-0"
        }`}
      >
        <header
          className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-[#cfe1e8] bg-white/85 px-6 backdrop-blur"
        >
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSidebarOpen((prev) => !prev)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#cfe1e8] bg-white text-slate-600 shadow-sm transition hover:bg-cyan-50 hover:text-cyan-700"
              title={sidebarOpen ? "Close menu" : "Open menu"}
              aria-label={sidebarOpen ? "Close menu" : "Open menu"}
            >
              <Menu className="h-5 w-5" strokeWidth={2.5} />
            </button>
            <button
              onClick={goBack}
              className="flex h-9 items-center gap-1.5 rounded-lg border border-[#cfe1e8] bg-white px-3 text-sm font-bold text-slate-600 shadow-sm transition hover:bg-cyan-50 hover:text-cyan-700"
              title="Go back"
              aria-label="Go back"
            >
              <ArrowLeft className="h-4 w-4" strokeWidth={2.5} />
              <span className="hidden sm:inline">Back</span>
            </button>
          </div>
          <HeaderControls />
        </header>

        <main className="min-h-[calc(100vh-3.5rem)] p-6 sm:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default SidebarLayout;
