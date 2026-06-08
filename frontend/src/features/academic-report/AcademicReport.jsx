import { useCallback, useEffect, useState } from "react";
import {
  GraduationCap,
  Upload,
  FileText,
  Trash2,
  Eye,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Info,
} from "lucide-react";
import api from "../../api/axios";
import {
  PageHeader,
  Card,
  CardBody,
  Badge,
  Button,
  EmptyState,
  LoadingState,
} from "../../components/ui";

const MAX_BYTES = 10 * 1024 * 1024;
const ACCEPT = ".pdf,.doc,.docx";

const formatSize = (bytes) => {
  if (!bytes && bytes !== 0) return "-";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

function AcademicReport() {
  const [report, setReport] = useState(null);
  const [assignment, setAssignment] = useState(null);
  const [canUpload, setCanUpload] = useState(false);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const fetchReport = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/academic-report/me");
      setReport(res.data.report || null);
      setAssignment(res.data.assignment || null);
      setCanUpload(Boolean(res.data.canUpload));
      setMessage(res.data.message || "");
      setIsError(Boolean(res.data.message) && !res.data.canUpload);
    } catch (error) {
      if (error.response?.status !== 404) {
        console.error(error);
      }
      setReport(null);
      setAssignment(null);
      setCanUpload(false);
      setMessage(
        error.response?.data?.message || "Unable to load academic report."
      );
      setIsError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(fetchReport);
  }, [fetchReport]);

  const showMessage = (text, error = false) => {
    setMessage(text);
    setIsError(error);
  };

  const onFileChange = (e) => {
    const next = e.target.files?.[0] || null;
    setFile(next);
    showMessage("", false);
  };

  const upload = async () => {
    if (!canUpload) {
      showMessage(
        "Complete your assignment before uploading your final report.",
        true
      );
      return;
    }

    if (!file) {
      showMessage("Final report file is required.", true);
      return;
    }
    if (file.size > MAX_BYTES) {
      showMessage("File size exceeds the maximum allowed limit (10 MB).", true);
      return;
    }

    try {
      setUploading(true);
      showMessage("", false);

      const formData = new FormData();
      formData.append("report", file);

      const res = await api.post("/academic-report/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setReport(res.data.report);
      setFile(null);
      const input = document.getElementById("academic-report-input");
      if (input) input.value = "";
      showMessage(res.data.message || "Final report uploaded.", false);
    } catch (error) {
      showMessage(
        error.response?.data?.message ||
          "Unable to upload final report. Please try again.",
        true
      );
    } finally {
      setUploading(false);
    }
  };

  const download = async () => {
    if (!report?.id) return;
    try {
      const res = await api.get(`/academic-report/file/${report.id}`, {
        responseType: "blob",
      });
      const contentType =
        res.headers["content-type"] || "application/octet-stream";
      const blob = new Blob([res.data], { type: contentType });
      const fileURL = window.URL.createObjectURL(blob);
      window.open(fileURL, "_blank");
    } catch (error) {
      showMessage(
        error.response?.data?.message || "Unable to open the report.",
        true
      );
    }
  };

  const remove = async () => {
    if (!report) return;
    if (!window.confirm("Delete your final report?")) return;
    try {
      setDeleting(true);
      await api.delete("/academic-report/me");
      setReport(null);
      showMessage("Final report deleted.", false);
    } catch (error) {
      showMessage(
        error.response?.data?.message || "Unable to delete final report.",
        true
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        icon={GraduationCap}
        title="Final report"
        subtitle="Upload your final report after completing your assignment."
      />

      <Card>
        <CardBody>
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700">
              <Info className="h-4 w-4" strokeWidth={2.5} />
            </span>
            <div className="text-sm text-slate-600">
              <p className="font-bold text-slate-900">Final report guidelines</p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>Accepted formats: PDF, DOC, DOCX</li>
                <li>Maximum file size: 10 MB</li>
                <li>The upload unlocks after your assignment is completed.</li>
                <li>
                  Uploading again will replace your previous final report.
                </li>
              </ul>
              {assignment?.subject?.title && (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-slate-700">
                    Assignment: {assignment.subject.title}
                  </p>
                  <Badge variant={canUpload ? "success" : "warning"}>
                    {assignment.status === "COMPLETED"
                      ? "Completed"
                      : "Not completed yet"}
                  </Badge>
                </div>
              )}
            </div>
          </div>
        </CardBody>
      </Card>

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

      <Card>
        <CardBody>
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700">
              <Upload className="h-4 w-4" strokeWidth={2.5} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-slate-950">
                {report
                  ? report.ownedByMe === false
                    ? "Team final report submitted"
                    : "Replace your final report"
                  : "Upload your final report"}
              </p>
              <p className="mt-0.5 text-sm text-slate-500">
                {report && report.ownedByMe === false
                  ? `Your teammate ${
                      report.owner?.fullName || ""
                    } already submitted the team's final report.`.trim()
                  : "Select a PDF, DOC, or DOCX file up to 10 MB."}
              </p>

              {!(report && report.ownedByMe === false) && (
                <>
                  {!canUpload && (
                    <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
                      <AlertCircle
                        className="mt-0.5 h-4 w-4 shrink-0"
                        strokeWidth={2.5}
                      />
                      <span>
                        Your assignment has to be completed before you can
                        upload the final report.
                      </span>
                    </div>
                  )}

                  <input
                    id="academic-report-input"
                    type="file"
                    accept={ACCEPT}
                    onChange={onFileChange}
                    disabled={!canUpload}
                    className="mt-4 block w-full rounded-xl border border-[#cfe1e8] bg-white px-4 py-2.5 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-cyan-700 file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-white hover:file:bg-cyan-800"
                  />

                  {file && (
                    <p className="mt-3 inline-flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700">
                      <FileText className="h-3.5 w-3.5 text-slate-400" strokeWidth={2.5} />
                      {file.name} — {formatSize(file.size)}
                    </p>
                  )}

                  <div className="mt-4">
                    <Button
                      onClick={upload}
                      disabled={!canUpload || uploading || !file}
                      iconLeft={uploading ? undefined : Upload}
                    >
                      {uploading
                        ? "Uploading..."
                        : report
                        ? "Replace final report"
                        : "Upload final report"}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </CardBody>
      </Card>

      {loading && <LoadingState label="Loading final report..." />}

      {!loading && !report && (
        <EmptyState
          icon={GraduationCap}
          title="No final report"
          description={
            canUpload
              ? "No final report has been submitted yet."
              : "Complete your assignment before uploading your final report."
          }
        />
      )}

      {!loading && report && (
        <Card>
          <CardBody>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-black text-slate-950">
                    {report.originalName || report.fileName}
                  </h2>
                  <Badge variant="success" icon={CheckCircle2}>
                    {report.status || "SUBMITTED"}
                  </Badge>
                </div>

                <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-slate-500">
                  <Calendar className="h-3.5 w-3.5" strokeWidth={2.5} />
                  Submitted on{" "}
                  {report.submittedAt
                    ? new Date(report.submittedAt).toLocaleString()
                    : "-"}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Size: {formatSize(report.fileSize)} · Type:{" "}
                  {report.fileType || "-"}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button variant="secondary" iconLeft={Eye} onClick={download}>
                  Open
                </Button>
                {report.ownedByMe !== false && (
                  <Button
                    variant="danger"
                    iconLeft={Trash2}
                    onClick={remove}
                    disabled={deleting}
                  >
                    {deleting ? "Deleting..." : "Delete"}
                  </Button>
                )}
              </div>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}

export default AcademicReport;
