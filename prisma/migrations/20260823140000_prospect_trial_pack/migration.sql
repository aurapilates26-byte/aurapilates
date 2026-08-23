ALTER TABLE "session_prospects" ADD COLUMN "trialPackId" TEXT;
ALTER TABLE "session_prospects" ADD COLUMN "trialListPriceDinars" INTEGER;
ALTER TABLE "session_prospects" ADD COLUMN "trialPersonalDiscountType" "PersonalDiscountType";
ALTER TABLE "session_prospects" ADD COLUMN "trialPersonalDiscountValue" INTEGER;
ALTER TABLE "session_prospects" ADD COLUMN "trialPersonalDiscountReason" TEXT;
ALTER TABLE "session_prospects" ADD COLUMN "trialPersonalDiscountDinars" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "session_prospects" ADD CONSTRAINT "session_prospects_trialPackId_fkey"
  FOREIGN KEY ("trialPackId") REFERENCES "packs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "session_prospects_trialPackId_idx" ON "session_prospects"("trialPackId");
