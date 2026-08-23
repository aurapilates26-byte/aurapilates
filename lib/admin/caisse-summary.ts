import "server-only";

import { buildCaisseBreakdown, buildCaisseLedger } from "@/lib/admin/caisse-ledger";
import { computeCoachPayrollForMonth } from "@/lib/admin/coach-payroll";
import { listCashExpensesForMonth, sumCashExpensesForMonth } from "@/lib/admin/cash-expense";
import {
  listPackPaymentsForMonth,
  sumPackPaymentsForMonth,
  syncMissingPackPaymentsFromMembers,
  yearMonthFromDate,
  parseYearMonth,
} from "@/lib/admin/pack-payment";
import {
  listProspectPaymentsForMonth,
  sumProspectPaymentsForMonth,
} from "@/lib/admin/session-prospect";
import { getPlanningPeriodConfigEnriched } from "@/lib/admin/planning-period-config";
import { startOfLocalToday } from "@/lib/calendar-day";
import type { CaisseMonthSnapshot } from "@/types/admin/caisse";

export function currentYearMonth(): string {
  return yearMonthFromDate(startOfLocalToday());
}

export function normalizeYearMonthParam(value: string | null | undefined): string {
  if (value && parseYearMonth(value)) return value;
  return currentYearMonth();
}

export async function fetchCaisseMonthSnapshot(yearMonth: string): Promise<CaisseMonthSnapshot> {
  const normalized = normalizeYearMonthParam(yearMonth);

  await syncMissingPackPaymentsFromMembers();

  const [incomeTotalDinars, prospectIncomeDinars, manualExpenseTotalDinars, payments, prospectPayments, expenses, coachPayroll, periodEnriched] =
    await Promise.all([
    sumPackPaymentsForMonth(normalized),
    sumProspectPaymentsForMonth(normalized),
    sumCashExpensesForMonth(normalized),
    listPackPaymentsForMonth(normalized),
    listProspectPaymentsForMonth(normalized),
    listCashExpensesForMonth(normalized),
    computeCoachPayrollForMonth(normalized),
    getPlanningPeriodConfigEnriched(),
  ]);

  const totalIncomeDinars = incomeTotalDinars + prospectIncomeDinars;

  const coachPayrollTotalDinars = coachPayroll.totalDinars;
  const expenseTotalDinars = manualExpenseTotalDinars + coachPayrollTotalDinars;

  const ledger = buildCaisseLedger({
    payments,
    prospectPayments,
    expenses,
    coachSessionCharges: coachPayroll.sessionCharges,
    coachMonthlyCharges: coachPayroll.monthlyCharges,
    billingToYmd: coachPayroll.billingToYmd,
  });

  const breakdown = buildCaisseBreakdown({
    incomeTotalDinars: totalIncomeDinars,
    coachPayrollTotalDinars,
    sessionPayrollTotalDinars: coachPayroll.sessionPayrollTotalDinars,
    monthlyPayrollTotalDinars: coachPayroll.monthlyPayrollTotalDinars,
    sessionCoachCount: coachPayroll.sessionCoachCount,
    monthlyCoachCount: coachPayroll.monthlyCoachCount,
    manualExpenseTotalDinars,
    payments,
    expenses,
  });

  return {
    yearMonth: normalized,
    incomeTotalDinars: totalIncomeDinars,
    expenseTotalDinars,
    balanceDinars: totalIncomeDinars - expenseTotalDinars,
    manualExpenseTotalDinars,
    coachPayrollTotalDinars,
    planningBookingWindow: coachPayroll.bookingWindow,
    planningBookingWindowLabel: coachPayroll.bookingWindowLabel,
    planningPeriodStartYmd: coachPayroll.periodStartYmd,
    planningPeriodEndYmd: coachPayroll.periodEndYmd,
    planningBillingPeriodLabel: coachPayroll.billingPeriodLabel,
    planningBillingFromYmd: coachPayroll.billingFromYmd,
    planningBillingToYmd: coachPayroll.billingToYmd,
    planningPeriodCount: coachPayroll.periodCount,
    planningWeeklyRepetitionCount: coachPayroll.weeklyRepetitionCount,
    planningPeriodStatus: periodEnriched.status,
    planningPeriodCoachHint:
      coachPayroll.billingPeriodLabel == null && periodEnriched.status === "expired"
        ? `Aucune séance coach ce mois-ci : la période planning (${periodEnriched.periodLabel}) est terminée. Renouvelez la période dans Planning.`
        : coachPayroll.billingPeriodLabel == null
          ? "Aucune séance coach ce mois-ci : la période planning active ne recoupe pas ce mois calendaire."
          : null,
    payments,
    prospectPayments,
    expenses,
    coachPayroll: coachPayroll.lines,
    coachSessionCharges: coachPayroll.sessionCharges,
    coachMonthlyCharges: coachPayroll.monthlyCharges,
    coachSessionPayrollTotalDinars: coachPayroll.sessionPayrollTotalDinars,
    coachMonthlyPayrollTotalDinars: coachPayroll.monthlyPayrollTotalDinars,
    coachSessionCount: coachPayroll.sessionCoachCount,
    coachMonthlyCount: coachPayroll.monthlyCoachCount,
    ledger,
    breakdown,
  };
}
