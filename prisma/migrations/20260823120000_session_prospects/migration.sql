-- CreateEnum
CREATE TYPE "SessionProspectStatus" AS ENUM ('ACTIVE', 'CONVERTED', 'PAID_TRIAL');

-- CreateTable
CREATE TABLE "session_prospects" (
    "id" TEXT NOT NULL,
    "planningId" TEXT NOT NULL,
    "sessionDate" DATE NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "courseSlug" TEXT NOT NULL,
    "status" "SessionProspectStatus" NOT NULL DEFAULT 'ACTIVE',
    "convertedMemberId" TEXT,
    "trialPaymentDinars" INTEGER,
    "trialPaymentMethod" "PackPaymentMethod",
    "trialPaidAt" TIMESTAMP(3),
    "createdByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "session_prospects_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "session_prospects_planningId_sessionDate_idx" ON "session_prospects"("planningId", "sessionDate");

-- CreateIndex
CREATE INDEX "session_prospects_status_idx" ON "session_prospects"("status");

-- AddForeignKey
ALTER TABLE "session_prospects" ADD CONSTRAINT "session_prospects_planningId_fkey" FOREIGN KEY ("planningId") REFERENCES "planning"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_prospects" ADD CONSTRAINT "session_prospects_convertedMemberId_fkey" FOREIGN KEY ("convertedMemberId") REFERENCES "members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_prospects" ADD CONSTRAINT "session_prospects_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
