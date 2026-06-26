ALTER TABLE "reservations"
ADD COLUMN IF NOT EXISTS "debitedPackId" TEXT;

CREATE INDEX IF NOT EXISTS "reservations_debitedPackId_idx" ON "reservations"("debitedPackId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'reservations_debitedPackId_fkey'
  ) THEN
    ALTER TABLE "reservations"
    ADD CONSTRAINT "reservations_debitedPackId_fkey"
    FOREIGN KEY ("debitedPackId") REFERENCES "packs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
