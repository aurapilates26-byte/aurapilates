import type { CoachPayrollMode } from "@prisma/client";
import type { PlanningBookingWindow } from "@/types/admin/planning";

/** Période planning (7 / 15 / 30 j) à l'intérieur du mois caisse. */
export type CoachPayrollPeriodDto = {
  periodIndex: number;
  fromYmd: string;
  toYmd: string;
  periodLabel: string;
  sessionsInPeriod: number;
  costDinars: number;
};

/** Créneau planning d'un coach pour le détail caisse (mode séance uniquement). */
export type CoachPayrollSlotDto = {
  planningId: string;
  dayOfWeek: string;
  dayLabel: string;
  courseSlug: string;
  courseLabel: string;
  startTime: string;
  endTime: string;
  /** Séances déjà passées et facturées dans le mois. */
  sessionsInMonth: number;
  /** Séances planifiées mais pas encore terminées. */
  sessionsUpcomingInMonth: number;
  sessionCostDinars: number;
  monthlyCostDinars: number;
};

/** Détail d'une occurrence (passée facturée ou à venir). */
export type CoachSessionDetailDto = {
  id: string;
  planningId: string;
  sessionDateYmd: string;
  dayLabel: string;
  startTime: string;
  endTime: string;
  courseLabel: string;
  timeLabel: string;
  isBilled: boolean;
  attendanceCount: number;
  /** 50 ou 100 si facturée ; null si à venir. */
  ratePct: number | null;
  amountDinars: number | null;
  periodLabel: string;
  periodIndex: number;
};

/** Une séance coach comptabilisée (mode PER_SESSION). */
export type CoachSessionChargeDto = {
  id: string;
  coachId: string;
  coachName: string;
  sessionDateYmd: string;
  courseLabel: string;
  timeLabel: string;
  amountDinars: number;
  attendanceCount: number;
  ratePct: number;
  periodLabel: string;
  periodIndex: number;
};

/** Charge mensuelle fixe (mode PER_MONTH). */
export type CoachMonthlyChargeDto = {
  id: string;
  coachId: string;
  coachName: string;
  amountDinars: number;
  yearMonth: string;
};

/** Détail charge coach pour un mois. */
export type CoachPayrollLineDto = {
  coachId: string;
  coachName: string;
  payrollMode: CoachPayrollMode;
  payrollModeLabel: string;
  sessionCostDinars: number;
  monthlySalaryDinars: number;
  recurringSlotCount: number;
  templateWeekCostDinars: number;
  /** Séances passées facturées (présence → 100 %, sinon 50 %). */
  sessionsInMonth: number;
  sessionsUpcomingInMonth: number;
  monthlyCostDinars: number;
  slots: CoachPayrollSlotDto[];
  periods: CoachPayrollPeriodDto[];
  sessionDetails: CoachSessionDetailDto[];
};

export type CoachPayrollMonthSummary = {
  bookingWindow: PlanningBookingWindow;
  bookingWindowLabel: string;
  periodStartYmd: string;
  periodEndYmd: string;
  weeklyRepetitionCount: number;
  billingPeriodLabel: string | null;
  billingFromYmd: string | null;
  billingToYmd: string | null;
  periodCount: number;
  lines: CoachPayrollLineDto[];
  sessionCharges: CoachSessionChargeDto[];
  monthlyCharges: CoachMonthlyChargeDto[];
  totalDinars: number;
  sessionCoachCount: number;
  monthlyCoachCount: number;
  sessionPayrollTotalDinars: number;
  monthlyPayrollTotalDinars: number;
};
