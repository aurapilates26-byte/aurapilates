-- CreateEnum
CREATE TYPE "CashExpenseKind" AS ENUM ('FIXED', 'VARIABLE');

-- CreateTable
CREATE TABLE "cash_expenses" (
    "id" TEXT NOT NULL,
    "kind" "CashExpenseKind" NOT NULL,
    "label" TEXT NOT NULL,
    "amountDinars" INTEGER NOT NULL,
    "expenseDate" DATE NOT NULL,
    "note" TEXT,
    "recordedByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cash_expenses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "cash_expenses_expenseDate_idx" ON "cash_expenses"("expenseDate");

-- AddForeignKey
ALTER TABLE "cash_expenses" ADD CONSTRAINT "cash_expenses_recordedByUserId_fkey" FOREIGN KEY ("recordedByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
