import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AlertCircle, ArrowRight, CheckCircle2, Lock } from "lucide-react";
import api from "../../api/axios";
import BrandLogo from "../../components/BrandLogo";
import HeaderControls from "../../components/HeaderControls";
import { Button, Field, Input } from "../../components/ui";

function PasswordResetConfirm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [form, setForm] = useState({
    password: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsError(false);

    if (!token) {
      setIsError(true);
      setMessage("Password reset link is invalid or expired.");
      return;
    }

    if (form.password.length < 8) {
      setIsError(true);
      setMessage("Password must be at least 8 characters.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setIsError(true);
      setMessage("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      const res = await api.post("/auth/password-reset/confirm", {
        token,
        password: form.password,
      });
      setCompleted(true);
      setMessage(res.data?.message || "Password has been reset successfully.");
      setTimeout(() => navigate("/login"), 1200);
    } catch (error) {
      setIsError(true);
      setMessage(
        error.response?.data?.message || "Unable to reset password."
      );
    } finally {
      setLoading(false);
    }
  };

  const MessageIcon = isError ? AlertCircle : CheckCircle2;

  return (
    <div className="grid min-h-screen bg-[#f1f8fc] lg:grid-cols-2">
      <HeaderControls className="fixed right-6 top-5 z-20" />

      <section className="auth-side-panel hidden border-r border-[#b9dceb] bg-[linear-gradient(145deg,#ffffff_0%,#f1f8fc_52%,#dff1fa_100%)] p-12 lg:flex lg:flex-col lg:justify-between">
        <div>
          <BrandLogo size="lg" />

          <h1 className="mt-20 max-w-xl text-5xl font-black leading-tight text-slate-950">
            Choose a new password.
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
            Complete the reset and return to your space with your new password.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="h-1.5 w-12 rounded-full bg-cyan-700" />
          <p className="text-sm font-bold uppercase tracking-wider text-cyan-700">
            Account Access
          </p>
        </div>
      </section>

      <section className="flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-[#cfe1e8] bg-white p-8 shadow-card">
            <p className="text-xs font-black uppercase tracking-widest text-cyan-700">
              Password Reset
            </p>

            <h1 className="mt-2 text-3xl font-black text-slate-950">
              New password
            </h1>
            <p className="mt-1.5 text-sm text-slate-600">
              Choose a strong password of at least 8 characters.
            </p>

            {message && (
              <div
                className={`mt-5 flex items-start gap-2 rounded-lg border px-3.5 py-2.5 text-sm font-semibold ${
                  isError
                    ? "border-rose-200 bg-rose-50 text-rose-700"
                    : "border-emerald-200 bg-emerald-50 text-emerald-700"
                }`}
              >
                <MessageIcon className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2.5} />
                <span>{message}</span>
              </div>
            )}

            <form onSubmit={submit} className="mt-6 space-y-4">
              <Field label="New password" htmlFor="resetPassword" required>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" strokeWidth={2.5} />
                  <Input
                    id="resetPassword"
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="New password"
                    className="pl-9"
                    autoComplete="new-password"
                    disabled={completed}
                    required
                  />
                </div>
              </Field>

              <Field
                label="Confirm password"
                htmlFor="resetConfirmPassword"
                required
              >
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" strokeWidth={2.5} />
                  <Input
                    id="resetConfirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    placeholder="Repeat password"
                    className="pl-9"
                    autoComplete="new-password"
                    disabled={completed}
                    required
                  />
                </div>
              </Field>

              <Button
                type="submit"
                size="lg"
                fullWidth
                disabled={loading || completed}
                iconRight={loading || completed ? undefined : ArrowRight}
              >
                {loading ? "Resetting..." : completed ? "Password reset" : "Reset password"}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-600">
              Remembered it?{" "}
              <Link to="/login" className="font-bold text-cyan-700 hover:underline">
                Back to login
              </Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default PasswordResetConfirm;
