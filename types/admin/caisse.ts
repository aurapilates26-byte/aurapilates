import type { CashExpenseDto } from "@/types/admin/cash-expense";
import type { CaisseBreakdownRowDto, CaisseLedgerEntryDto } from "@/types/admin/caisse-ledger";
import type {
  CoachMonthlyChargeDto,
  CoachPayrollLineDto,
  CoachSessionChargeDto,
} from "@/types/admin/coach-payroll";
import type { ProspectPaymentDto } from "@/types/admin/prospect-payment";
import type { PackPaymentDto } from "@/types/admin/pack-payment";
import type { PlanningBookingWindow, PlanningPeriodStatus } from "@/types/admin/planning";

export type CaisseMonthSnapshot = {
  yearMonth: string;
  incomeTotalDinars: number;
  expenseTotalDinars: number;
  balanceDinars: number;
  /** Charges saisies manuellement (loyer, fournitures…). */
  manualExpenseTotalDinars: number;
  /** Charges coachs actifs (planning × coût/séance). */
  coachPayrollTotalDinars: number;
  /** Fenêtre planning studio (7 / 15 / 30 j) utilisée pour le découpage du mois. */
  planningBookingWindow: PlanningBookingWindow;
  planningBookingWindowLabel: string;
  planningPeriodStartYmd: string;
  planningPeriodEndYmd: string;
  /** Mois calendaire facturé pour les coachs (créneaux récurrents × occurrences). */
  planningBillingPeriodLabel: string | null;
  planningBillingFromYmd: string | null;
  planningBillingToYmd: string | null;
  planningPeriodCount: number;
  planningWeeklyRepetitionCount: number;
  planningPeriodStatus: PlanningPeriodStatus;
  /** Message si la période planning ne recoupe pas le mois ou est expirée. */
  planningPeriodCoachHint: string | null;
  /** Ventes pack (auto à la création / renouvellement adhérente). */
  payments: PackPaymentDto[];
  /** Séances d'essai prospect payées à l'unité (sans pack). */
  prospectPayments: ProspectPaymentDto[];
  /** Charges saisies manuellement. */
  expenses: CashExpenseDto[];
  /** Détail par coach actif pour le mois. */
  coachPayroll: CoachPayrollLineDto[];
  /** Historique séance par séance (coachs). */
  coachSessionCharges: CoachSessionChargeDto[];
  coachMonthlyCharges: CoachMonthlyChargeDto[];
  coachSessionPayrollTotalDinars: number;
  coachMonthlyPayrollTotalDinars: number;
  coachSessionCount: number;
  coachMonthlyCount: number;
  /** Journal chronologique unifié du mois. */
  ledger: CaisseLedgerEntryDto[];
  /** Ventilation synthétique entrées / charges. */
  breakdown: CaisseBreakdownRowDto[];
};
