import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Ban,
  Search,
  Mail,
  Calendar,
  Info,
  UserMinus,
  UserCheck,
  ShieldOff,
  X,
} from "lucide-react";
import api from "../../api/axios";
import ExportButton from "../../components/ExportButton";
import {
  PageHeader,
  Card,
  CardHeader,
  CardBody,
  Field,
  Input,
<<<<<<< HEAD
  Button,
  EmptyState,
} from "../../components/ui";
import DateRangeFilter from "../../components/filters/DateRangeFilter";
import { createDateRange, matchesDateRange } from "../../utils/filters";
=======
  Select,
  Button,
  EmptyState,
} from "../../components/ui";
>>>>>>> 8fd258754427456a9e996d340332bcb6a728e256

function BlacklistManagement() {
  const [blacklist, setBlacklist] = useState([]);
  const [email, setEmail] = useState("");
  const [reason, setReason] = useState("");
  const [search, setSearch] = useState("");
<<<<<<< HEAD
  const [dateFilter, setDateFilter] = useState(createDateRange("ALL"));
=======
  const [dateFilter, setDateFilter] = useState("ALL");
>>>>>>> 8fd258754427456a9e996d340332bcb6a728e256
  const [message, setMessage] = useState("");
  const [confirmingId, setConfirmingId] = useState(null);

  const fetchBlacklist = useCallback(async () => {
    try {
      const res = await api.get("/admin/blacklist");
      setBlacklist(res.data || []);
    } catch {
      setMessage("Error while loading.");
    }
  }, []);

  useEffect(() => {
    queueMicrotask(fetchBlacklist);
  }, [fetchBlacklist]);

  const banUser = async (e) => {
    e.preventDefault();

    try {
      await api.post("/admin/blacklist", { email, reason });
      setMessage("User banned.");
      setEmail("");
      setReason("");
      fetchBlacklist();
    } catch {
      setMessage("Error.");
    }
  };

  const unbanUser = async (id) => {
    try {
      await api.delete(`/admin/blacklist/${id}`);
      setMessage("User unbanned.");
      setConfirmingId(null);
      fetchBlacklist();
    } catch {
      setMessage("Error.");
    }
  };

<<<<<<< HEAD
=======
  const isInDateFilter = useCallback(
    (date) => {
      if (dateFilter === "ALL") return true;

      const createdAt = new Date(date);
      const now = new Date();

      if (dateFilter === "TODAY") {
        return createdAt.toDateString() === now.toDateString();
      }

      if (dateFilter === "7_DAYS") {
        return now - createdAt <= 7 * 24 * 60 * 60 * 1000;
      }

      if (dateFilter === "30_DAYS") {
        return now - createdAt <= 30 * 24 * 60 * 60 * 1000;
      }

      return true;
    },
    [dateFilter]
  );

>>>>>>> 8fd258754427456a9e996d340332bcb6a728e256
  const filteredBlacklist = useMemo(() => {
    return blacklist.filter((entry) => {
      const text = [
        entry.email,
        entry.reason,
        entry.bannedBy?.fullName,
        entry.bannedBy?.email,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return (
<<<<<<< HEAD
        text.includes(search.toLowerCase()) &&
        matchesDateRange(entry.createdAt, dateFilter)
      );
    });
  }, [blacklist, search, dateFilter]);
=======
        text.includes(search.toLowerCase()) && isInDateFilter(entry.createdAt)
      );
    });
  }, [blacklist, search, isInDateFilter]);
