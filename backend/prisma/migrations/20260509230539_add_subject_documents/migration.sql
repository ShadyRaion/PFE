-- AlterTable
ALTER TABLE "Subject" ALTER COLUMN "duration" SET DEFAULT 'N/A';

-- CreateTable
CREATE TABLE "SubjectDocument" (
    "id" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "uploadedById" TEXT,
    "originalName" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SubjectDocument_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SubjectDocument" ADD CONSTRAINT "SubjectDocument_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
