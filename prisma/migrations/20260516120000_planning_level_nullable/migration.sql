-- Niveau optionnel : les cours sans niveau (mat, yoga, danse) n'enregistrent rien.
UPDATE "Planning"
SET "level" = NULL
WHERE "courseSlug" IN ('mat-pilates', 'yoga', 'dance')
  AND "level" = 'ALL_LEVELS';

ALTER TABLE "Planning" ALTER COLUMN "level" DROP NOT NULL;
ALTER TABLE "Planning" ALTER COLUMN "level" DROP DEFAULT;
