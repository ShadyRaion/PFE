import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import api from "../../api/axios";
import { LoadingState, Card, CardBody } from "../../components/ui";
import AdminStudentDetails from "./AdminStudentDetails";

function AdminUserDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("");

  const fetchUser = useCallback(async () => {
    try {
      const res = await api.get(`/admin/users/${id}`);
      setUser(res.data);
    } catch {
      setMessage("Error user.");
    }
  }, [id]);

  useEffect(() => {
    queueMicrotask(fetchUser);
  }, [fetchUser]);

  const backPath =
    user?.role === "COMPANY_SUPERVISOR" ? "/admin/supervisors" : "/admin/students";

  const backLabel =
    user?.role === "COMPANY_SUPERVISOR" ? "Back to supervisors" : "Back to students";

  if (!user) {
    return (
      <div className="space-y-6">
        <Link
          to="/admin/dashboard"
          className="inline-flex items-center gap-2 text-sm font-bold text-cyan-700 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2.5} />
          Back
        </Link>

        {message ? (
          <Card>
            <CardBody>
              <p className="text-sm font-semibold text-slate-600">{message}</p>
            </CardBody>
          </Card>
        ) : (
          <LoadingState label="Loading user..." />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        to={backPath}
        className="inline-flex items-center gap-2 text-sm font-bold text-cyan-700 hover:underline"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={2.5} />
        {backLabel}
      </Link>

      <AdminStudentDetails
        user={user}
        mode="page"
        onClose={() => navigate(backPath)}
      />
    </div>
  );
}

export default AdminUserDetails;
