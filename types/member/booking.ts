export type MemberPackSummary = {
  remainingSessions: number | null;
  totalSessions: number | null;
  reservedConfirmed: number;
  reservedWaitlist: number;
  mixedRemainingLine: string | null;
  subscriptionStatusLine: string | null;
};

export type MemberBookingRules = {
  lateCancellationRuleEnabled: boolean;
  lateCancellationHours: number;
};

export type MemberPlanningWindow = "WEEKLY" | "FIFTEEN_DAYS" | "ONE_MONTH";

export type MemberPlanningPeriodMeta = {
  status: "active" | "expired" | "upcoming";
  daysUntilEnd: number | null;
  daysSinceExpiry: number | null;
  daysUntilStart: number | null;
  periodLabel: string;
  periodEndYmd: string;
  periodStartYmd: string;
};

export type MemberPlanningOccurrence = {
  planningId: string;
  sessionDate: string;
  courseSlug: string;
  courseLabel: string;
  startTime: string;
  endTime: string;
  level: string | null;
  coachName: string | null;
  coachImageUrl: string | null;
  capacity: number;
  waitlistCapacity: number | null;
  mainOccupied: number;
  waitlistCount: number;
  spotsRemaining: number;
  waitSpotsRemaining: number | null;
  myReservation: { id: string; status: string } | null;
  /** Créneau déjà terminé (jour courant ou passé) — affiché en grisé, non réservable. */
  isPast: boolean;
};

export type MemberReservationItem = {
  id: string;
  status: string;
  sessionDate: string;
  reservedAt: string;
  packRefundedAt?: string | null;
  planning: {
    id: string;
    courseLabel: string;
    startTime: string;
    endTime: string;
    level: string | null;
    coachName: string | null;
    coachImageUrl: string | null;
  };
};
