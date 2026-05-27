-- AlterTable
ALTER TABLE "Subject" ADD COLUMN "languages" TEXT[] DEFAULT ARRAY[]::TEXT[];
