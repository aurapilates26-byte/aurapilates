-- AlterTable
ALTER TABLE "member_pack_enrollments" ADD COLUMN IF NOT EXISTS "prolongedFromExpiresAt" TIMESTAMP(3);
