-- AlterTable
ALTER TABLE "Subject" ADD COLUMN     "allowedAcademicYears" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "allowedDegreeLevels" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "internshipType" TEXT;
