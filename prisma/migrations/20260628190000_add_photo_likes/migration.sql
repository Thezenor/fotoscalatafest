-- AlterTable
ALTER TABLE "Photo" ADD COLUMN     "likes" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "Photo_status_likes_idx" ON "Photo"("status", "likes");

