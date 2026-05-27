import { useCallback, useEffect, useState } from "react";
import { User, Mail, Phone, GraduationCap, Save, CheckCircle2, AlertCircle, Briefcase, Lock, Calendar } from "lucide-react";
import api from "../../api/axios";
import { PageHeader, Card, CardBody, Button, Field, Input, Select } from "../../components/ui";
import { tunisianUniversities } from "../../data/tunisianUniversities";
import { EDUCATION_FIELD_OPTIONS } from "../../constants/educationFields";
import {
  DEGREE_LEVELS,
  INTERNSHIP_TYPES,
  DESIRED_DURATIONS,
  SUPERVISOR_DEPARTMENTS,
  SUPERVISOR_RANKS,
  SUPERVISOR_DIVISIONS,
<<<<<<< HEAD
=======
  SUPERVISOR_DIVISIONS_BY_DEPARTMENT,
>>>>>>> 8fd258754427456a9e996d340332bcb6a728e256
  getAcademicYearOptions,
  ACADEMIC_YEARS_BY_DEGREE,
} from "../../constants/profileFields";

const toDateInputValue = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "{}");
  } catch {
    return {};
  }
};

const buildProfileForm = (user) => ({
  fullName: user.fullName || "",
  email: user.email || "",
  phone: user.phone || "",
  university: user.university || "",
  specialty: user.specialty || "",
  educationField: user.educationField || "",
  degreeLevel: user.degreeLevel || "",
  academicYear: user.academicYear || "",
  internshipType: user.internshipType || "",
  internshipStartDate: toDateInputValue(user.internshipStartDate),
  desiredDuration: user.desiredDuration || "",
  department: user.department || "",
  rank: user.rank || "",
  division: user.division || "",
});

