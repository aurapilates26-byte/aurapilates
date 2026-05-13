-- Colonne encore INTEGER en base alors que Prisma attend du TEXT (P2032).
-- Entiers historiques -> « N jours » ; valeurs deja textuelles conservees.

ALTER TABLE "packs" ALTER COLUMN "durationDays" DROP DEFAULT;

ALTER TABLE "packs" ALTER COLUMN "durationDays" TYPE TEXT USING (
  CASE
    WHEN "durationDays" IS NULL THEN NULL
    WHEN trim("durationDays"::text) ~ '^\d+$' THEN trim("durationDays"::text) || ' jours'
    ELSE trim("durationDays"::text)
  END
);
