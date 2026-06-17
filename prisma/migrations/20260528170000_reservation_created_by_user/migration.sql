-- AlterTable
ALTER TABLE "reservations" ADD COLUMN "createdByUserId" TEXT;

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "reservations_createdByUserId_idx" ON "reservations"("createdByUserId");
