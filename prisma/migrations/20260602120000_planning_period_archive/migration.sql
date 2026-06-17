-- CreateTable
CREATE TABLE "studio_planning_period_archive" (
    "id" TEXT NOT NULL,
    "bookingWindow" "BookingWindow" NOT NULL,
    "periodStartDate" DATE NOT NULL,
    "periodEndDate" DATE NOT NULL,
    "archivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "studio_planning_period_archive_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "studio_planning_period_archive_periodStartDate_key" ON "studio_planning_period_archive"("periodStartDate");

-- CreateIndex
CREATE INDEX "studio_planning_period_archive_periodStartDate_periodEndDate_idx" ON "studio_planning_period_archive"("periodStartDate", "periodEndDate");
