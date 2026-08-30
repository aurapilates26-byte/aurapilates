-- AlterTable
ALTER TABLE "member_pack_enrollments" ADD COLUMN "categoryReassignedAt" TIMESTAMP(3);

-- Backfill: inscriptions déjà modifiées avec changement de catégorie
UPDATE "member_pack_enrollments" AS e
SET "categoryReassignedAt" = e."updatedAt"
FROM "pack_payments" AS p
WHERE e."packPaymentId" = p.id
  AND p.note LIKE '%changement catégorie%'
  AND e."categoryReassignedAt" IS NULL;