>>>>>>> 8fd258754427456a9e996d340332bcb6a728e256

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Ban}
        title="Blacklist"
        subtitle="Manage banned users without deleting their accounts."
        actions={
          <ExportButton
            endpoint="/exports/blacklist"
            filename="blacklist-export.csv"
          />
        }
      />

      {message && (
        <div className="flex items-start gap-2 rounded-xl border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm font-semibold text-cyan-700">
          <Info className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2.5} />
          <span>{message}</span>
        </div>
      )}

      <Card>
        <CardHeader>
          <h2 className="inline-flex items-center gap-2 text-lg font-black text-slate-950">
            <ShieldOff className="h-5 w-5 text-rose-600" strokeWidth={2.5} />
            Ban a user
          </h2>
        </CardHeader>
        <CardBody>
          <form onSubmit={banUser} className="grid gap-4 lg:grid-cols-3">
            <Field label="Email" htmlFor="banEmail">
              <div className="relative">
                <Mail
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  strokeWidth={2.5}
                />
                <Input
                  id="banEmail"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@example.com"
                  required
                  className="pl-9"
                />
              </div>
            </Field>

            <Field label="Reason" htmlFor="banReason">
              <Input
                id="banReason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Reason"
              />
            </Field>

            <Field label="&nbsp;" htmlFor="banSubmit">
              <Button
                type="submit"
                variant="danger"
                iconLeft={UserMinus}
                fullWidth
              >
                Ban user
              </Button>
            </Field>
          </form>
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <div className="grid gap-4 lg:grid-cols-3">
            <Field label="Search" htmlFor="search" className="lg:col-span-2">
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  strokeWidth={2.5}
                />
                <Input
                  id="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search email, reason, admin..."
                  className="pl-9"
                />
              </div>
            </Field>

<<<<<<< HEAD
            <DateRangeFilter value={dateFilter} onChange={setDateFilter} />
=======
            <Field label="Date" htmlFor="dateFilter">
              <Select
                id="dateFilter"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              >
                <option value="ALL">All dates</option>
                <option value="TODAY">Today</option>
                <option value="7_DAYS">Last 7 days</option>
                <option value="30_DAYS">Last 30 days</option>
              </Select>
            </Field>
>>>>>>> 8fd258754427456a9e996d340332bcb6a728e256
          </div>
        </CardBody>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-[#e2edf2] bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-600">
              <tr>
                <th className="px-5 py-3.5">Email</th>
                <th className="px-5 py-3.5">Reason</th>
                <th className="px-5 py-3.5">Banned by</th>
                <th className="px-5 py-3.5">Date</th>
                <th className="px-5 py-3.5">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#e2edf2]">
              {filteredBlacklist.map((entry) => (
<<<<<<< HEAD
                <tr key={entry.id} className="admin-hover-row transition hover:bg-cyan-50/50">
=======
                <tr key={entry.id} className="transition hover:bg-cyan-50/50">
>>>>>>> 8fd258754427456a9e996d340332bcb6a728e256
                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center gap-1.5 font-bold text-slate-950">
                      <Mail className="h-3.5 w-3.5 text-slate-400" strokeWidth={2.5} />
                      {entry.email}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-slate-600">
                    {entry.reason || "-"}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-slate-600">
                    {entry.bannedBy?.fullName || "-"}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center gap-1.5 text-sm text-slate-600">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" strokeWidth={2.5} />
                      {new Date(entry.createdAt).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <Button
                      variant="success"
                      size="sm"
                      iconLeft={UserCheck}
                      onClick={() => setConfirmingId(entry.id)}
                    >
                      Unban
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredBlacklist.length === 0 && (
          <EmptyState
            icon={Ban}
            title="No banned user."
            description="No users are currently on the blacklist."
          />
        )}
      </Card>

      {confirmingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-md">
            <CardBody>
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                  <ShieldOff className="h-5 w-5" strokeWidth={2.5} />
                </span>
                <div>
                  <h3 className="text-lg font-black text-slate-950">
                    Remove from blocklist?
                  </h3>
                  <p className="mt-1 text-sm text-slate-600">
                    This user will be able to access the platform again.
                  </p>
                </div>
              </div>
              <div className="mt-5 flex justify-end gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  iconLeft={X}
                  onClick={() => setConfirmingId(null)}
                >
                  Cancel
                </Button>
                <Button
                  variant="success"
                  size="sm"
                  iconLeft={UserCheck}
                  onClick={() => unbanUser(confirmingId)}
                >
                  Unban
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
}

export default BlacklistManagement;
