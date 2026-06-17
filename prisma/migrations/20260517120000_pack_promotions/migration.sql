-- CreateEnum
CREATE TYPE "PackDiscountType" AS ENUM ('PERCENT');

-- CreateTable
CREATE TABLE "pack_promotions" (
    "id" TEXT NOT NULL,
    "label" TEXT,
    "packId" TEXT,
    "discountType" "PackDiscountType" NOT NULL DEFAULT 'PERCENT',
    "discountValue" INTEGER NOT NULL,
    "startsAt" DATE NOT NULL,
    "endsAt" DATE NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pack_promotions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "pack_promotions_packId_idx" ON "pack_promotions"("packId");

-- CreateIndex
CREATE INDEX "pack_promotions_startsAt_endsAt_idx" ON "pack_promotions"("startsAt", "endsAt");

-- CreateIndex
CREATE INDEX "pack_promotions_isActive_idx" ON "pack_promotions"("isActive");

-- AddForeignKey
ALTER TABLE "pack_promotions" ADD CONSTRAINT "pack_promotions_packId_fkey" FOREIGN KEY ("packId") REFERENCES "packs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
