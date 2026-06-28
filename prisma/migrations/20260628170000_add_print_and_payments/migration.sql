-- CreateEnum
CREATE TYPE "PaymentProvider" AS ENUM ('STRIPE', 'PAYPAL');

-- CreateEnum
CREATE TYPE "PrintOrderStatus" AS ENUM ('PENDING', 'PAID', 'FULFILLED', 'CANCELLED');

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "sponsors" JSONB;

-- AlterTable
ALTER TABLE "Photo" ADD COLUMN     "printCode" TEXT;

-- CreateTable
CREATE TABLE "PrintOrder" (
    "id" TEXT NOT NULL,
    "photoId" TEXT,
    "kind" TEXT NOT NULL DEFAULT 'print',
    "status" "PrintOrderStatus" NOT NULL DEFAULT 'PENDING',
    "provider" "PaymentProvider",
    "amountCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "externalId" TEXT,
    "buyerEmail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paidAt" TIMESTAMP(3),

    CONSTRAINT "PrintOrder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PrintOrder_status_createdAt_idx" ON "PrintOrder"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Photo_printCode_key" ON "Photo"("printCode");

-- AddForeignKey
ALTER TABLE "PrintOrder" ADD CONSTRAINT "PrintOrder_photoId_fkey" FOREIGN KEY ("photoId") REFERENCES "Photo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

