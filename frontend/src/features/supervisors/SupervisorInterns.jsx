import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Search,
  Calendar,
  MessageSquare,
  BookMarked,
  X,
  AlertTriangle,
  FileText,
  Eye,
  Mail,
  GraduationCap,
  Briefcase,
  Phone,
  User,
  CheckCircle2,
  Send,
  Paperclip,
  Info,
<<<<<<< HEAD
  Languages,
  Clock,
} from "lucide-react";
import api from "../../api/axios";
import { getEducationFieldLabel, EDUCATION_FIELD_OPTIONS } from "../../constants/educationFields";
import {
  DEGREE_LEVELS,
  ACADEMIC_YEAR_OPTIONS,
  INTERNSHIP_TYPE_OPTIONS,
  getAcademicYearLabel,
  getInternshipTypeLabel,
} from "../../constants/profileFields";
import {
  DURATION_FILTERS,
  matchesDurationFilter,
} from "../../utils/filters";
=======
} from "lucide-react";
import api from "../../api/axios";
>>>>>>> 8fd258754427456a9e996d340332bcb6a728e256
import {
  PageHeader,
  Card,
  CardBody,
  Button,
  Field,
  Input,
  Select,
  Textarea,
  Badge,
  ScoreBadge,
  EmptyState,
  LoadingState,
} from "../../components/ui";

<<<<<<< HEAD
const formatExtractedLabel = (value) =>
  String(value || "")
    .replace(/([A-Z])/g, " $1")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^./, (letter) => letter.toUpperCase());

const formatExtractedValue = (value) => {
  if (value === null || value === undefined || value === "") return "-";
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === "object" && item !== null) {
          return Object.entries(item)
            .filter(([, entryValue]) => entryValue !== null && entryValue !== undefined && entryValue !== "")
            .map(([key, entryValue]) => `${formatExtractedLabel(key)}: ${formatExtractedValue(entryValue)}`)
            .join(" | ");
        }
        return String(item);
      })
      .filter(Boolean)
      .join(", ");
  }
  if (typeof value === "object") {
    return Object.entries(value)
      .filter(([, entryValue]) => entryValue !== null && entryValue !== undefined && entryValue !== "")
      .map(([key, entryValue]) => `${formatExtractedLabel(key)}: ${formatExtractedValue(entryValue)}`)
      .join(" | ");
  }
  return String(value);
};

function DetailCard({ icon: Icon, label, children }) {
  return (
    <div className="rounded-xl border border-[#cfe1e8] bg-slate-50 p-4">
      <p className="detail-card-label inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest">
        {Icon && <Icon className="h-3.5 w-3.5" strokeWidth={2.5} />}
        {label}
      </p>
      <div className="mt-1.5 font-bold text-slate-950">{children}</div>
    </div>
  );
}

