-- AlterTable
ALTER TABLE "User" ADD COLUMN     "degreeLevel" TEXT,
ADD COLUMN     "department" TEXT,
ADD COLUMN     "desiredDuration" TEXT,
ADD COLUMN     "division" TEXT,
ADD COLUMN     "internshipStartDate" TIMESTAMP(3),
ADD COLUMN     "internshipType" TEXT,
ADD COLUMN     "rank" TEXT;
