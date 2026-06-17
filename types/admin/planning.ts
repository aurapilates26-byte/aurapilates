import type { PlanningLevel } from "@prisma/client";

export type { PlanningLevel };
export type PlanningDayOfWeek = "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT" | "SUN";
export type PlanningBookingWindow = "WEEKLY" | "FIFTEEN_DAYS" | "ONE_MONTH";

export type AdminPlanningItem = {
  id: string;
  courseSlug: string;
  dayOfWeek: PlanningDayOfWeek;
  /** Date calendaire liée à la période (Y-M-D). */
  anchorSessionYmd: string | null;
  level: PlanningLevel | null;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  capacity: number;
  waitlistCapacity: number | null;
  coach: { id: string; firstName: string; lastName: string; imageUrl: string | null } | null;
  createdAt: string;
  updatedAt: string;
};

export type PlanningFilters = {
  search: string;
  dayOfWeek: "ALL" | PlanningDayOfWeek;
};

export type PlanningViewMode = "list" | "session-form" | "period-form";

/** Config période planning (admin + caisse + membre). */
export type PlanningPeriodConfig = {
  bookingWindow: PlanningBookingWindow;
  periodStartYmd: string;
  periodEndYmd: string;
  periodLabel: string;
};

export type PlanningPeriodStatus = "active" | "expired" | "upcoming";

export type PlanningPeriodRenewalSuggestion = {
  bookingWindow: PlanningBookingWindow;
  periodStartYmd: string;
  periodEndYmd: string;
  periodLabel: string;
};

/** Config + état calculé (active / expirée / à venir). */
export type PlanningPeriodEnriched = PlanningPeriodConfig & {
  status: PlanningPeriodStatus;
  daysUntilEnd: number | null;
  daysSinceExpiry: number | null;
  daysUntilStart: number | null;
  suggestedRenewal: PlanningPeriodRenewalSuggestion | null;
};

/** Période suivante en brouillon (admin uniquement). */
export type PlanningPeriodDraftSchedule = PlanningPeriodEnriched & {
  publishAtIso: string | null;
  publishAtYmd: string | null;
  publishAtTime: string;
  sundayPublishAtIso: string | null;
  sundayPublishAtYmd: string | null;
  partialPublishLabel: string | null;
  fullPublishLabel: string | null;
  publicationPhase: "SCHEDULED" | "PARTIAL" | null;
  /** true = publication samedi 13h pas encore passée */
  scheduled: boolean;
  statusLabel: string;
};

export type AdminPlanningPeriodWindow = {
  published: PlanningPeriodEnriched;
  draft: PlanningPeriodDraftSchedule | null;
  bookingRules: {
    lateCancellationRuleEnabled: boolean;
    lateCancellationHours: number;
  };
};

export type PlanningAdminScope = "published" | "draft" | "archive";

/** Période archivée (historique admin). */
export type PlanningArchivedPeriodItem = PlanningPeriodConfig & {
  id: string;
  archivedAt: string;
};

