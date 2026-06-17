import "server-only";

import { parseYmdLocal } from "@/lib/calendar-day";
import {
  CAISSE_HISTORY_FETCH_DAYS,
  clampHistoryDays,
  historyPeriodRange,
} from "@/lib/caisse-history-period";
import { buildCaisseLedger } from "@/lib/admin/caisse-ledger";
import { computeCoachPayrollForMonth } from "@/lib/admin/coach-payroll";
import { listCashExpensesForDateRange } from "@/lib/admin/cash-expense";
import { listPackPaymentsForDateRange, syncMissingPackPaymentsFromMembers, yearMonthFromDate } from "@/lib/admin/pack-payment";
import type { CoachMonthlyChargeDto, CoachSessionChargeDto } from "@/types/admin/coach-payroll";
import type { CaisseHistoryPeriod } from "@/types/admin/caisse-history";

export type { CaisseHistoryPeriod };

export { CAISSE_HISTORY_FETCH_DAYS, clampHistoryDays, historyPeriodRange };

function yearMonthsBetween(from: Date, to: Date): string[] {
  const months = new Set<string>();
  const cur = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const end = new Date(to.getFullYear(), to.getMonth(), to.getDate());
  while (cur <= end) {
    months.add(yearMonthFromDate(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return [...months].sort();
}

export async function fetchCaisseHistoryForLastDays(days: number = CAISSE_HISTORY_FETCH_DAYS): Promise<CaisseHistoryPeriod> {
  const range = historyPeriodRange(days);
  const fromDate = parseYmdLocal(range.fromYmd);
  const toDate = parseYmdLocal(range.toYmd);
  if (!fromDate || !toDate) {
    throw new Error("Invalid history date range");
  }
  await syncMissingPackPaymentsFromMembers();

  const months = yearMonthsBetween(fromDate, toDate);

  const [payments, expenses, payrolls] = await Promise.all([
    listPackPaymentsForDateRange(fromDate, toDate),
    listCashExpensesForDateRange(fromDate, toDate),
    Promise.all(months.map((ym) => computeCoachPayrollForMonth(ym))),
  ]);

  const sessionCharges: CoachSessionChargeDto[] = [];
  const monthlyCharges: CoachMonthlyChargeDto[] = [];

  for (const payroll of payrolls) {
    for (const c of payroll.sessionCharges) {
      if (c.sessionDateYmd >= range.fromYmd && c.sessionDateYmd <= range.toYmd) {
        sessionCharges.push(c);
      }
    }
    const monthlyEntryYmd = payroll.billingToYmd;
    for (const m of payroll.monthlyCharges) {
      const ymd = monthlyEntryYmd ?? `${m.yearMonth}-01`;
      if (ymd >= range.fromYmd && ymd <= range.toYmd) {
        monthlyCharges.push(m);
      }
    }
  }

  const billingToYmd = payrolls.find((p) => p.billingToYmd)?.billingToYmd ?? null;

  const ledger = buildCaisseLedger({
    payments,
    expenses,
    coachSessionCharges: sessionCharges,
    coachMonthlyCharges: monthlyCharges,
    billingToYmd,
  });

  return {
    days: range.days,
    fromYmd: range.fromYmd,
    toYmd: range.toYmd,
    ledger,
  };
}
