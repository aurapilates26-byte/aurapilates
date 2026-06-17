import type { CoachPayrollMode } from "@prisma/client";

export type { CoachPayrollMode };

export const COACH_PAYROLL_MODE_OPTIONS = [
  { value: "PER_SESSION" as const, label: "Payé par séance" },
  { value: "PER_MONTH" as const, label: "Payé par mois (forfait)" },
];

export function coachPayrollModeLabelFr(mode: CoachPayrollMode): string {
  if (mode === "PER_MONTH") return "Par mois";
  return "Par séance";
}

export function validateActiveCoachPayroll(input: {
  isActive: boolean;
  payrollMode: CoachPayrollMode;
  sessionCostDinars: number | null;
  monthlySalaryDinars: number | null;
}): string | null {
  if (!input.isActive) return null;

  if (input.payrollMode === "PER_MONTH") {
    if (input.monthlySalaryDinars == null || input.monthlySalaryDinars <= 0) {
      return "Un coach actif payé par mois doit avoir un forfait mensuel supérieur à 0 DT.";
    }
    return null;
  }

  if (input.sessionCostDinars == null || input.sessionCostDinars <= 0) {
    return "Un coach actif payé par séance doit avoir un coût/séance supérieur à 0 DT.";
  }
  return null;
}
