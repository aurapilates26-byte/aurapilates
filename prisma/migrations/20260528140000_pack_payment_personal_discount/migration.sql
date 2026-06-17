-- CreateEnum
CREATE TYPE "PersonalDiscountType" AS ENUM ('PERCENT', 'AMOUNT');

-- AlterTable
ALTER TABLE "pack_payments"
ADD COLUMN "personalDiscountType" "PersonalDiscountType",
ADD COLUMN "personalDiscountValue" INTEGER,
ADD COLUMN "personalDiscountDinars" INTEGER NOT NULL DEFAULT 0;
