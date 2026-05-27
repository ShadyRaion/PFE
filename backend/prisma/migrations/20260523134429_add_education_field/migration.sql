-- CreateEnum
CREATE TYPE "EducationField" AS ENUM ('INFORMATION_TECHNOLOGY', 'FINANCE_ACCOUNTING', 'DATA_ANALYSIS_BI', 'MANAGEMENT_HR', 'MARKETING_COMMUNICATION');

-- AlterTable
ALTER TABLE "Subject" ADD COLUMN     "educationField" "EducationField";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "educationField" "EducationField";
