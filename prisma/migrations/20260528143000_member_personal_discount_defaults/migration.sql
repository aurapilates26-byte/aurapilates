-- AlterTable
ALTER TABLE "members"
ADD COLUMN "personalDiscountType" "PersonalDiscountType",
ADD COLUMN "personalDiscountValue" INTEGER,
ADD COLUMN "personalDiscountReason" TEXT;