=======
>>>>>>> 8fd258754427456a9e996d340332bcb6a728e256
function SubjectDetailsModal({ subject, onClose, onOpenDocument }) {
  if (!subject) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-6">
      <Card className="max-h-[90vh] w-full max-w-4xl overflow-y-auto">
        <CardBody>
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-2xl font-black text-slate-950">
                {subject.title}
              </h2>
              <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-slate-500">
                <Calendar className="h-3.5 w-3.5" strokeWidth={2.5} />
                Created on{" "}
                {subject.createdAt
                  ? new Date(subject.createdAt).toLocaleString()
                  : "-"}
              </p>
            </div>
            <Button variant="secondary" size="sm" iconLeft={X} onClick={onClose}>
              Close
            </Button>
          </div>

          <div className="mt-6 space-y-5">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-slate-500">
<<<<<<< HEAD
                Information
              </p>
              <div className="mt-2 grid gap-2 md:grid-cols-2">
                {[
                  ["Duration", subject.duration || "N/A"],
                  [
                    "Education field",
                    getEducationFieldLabel(subject.educationField) || "-",
                  ],
                  [
                    "Internship type",
                    getInternshipTypeLabel(subject.internshipType) || "-",
                  ],
                  [
                    "Allowed degree levels",
                    subject.allowedDegreeLevels?.length
                      ? subject.allowedDegreeLevels.join(", ")
                      : "All",
                  ],
                  [
                    "Allowed academic years",
                    subject.allowedAcademicYears?.length
                      ? subject.allowedAcademicYears.map(getAcademicYearLabel).join(", ")
                      : "All",
                  ],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-xl border border-[#cfe1e8] bg-slate-50 p-3"
                  >
                    <p className="text-xs font-bold text-cyan-700">{label}</p>
                    <p className="mt-1 text-sm font-bold text-slate-950">
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-black uppercase tracking-widest text-slate-500">
=======
>>>>>>> 8fd258754427456a9e996d340332bcb6a728e256
                Description
              </p>
              <p className="mt-2 leading-7 text-slate-700">
                {subject.description || "No description."}
              </p>
            </div>

            <div>
              <p className="text-xs font-black uppercase tracking-widest text-slate-500">
                Technologies
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {subject.technologies?.map((tech) => (
                  <Badge key={tech} variant="info" size="md">
                    {tech}
                  </Badge>
                ))}
                {(!subject.technologies || subject.technologies.length === 0) && (
                  <p className="text-sm text-slate-500">No technology.</p>
                )}
              </div>
            </div>

            <div>
              <p className="text-xs font-black uppercase tracking-widest text-slate-500">
                Required skills
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {subject.requiredSkills?.map((skill) => (
                  <Badge key={skill} variant="neutral" size="md">
                    {skill}
                  </Badge>
                ))}
                {(!subject.requiredSkills || subject.requiredSkills.length === 0) && (
                  <p className="text-sm text-slate-500">No skills.</p>
                )}
              </div>
            </div>

            <div>
              <p className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-slate-500">
<<<<<<< HEAD
                <Languages className="h-3.5 w-3.5" strokeWidth={2.5} />
                Languages
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {subject.languages?.map((language) => (
                  <Badge key={language} variant="info" size="md">
                    {language}
                  </Badge>
                ))}
                {(!subject.languages || subject.languages.length === 0) && (
                  <p className="text-sm text-slate-500">No language.</p>
                )}
              </div>
            </div>

            <div>
              <p className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-slate-500">
=======
>>>>>>> 8fd258754427456a9e996d340332bcb6a728e256
                <Paperclip className="h-3.5 w-3.5" strokeWidth={2.5} />
                Documents
              </p>
              <div className="mt-2 space-y-1.5">
                {subject.documents?.map((document) => (
                  <button
                    key={document.id}
                    onClick={() => onOpenDocument(document)}
                    className="flex w-full items-center gap-2 rounded-xl border border-[#cfe1e8] bg-slate-50 px-4 py-3 text-left text-sm font-semibold text-cyan-700 transition hover:border-cyan-300 hover:bg-cyan-50"
                  >
                    <FileText className="h-4 w-4 shrink-0" strokeWidth={2.5} />
                    <span className="truncate">
                      {document.originalName || document.fileName || "Document"}
                    </span>
                  </button>
                ))}
                {(!subject.documents || subject.documents.length === 0) && (
                  <p className="text-sm text-slate-500">No document.</p>
                )}
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

<<<<<<< HEAD
function StudentDetailsModal({ student, application, onClose, onOpenCV, onReport }) {
  if (!student) return null;

  const cv = student.cvs?.[0];
  const extractedSkills = cv?.extractedSkills || [];
  const extractedData = cv?.extractedData || {};
  const resumeLanguages = Array.isArray(extractedData.languages)
    ? extractedData.languages
    : [];
  const infoCards = [
    ["University", student.university, GraduationCap],
    ["Specialty", student.specialty, Briefcase],
    ["Phone", student.phone, Phone],
    ["Education field", student.educationField, GraduationCap],
    ["Degree level", student.degreeLevel, GraduationCap],
    ["Academic year", student.academicYear, Calendar],
    ["Internship type", student.internshipType, Briefcase],
    [
      "Desired start date",
      student.internshipStartDate
        ? new Date(student.internshipStartDate).toLocaleDateString()
        : "-",
      Calendar,
    ],
    ["Desired duration", student.desiredDuration, Clock],
  ];
  const extractedEntries = Object.entries(extractedData || {}).filter(
    ([key, value]) =>
      key !== "skills" &&
      key !== "allSkills" &&
      key !== "technicalSkills" &&
      key !== "detectedSkills" &&
      key !== "extractedSkills" &&
      key !== "languages" &&
      key !== "language" &&
      key !== "detectedLanguage" &&
      key !== "resumeLanguage" &&
      key !== "languageDetected" &&
      value !== null &&
      value !== undefined &&
      !(Array.isArray(value) && value.length === 0) &&
      !(typeof value === "object" && !Array.isArray(value) && Object.keys(value).length === 0)
  );
  const visibleExtractedEntries = [
    ...(resumeLanguages.length > 0 ? [["languages", resumeLanguages]] : []),
    ...extractedEntries,
  ];
=======
function StudentDetailsModal({ student, application, onClose, onOpenCV }) {
  if (!student) return null;

  const cv = student.cvs?.[0];
>>>>>>> 8fd258754427456a9e996d340332bcb6a728e256

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-6">
      <Card className="max-h-[90vh] w-full max-w-2xl overflow-y-auto">
        <CardBody>
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 className="inline-flex items-center gap-2 text-2xl font-black text-slate-950">
                <User className="h-6 w-6 text-cyan-700" strokeWidth={2.5} />
                {student.fullName}
              </h2>
              <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-slate-600">
                <Mail className="h-3.5 w-3.5" strokeWidth={2.5} />
                {student.email}
              </p>
            </div>
            <Button variant="secondary" size="sm" iconLeft={X} onClick={onClose}>
              Close
            </Button>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-2">
<<<<<<< HEAD
            {infoCards
              .filter(([label]) => ["University", "Specialty", "Phone"].includes(label))
              .map(([label, value, Icon]) => (
                <DetailCard key={label} label={label} icon={Icon}>
                  {value || "-"}
                </DetailCard>
              ))}

            <DetailCard label="Score" icon={CheckCircle2}>
=======
            <div className="rounded-xl border border-[#cfe1e8] bg-slate-50 p-4">
              <p className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-slate-500">
                <GraduationCap className="h-3.5 w-3.5" strokeWidth={2.5} />
                University
              </p>
              <p className="mt-1.5 font-bold text-slate-950">
                {student.university || "-"}
              </p>
            </div>

            <div className="rounded-xl border border-[#cfe1e8] bg-slate-50 p-4">
              <p className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-slate-500">
                <Briefcase className="h-3.5 w-3.5" strokeWidth={2.5} />
                Specialty
              </p>
              <p className="mt-1.5 font-bold text-slate-950">
                {student.specialty || "-"}
              </p>
            </div>

            <div className="rounded-xl border border-[#cfe1e8] bg-slate-50 p-4">
              <p className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-slate-500">
                <Phone className="h-3.5 w-3.5" strokeWidth={2.5} />
                Phone
              </p>
              <p className="mt-1.5 font-bold text-slate-950">
                {student.phone || "-"}
              </p>
            </div>

            <div className="rounded-xl border border-[#cfe1e8] bg-slate-50 p-4">
              <p className="text-xs font-black uppercase tracking-widest text-slate-500">
                Score
              </p>
>>>>>>> 8fd258754427456a9e996d340332bcb6a728e256
              <div className="mt-1.5">
                {application?.score !== null && application?.score !== undefined ? (
                  <ScoreBadge score={application.score} size="lg" />
                ) : (
                  <p className="font-bold text-slate-500">-</p>
                )}
              </div>
<<<<<<< HEAD
            </DetailCard>
          </div>

          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {infoCards
              .filter(([label]) => !["University", "Specialty", "Phone"].includes(label))
              .map(([label, value, Icon]) => (
                <DetailCard key={label} label={label} icon={Icon}>
                  {value || "-"}
                </DetailCard>
              ))}
          </div>

          {extractedSkills.length > 0 && (
            <div className="mt-6 rounded-xl border border-[#cfe1e8] bg-slate-50 p-4">
              <p className="detail-card-label inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest">
                <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2.5} />
                Extracted skills
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {extractedSkills.map((skill) => (
                  <Badge key={skill} variant="info">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {visibleExtractedEntries.length > 0 && (
            <div className="mt-4">
              <p className="detail-card-label mb-3 inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest">
                <FileText className="h-3.5 w-3.5" strokeWidth={2.5} />
                Extracted Resume data
              </p>
              <div className="grid gap-3 md:grid-cols-2">
                {visibleExtractedEntries.map(([key, value]) => (
                  <DetailCard
                    key={key}
                    label={formatExtractedLabel(key)}
                    icon={key === "languages" ? Languages : FileText}
                  >
                    {key === "languages" && Array.isArray(value) ? (
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        {value.map((language, index) => (
                          <Badge key={`${formatExtractedValue(language)}-${index}`} variant="neutral">
                            {formatExtractedValue(language)}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm leading-6">{formatExtractedValue(value)}</p>
                    )}
                  </DetailCard>
                ))}
              </div>
            </div>
          )}

          {cv ? (
            <div className="mt-6 flex flex-wrap gap-2">
              <Button
                iconLeft={FileText}
                onClick={() => onOpenCV(cv.id, cv.originalName || cv.fileName)}
              >
                Open Resume
              </Button>
              <Button
                variant="danger"
                iconLeft={AlertTriangle}
                onClick={() => onReport(application, student)}
              >
                Report
              </Button>
            </div>
          ) : (
            <div className="mt-6 flex flex-wrap items-center gap-2">
              <p className="rounded-xl border border-[#cfe1e8] bg-slate-50 p-4 text-sm text-slate-600">
                Resume unavailable.
              </p>
              <Button
                variant="danger"
                iconLeft={AlertTriangle}
                onClick={() => onReport(application, student)}
              >
                Report
              </Button>
            </div>
=======
            </div>
          </div>

          {cv ? (
            <Button
              className="mt-6"
              iconLeft={FileText}
              onClick={() => onOpenCV(cv.id, cv.originalName || cv.fileName)}
            >
              Open Resume
            </Button>
          ) : (
            <p className="mt-6 rounded-xl border border-[#cfe1e8] bg-slate-50 p-4 text-sm text-slate-600">
              Resume unavailable.
            </p>
>>>>>>> 8fd258754427456a9e996d340332bcb6a728e256
          )}
        </CardBody>
      </Card>
    </div>
  );
}

function SupervisorInterns() {
  const navigate = useNavigate();

  const [interns, setInterns] = useState([]);
  const [search, setSearch] = useState("");
<<<<<<< HEAD
  const [teamFilter, setTeamFilter] = useState("ALL");
  const [educationFieldFilter, setEducationFieldFilter] = useState("ALL");
  const [internshipTypeFilter, setInternshipTypeFilter] = useState("ALL");
  const [durationFilter, setDurationFilter] = useState("ALL");
  const [degreeFilter, setDegreeFilter] = useState("ALL");
  const [academicYearFilter, setAcademicYearFilter] = useState("ALL");
=======
  const [dateFilter, setDateFilter] = useState("ALL");
>>>>>>> 8fd258754427456a9e996d340332bcb6a728e256
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [reportTarget, setReportTarget] = useState(null);
  const [reportReason, setReportReason] = useState("");
  const [submittingReport, setSubmittingReport] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);
  const [completingId, setCompletingId] = useState(null);
  const [confirmCancel, setConfirmCancel] = useState(null);
  const [confirmComplete, setConfirmComplete] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const normalizeInterns = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.interns)) return payload.interns;
    if (Array.isArray(payload?.applications)) return payload.applications;
    if (Array.isArray(payload?.data)) return payload.data;
    return [];
  };

  const fetchInterns = useCallback(async () => {
    try {
      setLoading(true);
      setMessage("");
      const res = await api.get("/supervisor/interns");
      setInterns(normalizeInterns(res.data));
    } catch (error) {
      console.error(error);
      setInterns([]);
      setMessage("Unable to load interns.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(fetchInterns);
  }, [fetchInterns]);

  const getCandidates = (application) => {
    if (application.binome) {
      return [application.binome.student1, application.binome.student2].filter(
        Boolean
      );
    }
    if (application.student) return [application.student];
    return [];
  };

  const getCandidateNames = (application) => {
    const candidates = getCandidates(application);
    if (candidates.length === 0) return "Intern";
    return candidates.map((candidate) => candidate.fullName).join(" & ");
  };

<<<<<<< HEAD
  const isBinome = (application) => Boolean(application.binome);

=======
  const getCandidateEmails = (application) => {
    const candidates = getCandidates(application);
    return candidates.map((candidate) => candidate.email).join(" / ");
  };

  const isBinome = (application) => Boolean(application.binome);

  const isInDateFilter = useCallback((date) => {
    if (!date) return true;
    if (dateFilter === "ALL") return true;
    const createdAt = new Date(date);
    const now = new Date();
    if (dateFilter === "TODAY") {
      return createdAt.toDateString() === now.toDateString();
    }
    if (dateFilter === "7_DAYS") {
      return now - createdAt <= 7 * 24 * 60 * 60 * 1000;
    }
    if (dateFilter === "30_DAYS") {
      return now - createdAt <= 30 * 24 * 60 * 60 * 1000;
    }
    return true;
  }, [dateFilter]);

>>>>>>> 8fd258754427456a9e996d340332bcb6a728e256
  const filteredInterns = useMemo(() => {
    return interns.filter((application) => {
      const candidates = getCandidates(application);
      const text = [
        application.subject?.title,
        application.subject?.description,
        application.status,
        application.createdAt,
        application.updatedAt,
        ...candidates.map((candidate) => candidate.fullName),
        ...candidates.map((candidate) => candidate.email),
        ...candidates.map((candidate) => candidate.university),
        ...candidates.map((candidate) => candidate.specialty),
        ...(application.subject?.technologies || []),
        ...(application.subject?.requiredSkills || []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = text.includes(search.toLowerCase());
<<<<<<< HEAD
      const matchesTeam =
        teamFilter === "ALL" ||
        (teamFilter === "TEAM" && isBinome(application)) ||
        (teamFilter === "SOLO" && !isBinome(application));
      const subject = application.subject || {};
      const matchesEducationField =
        educationFieldFilter === "ALL" ||
        subject.educationField === educationFieldFilter;
      const matchesInternshipType =
        internshipTypeFilter === "ALL" ||
        subject.internshipType === internshipTypeFilter;
      const matchesDuration = matchesDurationFilter(
        subject.duration,
        durationFilter
      );
      const matchesDegree =
        degreeFilter === "ALL" ||
        !subject.allowedDegreeLevels?.length ||
        subject.allowedDegreeLevels.includes(degreeFilter);
      const matchesAcademicYear =
        academicYearFilter === "ALL" ||
        !subject.allowedAcademicYears?.length ||
        subject.allowedAcademicYears.includes(academicYearFilter);
      return (
        matchesSearch &&
        matchesTeam &&
        matchesEducationField &&
        matchesInternshipType &&
        matchesDuration &&
        matchesDegree &&
        matchesAcademicYear
      );
    });
  }, [
    interns,
    search,
    teamFilter,
    educationFieldFilter,
    internshipTypeFilter,
    durationFilter,
    degreeFilter,
    academicYearFilter,
  ]);
=======
      const matchesDate = isInDateFilter(
        application.updatedAt || application.createdAt
      );
      return matchesSearch && matchesDate;
    });
  }, [interns, search, isInDateFilter]);
>>>>>>> 8fd258754427456a9e996d340332bcb6a728e256

  const openCV = async (cvId, fileName) => {
    try {
      const res = await api.get(`/cv/file/${cvId}`, { responseType: "blob" });
      const contentType =
        res.headers["content-type"] || "application/octet-stream";
      const blob = new Blob([res.data], { type: contentType });
      const fileURL = window.URL.createObjectURL(blob);
      if (contentType.includes("pdf")) {
        window.open(fileURL, "_blank");
        return;
      }
      const link = window.document.createElement("a");
      link.href = fileURL;
      link.download = fileName || "cv";
      window.document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(fileURL);
    } catch {
      setMessage("Error while opening the Resume.");
    }
  };

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
      link.download = document.originalName || document.fileName || "document";
      window.document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(fileURL);
    } catch {
      setMessage("Error document.");
    }
  };

  const openMessages = (application) => {
    if (application.conversation?.id) {
      navigate(`/encadrant/messages?conversationId=${application.conversation.id}`);
      return;
    }
    navigate("/encadrant/messages");
  };

  const cancelAssignment = async () => {
    if (!confirmCancel) return;
    const application = confirmCancel;
    setConfirmCancel(null);
    try {
      setCancellingId(application.id);
      await api.patch(`/supervisor/affectations/${application.id}/cancel`);
      setMessage("Assignment canceled.");
      await fetchInterns();
    } catch {
      setMessage("Error while canceling the assignment.");
    } finally {
      setCancellingId(null);
    }
  };

  const completeAssignment = async () => {
    if (!confirmComplete) return;
    const application = confirmComplete;
    setConfirmComplete(null);
    try {
      setCompletingId(application.id);
      await api.patch(`/supervisor/affectations/${application.id}/complete`);
      setMessage("Assignment marked as completed.");
      await fetchInterns();
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Unable to complete assignment."
      );
    } finally {
      setCompletingId(null);
    }
  };

  const openReport = (application, student) => {
    setReportTarget({ application, student });
    setReportReason("");
  };

  const submitReport = async (e) => {
    e.preventDefault();
    if (!reportTarget || !reportReason.trim()) {
      setMessage("Please enter a report reason.");
      return;
    }
    try {
      setSubmittingReport(true);
      await api.post("/supervisor/reports", {
        applicationId: reportTarget.application.id,
        studentId: reportTarget.student.id,
        reason: reportReason.trim(),
      });
      setMessage("Report sent.");
      setReportTarget(null);
      setReportReason("");
    } catch {
      setMessage("Error while sending the report.");
    } finally {
      setSubmittingReport(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          icon={Users}
          title="My interns"
          subtitle="Review interns assigned to your subjects."
        />
        <LoadingState label="Loading interns..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Users}
        title="My interns"
        subtitle="Review interns assigned to your subjects."
      />

      {message && (
        <div className="flex items-start gap-2 rounded-xl border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm font-semibold text-cyan-700">
          <Info className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2.5} />
          <span>{message}</span>
        </div>
      )}

      <Card>
        <CardBody>
<<<<<<< HEAD
          <div className="grid gap-3 lg:grid-cols-4">
            <Field label="Search" htmlFor="search" className="lg:col-span-2">
=======
          <div className="grid gap-3 lg:grid-cols-3">
            <Field htmlFor="search" className="lg:col-span-2">
>>>>>>> 8fd258754427456a9e996d340332bcb6a728e256
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  strokeWidth={2.5}
                />
                <Input
                  id="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search intern, email, subject, technology..."
                  className="pl-9"
                />
              </div>
            </Field>
<<<<<<< HEAD
            <Field label="Mode" htmlFor="teamFilter">
              <Select
                id="teamFilter"
                value={teamFilter}
                onChange={(e) => setTeamFilter(e.target.value)}
              >
                <option value="ALL">Solo and team</option>
                <option value="SOLO">Solo</option>
                <option value="TEAM">Team</option>
              </Select>
            </Field>
            <Field label="Education field" htmlFor="educationFieldFilter">
              <Select
                id="educationFieldFilter"
                value={educationFieldFilter}
                onChange={(e) => setEducationFieldFilter(e.target.value)}
              >
                <option value="ALL">All fields</option>
                {EDUCATION_FIELD_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Internship type" htmlFor="internshipTypeFilter">
              <Select
                id="internshipTypeFilter"
                value={internshipTypeFilter}
                onChange={(e) => setInternshipTypeFilter(e.target.value)}
              >
                <option value="ALL">All types</option>
                {INTERNSHIP_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Duration" htmlFor="durationFilter">
              <Select
                id="durationFilter"
                value={durationFilter}
                onChange={(e) => setDurationFilter(e.target.value)}
              >
                {DURATION_FILTERS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Degree level" htmlFor="degreeFilter">
              <Select
                id="degreeFilter"
                value={degreeFilter}
                onChange={(e) => setDegreeFilter(e.target.value)}
              >
                <option value="ALL">All degrees</option>
                {DEGREE_LEVELS.map((degree) => (
                  <option key={degree} value={degree}>
                    {degree}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Academic year" htmlFor="academicYearFilter">
              <Select
                id="academicYearFilter"
                value={academicYearFilter}
                onChange={(e) => setAcademicYearFilter(e.target.value)}
              >
                <option value="ALL">All academic years</option>
                {ACADEMIC_YEAR_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
=======
            <Field htmlFor="dateFilter">
              <Select
                id="dateFilter"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              >
                <option value="ALL">All dates</option>
                <option value="TODAY">Today</option>
                <option value="7_DAYS">Last 7 days</option>
                <option value="30_DAYS">Last 30 days</option>
>>>>>>> 8fd258754427456a9e996d340332bcb6a728e256
              </Select>
            </Field>
          </div>
        </CardBody>
      </Card>

      <section className="space-y-4">
        {filteredInterns.map((application) => (
          <Card key={application.id}>
            <CardBody>
              <div className="flex flex-wrap items-start justify-between gap-5">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-black text-slate-950">
                      {getCandidateNames(application)}
                    </h2>
                    <Badge variant="success" size="md" icon={CheckCircle2}>
                      Assigned
                    </Badge>
                    {isBinome(application) && (
                      <Badge variant="info" size="md" icon={Users}>
                        Team
                      </Badge>
                    )}
                  </div>

                  <div className="mt-2 space-y-1">
                    {getCandidates(application).map((candidate) => (
                      <p
                        key={candidate.id}
                        className="flex flex-wrap items-center gap-1.5 text-sm text-slate-600"
                      >
                        <Mail className="h-3.5 w-3.5" strokeWidth={2.5} />
                        {isBinome(application) && (
                          <span className="font-bold text-slate-800">
                            {candidate.fullName} —
                          </span>
                        )}
                        <span>{candidate.email}</span>
                      </p>
                    ))}
                  </div>

                  <div className="mt-3">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Subject
                    </p>
                    <button
                      onClick={() => setSelectedSubject(application.subject)}
                      className="mt-1 inline-flex items-center gap-2 text-left text-lg font-black text-cyan-700 hover:underline"
                    >
                      <BookMarked className="h-4 w-4" strokeWidth={2.5} />
                      {application.subject?.title || "Subject"}
                    </button>
                  </div>

                  <p className="mt-2 line-clamp-2 text-sm leading-7 text-slate-600">
                    {application.subject?.description || "No description."}
                  </p>

                  <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                    <Calendar className="h-3.5 w-3.5" strokeWidth={2.5} />
                    Assigned on{" "}
                    {application.updatedAt
                      ? new Date(application.updatedAt).toLocaleString()
                      : application.createdAt
                      ? new Date(application.createdAt).toLocaleString()
                      : "-"}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {getCandidates(application).map((candidate) => (
                      <div key={candidate.id} className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          iconLeft={Eye}
                          onClick={() => {
                            setSelectedStudent(candidate);
                            setSelectedApplication(application);
                          }}
                        >
                          View {candidate.fullName}
                        </Button>
<<<<<<< HEAD
=======
                        <Button
                          size="sm"
                          variant="danger"
                          iconLeft={AlertTriangle}
                          onClick={() => openReport(application, candidate)}
                        >
                          Report
                        </Button>
>>>>>>> 8fd258754427456a9e996d340332bcb6a728e256
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex shrink-0 flex-col gap-2">
                  <Button
                    iconLeft={MessageSquare}
                    onClick={() => openMessages(application)}
                  >
                    Message
                  </Button>
                  <Button
                    variant="secondary"
                    iconLeft={BookMarked}
                    onClick={() => setSelectedSubject(application.subject)}
                  >
                    Subject
                  </Button>
                  <Button
                    variant="success"
                    iconLeft={CheckCircle2}
                    disabled={completingId === application.id}
                    onClick={() => setConfirmComplete(application)}
                  >
                    {completingId === application.id
                      ? "Completing..."
                      : "Mark completed"}
                  </Button>
                  <Button
                    variant="danger"
                    iconLeft={X}
                    disabled={cancellingId === application.id}
                    onClick={() => setConfirmCancel(application)}
                  >
                    {cancellingId === application.id
                      ? "Canceling..."
                      : "Cancel assignment"}
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>
        ))}

        {filteredInterns.length === 0 && (
          <EmptyState
            icon={Users}
            title="No assigned intern"
            description="No interns have been assigned to your subjects yet."
          />
        )}
      </section>

      {selectedStudent && (
        <StudentDetailsModal
          student={selectedStudent}
          application={selectedApplication}
          onClose={() => {
            setSelectedStudent(null);
            setSelectedApplication(null);
          }}
          onOpenCV={openCV}
<<<<<<< HEAD
          onReport={openReport}
=======
>>>>>>> 8fd258754427456a9e996d340332bcb6a728e256
        />
      )}

      {confirmComplete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-md">
            <CardBody>
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <CheckCircle2 className="h-5 w-5" strokeWidth={2.5} />
                </span>
                <div>
                  <h3 className="text-lg font-black text-slate-950">
                    Mark assignment as completed?
                  </h3>
                  <p className="mt-1 text-sm text-slate-600">
                    It will move to Completed assignments and students can upload the final report.
                  </p>
                </div>
              </div>
              <div className="mt-5 flex justify-end gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  iconLeft={X}
                  onClick={() => setConfirmComplete(null)}
                >
                  Keep active
                </Button>
                <Button
                  variant="success"
                  size="sm"
                  iconLeft={CheckCircle2}
                  onClick={completeAssignment}
                >
                  Mark completed
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {selectedSubject && (
        <SubjectDetailsModal
          subject={selectedSubject}
          onClose={() => setSelectedSubject(null)}
          onOpenDocument={openDocument}
        />
      )}

      {confirmCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-6">
          <Card className="w-full max-w-md">
            <CardBody>
              <h2 className="inline-flex items-center gap-2 text-xl font-black text-slate-950">
                <AlertTriangle className="h-5 w-5 text-rose-600" strokeWidth={2.5} />
                Cancel assignment?
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                The intern will no longer be assigned to this subject. This
                action cannot be undone.
              </p>
              <div className="mt-6 flex justify-end gap-2">
                <Button
                  variant="secondary"
                  onClick={() => setConfirmCancel(null)}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  iconLeft={X}
                  onClick={cancelAssignment}
                >
                  Confirm
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {reportTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-6">
          <Card className="w-full max-w-xl">
            <CardBody>
              <form onSubmit={submitReport}>
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h2 className="inline-flex items-center gap-2 text-2xl font-black text-slate-950">
                      <AlertTriangle className="h-5 w-5 text-rose-600" strokeWidth={2.5} />
                      Report a student
                    </h2>
                    <p className="mt-1 text-sm text-slate-600">
                      {reportTarget.student.fullName} —{" "}
                      {reportTarget.application.subject?.title || "Subject"}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    iconLeft={X}
                    onClick={() => setReportTarget(null)}
                  >
                    Close
                  </Button>
                </div>

                <div className="mt-6">
                  <Field
                    label="Report reason"
                    htmlFor="reportReason"
                    hint="Describe what happened with enough detail for an admin to act."
                  >
                    <Textarea
                      id="reportReason"
                      value={reportReason}
                      onChange={(e) => setReportReason(e.target.value)}
                      rows={5}
                      placeholder="Describe the report reason..."
                    />
                  </Field>
                </div>

                <div className="mt-6 flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setReportTarget(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="danger"
                    iconLeft={submittingReport ? undefined : Send}
                    disabled={submittingReport || !reportReason.trim()}
                  >
                    {submittingReport ? "Sending..." : "Send"}
                  </Button>
                </div>
              </form>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
}

export default SupervisorInterns;
