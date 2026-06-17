-- Règle annulation tardive configurable par l'admin
ALTER TABLE "studio_planning_period"
ADD COLUMN IF NOT EXISTS "lateCancellationRuleEnabled" BOOLEAN NOT NULL DEFAULT true;
