-- Brouillon période suivante + publication programmée
ALTER TABLE "studio_planning_period" ADD COLUMN "draftPeriodStartDate" DATE;
ALTER TABLE "studio_planning_period" ADD COLUMN "draftBookingWindow" "BookingWindow";
ALTER TABLE "studio_planning_period" ADD COLUMN "draftPublishAt" TIMESTAMP(3);

ALTER TABLE "planning" ADD COLUMN "isDraft" BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX "planning_isDraft_idx" ON "planning"("isDraft");
