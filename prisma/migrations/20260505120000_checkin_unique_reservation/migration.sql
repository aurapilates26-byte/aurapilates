-- AlterTable
ALTER TABLE "checkins" ADD COLUMN "reservationId" TEXT;

-- CreateIndex (one check-in ledger row max per réservation lors du passage staff)
CREATE UNIQUE INDEX "checkins_reservationId_key" ON "checkins"("reservationId");

-- AddForeignKey
ALTER TABLE "checkins" ADD CONSTRAINT "checkins_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "reservations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
