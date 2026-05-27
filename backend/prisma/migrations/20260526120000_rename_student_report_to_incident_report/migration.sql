ALTER TABLE "StudentReport" RENAME TO "IncidentReport";

ALTER TABLE "IncidentReport" RENAME CONSTRAINT "StudentReport_pkey" TO "IncidentReport_pkey";
ALTER TABLE "IncidentReport" RENAME CONSTRAINT "StudentReport_supervisorId_fkey" TO "IncidentReport_supervisorId_fkey";
ALTER TABLE "IncidentReport" RENAME CONSTRAINT "StudentReport_studentId_fkey" TO "IncidentReport_studentId_fkey";
ALTER TABLE "IncidentReport" RENAME CONSTRAINT "StudentReport_applicationId_fkey" TO "IncidentReport_applicationId_fkey";

ALTER INDEX "StudentReport_supervisorId_idx" RENAME TO "IncidentReport_supervisorId_idx";
ALTER INDEX "StudentReport_studentId_idx" RENAME TO "IncidentReport_studentId_idx";
ALTER INDEX "StudentReport_applicationId_idx" RENAME TO "IncidentReport_applicationId_idx";
