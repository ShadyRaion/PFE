ALTER TABLE "Subject" ADD COLUMN IF NOT EXISTS "department" TEXT;

UPDATE "Subject"
SET "department" = COALESCE(
  NULLIF(TRIM(supervisor."specialty"), ''),
  'Finances'
)
FROM "User" AS supervisor
WHERE "Subject"."supervisorId" = supervisor."id"
  AND "Subject"."department" IS NULL;
