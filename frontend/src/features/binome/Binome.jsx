import { useCallback, useEffect, useState } from "react";
import {
  Users,
  Mail,
  Send,
  Check,
  X,
  Trash2,
  Inbox,
  UserPlus,
  Info,
  Lock,
} from "lucide-react";
import api from "../../api/axios";
import {
  PageHeader,
  Card,
  CardBody,
  CardHeader,
  Button,
  Field,
  Input,
  LoadingState,
  Badge,
} from "../../components/ui";

function Binome() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [email, setEmail] = useState("");
  const [binome, setBinome] = useState(null);
  const [requests, setRequests] = useState([]);
  const [message, setMessage] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [sending, setSending] = useState(false);
  const [removing, setRemoving] = useState(false);

  const refreshAlerts = () => {
    window.dispatchEvent(new Event("page-alerts-refresh"));
  };

  const normalizeArray = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.requests)) return payload.requests;
    if (Array.isArray(payload?.binomes)) return payload.binomes;
    return [];
  };

  const fetchBinome = useCallback(async () => {
    try {
      const res = await api.get("/binome/me");
      setBinome(res.data || null);
    } catch {
      setBinome(null);
    }
  }, []);

  const fetchRequests = useCallback(async () => {
    try {
      const res = await api.get("/binome/requests");
      setRequests(normalizeArray(res.data));
    } catch {
      setRequests([]);
    }
  }, []);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      await Promise.all([fetchBinome(), fetchRequests()]);
    } finally {
      setLoading(false);
    }
  }, [fetchBinome, fetchRequests]);

  useEffect(() => {
    queueMicrotask(fetchAll);
  }, [fetchAll]);

  const sendRequest = async () => {
    if (!email.trim()) {
      setMessage("Enter the student's email.");
      return;
    }
    try {
      setSending(true);
      setMessage("");
      await api.post("/binome/requests", { receiverEmail: email.trim() });
      setMessage("Invitation sent.");
      setEmail("");
      await fetchRequests();
      refreshAlerts();
    } catch (error) {
      setMessage(error.response?.data?.message || "Error while sending.");
    } finally {
      setSending(false);
    }
  };

  const acceptRequest = async (id) => {
    try {
      setActionLoadingId(id);
      setMessage("");
      await api.patch(`/binome/requests/${id}/accept`);
      setMessage("Invitation accepted.");
      setRequests((prev) => prev.filter((r) => r.id !== id));
      await fetchBinome();
      await fetchRequests();
      refreshAlerts();
    } catch (error) {
      setMessage(error.response?.data?.message || "Error.");
      await fetchAll();
      refreshAlerts();
    } finally {
      setActionLoadingId(null);
    }
  };

  const rejectRequest = async (id) => {
    try {
      setActionLoadingId(id);
      setMessage("");
      await api.patch(`/binome/requests/${id}/reject`);
      setMessage("Invitation rejected.");
      setRequests((prev) => prev.filter((r) => r.id !== id));
      await fetchRequests();
      refreshAlerts();
    } catch {
      setMessage("Error.");
      await fetchRequests();
      refreshAlerts();
    } finally {
      setActionLoadingId(null);
    }
  };

  const removeBinome = async () => {
    try {
      setRemoving(true);
      setMessage("");
      await api.delete("/binome/me");
      setMessage("Team deleted.");
      setBinome(null);
      setShowConfirm(false);
      await fetchAll();
      refreshAlerts();
    } catch {
      setMessage("Error.");
      setShowConfirm(false);
    } finally {
      setRemoving(false);
    }
  };

  const receivedRequests = requests.filter(
    (r) =>
      r.student2Id === user.id ||
      r.receiverId === user.id ||
      r.receiver?.id === user.id
  );

  const sentRequests = requests.filter(
    (r) =>
      r.student1Id === user.id ||
      r.senderId === user.id ||
      r.sender?.id === user.id
  );

  const partner =
    binome?.student1Id === user.id || binome?.student1?.id === user.id
      ? binome?.student2
      : binome?.student1;

  const canRemoveBinome =
    binome && binome.canRemove !== false && binome.isAffected !== true;

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          icon={Users}
          title="Team"
          subtitle="Manage your application team."
        />
        <LoadingState label="Loading team..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Users}
        title="Team"
        subtitle="Manage your application team."
      />

      {message && (
        <div className="flex items-start gap-2 rounded-xl border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm font-semibold text-cyan-700">
          <Info className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2.5} />
          <span>{message}</span>
        </div>
      )}

      {binome ? (
        <Card>
          <CardBody>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <Badge variant="success" size="md">
                  Active team
                </Badge>
                <h2 className="mt-3 text-2xl font-black text-slate-950">
                  {partner?.fullName || "Student"}
                </h2>
                <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-slate-600">
                  <Mail className="h-3.5 w-3.5" strokeWidth={2.5} />
                  {partner?.email || "-"}
                </p>
                {binome.isAffected && (
                  <p className="mt-4 inline-flex items-start gap-2 rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600">
                    <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={2.5} />
                    This team is locked because it is already assigned.
                  </p>
                )}
              </div>

              {canRemoveBinome && (
                <Button
                  variant="danger"
                  iconLeft={Trash2}
                  onClick={() => setShowConfirm(true)}
                >
                  Delete team
                </Button>
              )}
            </div>
          </CardBody>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <h2 className="inline-flex items-center gap-2 text-lg font-black text-slate-950">
              <UserPlus className="h-5 w-5 text-cyan-700" strokeWidth={2.5} />
              Invite a student
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Send an invitation to another student to form a team.
            </p>
          </CardHeader>
          <CardBody>
            <p className="mb-3 text-sm font-semibold text-slate-600">
              You can only invite a student from the same university, degree
              level, and academic year.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Field htmlFor="email" className="flex-1">
                <div className="relative">
                  <Mail
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                    strokeWidth={2.5}
                  />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@example.com"
                    className="pl-9"
                  />
                </div>
              </Field>
              <Button
                onClick={sendRequest}
                disabled={sending}
                iconRight={sending ? undefined : Send}
              >
                {sending ? "Sending..." : "Send"}
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      <section className="grid gap-5 md:grid-cols-2">
        <Card>
          <CardHeader>
            <h2 className="inline-flex items-center gap-2 text-base font-black text-slate-950">
              <Inbox className="h-4 w-4 text-cyan-700" strokeWidth={2.5} />
              Received invitations
            </h2>
          </CardHeader>
          <CardBody>
            <div className="space-y-2">
              {receivedRequests.map((request) => {
                const sender = request.student1 || request.sender;
                const loadingThis = actionLoadingId === request.id;
                return (
                  <div
                    key={request.id}
                    className="rounded-xl border border-[#cfe1e8] bg-[#f1f8fc] p-4"
                  >
                    <p className="font-bold text-slate-950">
                      {sender?.fullName || "Student"}
                    </p>
                    <p className="mt-0.5 inline-flex items-center gap-1.5 text-sm text-slate-600">
                      <Mail className="h-3.5 w-3.5" strokeWidth={2.5} />
                      {sender?.email || "-"}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button
                        variant="success"
                        size="sm"
                        iconLeft={Check}
                        disabled={loadingThis}
                        onClick={() => acceptRequest(request.id)}
                      >
                        {loadingThis ? "..." : "Accept"}
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        iconLeft={X}
                        disabled={loadingThis}
                        onClick={() => rejectRequest(request.id)}
                      >
                        {loadingThis ? "..." : "Reject"}
                      </Button>
                    </div>
                  </div>
                );
              })}
              {receivedRequests.length === 0 && (
                <p className="text-sm text-slate-500">No invitation received.</p>
              )}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="inline-flex items-center gap-2 text-base font-black text-slate-950">
              <Send className="h-4 w-4 text-cyan-700" strokeWidth={2.5} />
              Sent invitations
            </h2>
          </CardHeader>
          <CardBody>
            <div className="space-y-2">
              {sentRequests.map((request) => {
                const receiver = request.student2 || request.receiver;
                return (
                  <div
                    key={request.id}
                    className="rounded-xl border border-[#cfe1e8] bg-[#f1f8fc] p-4"
                  >
                    <p className="font-bold text-slate-950">
                      {receiver?.fullName || "Student"}
                    </p>
                    <p className="mt-0.5 inline-flex items-center gap-1.5 text-sm text-slate-600">
                      <Mail className="h-3.5 w-3.5" strokeWidth={2.5} />
                      {receiver?.email || "-"}
                    </p>
                    <div className="mt-2">
                      <Badge variant="warning" size="sm">
                        Pending
                      </Badge>
                    </div>
                  </div>
                );
              })}
              {sentRequests.length === 0 && (
                <p className="text-sm text-slate-500">No sent invitation.</p>
              )}
            </div>
          </CardBody>
        </Card>
      </section>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-6">
          <Card className="w-full max-w-md">
            <CardBody>
              <h2 className="text-xl font-black text-slate-950">
                Delete team?
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                This action will permanently delete the team. You can invite
                the same student again afterward.
              </p>
              <div className="mt-6 flex justify-end gap-2">
                <Button
                  variant="secondary"
                  onClick={() => setShowConfirm(false)}
                  disabled={removing}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  onClick={removeBinome}
                  disabled={removing}
                  iconLeft={removing ? undefined : Trash2}
                >
                  {removing ? "Deleting..." : "Confirm"}
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
}

export default Binome;
