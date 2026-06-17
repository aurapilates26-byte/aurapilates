import type { CashExpenseDto } from "@/types/admin/cash-expense";
import type { CaisseLedgerEntryDto, CaisseLedgerKind } from "@/types/admin/caisse-ledger";

function kindLabel(kind: CaisseLedgerKind): string {
  switch (kind) {
    case "INCOME_PACK":
      return "Vente pack";
    case "EXPENSE_COACH_SESSION":
      return "Coach (séance)";
    case "EXPENSE_COACH_MONTHLY":
      return "Coach (mois)";
    case "EXPENSE_MANUAL_FIXED":
      return "Charge fixe";
    case "EXPENSE_MANUAL_VARIABLE":
      return "Charge variable";
  }
}

export function cashExpenseToLedgerEntry(ex: CashExpenseDto): CaisseLedgerEntryDto {
  const kind = ex.kind === "FIXED" ? "EXPENSE_MANUAL_FIXED" : "EXPENSE_MANUAL_VARIABLE";
  return {
    id: `expense-${ex.id}`,
    kind,
    dateYmd: ex.expenseDateYmd,
    label: ex.label,
    amountDinars: ex.amountDinars,
    direction: "out",
    detail: ex.note ? ex.note : kindLabel(kind),
  };
}

export function sortCaisseLedgerEntries(entries: CaisseLedgerEntryDto[]): CaisseLedgerEntryDto[] {
  return [...entries].sort((a, b) => {
    const byDate = b.dateYmd.localeCompare(a.dateYmd);
    if (byDate !== 0) return byDate;
    if (a.direction !== b.direction) return a.direction === "in" ? -1 : 1;
    return a.label.localeCompare(b.label, "fr");
  });
}
