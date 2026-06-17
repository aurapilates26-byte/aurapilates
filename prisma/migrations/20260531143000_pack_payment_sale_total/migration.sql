-- Total attendu pour ventes en plusieurs fois (acompte + solde).
ALTER TABLE "pack_payments" ADD COLUMN "packSaleTotalDinars" INTEGER;

-- Rétro-remplissage : total attendu depuis l'adhérent (inscriptions acompte).
UPDATE "pack_payments" pp
SET "packSaleTotalDinars" = m."expectedPackAmountDinars"
FROM "members" m
WHERE pp."memberId" = m.id
  AND pp."paymentKind" IN ('DEPOSIT', 'BALANCE')
  AND m."expectedPackAmountDinars" IS NOT NULL
  AND pp."packSaleTotalDinars" IS NULL;
