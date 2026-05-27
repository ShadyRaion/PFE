ALTER TABLE "IncidentReport"
DROP CONSTRAINT IF EXISTS "IncidentReport_applicationId_fkey";

DROP INDEX IF EXISTS "IncidentReport_applicationId_idx";

ALTER TABLE "IncidentReport"
DROP COLUMN IF EXISTS "applicationId";
