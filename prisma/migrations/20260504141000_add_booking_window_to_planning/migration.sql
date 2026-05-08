-- CreateEnum
CREATE TYPE "BookingWindow" AS ENUM ('WEEKLY', 'FIFTEEN_DAYS', 'ONE_MONTH');

-- AlterTable
ALTER TABLE "planning" ADD COLUMN "bookingWindow" "BookingWindow" NOT NULL DEFAULT 'WEEKLY';
