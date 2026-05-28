import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, AlertCircle, ArrowRight } from "lucide-react";
import api from "../../api/axios";
import BrandLogo from "../../components/BrandLogo";
import HeaderControls from "../../components/HeaderControls";
import { Button, Field, Input } from "../../components/ui";

function SupervisorLogin() {
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const submit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setMessage("");
      const res = await api.post("/auth/supervisor/login", form);

      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      navigate("/encadrant/dashboard");
    } catch {
      setMessage("Incorrect email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen bg-[#f1f8fc] lg:grid-cols-2">
      <HeaderControls className="fixed right-6 top-5 z-20" />

      <section className="auth-side-panel hidden border-r border-[#b9dceb] bg-[linear-gradient(145deg,#ffffff_0%,#f1f8fc_52%,#dff1fa_100%)] p-12 lg:flex lg:flex-col lg:justify-between">
        <div>
          <BrandLogo size="lg" />

          <h1 className="mt-20 max-w-xl text-5xl font-black leading-tight text-slate-950">
            Supervisor Space
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
            Log in to manage your subjects, applications, and assigned interns.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="h-1.5 w-12 rounded-full bg-cyan-700" />
          <p className="text-sm font-bold uppercase tracking-wider text-cyan-700">
            Supervisor Space
          </p>
        </div>
      </section>

      <section className="flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-[#cfe1e8] bg-white p-8 shadow-card">
            <p className="text-xs font-black uppercase tracking-widest text-cyan-700">
              Supervisor Space
            </p>

            <h1 className="mt-2 text-3xl font-black text-slate-950">Login</h1>
            <p className="mt-1.5 text-sm text-slate-600">
              Access your supervisor space.
            </p>

            {message && (
              <div className="mt-5 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm font-semibold text-rose-700">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2.5} />
                <span>{message}</span>
              </div>
            )}

            <form onSubmit={submit} className="mt-6 space-y-4">
              <Field label="Email" htmlFor="email" required>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" strokeWidth={2.5} />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="email@example.com"
                    className="pl-9"
                    required
                  />
                </div>
              </Field>

              <Field label="Password" htmlFor="password" required>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" strokeWidth={2.5} />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="••••••••"
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
                {loading ? "Logging in..." : "Log in"}
              </Button>
            </form>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm">
              <Link
                to="/encadrant/register"
                className="font-bold text-cyan-700 hover:underline"
              >
                Request supervisor access
              </Link>
              <Link to="/login" className="font-semibold text-slate-500 hover:underline">
                Intern space
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default SupervisorLogin;
