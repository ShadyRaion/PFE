import { useState } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, ArrowRight, CheckCircle2, Mail } from "lucide-react";
import api from "../../api/axios";
import BrandLogo from "../../components/BrandLogo";
import HeaderControls from "../../components/HeaderControls";
import { Button, Field, Input } from "../../components/ui";

function PasswordResetRequest() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setMessage("");
      setIsError(false);
      const res = await api.post("/auth/password-reset/request", {
        email: email.trim(),
      });
      setMessage(res.data?.message || "Check your email for a reset link.");
    } catch (error) {
      setIsError(true);
      setMessage(
        error.response?.data?.message || "Unable to request password reset."
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
            Reset your password.
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
            Request a secure link and choose a new password for your account.
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
              Forgot password
            </h1>
            <p className="mt-1.5 text-sm text-slate-600">
              Enter the email linked to your STB Interns account.
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
              <Field label="Email" htmlFor="resetEmail" required>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" strokeWidth={2.5} />
                  <Input
                    id="resetEmail"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="pl-9"
                    required
                  />
                </div>
              </Field>

              <Button
                type="submit"
                size="lg"
                fullWidth
                disabled={loading}
                iconRight={loading ? undefined : ArrowRight}
              >
                {loading ? "Sending..." : "Send reset link"}
              </Button>
            </form>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm">
              <Link to="/login" className="font-bold text-cyan-700 hover:underline">
                Intern login
              </Link>
              <Link
                to="/encadrant/login"
                className="font-semibold text-slate-500 hover:underline"
              >
                Supervisor login
              </Link>
              <Link
                to="/admin"
                className="font-semibold text-slate-500 hover:underline"
              >
                Admin login
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default PasswordResetRequest;
