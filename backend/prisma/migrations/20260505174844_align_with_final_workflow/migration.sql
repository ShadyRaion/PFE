/*
  Warnings:

  - The values [ACADEMIC_SUPERVISOR] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `StudentProfile` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Supervisor` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `userId` to the `CV` table without a default value. This is not possible if the table is not empty.
  - Added the required column `supervisorId` to the `Subject` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "SupervisorStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('STUDENT', 'COMPANY_SUPERVISOR', 'ADMIN');
ALTER TABLE "User" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "public"."Role_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "StudentProfile" DROP CONSTRAINT "StudentProfile_userId_fkey";

-- AlterTable
ALTER TABLE "CV" ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Subject" ADD COLUMN     "supervisorId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "phone" TEXT,
ADD COLUMN     "specialty" TEXT,
ADD COLUMN     "supervisorStatus" "SupervisorStatus",
ADD COLUMN     "university" TEXT;

-- DropTable
DROP TABLE "StudentProfile";

-- DropTable
DROP TABLE "Supervisor";

-- AddForeignKey
ALTER TABLE "Subject" ADD CONSTRAINT "Subject_supervisorId_fkey" FOREIGN KEY ("supervisorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CV" ADD CONSTRAINT "CV_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
