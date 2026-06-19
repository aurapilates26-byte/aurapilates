-- Niveau optionnel : les cours sans niveau (mat, yoga, danse) n'enregistrent rien.
UPDATE "planning"
SET "level" = NULL
WHERE "courseSlug" IN ('mat-pilates', 'yoga', 'dance')
  AND "level" = 'ALL_LEVELS';

ALTER TABLE "planning" ALTER COLUMN "level" DROP NOT NULL;
ALTER TABLE "planning" ALTER COLUMN "level" DROP DEFAULT;
