import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  AlertCircle,
  Calendar,
  RefreshCw,
  Archive,
  User,
  Mail,
  FileText,
  CheckCircle2,
  Clock,
  History,
  Info,
  GraduationCap,
  Briefcase,
  Languages,
  Users,
} from "lucide-react";
import api from "../../api/axios";
import AdminStudentDetails from "./AdminStudentDetails";
import { getEducationFieldLabel } from "../../constants/educationFields";
import {
  getAcademicYearLabel,
  getInternshipTypeLabel,
} from "../../constants/profileFields";
import {
  Card,
  CardHeader,
  CardBody,
  Badge,
  LoadingState,
} from "../../components/ui";
import { formatManagerPlaces } from "../../utils/subjectPlaces";

function statusVariant(status) {
  switch (status) {
    case "AFFECTED":
    case "APPROVED":
      return "success";
    case "PENDING":
      return "warning";
    case "REJECTED":
      return "danger";
    case "CANCELLED":
      return "neutral";
    default:
      return "neutral";
  }
}

function AdminSubjectDetails() {
  const { id } = useParams();

  const [subject, setSubject] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState("");

  const fetchSubject = useCallback(async () => {
    try {
      const res = await api.get(`/admin/subjects/${id}`);
      setSubject(res.data);
    } catch {
      setMessage("Error while loading.");
    }
  }, [id]);

  useEffect(() => {
    queueMicrotask(fetchSubject);
  }, [fetchSubject]);

  const openUser = async (userId) => {
    try {
      const res = await api.get(`/admin/users/${userId}`);
      setSelectedUser(res.data);
    } catch {
      setMessage("Error user.");
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
      link.download = document.originalName || "document";
      window.document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(fileURL);
    } catch {
      setMessage("Error document.");
    }
  };

  const getCandidates = (application) => {
    if (application.student) return [application.student];

    if (application.binome) {
      return [application.binome.student1, application.binome.student2];
    }

    return [];
  };

  if (!subject) {
    return (
      <div className="space-y-6">
        <Link
          to="/admin/subjects"
          className="inline-flex items-center gap-2 text-sm font-bold text-cyan-700 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2.5} />
          Back to subjects
        </Link>
        {message ? (
          <Card>
            <CardBody>
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-rose-700">
                <AlertCircle className="h-4 w-4" strokeWidth={2.5} />
                {message}
              </p>
            </CardBody>
          </Card>
        ) : (
          <LoadingState label="Loading subject..." />
        )}
      </div>
    );
  }

  const affectedApplications =
    subject.affectedApplications ||
    subject.applications?.filter((app) => app.status === "AFFECTED") ||
    [];

  const pendingApplications =
    subject.pendingApplications ||
    subject.applications?.filter((app) => app.status === "PENDING") ||
    [];

  const otherApplications =
    subject.rejectedApplications ||
    subject.applications?.filter(
      (app) => !["AFFECTED", "PENDING"].includes(app.status)
    ) ||
    [];

  return (
    <div className="space-y-6">
      <Link
        to="/admin/subjects"
        className="inline-flex items-center gap-2 text-sm font-bold text-cyan-700 hover:underline"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={2.5} />
        Back to subjects
      </Link>

      <div>
        <h1 className="text-3xl font-black text-slate-950">{subject.title}</h1>
        <p className="mt-2 text-base text-slate-600">Complete subject details.</p>
      </div>

      {message && (
        <div className="flex items-start gap-2 rounded-xl border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm font-semibold text-cyan-700">
          <Info className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2.5} />
          <span>{message}</span>
        </div>
      )}

      <section className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <h2 className="text-base font-black text-slate-950">Description</h2>
          </CardHeader>
          <CardBody>
            <p className="whitespace-pre-line leading-7 text-slate-700">
              {subject.description}
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-base font-black text-slate-950">Information</h2>
          </CardHeader>
          <CardBody>
            <div className="space-y-3 text-sm">
              <p className="inline-flex items-center gap-1.5 text-slate-600">
                <Calendar className="h-3.5 w-3.5 text-slate-400" strokeWidth={2.5} />
                <span className="font-bold text-slate-900">Created:</span>{" "}
                {new Date(subject.createdAt).toLocaleString()}
              </p>
              <p className="inline-flex items-center gap-1.5 text-slate-600">
                <Clock className="h-3.5 w-3.5 text-slate-400" strokeWidth={2.5} />
                <span className="font-bold text-slate-900">Duration:</span>{" "}
                {subject.duration || "N/A"}
              </p>
              <p className="inline-flex items-center gap-1.5 text-slate-600">
                <Users className="h-3.5 w-3.5 text-slate-400" strokeWidth={2.5} />
                <span className="font-bold text-slate-900">Places:</span>{" "}
                {formatManagerPlaces(subject)}
              </p>
              <p className="inline-flex items-center gap-1.5 text-slate-600">
                <RefreshCw className="h-3.5 w-3.5 text-slate-400" strokeWidth={2.5} />
                <span className="font-bold text-slate-900">Modified:</span>{" "}
                {new Date(subject.updatedAt).toLocaleString()}
              </p>
              <p className="inline-flex items-center gap-1.5 text-slate-600">
                <Archive className="h-3.5 w-3.5 text-slate-400" strokeWidth={2.5} />
                <span className="font-bold text-slate-900">Archived:</span>{" "}
                {subject.archived ? "Yes" : "No"}
              </p>
              <p className="inline-flex items-center gap-1.5 text-slate-600">
                <GraduationCap className="h-3.5 w-3.5 text-slate-400" strokeWidth={2.5} />
                <span className="font-bold text-slate-900">Education field:</span>{" "}
                {getEducationFieldLabel(subject.educationField) || "-"}
              </p>
              <p className="inline-flex items-center gap-1.5 text-slate-600">
                <Briefcase className="h-3.5 w-3.5 text-slate-400" strokeWidth={2.5} />
                <span className="font-bold text-slate-900">Internship type:</span>{" "}
                {getInternshipTypeLabel(subject.internshipType) || "-"}
              </p>
              <p className="inline-flex items-start gap-1.5 text-slate-600">
                <GraduationCap className="mt-0.5 h-3.5 w-3.5 text-slate-400" strokeWidth={2.5} />
                <span>
                  <span className="font-bold text-slate-900">
                    Allowed degree levels:
                  </span>{" "}
                  {subject.allowedDegreeLevels?.length
                    ? subject.allowedDegreeLevels.join(", ")
                    : "All"}
                </span>
              </p>
              <p className="inline-flex items-start gap-1.5 text-slate-600">
                <Calendar className="mt-0.5 h-3.5 w-3.5 text-slate-400" strokeWidth={2.5} />
                <span>
                  <span className="font-bold text-slate-900">
                    Allowed academic years:
                  </span>{" "}
                  {subject.allowedAcademicYears?.length
                    ? subject.allowedAcademicYears.map(getAcademicYearLabel).join(", ")
                    : "All"}
                </span>
              </p>
            </div>
          </CardBody>
        </Card>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <h2 className="text-base font-black text-slate-950">Supervisor</h2>
          </CardHeader>
          <CardBody>
            <button
              onClick={() => openUser(subject.supervisor?.id)}
              className="inline-flex items-center gap-1.5 text-left text-lg font-bold text-cyan-700 hover:underline"
            >
              <User className="h-4 w-4" strokeWidth={2.5} />
              {subject.supervisor?.fullName || "-"}
            </button>
            {subject.supervisor?.email && (
              <p className="mt-1.5 inline-flex items-center gap-1.5 text-sm text-slate-600">
                <Mail className="h-3.5 w-3.5 text-slate-400" strokeWidth={2.5} />
                {subject.supervisor.email}
              </p>
            )}
          </CardBody>
        </Card>

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
                <p className="text-sm text-slate-500">No document.</p>
              )}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="inline-flex items-center gap-2 text-base font-black text-slate-950">
              <Languages className="h-4 w-4 text-cyan-700" strokeWidth={2.5} />
              Languages
            </h2>
          </CardHeader>
          <CardBody>
            <div className="flex flex-wrap gap-1.5">
              {subject.languages?.map((language) => (
                <Badge key={language} variant="info">
                  {language}
                </Badge>
              ))}
              {(!subject.languages || subject.languages.length === 0) && (
                <p className="text-sm text-slate-500">No language.</p>
              )}
            </div>
          </CardBody>
        </Card>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <h2 className="text-base font-black text-slate-950">Technologies</h2>
          </CardHeader>
          <CardBody>
            <div className="flex flex-wrap gap-1.5">
              {subject.technologies?.map((tech) => (
                <Badge key={tech} variant="info">
                  {tech}
                </Badge>
              ))}
              {(!subject.technologies || subject.technologies.length === 0) && (
                <p className="text-sm text-slate-500">No technology.</p>
              )}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-base font-black text-slate-950">Required skills</h2>
          </CardHeader>
          <CardBody>
            <div className="flex flex-wrap gap-1.5">
              {subject.requiredSkills?.map((skill) => (
                <Badge key={skill} variant="neutral">
                  {skill}
                </Badge>
              ))}
              {(!subject.requiredSkills ||
                subject.requiredSkills.length === 0) && (
                <p className="text-sm text-slate-500">No skills.</p>
              )}
            </div>
          </CardBody>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <h2 className="inline-flex items-center gap-2 text-lg font-black text-slate-950">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" strokeWidth={2.5} />
            Assignments
          </h2>
        </CardHeader>
        <CardBody>
          <div className="space-y-2">
            {affectedApplications.map((application) => (
              <div
                key={application.id}
                className="assignment-detail-card rounded-xl border border-emerald-200 bg-emerald-50 p-4"
              >
                <div className="flex flex-wrap items-center gap-2">
                  {getCandidates(application).map((candidate) => (
                    <button
                      key={candidate.id}
                      onClick={() => openUser(candidate.id)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-sm font-bold text-cyan-700 transition hover:bg-cyan-50"
                    >
                      <User className="h-3.5 w-3.5" strokeWidth={2.5} />
                      {candidate.fullName}
                    </button>
                  ))}
                </div>
                <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-slate-600">
                  <Calendar className="h-3 w-3" strokeWidth={2.5} />
                  Assigned on {new Date(application.updatedAt).toLocaleString()}
                </p>
              </div>
            ))}

            {affectedApplications.length === 0 && (
              <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                No assignment.
              </p>
            )}
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="inline-flex items-center gap-2 text-lg font-black text-slate-950">
            <Clock className="h-5 w-5 text-amber-600" strokeWidth={2.5} />
            Pending applications
          </h2>
        </CardHeader>
        <CardBody>
          <div className="space-y-2">
            {pendingApplications.map((application) => (
              <div
                key={application.id}
                className="rounded-xl border border-[#e2edf2] bg-slate-50 p-4"
              >
                <div className="flex flex-wrap items-center gap-2">
                  {getCandidates(application).map((candidate) => (
                    <button
                      key={candidate.id}
                      onClick={() => openUser(candidate.id)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-50 px-3 py-1.5 text-sm font-bold text-cyan-700 transition hover:bg-cyan-100"
                    >
                      <User className="h-3.5 w-3.5" strokeWidth={2.5} />
                      {candidate.fullName}
                    </button>
                  ))}
                </div>
                <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-slate-500">
                  <Calendar className="h-3 w-3" strokeWidth={2.5} />
                  Sent on {new Date(application.createdAt).toLocaleString()}
                </p>
              </div>
            ))}

            {pendingApplications.length === 0 && (
              <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                No pending application.
              </p>
            )}
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="inline-flex items-center gap-2 text-lg font-black text-slate-950">
            <History className="h-5 w-5 text-slate-500" strokeWidth={2.5} />
            Application history
          </h2>
        </CardHeader>
        <CardBody>
          <div className="space-y-2">
            {otherApplications.map((application) => (
              <div
                key={application.id}
                className="rounded-xl border border-[#e2edf2] bg-slate-50 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    {getCandidates(application).map((candidate) => (
                      <button
                        key={candidate.id}
                        onClick={() => openUser(candidate.id)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-sm font-bold text-cyan-700 transition hover:bg-cyan-50"
                      >
                        <User className="h-3.5 w-3.5" strokeWidth={2.5} />
                        {candidate.fullName}
                      </button>
                    ))}
                  </div>
                  <Badge variant={statusVariant(application.status)} size="sm">
                    {application.status}
                  </Badge>
                </div>
                <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-slate-500">
                  <Calendar className="h-3 w-3" strokeWidth={2.5} />
                  {new Date(application.createdAt).toLocaleString()}
                </p>
              </div>
            ))}

            {otherApplications.length === 0 && (
              <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                No history.
              </p>
            )}
          </div>
        </CardBody>
      </Card>

      {selectedUser && (
        <AdminStudentDetails
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </div>
  );
}

export default AdminSubjectDetails;
