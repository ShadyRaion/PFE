/*
  Warnings:

  - You are about to drop the column `userId` on the `Application` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[studentId,subjectId]` on the table `Application` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[binomeId,subjectId]` on the table `Application` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Application" DROP CONSTRAINT "Application_userId_fkey";

-- DropIndex
DROP INDEX "Application_userId_subjectId_key";

-- AlterTable
ALTER TABLE "Application" DROP COLUMN "userId",
ADD COLUMN     "binomeId" TEXT,
ADD COLUMN     "studentId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Application_studentId_subjectId_key" ON "Application"("studentId", "subjectId");

-- CreateIndex
CREATE UNIQUE INDEX "Application_binomeId_subjectId_key" ON "Application"("binomeId", "subjectId");

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_binomeId_fkey" FOREIGN KEY ("binomeId") REFERENCES "Binome"("id") ON DELETE CASCADE ON UPDATE CASCADE;
