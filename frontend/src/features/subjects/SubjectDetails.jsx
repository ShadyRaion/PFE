import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  User,
  FileText,
  AlertCircle,
  CheckCircle2,
  Mail,
  Send,
  Info,
<<<<<<< HEAD
  Clock,
=======
>>>>>>> 8fd258754427456a9e996d340332bcb6a728e256
} from "lucide-react";
import api from "../../api/axios";
import useSessionUser from "../../hooks/useSessionUser";
import { getEducationFieldLabel } from "../../constants/educationFields";
import {
  Card,
  CardBody,
  CardHeader,
  Badge,
  ScoreBadge,
  Button,
  LoadingState,
} from "../../components/ui";

function SubjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useSessionUser();
  const isStudent = user?.role === "STUDENT";

  const [subject, setSubject] = useState(null);
  const [applications, setApplications] = useState([]);
  const [message, setMessage] = useState("");
  const [hasBinome, setHasBinome] = useState(false);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);

  const normalizeSkill = (value) =>
    String(value || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9#+.]/g, "");

  const skillMatches = (skill) => {
    const matchedSkills = (subject?.matchedSkills || []).map(normalizeSkill);
    return matchedSkills.includes(normalizeSkill(skill));
  };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setMessage("");

      const subjectRes = await api.get(`/subjects/${id}`);
      setSubject(subjectRes.data);

      try {
        const applicationsRes = await api.get("/applications/me");
        setApplications(
          Array.isArray(applicationsRes.data) ? applicationsRes.data : []
        );
      } catch {
        setApplications([]);
      }

      try {
        const binomeRes = await api.get("/binome/me");
        setHasBinome(Boolean(binomeRes.data));
      } catch {
        setHasBinome(false);
      }
    } catch {
      setMessage("Subject not found.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    queueMicrotask(fetchData);
  }, [fetchData]);

  const openDocument = async (document) => {
    try {
      const res = await api.get(`/subject-documents/open/${document.id}`, {
        responseType: "blob",
      });

      const contentType =
        res.headers["content-type"] ||
        document.fileType ||
        "application/octet-stream";

      const blob = new Blob([res.data], { type: contentType });
      const fileURL = window.URL.createObjectURL(blob);

      if (contentType.includes("pdf") || contentType.includes("image")) {
        window.open(fileURL, "_blank");
        return;
      }

      const link = window.document.createElement("a");
      link.href = fileURL;
      link.download = document.originalName || "document";
      window.document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(fileURL);
    } catch {
      setMessage("Error opening document.");
    }
  };

  const activeApplicationStatuses = ["PENDING", "APPROVED", "AFFECTED"];

  const applicationOnThisSubject = applications.find(
    (app) => app.subjectId === id
  );

  const alreadyApplied = applications.some(
    (app) =>
      app.subjectId === id && activeApplicationStatuses.includes(app.status)
  );

  const canReapply =
    applicationOnThisSubject &&
    ["REJECTED", "CANCELLED"].includes(applicationOnThisSubject.status);

  const affectedApplication = applications.find((app) =>
    ["AFFECTED", "APPROVED"].includes(app.status)
  );

  const facultyApplicationLock = subject?.facultyApplicationLock;
  const isLockedByFaculty = Boolean(facultyApplicationLock?.isLocked);

  const fieldMismatch =
    isStudent &&
    subject?.educationField &&
    user?.educationField &&
    subject.educationField !== user.educationField;

  const cannotApplyReason = (() => {
    if (fieldMismatch) {
      return `You can only apply to subjects in your education field (${
        getEducationFieldLabel(user?.educationField) || "your field"
      }).`;
    }
    if (alreadyApplied) return "You have already applied to this subject.";
    if (affectedApplication) return "You are already assigned to a subject.";
    if (isLockedByFaculty) {
      return (
        facultyApplicationLock?.message ||
        "You cannot apply because someone from your faculty is already working on this subject."
      );
    }
    return "";
  })();

  const applyToSubject = async () => {
    if (cannotApplyReason) {
      setMessage(cannotApplyReason);
      return;
    }
    try {
      setApplying(true);
      setMessage("");
      await api.post("/applications", { subjectId: id });
      setMessage("Application sent.");
      await fetchData();
    } catch (error) {
      setMessage(error.response?.data?.message || "Error while applying.");
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return <LoadingState label="Loading subject..." />;
  }

  if (!subject) {
    return (
      <Card>
        <CardBody>
          <div className="flex items-start gap-2 text-rose-700">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" strokeWidth={2.5} />
            <p className="font-semibold">{message}</p>
          </div>
          <Button
            onClick={() => navigate("/subjects")}
            className="mt-4"
            iconLeft={ArrowLeft}
          >
            Back to catalog
          </Button>
        </CardBody>
      </Card>
    );
  }

  const buttonLabel = applying
    ? "Sending..."
    : alreadyApplied
    ? "Already applied"
    : affectedApplication
    ? "Already assigned"
    : isLockedByFaculty
    ? "Locked by faculty"
    : canReapply
    ? "Apply again"
    : hasBinome
    ? "Apply as team"
    : "Apply";

  return (
    <div className="space-y-6">
      <Link
        to="/subjects"
        className="inline-flex items-center gap-2 text-sm font-bold text-cyan-700 hover:underline"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={2.5} />
        Back to catalog
      </Link>

      <div className="grid gap-6 xl:grid-cols-3">
        <section className="space-y-6 xl:col-span-2">
          <Card>
            <CardBody>
              <p className="text-xs font-black uppercase tracking-widest text-cyan-700">
                PFE Subject
              </p>
              <h1 className="mt-2 text-3xl font-black leading-tight text-slate-950 sm:text-4xl">
                {subject.title}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-slate-600">
                <span className="inline-flex items-center gap-1.5">
                  <User className="h-4 w-4" strokeWidth={2.5} />
                  Proposed by{" "}
                  <span className="font-bold text-slate-900">
                    {subject.supervisor?.fullName || "Supervisor STB"}
                  </span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" strokeWidth={2.5} />
                  {new Date(subject.createdAt).toLocaleDateString()}
                </span>
<<<<<<< HEAD
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-4 w-4" strokeWidth={2.5} />
                  Duration{" "}
                  <span className="font-bold text-slate-900">
                    {subject.duration || "N/A"}
                  </span>
                </span>
=======
>>>>>>> 8fd258754427456a9e996d340332bcb6a728e256
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-lg font-black text-slate-950">Description</h2>
            </CardHeader>
            <CardBody>
              <p className="whitespace-pre-line leading-7 text-slate-700">
                {subject.description}
              </p>
            </CardBody>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <h2 className="text-base font-black text-slate-950">
                  Technologies
                </h2>
              </CardHeader>
              <CardBody>
                <div className="flex flex-wrap gap-1.5">
                  {subject.technologies?.map((tech) => {
                    const matched = skillMatches(tech);
                    return (
                      <Badge
                        key={tech}
                        variant={matched ? "success" : "info"}
                        icon={matched ? CheckCircle2 : undefined}
                      >
                        {tech}
                      </Badge>
                    );
                  })}
                  {(!subject.technologies ||
                    subject.technologies.length === 0) && (
                    <p className="text-sm text-slate-500">No technology.</p>
                  )}
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <h2 className="text-base font-black text-slate-950">
                  Required skills
                </h2>
              </CardHeader>
              <CardBody>
                <div className="flex flex-wrap gap-1.5">
                  {subject.requiredSkills?.map((skill) => {
                    const matched = skillMatches(skill);
                    return (
                      <Badge
                        key={skill}
                        variant={matched ? "success" : "neutral"}
                        icon={matched ? CheckCircle2 : undefined}
                      >
                        {skill}
                      </Badge>
                    );
                  })}
                  {(!subject.requiredSkills ||
                    subject.requiredSkills.length === 0) && (
                    <p className="text-sm text-slate-500">No skills.</p>
                  )}
                </div>
              </CardBody>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <h2 className="text-base font-black text-slate-950">Documents</h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-2">
                {subject.documents?.map((document) => (
                  <button
                    key={document.id}
                    onClick={() => openDocument(document)}
                    className="flex w-full items-center gap-3 rounded-xl border border-[#cfe1e8] bg-[#f1f8fc] px-4 py-3 text-left transition hover:border-cyan-200 hover:bg-cyan-50"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-cyan-700">
                      <FileText className="h-4 w-4" strokeWidth={2.5} />
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm font-bold text-slate-900">
                      {document.originalName}
                    </span>
                  </button>
                ))}
                {(!subject.documents || subject.documents.length === 0) && (
                  <p className="text-sm text-slate-500">No document added.</p>
                )}
              </div>
            </CardBody>
          </Card>
        </section>

        <aside className="space-y-5">
          {subject.score !== null && subject.score !== undefined && (
            <Card>
              <CardBody>
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-black text-slate-950">
                    Compatibility
                  </h2>
                  <ScoreBadge score={subject.score} size="lg" />
                </div>
                {subject.recommendationType === "BINOME" && (
                  <p className="mt-3 inline-flex items-start gap-2 rounded-lg bg-cyan-50 px-3 py-2 text-xs font-semibold text-cyan-700">
                    <Info
                      className="mt-0.5 h-3.5 w-3.5 shrink-0"
                      strokeWidth={2.5}
                    />
                    Score calculated with the team's skills.
                  </p>
                )}
              </CardBody>
            </Card>
          )}

          <Card>
            <CardHeader>
              <h2 className="text-base font-black text-slate-950">Supervisor</h2>
            </CardHeader>
            <CardBody>
              <p className="inline-flex items-center gap-1.5 font-bold text-slate-950">
                <User className="h-4 w-4 text-slate-400" strokeWidth={2.5} />
                {subject.supervisor?.fullName || "-"}
              </p>
              {subject.supervisor?.email && (
                <p className="mt-1.5 inline-flex items-center gap-1.5 text-sm text-slate-600">
                  <Mail className="h-3.5 w-3.5 text-slate-400" strokeWidth={2.5} />
                  {subject.supervisor.email}
                </p>
              )}
            </CardBody>
          </Card>

          <Button
            onClick={applyToSubject}
            disabled={applying || Boolean(cannotApplyReason)}
            fullWidth
            size="lg"
            iconRight={applying ? undefined : Send}
          >
            {buttonLabel}
          </Button>

          {cannotApplyReason && (
            <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-sm font-semibold text-amber-900">
              <Info className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2.5} />
              <span>{cannotApplyReason}</span>
            </div>
          )}

          {message && (
            <div className="flex items-start gap-2 rounded-xl border border-cyan-200 bg-cyan-50 px-3.5 py-2.5 text-sm font-semibold text-cyan-700">
              <Info className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2.5} />
              <span>{message}</span>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

export default SubjectDetails;
