-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'COACH';

-- AlterTable
ALTER TABLE "coaches" ADD COLUMN IF NOT EXISTS "userId" TEXT;

-- AlterTable
ALTER TABLE "qrcodes" ADD COLUMN IF NOT EXISTS "assignedCoachId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "coaches_userId_key" ON "coaches"("userId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "qrcodes_assignedCoachId_idx" ON "qrcodes"("assignedCoachId");

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "coaches" ADD CONSTRAINT "coaches_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "qrcodes" ADD CONSTRAINT "qrcodes_assignedCoachId_fkey" FOREIGN KEY ("assignedCoachId") REFERENCES "coaches"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
