/*
  Warnings:

  - A unique constraint covering the columns `[binomeId]` on the table `Conversation` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "ConversationType" AS ENUM ('APPLICATION', 'BINOME');

-- AlterTable
ALTER TABLE "Conversation" ADD COLUMN     "binomeId" TEXT,
ADD COLUMN     "type" "ConversationType" NOT NULL DEFAULT 'APPLICATION',
ALTER COLUMN "studentId" DROP NOT NULL,
ALTER COLUMN "supervisorId" DROP NOT NULL,
ALTER COLUMN "applicationId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "PageAlert" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "pageKey" TEXT NOT NULL,
    "refId" TEXT,
    "isResolved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PageAlert_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PageAlert_userId_pageKey_isResolved_idx" ON "PageAlert"("userId", "pageKey", "isResolved");

-- CreateIndex
CREATE UNIQUE INDEX "Conversation_binomeId_key" ON "Conversation"("binomeId");

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_binomeId_fkey" FOREIGN KEY ("binomeId") REFERENCES "Binome"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PageAlert" ADD CONSTRAINT "PageAlert_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
