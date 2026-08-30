-- Prolongation admin : pack expiré réactivé avec séances restantes.
ALTER TABLE "member_pack_enrollments" ADD COLUMN IF NOT EXISTS "prolongedAt" TIMESTAMP(3);
