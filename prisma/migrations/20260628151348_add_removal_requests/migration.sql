-- CreateEnum
CREATE TYPE "RemovalStatus" AS ENUM ('OPEN', 'RESOLVED');

-- CreateTable
CREATE TABLE "RemovalRequest" (
    "id" TEXT NOT NULL,
    "photoId" TEXT,
    "email" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "RemovalStatus" NOT NULL DEFAULT 'OPEN',
    "ip" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "RemovalRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RemovalRequest_status_createdAt_idx" ON "RemovalRequest"("status", "createdAt");

-- AddForeignKey
ALTER TABLE "RemovalRequest" ADD CONSTRAINT "RemovalRequest_photoId_fkey" FOREIGN KEY ("photoId") REFERENCES "Photo"("id") ON DELETE SET NULL ON UPDATE CASCADE;
