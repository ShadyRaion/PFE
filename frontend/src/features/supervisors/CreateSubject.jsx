import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  FileText,
  Upload,
  CheckCircle2,
  AlertCircle,
  Paperclip,
} from "lucide-react";
import api from "../../api/axios";
import {
  PageHeader,
  Card,
  CardBody,
  Button,
  Field,
  Input,
  Textarea,
  Select,
} from "../../components/ui";
import { EDUCATION_FIELD_OPTIONS } from "../../constants/educationFields";
import {
  INTERNSHIP_TYPE_OPTIONS,
  DEGREE_LEVELS,
  ACADEMIC_YEAR_OPTIONS,
} from "../../constants/profileFields";

function CreateSubject() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    description: "",
    duration: "",
    places: "",
    technologies: "",
    requiredSkills: "",
    languages: "",
    educationField: "",
    internshipType: "",
    allowedDegreeLevels: [],
    allowedAcademicYears: [],
  });

  const [documents, setDocuments] = useState([]);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [creating, setCreating] = useState(false);

  const updateField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const toggleMultiValue = (field, value) => {
    setForm((prev) => {
      const arr = prev[field] || [];
      return {
        ...prev,
        [field]: arr.includes(value)
          ? arr.filter((v) => v !== value)
          : [...arr, value],
      };
    });
  };

  const uploadDocuments = async (subjectId) => {
    if (!documents || documents.length === 0) return;

    const formData = new FormData();

    Array.from(documents).forEach((file) => {
      formData.append("documents", file);
    });

    await api.post(`/subject-documents/${subjectId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  };

  const createSubject = async (e) => {
    e.preventDefault();
    if (creating) return;

    if (!form.educationField) {
      setIsError(true);
      setMessage("Please choose the education field for this subject.");
      return;
    }

    if (!form.internshipType) {
      setIsError(true);
      setMessage("Please choose the internship type for this subject.");
      return;
    }

    if (!Number.isInteger(Number(form.places)) || Number(form.places) < 1) {
      setIsError(true);
      setMessage("Please enter a valid number of places.");
      return;
    }

    try {
      setCreating(true);
      setMessage("");
      setIsError(false);

      const res = await api.post("/subjects", {
        title: form.title,
        description: form.description,
        duration: form.duration,
        places: Number(form.places),
        educationField: form.educationField,
        internshipType: form.internshipType,
        allowedDegreeLevels: form.allowedDegreeLevels,
        allowedAcademicYears: form.allowedAcademicYears,
        technologies: form.technologies
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        requiredSkills: form.requiredSkills
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        languages: form.languages
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      });

      const subject = res.data.subject || res.data;

      await uploadDocuments(subject.id);

      setMessage("Subject created successfully.");
      setForm({
        title: "",
        description: "",
        duration: "",
        places: "",
        technologies: "",
        requiredSkills: "",
        languages: "",
        educationField: "",
        internshipType: "",
        allowedDegreeLevels: [],
        allowedAcademicYears: [],
      });
      setDocuments([]);
      navigate("/encadrant/my-subjects");
    } catch (error) {
      setIsError(true);
      setMessage(
        error?.response?.data?.message || "Error while creating."
      );
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Plus}
        title="Create subject"
        subtitle="Create a final-year project subject and add the required documents directly."
      />

      {message && (
        <div
          className={`flex items-start gap-2 rounded-xl border px-4 py-3 text-sm font-semibold ${
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

      <Card className="max-w-4xl">
        <CardBody>
          <form onSubmit={createSubject} className="space-y-5">
            <Field label="Title" htmlFor="title">
              <Input
                id="title"
                value={form.title}
                onChange={(e) => updateField("title", e.target.value)}
                required
                placeholder="Subject title"
              />
            </Field>

            <Field label="Description" htmlFor="description">
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => updateField("description", e.target.value)}
                required
                rows={8}
                placeholder="Detailed subject description"
              />
            </Field>

            <Field label="Duration" htmlFor="duration" required>
              <Select
                id="duration"
                value={form.duration}
                onChange={(e) => updateField("duration", e.target.value)}
                required
              >
                <option value="">Select a duration</option>
                <option value="1 month">1 month</option>
                <option value="2 months">2 months</option>
                <option value="3 months">3 months</option>
                <option value="4 months">4 months</option>
                <option value="5 months">5 months</option>
                <option value="6 months">6 months</option>
                <option value="6+ months">6+ months</option>
              </Select>
            </Field>

            <Field label="Places" htmlFor="places" required>
              <Input
                id="places"
                type="number"
                min="1"
                step="1"
                value={form.places}
                onChange={(e) => updateField("places", e.target.value)}
                required
                placeholder="Number of available places"
              />
            </Field>

            <Field
              label="Education field"
              htmlFor="educationField"
              hint="Only students in this field will see and be able to apply."
            >
              <Select
                id="educationField"
                value={form.educationField}
                onChange={(e) => updateField("educationField", e.target.value)}
                required
              >
                <option value="">Select an education field</option>
                {EDUCATION_FIELD_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </Field>

            <Field
              label="Internship type"
              htmlFor="internshipType"
              hint="Only students whose internship matches this type can apply."
            >
              <Select
                id="internshipType"
                value={form.internshipType}
                onChange={(e) => updateField("internshipType", e.target.value)}
                required
              >
                <option value="">Select an internship type</option>
                {INTERNSHIP_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </Field>

            <Field
              label="Allowed degree levels"
              hint="Leave all unchecked to allow every degree level."
            >
              <div className="flex flex-wrap gap-3">
                {DEGREE_LEVELS.map((level) => (
                  <label
                    key={level}
                    className="inline-flex items-center gap-2 rounded-lg border border-[#cfe1e8] bg-white px-3 py-1.5 text-sm font-semibold text-slate-700"
                  >
                    <input
                      type="checkbox"
                      checked={form.allowedDegreeLevels.includes(level)}
                      onChange={() =>
                        toggleMultiValue("allowedDegreeLevels", level)
                      }
                    />
                    {level}
                  </label>
                ))}
              </div>
            </Field>

            <Field
              label="Allowed academic years"
              hint="Leave all unchecked to allow every academic year."
            >
              <div className="flex flex-wrap gap-3">
                {ACADEMIC_YEAR_OPTIONS.map((opt) => (
                  <label
                    key={opt.value}
                    className="inline-flex items-center gap-2 rounded-lg border border-[#cfe1e8] bg-white px-3 py-1.5 text-sm font-semibold text-slate-700"
                  >
                    <input
                      type="checkbox"
                      checked={form.allowedAcademicYears.includes(opt.value)}
                      onChange={() =>
                        toggleMultiValue("allowedAcademicYears", opt.value)
                      }
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </Field>

            <Field
              label="Technologies"
              htmlFor="technologies"
              hint="Separated by commas"
            >
              <Input
                id="technologies"
                value={form.technologies}
                onChange={(e) => updateField("technologies", e.target.value)}
                placeholder="React, Node.js, PostgreSQL"
              />
            </Field>

            <Field
              label="Required skills"
              htmlFor="requiredSkills"
              hint="Separated by commas"
            >
              <Input
                id="requiredSkills"
                value={form.requiredSkills}
                onChange={(e) => updateField("requiredSkills", e.target.value)}
                placeholder="JavaScript, API REST, SQL"
              />
            </Field>

            <Field
              label="Languages"
              htmlFor="languages"
              hint="Separated by commas"
            >
              <Input
                id="languages"
                value={form.languages}
                onChange={(e) => updateField("languages", e.target.value)}
                placeholder="French, English, Arabic"
              />
            </Field>

            <div className="rounded-2xl border-2 border-dashed border-[#cfe1e8] bg-slate-50 p-6">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700">
                  <Upload className="h-4 w-4" strokeWidth={2.5} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-slate-950">
                    Subject documents
                  </p>
                  <p className="mt-0.5 text-sm text-slate-500">
                    Add specifications, PDF, Word, images, or other files.
                  </p>

                  <input
                    type="file"
                    multiple
                    onChange={(e) => setDocuments(e.target.files)}
                    className="mt-4 block w-full rounded-xl border border-[#cfe1e8] bg-white px-4 py-2.5 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-cyan-700 file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-white hover:file:bg-cyan-800"
                  />

                  {documents?.length > 0 && (
                    <div className="mt-3 space-y-1.5">
                      {Array.from(documents).map((file) => (
                        <div
                          key={file.name}
                          className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-slate-700"
                        >
                          <Paperclip className="h-3 w-3 text-slate-400" strokeWidth={2.5} />
                          {file.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                disabled={creating}
                iconLeft={creating ? undefined : FileText}
              >
                {creating ? "Creating..." : "Create subject"}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}

export default CreateSubject;
