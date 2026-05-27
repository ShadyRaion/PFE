-- Add a completed assignment lifecycle state and link final reports to assignments.
ALTER TYPE "ApplicationStatus" ADD VALUE IF NOT EXISTS 'COMPLETED';

ALTER TABLE "Application"
ADD COLUMN IF NOT EXISTS "completedAt" TIMESTAMP(3);

ALTER TABLE "AcademicReport"
ADD COLUMN IF NOT EXISTS "applicationId" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "AcademicReport_applicationId_key"
ON "AcademicReport"("applicationId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_name = 'AcademicReport_applicationId_fkey'
      AND table_name = 'AcademicReport'
  ) THEN
    ALTER TABLE "AcademicReport"
    ADD CONSTRAINT "AcademicReport_applicationId_fkey"
    FOREIGN KEY ("applicationId")
    REFERENCES "Application"("id")
    ON DELETE CASCADE
    ON UPDATE CASCADE;
  END IF;
END $$;
