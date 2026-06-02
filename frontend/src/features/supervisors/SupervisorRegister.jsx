import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Lock, Phone, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";
import api from "../../api/axios";
import BrandLogo from "../../components/BrandLogo";
import HeaderControls from "../../components/HeaderControls";
import {
  SUPERVISOR_DEPARTMENTS,
  SUPERVISOR_RANKS,
  SUPERVISOR_DIVISIONS_BY_DEPARTMENT,
} from "../../constants/profileFields";
import { Button, Field, Input, Select } from "../../components/ui";

function SupervisorRegister() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    department: "",
    rank: "",
    division: "",
  });

  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  const availableDivisions =
    SUPERVISOR_DIVISIONS_BY_DEPARTMENT[formData.department] || [];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      if (name === "department") {
        const allowed = SUPERVISOR_DIVISIONS_BY_DEPARTMENT[value] || [];
        if (!allowed.includes(prev.division)) {
          next.division = "";
        }
      }
      return next;
    });
    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.department) {
      setIsError(true);
      setMessage("Department is required.");
      return;
    }
    if (!formData.rank) {
      setIsError(true);
      setMessage("Rank is required.");
      return;
    }
    if (!formData.division) {
      setIsError(true);
      setMessage("Division is required.");
      return;
    }
    if (formData.password.length < 8) {
      setIsError(true);
      setMessage("Password must be at least 8 characters.");
      return;
    }

    try {
      setLoading(true);
      setIsError(false);
      await api.post("/auth/supervisor/register", formData);
      setMessage("Request submitted. Awaiting admin approval.");

      setTimeout(() => navigate("/encadrant/login"), 1400);
    } catch {
      setMessage("Registration failed");
      setIsError(true);
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
            Become a supervisor.
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
            Submit a request to access the supervisor space. An administrator
            will validate your account before you can log in.
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

            <h1 className="mt-2 text-3xl font-black text-slate-950">
              Request access
            </h1>
            <p className="mt-1.5 text-sm text-slate-600">
              Your account will require admin approval before login.
            </p>

            {message && (
              <div
                className={`mt-5 flex items-start gap-2 rounded-lg border px-3.5 py-2.5 text-sm font-semibold ${
                  isError
                    ? "border-rose-200 bg-rose-50 text-rose-700"
                    : "border-emerald-200 bg-emerald-50 text-emerald-700"
                }`}
              >
                {isError ? (
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2.5} />
                ) : (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2.5} />
                )}
                <span>{message}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <Field label="Full name" htmlFor="fullName" required>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" strokeWidth={2.5} />
                  <Input
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Jane Doe"
                    className="pl-9"
                    required
                  />
                </div>
              </Field>

              <Field label="Email" htmlFor="email" required>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" strokeWidth={2.5} />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
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
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="At least 8 characters"
                    className="pl-9"
                    minLength={8}
                    required
                  />
                </div>
              </Field>

              <Field label="Phone" htmlFor="phone">
                <div className="relative">
                  <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" strokeWidth={2.5} />
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+216 ..."
                    className="pl-9"
                  />
                </div>
              </Field>

              <Field label="Department" htmlFor="department" required>
                <Select
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select your department</option>
                  {SUPERVISOR_DEPARTMENTS.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field label="Rank" htmlFor="rank" required>
                <Select
                  id="rank"
                  name="rank"
                  value={formData.rank}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select your rank</option>
                  {SUPERVISOR_RANKS.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field label="Division" htmlFor="division" required>
                <Select
                  id="division"
                  name="division"
                  value={formData.division}
                  onChange={handleChange}
                  required
                  disabled={!formData.department}
                >
                  <option value="">
                    {formData.department
                      ? "Select your division"
                      : "Select a department first"}
                  </option>
                  {availableDivisions.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </Select>
              </Field>

              <Button
                type="submit"
                size="lg"
                fullWidth
                disabled={loading}
                iconRight={loading ? undefined : ArrowRight}
              >
                {loading ? "Submitting..." : "Submit request"}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-600">
              Already have an account?{" "}
              <Link
                to="/encadrant/login"
                className="font-bold text-cyan-700 hover:underline"
              >
                Log in
              </Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default SupervisorRegister;
