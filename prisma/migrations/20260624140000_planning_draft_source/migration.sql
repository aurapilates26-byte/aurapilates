-- AlterTable
ALTER TABLE "planning" ADD COLUMN "draftSourceId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "planning_draftSourceId_key" ON "planning"("draftSourceId");

-- CreateIndex
CREATE INDEX "planning_draftSourceId_idx" ON "planning"("draftSourceId");

-- AddForeignKey
ALTER TABLE "planning" ADD CONSTRAINT "planning_draftSourceId_fkey" FOREIGN KEY ("draftSourceId") REFERENCES "planning"("id") ON DELETE CASCADE ON UPDATE CASCADE;
