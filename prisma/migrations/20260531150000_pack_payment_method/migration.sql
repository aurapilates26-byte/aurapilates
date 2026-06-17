-- Moyen d'encaissement pack (espèce, chèque, TPE).
CREATE TYPE "PackPaymentMethod" AS ENUM ('CASH', 'CHECK', 'TPE');

ALTER TABLE "pack_payments" ADD COLUMN "paymentMethod" "PackPaymentMethod" NOT NULL DEFAULT 'CASH';