function MonProfile() {
  const storedUser = getStoredUser();
  const isSupervisor = storedUser.role === "COMPANY_SUPERVISOR";
  const isStudent = storedUser.role === "STUDENT";

  const [profile, setProfile] = useState(() => buildProfileForm(storedUser));
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [saving, setSaving] = useState(false);

  const [currentEmail, setCurrentEmail] = useState(storedUser.email || "");
  const [newEmail, setNewEmail] = useState("");
  const [emailCurrentPassword, setEmailCurrentPassword] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [emailIsError, setEmailIsError] = useState(false);
  const [savingEmail, setSavingEmail] = useState(false);

  const [pwCurrent, setPwCurrent] = useState("");
  const [pwNew, setPwNew] = useState("");
  const [pwConfirm, setPwConfirm] = useState("");
  const [pwMessage, setPwMessage] = useState("");
  const [pwIsError, setPwIsError] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await api.get("/profiles/me");
      setProfile(buildProfileForm(res.data));
      setCurrentEmail(res.data.email || "");
      localStorage.setItem("user", JSON.stringify(res.data));
    } catch {
      setProfile(buildProfileForm(getStoredUser()));
    }
  }, []);

  useEffect(() => {
    queueMicrotask(fetchProfile);
  }, [fetchProfile]);

  const saveProfile = async () => {
    try {
      setSaving(true);
      setMessage("");
      setIsError(false);

      const payload = { ...profile };
      const studentKeys = [
        "degreeLevel",
        "academicYear",
        "internshipType",
        "internshipStartDate",
        "desiredDuration",
      ];
      const supervisorKeys = ["department", "rank", "division"];

      if (!isStudent) studentKeys.forEach((k) => delete payload[k]);
      if (!isSupervisor) supervisorKeys.forEach((k) => delete payload[k]);

      [...studentKeys, ...supervisorKeys].forEach((k) => {
        if (payload[k] === "") delete payload[k];
      });

      const res = await api.put("/profiles/me", payload);
      const updatedUser = res.data.user || res.data;
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setMessage("Profile updated successfully.");
    } catch {
      setIsError(true);
      setMessage("Error while saving.");
    } finally {
      setSaving(false);
    }
  };

  const update = (key) => (e) => {
    const value = e.target.value;
    setProfile((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "degreeLevel") {
        const allowed = ACADEMIC_YEARS_BY_DEGREE[value] || [];
        if (!allowed.includes(prev.academicYear)) {
          next.academicYear = "";
        }
      }
      return next;
    });
  };

  const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const saveEmail = async (e) => {
    e.preventDefault();
    setEmailMessage("");
    setEmailIsError(false);

    const trimmed = newEmail.trim();
    if (!trimmed) {
      setEmailIsError(true);
      setEmailMessage("New email is required.");
      return;
    }
    if (!isValidEmail(trimmed)) {
      setEmailIsError(true);
      setEmailMessage("Please enter a valid email address.");
      return;
    }
    if (trimmed.toLowerCase() === currentEmail.toLowerCase()) {
      setEmailIsError(true);
      setEmailMessage("New email is the same as the current one.");
      return;
    }

    try {
      setSavingEmail(true);
      const res = await api.patch("/settings", {
        email: trimmed,
        currentPassword: emailCurrentPassword || undefined,
      });
      const updatedUser = res.data.user || res.data;
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setCurrentEmail(updatedUser.email || trimmed);
      setProfile((prev) => ({ ...prev, email: updatedUser.email || trimmed }));
      setNewEmail("");
      setEmailCurrentPassword("");
      setEmailMessage("Email updated successfully.");
    } catch (err) {
      setEmailIsError(true);
      setEmailMessage(
        err?.response?.data?.message || "Failed to update email."
      );
    } finally {
      setSavingEmail(false);
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    setPwMessage("");
    setPwIsError(false);

    if (!pwCurrent) {
      setPwIsError(true);
      setPwMessage("Current password is required.");
      return;
    }
    if (!pwNew || pwNew.length < 8) {
      setPwIsError(true);
      setPwMessage("New password must be at least 8 characters.");
      return;
    }
    if (pwNew !== pwConfirm) {
      setPwIsError(true);
      setPwMessage("Password confirmation does not match.");
      return;
    }

    try {
      setSavingPw(true);
      await api.patch("/settings", {
        currentPassword: pwCurrent,
        newPassword: pwNew,
      });
      setPwCurrent("");
      setPwNew("");
      setPwConfirm("");
      setPwMessage("Password updated successfully.");
    } catch (err) {
      setPwIsError(true);
      setPwMessage(
        err?.response?.data?.message || "Failed to update password."
      );
    } finally {
      setSavingPw(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        icon={User}
        title="My profile"
        subtitle={
          isSupervisor
            ? "Manage your personal and professional information."
            : "Manage your personal and academic information."
        }
      />

      <Card>
        <CardBody>
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Full name" htmlFor="fullName">
              <div className="relative">
                <User
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  strokeWidth={2.5}
                />
                <Input
                  id="fullName"
                  value={profile.fullName}
                  onChange={update("fullName")}
                  className="pl-9"
                />
              </div>
            </Field>

            <Field label="Phone" htmlFor="phone">
              <div className="relative">
                <Phone
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  strokeWidth={2.5}
                />
                <Input
                  id="phone"
                  value={profile.phone}
                  onChange={update("phone")}
                  placeholder="+216 ..."
                  className="pl-9"
                />
              </div>
            </Field>

            {!isSupervisor && (
              <Field label="University" htmlFor="university">
                <div className="relative">
                  <GraduationCap
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                    strokeWidth={2.5}
                  />
                  <Input
                    id="university"
                    list="profile-universities"
                    value={profile.university}
                    onChange={update("university")}
                    placeholder="Your university"
                    className="pl-9"
                  />
                  <datalist id="profile-universities">
                    {tunisianUniversities.map((university) => (
                      <option key={university} value={university} />
                    ))}
                  </datalist>
                </div>
              </Field>
            )}

            {!isSupervisor && (
              <Field
                label="Specialty"
                htmlFor="specialty"
                className="md:col-span-2"
              >
                <div className="relative">
                  <Briefcase
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                    strokeWidth={2.5}
                  />
                  <Input
                    id="specialty"
                    value={profile.specialty}
                    onChange={update("specialty")}
                    placeholder="Your specialty"
                    className="pl-9"
                  />
                </div>
              </Field>
            )}

            {isStudent && (
              <Field
                label="Education field"
                htmlFor="educationField"
                className="md:col-span-2"
                hint="Defines which subjects you can see and apply to."
              >
                <Select
                  id="educationField"
                  value={profile.educationField}
                  onChange={update("educationField")}
                >
                  <option value="">Select your education field</option>
                  {EDUCATION_FIELD_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </Field>
            )}

            {isStudent && (
              <>
                <Field label="Degree level" htmlFor="degreeLevel">
                  <Select
                    id="degreeLevel"
                    value={profile.degreeLevel}
                    onChange={update("degreeLevel")}
                  >
                    <option value="">Select your degree level</option>
                    {DEGREE_LEVELS.map((value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </Select>
                </Field>

                <Field label="Academic year" htmlFor="academicYear">
                  <Select
                    id="academicYear"
                    value={profile.academicYear}
                    onChange={update("academicYear")}
                    disabled={!profile.degreeLevel}
                  >
                    <option value="">
                      {profile.degreeLevel
                        ? "Select your academic year"
                        : "Select a degree level first"}
                    </option>
                    {getAcademicYearOptions(profile.degreeLevel).map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </Select>
                </Field>

                <Field label="Internship type" htmlFor="internshipType">
                  <Select
                    id="internshipType"
                    value={profile.internshipType}
                    onChange={update("internshipType")}
                  >
                    <option value="">Select your internship type</option>
                    {INTERNSHIP_TYPES.map((value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </Select>
                </Field>

                <Field label="Desired start date" htmlFor="internshipStartDate">
                  <div className="relative">
                    <Calendar
                      className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                      strokeWidth={2.5}
                    />
                    <Input
                      id="internshipStartDate"
                      type="date"
                      value={profile.internshipStartDate}
                      onChange={update("internshipStartDate")}
                      className="pl-9"
                    />
                  </div>
                </Field>

                <Field label="Desired duration" htmlFor="desiredDuration">
                  <Select
                    id="desiredDuration"
                    value={profile.desiredDuration}
                    onChange={update("desiredDuration")}
                  >
                    <option value="">Select your desired duration</option>
                    {DESIRED_DURATIONS.map((value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </Select>
                </Field>
              </>
            )}

            {isSupervisor && (
              <>
                <Field label="Department" htmlFor="department">
                  <Select
                    id="department"
                    value={profile.department}
                    onChange={update("department")}
                  >
                    <option value="">Select your department</option>
                    {SUPERVISOR_DEPARTMENTS.map((value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </Select>
                </Field>

                <Field label="Rank" htmlFor="rank">
                  <Select
                    id="rank"
                    value={profile.rank}
                    onChange={update("rank")}
                  >
                    <option value="">Select your rank</option>
                    {SUPERVISOR_RANKS.map((value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </Select>
                </Field>

                <Field
                  label="Division"
                  htmlFor="division"
                  className="md:col-span-2"
                >
                  <Select
                    id="division"
                    value={profile.division}
                    onChange={update("division")}
                  >
                    <option value="">Select your division</option>
                    {SUPERVISOR_DIVISIONS.map((value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </Select>
                </Field>
              </>
            )}
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Button
              onClick={saveProfile}
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
        </CardBody>
      </Card>

<<<<<<< HEAD
      {(isStudent || isSupervisor) && (
=======
      {isStudent && (
>>>>>>> 8fd258754427456a9e996d340332bcb6a728e256
        <>
        <Card>
        <CardBody>
          <div className="mb-5">
            <h2 className="text-lg font-bold text-slate-900">Email settings</h2>
            <p className="text-sm text-slate-500">Update the email address used to sign in to your account.</p>
          </div>

          <form onSubmit={saveEmail} className="space-y-5">
            <Field label="Current email" htmlFor="currentEmail">
              <div className="relative">
                <Mail
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  strokeWidth={2.5}
                />
                <Input
                  id="currentEmail"
                  value={currentEmail}
                  disabled
                  className="bg-slate-50 pl-9 text-slate-500"
                />
              </div>
            </Field>

            <Field label="New email" htmlFor="newEmail">
              <div className="relative">
                <Mail
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  strokeWidth={2.5}
                />
                <Input
                  id="newEmail"
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="pl-9"
                />
              </div>
            </Field>

            <Field
              label="Current password"
              htmlFor="emailCurrentPassword"
              hint="Optional — enter your password to confirm the email change."
            >
              <div className="relative">
                <Lock
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  strokeWidth={2.5}
                />
                <Input
                  id="emailCurrentPassword"
                  type="password"
                  value={emailCurrentPassword}
                  onChange={(e) => setEmailCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-9"
                />
              </div>
            </Field>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Button
                type="submit"
                disabled={savingEmail}
                iconLeft={savingEmail ? undefined : Save}
              >
                {savingEmail ? "Saving..." : "Save email"}
              </Button>

              {emailMessage && (
                <span
                  className={`inline-flex items-center gap-1.5 text-sm font-semibold ${
                    emailIsError ? "text-rose-700" : "text-emerald-700"
                  }`}
                >
                  {emailIsError ? (
                    <AlertCircle className="h-4 w-4" strokeWidth={2.5} />
                  ) : (
                    <CheckCircle2 className="h-4 w-4" strokeWidth={2.5} />
                  )}
                  {emailMessage}
                </span>
              )}
            </div>
          </form>
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <div className="mb-5">
            <h2 className="text-lg font-bold text-slate-900">Change password</h2>
            <p className="text-sm text-slate-500">Choose a strong password of at least 8 characters.</p>
          </div>

          <form onSubmit={savePassword} className="space-y-5">
            <Field label="Current password" htmlFor="pwCurrent">
              <div className="relative">
                <Lock
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  strokeWidth={2.5}
                />
                <Input
                  id="pwCurrent"
                  type="password"
                  value={pwCurrent}
                  onChange={(e) => setPwCurrent(e.target.value)}
                  placeholder="••••••••"
                  className="pl-9"
                  autoComplete="current-password"
                />
              </div>
            </Field>

            <Field label="New password" htmlFor="pwNew">
              <div className="relative">
                <Lock
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  strokeWidth={2.5}
                />
                <Input
                  id="pwNew"
                  type="password"
                  value={pwNew}
                  onChange={(e) => setPwNew(e.target.value)}
                  placeholder="At least 8 characters"
                  className="pl-9"
                  autoComplete="new-password"
                />
              </div>
            </Field>

            <Field label="Confirm new password" htmlFor="pwConfirm">
              <div className="relative">
                <Lock
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  strokeWidth={2.5}
                />
                <Input
                  id="pwConfirm"
                  type="password"
                  value={pwConfirm}
                  onChange={(e) => setPwConfirm(e.target.value)}
                  placeholder="Repeat new password"
                  className="pl-9"
                  autoComplete="new-password"
                />
              </div>
            </Field>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Button
                type="submit"
                disabled={savingPw}
                iconLeft={savingPw ? undefined : Save}
              >
                {savingPw ? "Saving..." : "Save password"}
              </Button>

              {pwMessage && (
                <span
                  className={`inline-flex items-center gap-1.5 text-sm font-semibold ${
                    pwIsError ? "text-rose-700" : "text-emerald-700"
                  }`}
                >
                  {pwIsError ? (
                    <AlertCircle className="h-4 w-4" strokeWidth={2.5} />
                  ) : (
                    <CheckCircle2 className="h-4 w-4" strokeWidth={2.5} />
                  )}
                  {pwMessage}
                </span>
              )}
            </div>
          </form>
        </CardBody>
      </Card>
        </>
      )}
    </div>
  );
}

export default MonProfile;
