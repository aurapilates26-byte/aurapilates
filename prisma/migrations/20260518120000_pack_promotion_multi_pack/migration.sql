-- AlterTable
ALTER TABLE "pack_promotions" ADD COLUMN "appliesToAll" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "pack_promotion_packs" (
    "promotionId" TEXT NOT NULL,
    "packId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pack_promotion_packs_pkey" PRIMARY KEY ("promotionId","packId")
);

-- Migrate existing rows
INSERT INTO "pack_promotion_packs" ("promotionId", "packId", "createdAt")
SELECT "id", "packId", CURRENT_TIMESTAMP
FROM "pack_promotions"
WHERE "packId" IS NOT NULL;

UPDATE "pack_promotions" SET "appliesToAll" = true WHERE "packId" IS NULL;

-- Drop old single-pack column
ALTER TABLE "pack_promotions" DROP CONSTRAINT IF EXISTS "pack_promotions_packId_fkey";
DROP INDEX IF EXISTS "pack_promotions_packId_idx";
ALTER TABLE "pack_promotions" DROP COLUMN "packId";

-- CreateIndex
CREATE INDEX "pack_promotion_packs_packId_idx" ON "pack_promotion_packs"("packId");

-- AddForeignKey
ALTER TABLE "pack_promotion_packs" ADD CONSTRAINT "pack_promotion_packs_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "pack_promotions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "pack_promotion_packs" ADD CONSTRAINT "pack_promotion_packs_packId_fkey" FOREIGN KEY ("packId") REFERENCES "packs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
