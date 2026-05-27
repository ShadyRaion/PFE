import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FileText,
  Upload,
  Trash2,
  Plus,
  X,
  Save,
  Info,
  CheckCircle2,
  Languages,
  Sparkles,
  Award,
  Wrench,
  Target,
  AlertCircle,
  Download,
  Eye,
  EyeOff,
} from "lucide-react";
import api from "../../api/axios";
import mammoth from "mammoth/mammoth.browser";
import {
  PageHeader,
  Card,
  CardHeader,
  CardBody,
  Button,
  Field,
  Input,
  Badge,
  LoadingState,
} from "../../components/ui";

function MonCV() {
  const [cv, setCv] = useState(null);
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [savingSkills, setSavingSkills] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [skillInput, setSkillInput] = useState("");
  const [editableSkills, setEditableSkills] = useState([]);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [previewContentType, setPreviewContentType] = useState("");
  const [previewHtml, setPreviewHtml] = useState("");
  const [loadingPreview, setLoadingPreview] = useState(false);

  const normalizeSkill = (value) => {
    return String(value || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9#+.]/g, "");
  };

  const sortedSkills = useMemo(() => {
    return [...editableSkills].sort((a, b) =>
      String(a).localeCompare(String(b), "en", { sensitivity: "base" })
    );
  }, [editableSkills]);

  const originalSkills = useMemo(() => {
    return Array.isArray(cv?.extractedSkills) ? cv.extractedSkills : [];
  }, [cv]);

  const profileStats = useMemo(() => {
    const data = cv?.extractedData || {};
    return {
      technical: Array.isArray(data.technicalSkills)
        ? data.technicalSkills.length
        : 0,
      tools: Array.isArray(data.tools) ? data.tools.length : 0,
      languages: Array.isArray(data.languages) ? data.languages.length : 0,
      certifications: Array.isArray(data.certifications)
        ? data.certifications.length
        : 0,
      domains: Array.isArray(data.domainSkills) ? data.domainSkills : [],
    };
  }, [cv]);

  const cvStrength = useMemo(() => {
    const data = cv?.extractedData;
    if (!data) return null;

    const checks = [
      {
        label: "5+ technical skills",
        points: 25,
        ok: (data.technicalSkills?.length || 0) >= 5,
      },
      {
        label: "Languages with level",
        points: 20,
        ok:
          Array.isArray(data.languages) &&
          data.languages.some((l) => l.level && l.level !== "Unknown"),
      },
      { label: "Tools", points: 15, ok: (data.tools?.length || 0) > 0 },
      {
        label: "Certifications",
        points: 15,
        ok: (data.certifications?.length || 0) > 0,
      },
      {
        label: "Domain expertise",
        points: 25,
        ok: (data.domainSkills?.length || 0) > 0,
      },
    ];

    const score = checks.reduce((sum, c) => sum + (c.ok ? c.points : 0), 0);
    return { score, checks };
  }, [cv]);

  const skillsChanged = useMemo(() => {
    const current = editableSkills.map(normalizeSkill).sort();
    const original = originalSkills.map(normalizeSkill).sort();

    if (current.length !== original.length) return true;

    return current.some((skill, index) => skill !== original[index]);
  }, [editableSkills, originalSkills]);

  const fetchCV = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/cv/me");
      const nextCv = res.data || null;
      setCv(nextCv);
      setEditableSkills(
        Array.isArray(nextCv?.extractedSkills) ? nextCv.extractedSkills : []
      );
    } catch {
      setCv(null);
      setEditableSkills([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(fetchCV);
  }, [fetchCV]);

  useEffect(() => {
    return () => {
      if (previewUrl) window.URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const downloadCV = async () => {
    if (!cv?.id) return;

    try {
      const res = await api.get(`/cv/file/${cv.id}`, { responseType: "blob" });

      const contentType =
        res.headers["content-type"] || "application/octet-stream";

      const blob = new Blob([res.data], { type: contentType });

      const fileURL = window.URL.createObjectURL(blob);

      const link = window.document.createElement("a");
      link.href = fileURL;
      link.download = cv.originalName || "cv";
      window.document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(fileURL);
    } catch {
      setIsError(true);
      setMessage("Error while saving the Resume.");
    }
  };

  const togglePreview = async () => {
    if (previewUrl || previewHtml) {
      if (previewUrl) window.URL.revokeObjectURL(previewUrl);
      setPreviewUrl("");
      setPreviewContentType("");
      setPreviewHtml("");
      return;
    }

    if (!cv?.id) return;

    try {
      setLoadingPreview(true);
      setIsError(false);
      setMessage("");

      const res = await api.get(`/cv/file/${cv.id}`, { responseType: "blob" });
      const contentType =
        res.headers["content-type"] || "application/octet-stream";
      const blob = new Blob([res.data], { type: contentType });

      const isDocx =
        contentType.includes(
          "vnd.openxmlformats-officedocument.wordprocessingml.document"
        ) || /\.docx$/i.test(cv.originalName || "");

      if (isDocx) {
        const arrayBuffer = await blob.arrayBuffer();
        const result = await mammoth.convertToHtml({ arrayBuffer });
        setPreviewHtml(result.value || "<p>(Empty document)</p>");
        setPreviewContentType(contentType);
      } else {
        const fileURL = window.URL.createObjectURL(blob);
        setPreviewUrl(fileURL);
        setPreviewContentType(contentType);
      }
    } catch {
      setIsError(true);
      setMessage("Error while loading the preview.");
    } finally {
      setLoadingPreview(false);
    }
  };

  const uploadCV = async (e) => {
    e.preventDefault();

    if (!file) {
      setIsError(true);
      setMessage("Please choose a file.");
      return;
    }

    try {
      setUploading(true);
      setIsError(false);
      setMessage("");

      const token = localStorage.getItem("token");

      if (!token) {
        setIsError(true);
        setMessage("Your session is missing. Please log in again.");
        return;
      }

      const formData = new FormData();
      formData.append("cv", file);

      const res = await api.post("/cv/upload", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const nextCv = res.data.cv || null;
      setCv(nextCv);
      setEditableSkills(
        Array.isArray(nextCv?.extractedSkills) ? nextCv.extractedSkills : []
      );
      setMessage("Resume uploaded successfully.");
      setFile(null);

      const input = document.getElementById("cv-file-input");
      if (input) input.value = "";
    } catch (error) {
      const details =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message;

      console.error("CV upload failed:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });

      setIsError(true);
      setMessage(
        details
          ? `Error while uploading the Resume: ${details}`
          : "Error while uploading the Resume."
      );
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);

    const droppedFile = e.dataTransfer?.files?.[0];
    if (droppedFile) {
      setFile(droppedFile);
      setMessage("");
    }
  };

  const deleteCV = async () => {
    if (!cv?.id) return;

    try {
      await api.delete(`/cv/${cv.id}`);
      setMessage("Resume deleted.");
      setIsError(false);
      setCv(null);
      setFile(null);
      setEditableSkills([]);
      setSkillInput("");
      setConfirmingDelete(false);
      if (previewUrl) window.URL.revokeObjectURL(previewUrl);
      setPreviewUrl("");
      setPreviewContentType("");
      setPreviewHtml("");
    } catch {
      setIsError(true);
      setMessage("Error while deleting.");
      setConfirmingDelete(false);
    }
  };

  const addSkill = () => {
    const value = skillInput.trim();
    if (!value) return;

    const alreadyExists = editableSkills.some(
      (skill) => normalizeSkill(skill) === normalizeSkill(value)
    );

    if (alreadyExists) {
      setSkillInput("");
      return;
    }

    setEditableSkills((prev) => [...prev, value]);
    setSkillInput("");
  };

  const removeSkill = (skillToRemove) => {
    setEditableSkills((prev) =>
      prev.filter(
        (skill) => normalizeSkill(skill) !== normalizeSkill(skillToRemove)
      )
    );
  };

  const handleSkillInputKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill();
    }
  };

  const saveSkills = async () => {
    if (!cv?.id || !skillsChanged) return;

    try {
      setSavingSkills(true);
      setIsError(false);
      setMessage("");

      const res = await api.patch("/cv/skills", { skills: editableSkills });

      const nextCv = res.data.cv || null;
      setCv(nextCv);
      setEditableSkills(
        Array.isArray(nextCv?.extractedSkills) ? nextCv.extractedSkills : []
      );
      setMessage("Skills updated.");
    } catch {
      setIsError(true);
      setMessage("Error while editing skills.");
    } finally {
      setSavingSkills(false);
    }
  };

  const resetSkills = () => {
    setEditableSkills(originalSkills);
    setSkillInput("");
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          icon={FileText}
          title="My Resume"
          subtitle="Review, open, replace, or delete your Resume."
        />
        <LoadingState label="Loading Resume..." />
      </div>
    );
  }

  const strengthColor =
    !cvStrength
      ? "text-slate-400"
      : cvStrength.score >= 75
      ? "text-emerald-600"
      : cvStrength.score >= 50
      ? "text-amber-600"
      : "text-rose-600";

  const strengthBar =
    !cvStrength
      ? "bg-slate-300"
      : cvStrength.score >= 75
      ? "bg-emerald-500"
      : cvStrength.score >= 50
      ? "bg-amber-500"
      : "bg-rose-500";

  return (
    <div className="space-y-6">
      <PageHeader
        icon={FileText}
        title="My Resume"
        subtitle="Review, open, replace, or delete your Resume."
      />

      {message && (
        <div
          className={`flex items-start gap-2 rounded-xl border px-4 py-3 text-sm font-semibold ${
            isError
              ? "border-rose-200 bg-rose-50 text-rose-700"
              : "border-cyan-200 bg-cyan-50 text-cyan-700"
          }`}
        >
          {isError ? (
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2.5} />
          ) : (
            <Info className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2.5} />
          )}
          <span>{message}</span>
        </div>
      )}

      {cv ? (
        <Card>
          <CardBody>
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-black uppercase tracking-widest text-cyan-700">
                  Current Resume
                </p>
                <h2 className="mt-2 inline-flex items-center gap-2 break-all text-2xl font-black text-slate-950">
                  <FileText className="h-6 w-6 shrink-0 text-cyan-700" strokeWidth={2.5} />
                  {cv.originalName || cv.fileName || "Resume"}
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  Uploaded on{" "}
                  {cv.uploadedAt
                    ? new Date(cv.uploadedAt).toLocaleString()
                    : cv.createdAt
                    ? new Date(cv.createdAt).toLocaleString()
                    : "-"}
                </p>
              </div>

              <div className="flex shrink-0 flex-wrap gap-2">
                <Button
                  variant="secondary"
                  onClick={togglePreview}
                  disabled={loadingPreview}
                  iconLeft={previewUrl || previewHtml ? EyeOff : Eye}
                >
                  {loadingPreview
                    ? "Loading..."
                    : previewUrl || previewHtml
                    ? "Hide preview"
                    : "Preview"}
                </Button>
                <Button onClick={downloadCV} iconLeft={Download}>
                  Save
                </Button>
                <Button
                  variant="danger"
                  iconLeft={Trash2}
                  onClick={() => setConfirmingDelete(true)}
                >
                  Delete
                </Button>
              </div>
            </div>

            {(previewUrl || previewHtml) && (
              <div className="mt-5 overflow-hidden rounded-xl border border-[#cfe1e8] bg-slate-50">
                {previewHtml ? (
                  <div
                    className="docx-preview max-h-[720px] overflow-y-auto bg-white px-8 py-6 text-slate-800"
                    dangerouslySetInnerHTML={{ __html: previewHtml }}
                  />
                ) : previewContentType.includes("pdf") ||
                  previewContentType.includes("image") ? (
                  <iframe
                    src={previewUrl}
                    title={cv.originalName || "Resume preview"}
                    className="h-[720px] w-full bg-white"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center gap-3 px-6 py-10 text-center">
                    <FileText
                      className="h-10 w-10 text-cyan-700"
                      strokeWidth={2}
                    />
                    <p className="text-sm font-bold text-slate-700">
                      Inline preview is not available for this file type.
                    </p>
                    <p className="text-xs text-slate-500">
                      Use the Save button to download the file.
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardBody>
        </Card>
      ) : (
        <Card>
          <CardBody>
            <h2 className="inline-flex items-center gap-2 text-xl font-black text-slate-950">
              <FileText className="h-5 w-5 text-cyan-700" strokeWidth={2.5} />
              Add your Resume
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Add a PDF or DOCX file to generate your recommendations.
            </p>
          </CardBody>
        </Card>
      )}

      {cv?.extractedData && cvStrength && (
        <section className="grid gap-5 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <h3 className="inline-flex items-center gap-2 text-base font-black text-slate-950">
                <Sparkles className="h-5 w-5 text-cyan-700" strokeWidth={2.5} />
                Profile summary
              </h3>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div>
                  <p className="text-3xl font-black text-cyan-700">
                    {profileStats.technical}
                  </p>
                  <p className="mt-0.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Technical
                  </p>
                </div>
                <div>
                  <p className="text-3xl font-black text-cyan-700">
                    {profileStats.tools}
                  </p>
                  <p className="mt-0.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Tools
                  </p>
                </div>
                <div>
                  <p className="text-3xl font-black text-cyan-700">
                    {profileStats.languages}
                  </p>
                  <p className="mt-0.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Languages
                  </p>
                </div>
                <div>
                  <p className="text-3xl font-black text-cyan-700">
                    {profileStats.certifications}
                  </p>
                  <p className="mt-0.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Certifications
                  </p>
                </div>
              </div>

              {profileStats.domains.length > 0 && (
                <div className="mt-5 border-t border-[#e2edf2] pt-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Dominant domain
                  </p>
                  <p className="mt-1.5 text-sm font-bold text-slate-800">
                    {profileStats.domains.slice(0, 2).join(" · ")}
                  </p>
                </div>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-baseline justify-between">
                <h3 className="inline-flex items-center gap-2 text-base font-black text-slate-950">
                  <Target className="h-5 w-5 text-cyan-700" strokeWidth={2.5} />
                  Resume strength
                </h3>
                <span className={`text-3xl font-black ${strengthColor}`}>
                  {cvStrength.score}
                  <span className="text-sm font-bold text-slate-400">/100</span>
                </span>
              </div>
            </CardHeader>
            <CardBody>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full transition-all ${strengthBar}`}
                  style={{ width: `${cvStrength.score}%` }}
                />
              </div>

              <ul className="mt-4 space-y-1.5">
                {cvStrength.checks.map((c) => (
                  <li
                    key={c.label}
                    className="flex items-center gap-2 text-xs"
                  >
                    {c.ok ? (
                      <CheckCircle2
                        className="h-3.5 w-3.5 text-emerald-600"
                        strokeWidth={2.5}
                      />
                    ) : (
                      <span className="h-3.5 w-3.5 rounded-full border-2 border-slate-300" />
                    )}
                    <span
                      className={
                        c.ok
                          ? "font-semibold text-slate-700"
                          : "text-slate-500"
                      }
                    >
                      {c.label}
                    </span>
                    <span className="ml-auto font-bold text-slate-400">
                      +{c.points}
                    </span>
                  </li>
                ))}
              </ul>
            </CardBody>
          </Card>
        </section>
      )}

      {cv && (
        <Card>
          <CardHeader>
            <h3 className="inline-flex items-center gap-2 text-base font-black text-slate-950">
              <Sparkles className="h-5 w-5 text-cyan-700" strokeWidth={2.5} />
              Detected skills
            </h3>
          </CardHeader>
          <CardBody>
            <div className="flex flex-wrap gap-1.5">
              {sortedSkills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center rounded-md bg-cyan-50 px-3 py-1.5 text-sm font-bold text-cyan-700"
                >
                  {skill}
                </span>
              ))}

              {sortedSkills.length === 0 && (
                <p className="text-sm text-slate-500">No extracted skills.</p>
              )}
            </div>

            {cv.extractedData && (
              <div className="mt-6 space-y-5 border-t border-[#e2edf2] pt-5">
                {Array.isArray(cv.extractedData.languages) &&
                  cv.extractedData.languages.length > 0 && (
                    <div>
                      <h4 className="mb-2 inline-flex items-center gap-1.5 text-sm font-bold text-slate-700">
                        <Languages className="h-4 w-4 text-indigo-600" strokeWidth={2.5} />
                        Languages
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {cv.extractedData.languages.map((lang) => (
                          <Badge key={lang.name} variant="indigo">
                            {lang.name}
                            {lang.level && lang.level !== "Unknown" && (
                              <span className="ml-1.5 rounded bg-indigo-200 px-1.5 py-0.5 text-[10px] font-bold text-indigo-900">
                                {lang.level}
                              </span>
                            )}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                {Array.isArray(cv.extractedData.softSkills) &&
                  cv.extractedData.softSkills.length > 0 && (
                    <div>
                      <h4 className="mb-2 inline-flex items-center gap-1.5 text-sm font-bold text-slate-700">
                        <Sparkles className="h-4 w-4 text-emerald-600" strokeWidth={2.5} />
                        Soft skills
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {cv.extractedData.softSkills.map((s) => (
                          <Badge key={s} variant="success">
                            {s}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                {Array.isArray(cv.extractedData.tools) &&
                  cv.extractedData.tools.length > 0 && (
                    <div>
                      <h4 className="mb-2 inline-flex items-center gap-1.5 text-sm font-bold text-slate-700">
                        <Wrench className="h-4 w-4 text-slate-600" strokeWidth={2.5} />
                        Tools
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {cv.extractedData.tools.map((t) => (
                          <Badge key={t} variant="neutral">
                            {t}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                {Array.isArray(cv.extractedData.domainSkills) &&
                  cv.extractedData.domainSkills.length > 0 && (
                    <div>
                      <h4 className="mb-2 inline-flex items-center gap-1.5 text-sm font-bold text-slate-700">
                        <Target className="h-4 w-4 text-amber-600" strokeWidth={2.5} />
                        Domain expertise
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {cv.extractedData.domainSkills.map((d) => (
                          <Badge key={d} variant="warning">
                            {d}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                {Array.isArray(cv.extractedData.certifications) &&
                  cv.extractedData.certifications.length > 0 && (
                    <div>
                      <h4 className="mb-2 inline-flex items-center gap-1.5 text-sm font-bold text-slate-700">
                        <Award className="h-4 w-4 text-rose-600" strokeWidth={2.5} />
                        Certifications
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {cv.extractedData.certifications.map((c) => (
                          <Badge key={c} variant="danger">
                            {c}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                {cv.extractedData.detectedLanguage &&
                  cv.extractedData.detectedLanguage !== "unknown" && (
                    <p className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                      <Info className="h-3.5 w-3.5" strokeWidth={2.5} />
                      Resume language detected:{" "}
                      <span className="font-bold uppercase text-slate-700">
                        {cv.extractedData.detectedLanguage}
                      </span>
                    </p>
                  )}
              </div>
            )}
          </CardBody>
        </Card>
      )}

      <Card>
        <CardHeader>
          <h2 className="inline-flex items-center gap-2 text-base font-black text-slate-950">
            <Upload className="h-5 w-5 text-cyan-700" strokeWidth={2.5} />
            {cv ? "Replace Resume" : "Upload Resume"}
          </h2>
        </CardHeader>
        <CardBody>
          <form onSubmit={uploadCV}>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              className={`flex min-h-[140px] flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-5 py-6 text-center transition ${
                dragActive
                  ? "border-cyan-700 bg-cyan-50"
                  : "border-[#cfe1e8] bg-slate-50"
              }`}
            >
              <Upload
                className="h-8 w-8 text-cyan-700"
                strokeWidth={2}
              />
              <p className="text-sm font-bold text-slate-700">
                Drag and drop your Resume here, or browse
              </p>
              <input
                id="cv-file-input"
                type="file"
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="block max-w-full text-xs text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-cyan-700 file:px-4 file:py-2 file:text-sm file:font-bold file:text-white hover:file:bg-cyan-800"
              />
              {file && (
                <p className="inline-flex items-center gap-1.5 break-all text-xs font-semibold text-cyan-700">
                  <FileText className="h-3.5 w-3.5" strokeWidth={2.5} />
                  {file.name}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={uploading}
              iconLeft={uploading ? undefined : Upload}
              className="mt-5"
            >
              {uploading ? "Analyzing Resume..." : cv ? "Replace" : "Upload"}
            </Button>
          </form>
        </CardBody>
      </Card>

      {confirmingDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-md">
            <CardBody>
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                  <Trash2 className="h-5 w-5" strokeWidth={2.5} />
                </span>
                <div>
                  <h3 className="text-lg font-black text-slate-950">
                    Delete your Resume?
                  </h3>
                  <p className="mt-1 text-sm text-slate-600">
                    Your recommendations will no longer be available until you
                    upload a new Resume.
                  </p>
                </div>
              </div>
              <div className="mt-5 flex justify-end gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  iconLeft={X}
                  onClick={() => setConfirmingDelete(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  iconLeft={Trash2}
                  onClick={deleteCV}
                >
                  Delete
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
}

export default MonCV;
