-- Prospect annulé depuis Réservations (badge « Annulé », ne compte plus dans les places).
ALTER TYPE "SessionProspectStatus" ADD VALUE IF NOT EXISTS 'CANCELLED';
