-- Allow students/binomes to reapply to the same subject while preserving
-- previous rejected or cancelled applications as history.
DROP INDEX IF EXISTS "Application_studentId_subjectId_key";
DROP INDEX IF EXISTS "Application_binomeId_subjectId_key";

CREATE INDEX IF NOT EXISTS "Application_studentId_subjectId_idx" ON "Application"("studentId", "subjectId");
CREATE INDEX IF NOT EXISTS "Application_binomeId_subjectId_idx" ON "Application"("binomeId", "subjectId");
