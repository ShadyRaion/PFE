import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Lock, GraduationCap, AlertCircle, ArrowRight, Calendar } from "lucide-react";
import api from "../../api/axios";
import BrandLogo from "../../components/BrandLogo";
import HeaderControls from "../../components/HeaderControls";
import { tunisianUniversities } from "../../data/tunisianUniversities";
import { EDUCATION_FIELD_OPTIONS } from "../../constants/educationFields";
import {
  DEGREE_LEVELS,
  INTERNSHIP_TYPES,
  DESIRED_DURATIONS,
  getAcademicYearOptions,
  ACADEMIC_YEARS_BY_DEGREE,
} from "../../constants/profileFields";
import { Button, Field, Input, Select } from "../../components/ui";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "STUDENT",
    university: "",
    educationField: "",
    degreeLevel: "",
    academicYear: "",
    internshipType: "",
    internshipStartDate: "",
    desiredDuration: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const academicYearOptions = getAcademicYearOptions(formData.degreeLevel);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      if (name === "degreeLevel") {
        const allowed = ACADEMIC_YEARS_BY_DEGREE[value] || [];
        if (!allowed.includes(prev.academicYear)) {
          next.academicYear = "";
        }
      }
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.educationField) {
      setMessage("Please choose your education field.");
      return;
    }

    if (!formData.degreeLevel) {
      setMessage("Degree level is required.");
      return;
    }
    if (!formData.academicYear) {
      setMessage("Academic year is required.");
      return;
    }
    if (!formData.internshipType) {
      setMessage("Internship type is required.");
      return;
    }
    if (!formData.internshipStartDate) {
      setMessage("Desired start date is required.");
      return;
    }
    if (!formData.desiredDuration) {
      setMessage("Desired duration is required.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");
      await api.post("/auth/register", { ...formData, role: "STUDENT" });
      navigate("/login");
    } catch (error) {
      setMessage(
        error?.response?.data?.message || "Registration failed."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen bg-[#f1f8fc] lg:grid-cols-2">
      <HeaderControls className="fixed right-6 top-5 z-20" />

<<<<<<< HEAD
      <section className="auth-side-panel hidden border-r border-[#b9dceb] bg-[linear-gradient(145deg,#ffffff_0%,#f1f8fc_52%,#dff1fa_100%)] p-12 lg:flex lg:flex-col lg:justify-between">
=======
      <section className="hidden border-r border-[#b9dceb] bg-[linear-gradient(145deg,#ffffff_0%,#f1f8fc_52%,#dff1fa_100%)] p-12 lg:flex lg:flex-col lg:justify-between">
>>>>>>> 8fd258754427456a9e996d340332bcb6a728e256
        <div>
          <BrandLogo size="lg" />

          <h1 className="mt-20 max-w-xl text-5xl font-black leading-tight text-slate-950">
            Create your intern space.
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
            Join the STB Interns platform to apply for PFE subjects and start
            your career.
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

            <h1 className="mt-2 text-3xl font-black text-slate-950">
              Create an account
            </h1>
            <p className="mt-1.5 text-sm text-slate-600">
              Fill in your details to register as an intern.
            </p>

            {message && (
              <div className="mt-5 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm font-semibold text-rose-700">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2.5} />
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
                    type="email"
                    name="email"
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
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="At least 8 characters"
                    className="pl-9"
                    required
                  />
                </div>
              </Field>

              <Field label="University" htmlFor="university" required>
                <div className="relative">
                  <GraduationCap className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" strokeWidth={2.5} />
                  <Input
                    id="university"
                    name="university"
                    list="student-universities"
                    value={formData.university}
                    onChange={handleChange}
                    placeholder="Select or type your university"
                    className="pl-9"
                    required
                  />
                  <datalist id="student-universities">
                    {tunisianUniversities.map((university) => (
                      <option key={university} value={university} />
                    ))}
                  </datalist>
                </div>
              </Field>

              <Field label="Education field" htmlFor="educationField" required>
                <Select
                  id="educationField"
                  name="educationField"
                  value={formData.educationField}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select your education field</option>
                  {EDUCATION_FIELD_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field label="Degree level" htmlFor="degreeLevel" required>
                <Select
                  id="degreeLevel"
                  name="degreeLevel"
                  value={formData.degreeLevel}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select your degree level</option>
                  {DEGREE_LEVELS.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field label="Academic year" htmlFor="academicYear" required>
                <Select
                  id="academicYear"
                  name="academicYear"
                  value={formData.academicYear}
                  onChange={handleChange}
                  required
                  disabled={!formData.degreeLevel}
                >
                  <option value="">
                    {formData.degreeLevel
                      ? "Select your academic year"
                      : "Select a degree level first"}
                  </option>
                  {academicYearOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field label="Internship type" htmlFor="internshipType" required>
                <Select
                  id="internshipType"
                  name="internshipType"
                  value={formData.internshipType}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select your internship type</option>
                  {INTERNSHIP_TYPES.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field label="Desired start date" htmlFor="internshipStartDate" required>
                <div className="relative">
                  <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" strokeWidth={2.5} />
                  <Input
                    id="internshipStartDate"
                    type="date"
                    name="internshipStartDate"
                    value={formData.internshipStartDate}
                    onChange={handleChange}
                    className="pl-9"
                    required
                  />
                </div>
              </Field>

              <Field label="Desired duration" htmlFor="desiredDuration" required>
                <Select
                  id="desiredDuration"
                  name="desiredDuration"
                  value={formData.desiredDuration}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select your desired duration</option>
                  {DESIRED_DURATIONS.map((value) => (
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
                {loading ? "Creating account..." : "Sign up"}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-600">
              Already registered?{" "}
              <Link to="/login" className="font-bold text-cyan-700 hover:underline">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Register;
