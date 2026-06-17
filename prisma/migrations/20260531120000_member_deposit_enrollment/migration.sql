-- CreateEnum
CREATE TYPE "MemberEnrollmentStatus" AS ENUM ('ACTIVE', 'DEPOSIT_PENDING');

-- CreateEnum
CREATE TYPE "PackPaymentKind" AS ENUM ('FULL', 'DEPOSIT', 'BALANCE');

-- AlterTable
ALTER TABLE "members" ADD COLUMN "enrollmentStatus" "MemberEnrollmentStatus" NOT NULL DEFAULT 'ACTIVE';
ALTER TABLE "members" ADD COLUMN "expectedPackAmountDinars" INTEGER;

-- AlterTable
ALTER TABLE "pack_payments" ADD COLUMN "paymentKind" "PackPaymentKind" NOT NULL DEFAULT 'FULL';
