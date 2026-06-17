-- CreateEnum
CREATE TYPE "ReservationSource" AS ENUM ('MEMBER', 'ADMIN');

-- AlterTable
ALTER TABLE "reservations" ADD COLUMN "source" "ReservationSource";

