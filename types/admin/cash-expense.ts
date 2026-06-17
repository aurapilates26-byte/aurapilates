import type { CashExpenseKind } from "@prisma/client";

export type CashExpenseDto = {
  id: string;
  kind: CashExpenseKind;
  label: string;
  amountDinars: number;
  expenseDateYmd: string;
  note: string | null;
};
