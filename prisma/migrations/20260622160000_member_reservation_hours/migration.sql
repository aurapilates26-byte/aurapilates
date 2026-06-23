ALTER TABLE "studio_planning_period"
ADD COLUMN IF NOT EXISTS "memberReservationOpenTime" TEXT NOT NULL DEFAULT '08:00';

ALTER TABLE "studio_planning_period"
ADD COLUMN IF NOT EXISTS "memberReservationCloseTime" TEXT NOT NULL DEFAULT '22:00';
