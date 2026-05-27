import { useNavigate } from "react-router-dom";
import {
  X,
  Mail,
  Phone,
  Calendar,
  GraduationCap,
  Briefcase,
  Shield,
  Users as UsersIcon,
  CheckCircle2,
  FileText,
  BookMarked,
  ClipboardList,
} from "lucide-react";
import api from "../../api/axios";
import { Card, CardBody, CardHeader, Badge, Button } from "../../components/ui";

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

function AdminStudentDetails({ user, onClose, mode = "modal" }) {
  const navigate = useNavigate();

  if (!user) return null;

  const isModal = mode === "modal";

  const openCV = async (cvId, fileName) => {
    try {
      const res = await api.get(`/cv/file/${cvId}`, {
        responseType: "blob",
      });

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
    } catch (error) {
      console.error(error);
    }
  };

  const openSubject = (subjectId) => {
    if (!subjectId) return;

    if (isModal && onClose) {
      onClose();
    }

    navigate(`/admin/subjects/${subjectId}`);
  };

  const content = (
    <Card className={isModal ? "max-h-[90vh] w-full max-w-5xl overflow-y-auto" : "w-full"}>
      <CardBody>
        <div className="flex items-start justify-between gap-5">
          <div className="min-w-0">
            <h2 className="text-3xl font-black text-slate-950">{user.fullName}</h2>
            <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-slate-600">
              <Mail className="h-4 w-4 text-slate-400" strokeWidth={2.5} />
              {user.email}
            </p>
            <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-slate-500">
              <Calendar className="h-3.5 w-3.5 text-slate-400" strokeWidth={2.5} />
              Registered on {new Date(user.createdAt).toLocaleString()}
            </p>
          </div>

          {onClose && isModal && (
            <Button variant="secondary" size="sm" iconLeft={X} onClick={onClose}>
              Close
            </Button>
          )}
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-2">
          <div className="rounded-xl border border-[#e2edf2] bg-slate-50 p-4">
            <p className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
              <Shield className="h-3.5 w-3.5" strokeWidth={2.5} />
              Role
            </p>
            <p className="mt-1.5 font-bold text-slate-950">{user.role}</p>
          </div>

          <div className="rounded-xl border border-[#e2edf2] bg-slate-50 p-4">
            <p className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
              <Phone className="h-3.5 w-3.5" strokeWidth={2.5} />
              Phone
            </p>
            <p className="mt-1.5 font-bold text-slate-950">{user.phone || "-"}</p>
          </div>

          {user.role === "STUDENT" && (
            <>
              <div className="rounded-xl border border-[#e2edf2] bg-slate-50 p-4">
                <p className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <GraduationCap className="h-3.5 w-3.5" strokeWidth={2.5} />
                  University
                </p>
                <p className="mt-1.5 font-bold text-slate-950">
                  {user.university || "-"}
                </p>
              </div>

              <div className="rounded-xl border border-[#e2edf2] bg-slate-50 p-4">
                <p className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <Briefcase className="h-3.5 w-3.5" strokeWidth={2.5} />
                  Specialty
                </p>
                <p className="mt-1.5 font-bold text-slate-950">
                  {user.specialty || "-"}
                </p>
              </div>

              <div className="rounded-xl border border-[#e2edf2] bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Degree level
                </p>
                <p className="mt-1.5 font-bold text-slate-950">
                  {user.degreeLevel || "-"}
                </p>
              </div>

              <div className="rounded-xl border border-[#e2edf2] bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Internship type
                </p>
                <p className="mt-1.5 font-bold text-slate-950">
                  {user.internshipType || "-"}
                </p>
              </div>

              <div className="rounded-xl border border-[#e2edf2] bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Desired start date
                </p>
                <p className="mt-1.5 font-bold text-slate-950">
                  {user.internshipStartDate
                    ? new Date(user.internshipStartDate).toLocaleDateString()
                    : "-"}
                </p>
              </div>

              <div className="rounded-xl border border-[#e2edf2] bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Desired duration
                </p>
                <p className="mt-1.5 font-bold text-slate-950">
                  {user.desiredDuration || "-"}
                </p>
              </div>
            </>
          )}

          {user.role === "COMPANY_SUPERVISOR" && (
            <>
              <div className="rounded-xl border border-[#e2edf2] bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Department
                </p>
                <p className="mt-1.5 font-bold text-slate-950">
                  {user.department || "-"}
                </p>
              </div>

              <div className="rounded-xl border border-[#e2edf2] bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Rank
                </p>
                <p className="mt-1.5 font-bold text-slate-950">
                  {user.rank || "-"}
                </p>
              </div>

              <div className="rounded-xl border border-[#e2edf2] bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Division
                </p>
                <p className="mt-1.5 font-bold text-slate-950">
                  {user.division || "-"}
                </p>
              </div>
            </>
          )}
        </div>

<<<<<<< HEAD
        {user.role === "STUDENT" && (
          <div className="student-mode-card mt-6 rounded-2xl border border-[#e2edf2] bg-slate-50 p-5">
            <p className="detail-card-label inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider">
              <UsersIcon className="h-3.5 w-3.5" strokeWidth={2.5} />
              Mode
            </p>
            <h3 className="mt-2 text-xl font-black text-slate-950">
              {user.teamMode === "TEAM" ? "Team" : "Solo"}
            </h3>
            {user.partner && (
              <button
                type="button"
                onClick={async () => {
                  try {
                    const res = await api.get(`/admin/users/${user.partner.id}`);
                    if (onClose) onClose();
                    setTimeout(() => navigate(`/admin/users/${res.data.id}`), 0);
                  } catch {
                    navigate(`/admin/users/${user.partner.id}`);
                  }
                }}
                className="mt-1 inline-flex items-center gap-1.5 text-sm font-bold text-cyan-700 hover:underline"
              >
                <Mail className="h-3.5 w-3.5 text-slate-400" strokeWidth={2.5} />
                Partner: {user.partner.fullName} ({user.partner.email})
              </button>
            )}
=======
        {user.binome && (
          <div className="mt-6 rounded-2xl border border-cyan-200 bg-cyan-50 p-5">
            <p className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-cyan-700">
              <UsersIcon className="h-3.5 w-3.5" strokeWidth={2.5} />
              Team
            </p>
            <h3 className="mt-2 text-xl font-black text-slate-950">
              {user.binome.fullName}
            </h3>
            <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-slate-600">
              <Mail className="h-3.5 w-3.5 text-slate-400" strokeWidth={2.5} />
              {user.binome.email}
            </p>
>>>>>>> 8fd258754427456a9e996d340332bcb6a728e256
          </div>
        )}

        {user.affectedApplication && (
<<<<<<< HEAD
          <div className="assignment-detail-card mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
=======
          <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
>>>>>>> 8fd258754427456a9e996d340332bcb6a728e256
            <p className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700">
              <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2.5} />
              Assigned subject
            </p>
            <button
              type="button"
              onClick={() => openSubject(user.affectedApplication.subject?.id)}
<<<<<<< HEAD
              className="assignment-subject-title mt-2 block text-left text-2xl font-black text-cyan-700 hover:underline"
=======
              className="mt-2 text-left text-2xl font-black text-cyan-700 hover:underline"
>>>>>>> 8fd258754427456a9e996d340332bcb6a728e256
            >
              {user.affectedApplication.subject?.title}
            </button>
            <p className="mt-2 leading-7 text-slate-700">
              {user.affectedApplication.subject?.description}
            </p>
            <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-slate-500">
              <Calendar className="h-3.5 w-3.5 text-slate-400" strokeWidth={2.5} />
              Assigned on{" "}
              {new Date(user.affectedApplication.updatedAt).toLocaleString()}
            </p>
          </div>
        )}

        {user.cvs?.[0] && (
          <Button
            onClick={() => openCV(user.cvs[0].id, user.cvs[0].originalName)}
            iconLeft={FileText}
            className="mt-6"
          >
            Open Resume
          </Button>
        )}

        {!user.cvs?.[0] && user.role === "STUDENT" && (
          <p className="mt-6 rounded-xl border border-[#e2edf2] bg-slate-50 p-4 text-sm text-slate-500">
            No Resume available.
          </p>
        )}
      </CardBody>

      <CardHeader>
        <h3 className="inline-flex items-center gap-2 text-lg font-black text-slate-950">
          <ClipboardList className="h-5 w-5 text-cyan-700" strokeWidth={2.5} />
          Application history
        </h3>
      </CardHeader>
      <CardBody>
        <div className="space-y-2">
          {user.applications?.map((application) => (
            <div
              key={application.id}
              className="rounded-xl border border-[#e2edf2] bg-slate-50 p-4"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <button
                    type="button"
                    onClick={() => openSubject(application.subject?.id)}
                    className="truncate text-left text-base font-bold text-cyan-700 hover:underline"
                  >
                    {application.subject?.title}
                  </button>
                  <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-slate-500">
                    <Calendar className="h-3 w-3" strokeWidth={2.5} />
                    {new Date(application.createdAt).toLocaleString()}
                  </p>
                </div>
                <Badge variant={statusVariant(application.status)} size="sm">
                  {application.status}
                </Badge>
              </div>
            </div>
          ))}

          {(!user.applications || user.applications.length === 0) && (
            <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
              No application.
            </p>
          )}
        </div>
      </CardBody>

      {user.role === "COMPANY_SUPERVISOR" && (
        <>
          <CardHeader>
            <h3 className="inline-flex items-center gap-2 text-lg font-black text-slate-950">
              <BookMarked className="h-5 w-5 text-cyan-700" strokeWidth={2.5} />
              Created subjects
            </h3>
          </CardHeader>
          <CardBody>
            <div className="space-y-2">
              {user.subjects?.map((subject) => (
                <div
                  key={subject.id}
                  className="rounded-xl border border-[#e2edf2] bg-slate-50 p-4"
                >
                  <button
                    type="button"
                    onClick={() => openSubject(subject.id)}
                    className="text-left text-base font-bold text-cyan-700 hover:underline"
                  >
                    {subject.title}
                  </button>
                  <p className="mt-1.5 line-clamp-2 text-sm text-slate-600">
                    {subject.description}
                  </p>
                  <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-slate-500">
                    <Calendar className="h-3 w-3" strokeWidth={2.5} />
                    Created on {new Date(subject.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}

              {(!user.subjects || user.subjects.length === 0) && (
                <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                  No subject created.
                </p>
              )}
            </div>
          </CardBody>
        </>
      )}
    </Card>
  );

  if (!isModal) {
    return content;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
      {content}
    </div>
  );
}

export default AdminStudentDetails;
