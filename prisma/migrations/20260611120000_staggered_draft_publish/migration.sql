-- CreateEnum
CREATE TYPE "DraftPublicationPhase" AS ENUM ('SCHEDULED', 'PARTIAL');

-- AlterTable
ALTER TABLE "studio_planning_period" ADD COLUMN "draftSundayPublishAt" TIMESTAMP(3),
ADD COLUMN "draftPublicationPhase" "DraftPublicationPhase";
