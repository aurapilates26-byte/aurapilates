-- Période planning configurable (date de début + fenêtre 7/15/30 j).
CREATE TABLE "studio_planning_period" (
    "id" TEXT NOT NULL,
    "bookingWindow" "BookingWindow" NOT NULL DEFAULT 'WEEKLY',
    "periodStartDate" DATE NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "studio_planning_period_pkey" PRIMARY KEY ("id")
);

INSERT INTO "studio_planning_period" ("id", "bookingWindow", "periodStartDate", "updatedAt")
VALUES ('singleton', 'WEEKLY', CURRENT_DATE, CURRENT_TIMESTAMP);
