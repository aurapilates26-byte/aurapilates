-- Le moyen de paiement n'est renseigné que lors d'un encaissement explicite (inscription, finalisation, caisse manuelle).
ALTER TABLE "pack_payments" ALTER COLUMN "paymentMethod" DROP DEFAULT;
ALTER TABLE "pack_payments" ALTER COLUMN "paymentMethod" DROP NOT NULL;
UPDATE "pack_payments" SET "paymentMethod" = NULL;
