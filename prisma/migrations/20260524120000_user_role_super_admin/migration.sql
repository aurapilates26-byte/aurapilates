-- Rôle direction : accès complet (vue d'ensemble + caisse).
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'SUPER_ADMIN';
