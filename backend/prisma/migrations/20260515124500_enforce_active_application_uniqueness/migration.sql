-- Preserve application history, but keep at most one active application per
-- student/binome and subject.
CREATE UNIQUE INDEX IF NOT EXISTS "Application_active_student_subject_key"
ON "Application"("studentId", "subjectId")
WHERE "studentId" IS NOT NULL
  AND "status" IN ('PENDING', 'APPROVED', 'AFFECTED');

CREATE UNIQUE INDEX IF NOT EXISTS "Application_active_binome_subject_key"
ON "Application"("binomeId", "subjectId")
WHERE "binomeId" IS NOT NULL
  AND "status" IN ('PENDING', 'APPROVED', 'AFFECTED');
