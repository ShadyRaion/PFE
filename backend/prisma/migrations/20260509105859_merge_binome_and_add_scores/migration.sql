/*
  Warnings:

  - You are about to drop the `BinomeRequest` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[student1Id,student2Id]` on the table `Binome` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `requestedById` to the `Binome` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Binome` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "BinomeStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED');

-- DropForeignKey
ALTER TABLE "BinomeRequest" DROP CONSTRAINT "BinomeRequest_receiverId_fkey";

-- DropForeignKey
ALTER TABLE "BinomeRequest" DROP CONSTRAINT "BinomeRequest_senderId_fkey";

-- DropForeignKey
ALTER TABLE "Subject" DROP CONSTRAINT "Subject_supervisorId_fkey";

-- DropIndex
DROP INDEX "Binome_student1Id_key";

-- DropIndex
DROP INDEX "Binome_student2Id_key";

-- AlterTable
ALTER TABLE "Binome" ADD COLUMN     "requestedById" TEXT NOT NULL,
ADD COLUMN     "status" "BinomeStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Subject" ALTER COLUMN "duration" SET DEFAULT '4-6 months',
ALTER COLUMN "places" SET DEFAULT 1,
ALTER COLUMN "requiredSkills" SET DEFAULT ARRAY[]::TEXT[];

-- DropTable
DROP TABLE "BinomeRequest";

-- DropEnum
DROP TYPE "BinomeRequestStatus";

-- CreateTable
CREATE TABLE "RecommendationScore" (
    "id" TEXT NOT NULL,
    "studentId" TEXT,
    "binomeId" TEXT,
    "subjectId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "matchedSkills" TEXT[],
    "missingSkills" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecommendationScore_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RecommendationScore_studentId_subjectId_key" ON "RecommendationScore"("studentId", "subjectId");

-- CreateIndex
CREATE UNIQUE INDEX "RecommendationScore_binomeId_subjectId_key" ON "RecommendationScore"("binomeId", "subjectId");

-- CreateIndex
CREATE UNIQUE INDEX "Binome_student1Id_student2Id_key" ON "Binome"("student1Id", "student2Id");

-- AddForeignKey
ALTER TABLE "Subject" ADD CONSTRAINT "Subject_supervisorId_fkey" FOREIGN KEY ("supervisorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecommendationScore" ADD CONSTRAINT "RecommendationScore_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecommendationScore" ADD CONSTRAINT "RecommendationScore_binomeId_fkey" FOREIGN KEY ("binomeId") REFERENCES "Binome"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecommendationScore" ADD CONSTRAINT "RecommendationScore_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Binome" ADD CONSTRAINT "Binome_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
