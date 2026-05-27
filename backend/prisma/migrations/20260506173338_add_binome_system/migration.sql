-- CreateEnum
CREATE TYPE "BinomeRequestStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED');

-- CreateTable
CREATE TABLE "BinomeRequest" (
    "id" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "status" "BinomeRequestStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BinomeRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Binome" (
    "id" TEXT NOT NULL,
    "student1Id" TEXT NOT NULL,
    "student2Id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Binome_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BinomeRequest_senderId_receiverId_key" ON "BinomeRequest"("senderId", "receiverId");

-- CreateIndex
CREATE UNIQUE INDEX "Binome_student1Id_key" ON "Binome"("student1Id");

-- CreateIndex
CREATE UNIQUE INDEX "Binome_student2Id_key" ON "Binome"("student2Id");

-- AddForeignKey
ALTER TABLE "BinomeRequest" ADD CONSTRAINT "BinomeRequest_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BinomeRequest" ADD CONSTRAINT "BinomeRequest_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Binome" ADD CONSTRAINT "Binome_student1Id_fkey" FOREIGN KEY ("student1Id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Binome" ADD CONSTRAINT "Binome_student2Id_fkey" FOREIGN KEY ("student2Id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
