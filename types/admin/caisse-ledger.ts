/** Ligne du journal comptable mensuel (tri chronologique). */
export type CaisseLedgerKind =
  | "INCOME_PACK"
  | "INCOME_PROSPECT"
  | "EXPENSE_COACH_SESSION"
  | "EXPENSE_COACH_MONTHLY"
  | "EXPENSE_MANUAL_FIXED"
  | "EXPENSE_MANUAL_VARIABLE";

export type CaisseLedgerEntryDto = {
  id: string;
  kind: CaisseLedgerKind;
  dateYmd: string;
  label: string;
  amountDinars: number;
  direction: "in" | "out";
  detail: string;
};

export type CaisseBreakdownRowDto = {
  key: string;
  label: string;
  amountDinars: number;
  kind: "income" | "expense";
};
