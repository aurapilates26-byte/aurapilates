-- CreateEnum
CREATE TYPE "MemberPackEnrollmentStatus" AS ENUM ('PENDING_START', 'ACTIVE', 'EXPIRED', 'REPLACED');

-- CreateTable
CREATE TABLE "member_pack_enrollments" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "packId" TEXT NOT NULL,
    "packPaymentId" TEXT,
    "purchasedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "packStartedAt" TIMESTAMP(3),
    "packExpiresAt" TIMESTAMP(3),
    "status" "MemberPackEnrollmentStatus" NOT NULL DEFAULT 'PENDING_START',
    "closedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "member_pack_enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "member_pack_enrollments_packPaymentId_key" ON "member_pack_enrollments"("packPaymentId");

-- CreateIndex
CREATE INDEX "member_pack_enrollments_memberId_purchasedAt_idx" ON "member_pack_enrollments"("memberId", "purchasedAt");

-- CreateIndex
CREATE INDEX "member_pack_enrollments_memberId_packId_idx" ON "member_pack_enrollments"("memberId", "packId");

-- AddForeignKey
ALTER TABLE "member_pack_enrollments" ADD CONSTRAINT "member_pack_enrollments_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member_pack_enrollments" ADD CONSTRAINT "member_pack_enrollments_packId_fkey" FOREIGN KEY ("packId") REFERENCES "packs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member_pack_enrollments" ADD CONSTRAINT "member_pack_enrollments_packPaymentId_fkey" FOREIGN KEY ("packPaymentId") REFERENCES "pack_payments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
