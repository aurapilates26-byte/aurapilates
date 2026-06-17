-- CreateEnum
CREATE TYPE "PackPaymentSource" AS ENUM ('AUTO', 'MANUAL');

-- CreateTable
CREATE TABLE "pack_payments" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "packId" TEXT NOT NULL,
    "amountDinars" INTEGER NOT NULL,
    "listPriceDinars" INTEGER,
    "paidAt" DATE NOT NULL,
    "source" "PackPaymentSource" NOT NULL,
    "promotionId" TEXT,
    "note" TEXT,
    "recordedByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pack_payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "pack_payments_paidAt_idx" ON "pack_payments"("paidAt");

-- CreateIndex
CREATE INDEX "pack_payments_memberId_paidAt_idx" ON "pack_payments"("memberId", "paidAt");

-- CreateIndex
CREATE INDEX "pack_payments_packId_paidAt_idx" ON "pack_payments"("packId", "paidAt");

-- AddForeignKey
ALTER TABLE "pack_payments" ADD CONSTRAINT "pack_payments_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pack_payments" ADD CONSTRAINT "pack_payments_packId_fkey" FOREIGN KEY ("packId") REFERENCES "packs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pack_payments" ADD CONSTRAINT "pack_payments_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "pack_promotions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pack_payments" ADD CONSTRAINT "pack_payments_recordedByUserId_fkey" FOREIGN KEY ("recordedByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
