import "server-only";

import type { CashExpenseDto } from "@/types/admin/cash-expense";
import type { CaisseBreakdownRowDto, CaisseLedgerEntryDto, CaisseLedgerKind } from "@/types/admin/caisse-ledger";
import type { CoachMonthlyChargeDto, CoachSessionChargeDto } from "@/types/admin/coach-payroll";
import type { PackPaymentDto } from "@/types/admin/pack-payment";
import { packPaymentMethodLabel } from "@/lib/pack-payment-method";

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

export function buildCaisseLedger(input: {
  payments: PackPaymentDto[];
  expenses: CashExpenseDto[];
  coachSessionCharges: CoachSessionChargeDto[];
  coachMonthlyCharges: CoachMonthlyChargeDto[];
  billingToYmd: string | null;
}): CaisseLedgerEntryDto[] {
  const entries: CaisseLedgerEntryDto[] = [];

  for (const p of input.payments) {
    const promo = p.promotionLabel ? ` · promo ${p.promotionLabel}` : "";
    const personal =
      p.personalDiscountType && p.personalDiscountDinars > 0
        ? ` · remise perso ${p.personalDiscountType === "PERCENT" ? `${p.personalDiscountValue}%` : `${p.personalDiscountValue} DT`}`
        : "";
    const methodLabel =
      p.paymentMethod === "CASH" || p.paymentMethod === "CHECK" || p.paymentMethod === "TPE"
        ? ` · ${packPaymentMethodLabel(p.paymentMethod)}`
        : "";
    const note = p.note ? ` · ${p.note}` : "";
    const paymentKindLabel =
      p.paymentKind === "DEPOSIT"
        ? p.packSaleTotalDinars != null
          ? ` · acompte ${p.amountDinars} DT sur ${p.packSaleTotalDinars} DT (reste ${Math.max(0, p.packSaleTotalDinars - p.amountDinars)} DT)`
          : " · acompte"
        : p.paymentKind === "BALANCE"
          ? p.packSaleTotalDinars != null
            ? ` · solde ${p.amountDinars} DT (vente ${p.packSaleTotalDinars} DT)`
            : " · solde"
          : "";
    entries.push({
      id: `pack-${p.id}`,
      kind: "INCOME_PACK",
      dateYmd: p.paidAtYmd,
      label: p.memberName,
      amountDinars: p.amountDinars,
      direction: "in",
      detail: `${p.packName}${promo}${personal}${paymentKindLabel}${methodLabel}${note} · ${p.source === "AUTO" ? "auto" : "manuel"}`,
    });
  }

  for (const c of input.coachSessionCharges) {
    entries.push({
      id: c.id,
      kind: "EXPENSE_COACH_SESSION",
      dateYmd: c.sessionDateYmd,
      label: c.coachName,
      amountDinars: c.amountDinars,
      direction: "out",
      detail: `${c.courseLabel} · ${c.timeLabel} · ${c.periodLabel}`,
    });
  }

  const firstCoachMonth = input.coachMonthlyCharges[0]?.yearMonth;
  const monthlyDateYmd =
    input.billingToYmd ?? (firstCoachMonth ? `${firstCoachMonth}-01` : "1970-01-01");
  for (const m of input.coachMonthlyCharges) {
    entries.push({
      id: m.id,
      kind: "EXPENSE_COACH_MONTHLY",
      dateYmd: monthlyDateYmd,
      label: m.coachName,
      amountDinars: m.amountDinars,
      direction: "out",
      detail: `Forfait mensuel · ${m.yearMonth}`,
    });
  }

  for (const ex of input.expenses) {
    entries.push({
      id: `expense-${ex.id}`,
      kind: ex.kind === "FIXED" ? "EXPENSE_MANUAL_FIXED" : "EXPENSE_MANUAL_VARIABLE",
      dateYmd: ex.expenseDateYmd,
      label: ex.label,
      amountDinars: ex.amountDinars,
      direction: "out",
      detail: ex.note ? ex.note : kindLabel(ex.kind === "FIXED" ? "EXPENSE_MANUAL_FIXED" : "EXPENSE_MANUAL_VARIABLE"),
    });
  }

  entries.sort((a, b) => {
    const byDate = b.dateYmd.localeCompare(a.dateYmd);
    if (byDate !== 0) return byDate;
    if (a.direction !== b.direction) return a.direction === "in" ? -1 : 1;
    return a.label.localeCompare(b.label, "fr");
  });

  return entries;
}

export function buildCaisseBreakdown(input: {
  incomeTotalDinars: number;
  coachPayrollTotalDinars: number;
  sessionPayrollTotalDinars: number;
  monthlyPayrollTotalDinars: number;
  sessionCoachCount: number;
  monthlyCoachCount: number;
  manualExpenseTotalDinars: number;
  payments: PackPaymentDto[];
  expenses: CashExpenseDto[];
}): CaisseBreakdownRowDto[] {
  const rows: CaisseBreakdownRowDto[] = [
    {
      key: "income-packs",
      label: "Ventes de packs",
      amountDinars: input.incomeTotalDinars,
      kind: "income",
    },
    {
      key: "expense-coaches",
      label: "Coachs (total)",
      amountDinars: input.coachPayrollTotalDinars,
      kind: "expense",
    },
    {
      key: "expense-manual",
      label: "Autres charges",
      amountDinars: input.manualExpenseTotalDinars,
      kind: "expense",
    },
  ];

  if (input.sessionPayrollTotalDinars > 0) {
    rows.push({
      key: "expense-coaches-session",
      label: `↳ Par séance (${input.sessionCoachCount} coach${input.sessionCoachCount > 1 ? "s" : ""})`,
      amountDinars: input.sessionPayrollTotalDinars,
      kind: "expense",
    });
  }

  if (input.monthlyPayrollTotalDinars > 0) {
    rows.push({
      key: "expense-coaches-monthly",
      label: `↳ Par mois (${input.monthlyCoachCount} coach${input.monthlyCoachCount > 1 ? "s" : ""})`,
      amountDinars: input.monthlyPayrollTotalDinars,
      kind: "expense",
    });
  }

  if (input.payments.length > 0) {
    rows.push({
      key: "income-packs-count",
      label: `↳ ${input.payments.length} vente${input.payments.length > 1 ? "s" : ""}`,
      amountDinars: input.incomeTotalDinars,
      kind: "income",
    });
  }

  const fixed = input.expenses.filter((e) => e.kind === "FIXED").reduce((s, e) => s + e.amountDinars, 0);
  const variable = input.expenses.filter((e) => e.kind === "VARIABLE").reduce((s, e) => s + e.amountDinars, 0);
  if (fixed > 0) {
    rows.push({ key: "expense-fixed", label: "↳ Charges fixes", amountDinars: fixed, kind: "expense" });
  }
  if (variable > 0) {
    rows.push({ key: "expense-variable", label: "↳ Charges variables", amountDinars: variable, kind: "expense" });
  }

  return rows;
}

export { kindLabel as caisseLedgerKindLabel };
