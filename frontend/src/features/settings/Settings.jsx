import { useState } from "react";
import { Settings as SettingsIcon, Mail, Lock, Save, CheckCircle2, AlertCircle } from "lucide-react";
import api from "../../api/axios";
import { PageHeader, Card, CardBody, Button, Field, Input } from "../../components/ui";

function Settings() {
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");

  const [email, setEmail] = useState(storedUser.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [saving, setSaving] = useState(false);

  const updateSettings = async (e) => {
    e.preventDefault();
    if (newPassword && newPassword.length < 8) {
      setIsError(true);
      setMessage("Password must be at least 8 characters.");
      return;
    }

    try {
      setSaving(true);
      setMessage("");
      setIsError(false);
      const res = await api.patch("/settings", {
        email,
        currentPassword,
        newPassword,
      });
      localStorage.setItem("user", JSON.stringify(res.data.user));
      setMessage("Settings updated.");
      setCurrentPassword("");
      setNewPassword("");
    } catch {
      setIsError(true);
      setMessage("Error while updating settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        icon={SettingsIcon}
        title="Settings"
        subtitle="Update your email or password."
      />

      <Card className="max-w-3xl">
        <CardBody>
          <form onSubmit={updateSettings} className="space-y-5">
            <Field label="Email" htmlFor="email">
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
                  className="pl-9"
                />
              </div>
            </Field>

            <Field label="Current password" htmlFor="currentPassword">
              <div className="relative">
                <Lock
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  strokeWidth={2.5}
                />
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-9"
                />
              </div>
            </Field>

            <Field
              label="New password"
              htmlFor="newPassword"
              hint="Leave blank to keep your current password"
            >
              <div className="relative">
                <Lock
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  strokeWidth={2.5}
                />
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="pl-9"
                  minLength={8}
                />
              </div>
            </Field>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button
                type="submit"
                disabled={saving}
                iconLeft={saving ? undefined : Save}
              >
                {saving ? "Saving..." : "Save"}
              </Button>

              {message && (
                <span
                  className={`inline-flex items-center gap-1.5 text-sm font-semibold ${
                    isError ? "text-rose-700" : "text-emerald-700"
                  }`}
                >
                  {isError ? (
                    <AlertCircle className="h-4 w-4" strokeWidth={2.5} />
                  ) : (
                    <CheckCircle2 className="h-4 w-4" strokeWidth={2.5} />
                  )}
                  {message}
                </span>
              )}
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}

export default Settings;
