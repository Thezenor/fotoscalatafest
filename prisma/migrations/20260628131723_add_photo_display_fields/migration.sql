-- AlterTable
ALTER TABLE "Photo" ADD COLUMN     "authorInstagram" TEXT,
ADD COLUMN     "authorName" TEXT,
ADD COLUMN     "authorTiktok" TEXT,
ADD COLUMN     "comment" TEXT,
ADD COLUMN     "day" TEXT,
ADD COLUMN     "featured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "onScreen" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "timeLabel" TEXT;

-- CreateIndex
CREATE INDEX "Photo_status_featured_idx" ON "Photo"("status", "featured");

-- CreateIndex
CREATE INDEX "Photo_status_onScreen_idx" ON "Photo"("status", "onScreen");
