-- Créneau lié à une date précise de la période (évite les doublons sur les périodes 15/30 j).
ALTER TABLE "planning" ADD COLUMN "anchorSessionYmd" DATE;
