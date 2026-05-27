import { Navigate, useLocation } from "react-router-dom";

function decodeToken(token) {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
}

function ProtectedRoute({ children, allowedRoles, redirectTo }) {
  const location = useLocation();

  const token = localStorage.getItem("token");
  const storedUser = localStorage.getItem("user");

  let user = null;

  try {
    user = storedUser ? JSON.parse(storedUser) : null;
  } catch {
    // Keep the decoded token fallback when persisted user JSON is invalid.
  }

  const decoded = token ? decodeToken(token) : null;

  const userRole = decoded?.role || user?.role;

  const fallbackRedirect = () => {
    if (redirectTo) return redirectTo;
    if (location.pathname.startsWith("/admin")) return "/admin";
    if (location.pathname.startsWith("/encadrant")) return "/encadrant";
    return "/login";
  };

  if (!token) {
    return <Navigate to={fallbackRedirect()} replace />;
  }

  if (!userRole || !allowedRoles.includes(userRole)) {
    return <Navigate to={fallbackRedirect()} replace />;
  }

  return children;
}

export default ProtectedRoute;
