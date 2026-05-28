import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, AlertCircle, ArrowRight } from "lucide-react";
import api from "../../api/axios";
import BrandLogo from "../../components/BrandLogo";
import HeaderControls from "../../components/HeaderControls";
import { Button, Field, Input } from "../../components/ui";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setMessage("");
      const res = await api.post("/auth/login", formData);

      if (res.data.user.role !== "STUDENT") {
        setMessage("Access denied. Please use the correct portal.");
        return;
      }

      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate("/dashboard");
    } catch {
      setMessage("Login failed");
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
            Welcome to STB Interns.
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
            Log in to your intern space to manage your PFE journey, browse
            subjects, and track applications.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="h-1.5 w-12 rounded-full bg-cyan-700" />
          <p className="text-sm font-bold uppercase tracking-wider text-cyan-700">
            Intern Space
          </p>
        </div>
      </section>

      <section className="flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-[#cfe1e8] bg-white p-8 shadow-card">
            <p className="text-xs font-black uppercase tracking-widest text-cyan-700">
              Intern Space
            </p>

            <h1 className="mt-2 text-3xl font-black text-slate-950">Login</h1>
            <p className="mt-1.5 text-sm text-slate-600">
              Access your intern dashboard.
            </p>

            {message && (
              <div className="mt-5 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm font-semibold text-rose-700">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2.5} />
                <span>{message}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <Field label="Email" htmlFor="email" required>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" strokeWidth={2.5} />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="you@example.com"
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
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
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

            <p className="mt-6 text-center text-sm text-slate-600">
              No account yet?{" "}
              <Link to="/register" className="font-bold text-cyan-700 hover:underline">
                Create an account
              </Link>
            </p>
          </div>

          <p className="mt-4 text-center text-xs text-slate-500">
            Not an intern?{" "}
            <Link to="/encadrant" className="font-semibold text-slate-700 hover:underline">
              Supervisor space
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}

export default Login;
