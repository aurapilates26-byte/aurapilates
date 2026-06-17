import {
  addLocalDays,
  formatYmdLocal,
  parseYmdLocal,
  startOfLocalToday,
} from "@/lib/calendar-day";
import {
  bookingWindowDateRange,
  formatPeriodIntervalFr,
} from "@/lib/planning-booking-window";
import type {
  PlanningBookingWindow,
  PlanningPeriodConfig,
  PlanningPeriodEnriched,
  PlanningPeriodRenewalSuggestion,
  PlanningPeriodStatus,
} from "@/types/admin/planning";

const PERIOD_END_WARNING_DAYS = 2;

function calendarDayDiff(from: Date, to: Date): number {
  const a = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const b = new Date(to.getFullYear(), to.getMonth(), to.getDate());
  return Math.round((b.getTime() - a.getTime()) / (24 * 60 * 60 * 1000));
}

/** Prochaine fenêtre : lendemain de la fin de période actuelle (ou aujourd'hui). */
export function proposeNextPlanningPeriod(
  config: PlanningPeriodConfig,
): PlanningPeriodRenewalSuggestion {
  const end = parseYmdLocal(config.periodEndYmd);
  const nextStart = end ? addLocalDays(end, 1) : startOfLocalToday();
  const { from, to } = bookingWindowDateRange(config.bookingWindow, nextStart);
  return {
    bookingWindow: config.bookingWindow,
    periodStartYmd: formatYmdLocal(from),
    periodEndYmd: formatYmdLocal(to),
    periodLabel: formatPeriodIntervalFr(from, to),
  };
}

export function enrichPlanningPeriodConfig(
  config: PlanningPeriodConfig,
  today: Date = startOfLocalToday(),
): PlanningPeriodEnriched {
  const start = parseYmdLocal(config.periodStartYmd);
  const end = parseYmdLocal(config.periodEndYmd);

  let status: PlanningPeriodStatus = "active";
  let daysUntilEnd: number | null = null;
  let daysSinceExpiry: number | null = null;
  let daysUntilStart: number | null = null;

  if (start && end) {
    if (today.getTime() < start.getTime()) {
      status = "upcoming";
      daysUntilStart = calendarDayDiff(today, start);
    } else if (today.getTime() > end.getTime()) {
      status = "expired";
      daysSinceExpiry = calendarDayDiff(end, today);
    } else {
      status = "active";
      daysUntilEnd = calendarDayDiff(today, end);
    }
  }

  const needsRenewalHint =
    status === "expired" ||
    (status === "active" && daysUntilEnd !== null && daysUntilEnd <= PERIOD_END_WARNING_DAYS);

  const suggestedRenewal = needsRenewalHint ? proposeNextPlanningPeriod(config) : null;

  return {
    ...config,
    status,
    daysUntilEnd,
    daysSinceExpiry,
    daysUntilStart,
    suggestedRenewal,
  };
}

export type PlanningPeriodDateRange = Pick<
  PlanningPeriodConfig,
  "periodStartYmd" | "periodEndYmd"
>;

export function isSessionYmdWithinPlanningPeriod(
  sessionYmd: string,
  config: PlanningPeriodDateRange,
): boolean {
  const ymd = sessionYmd.trim();
  return ymd >= config.periodStartYmd && ymd <= config.periodEndYmd;
}

export function planningPeriodStatusLabelFr(status: PlanningPeriodStatus): string {
  if (status === "expired") return "Période expirée";
  if (status === "upcoming") return "Période à venir";
  return "Période active";
}

export function formatShortYmdFr(ymd: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd);
  if (!m) return ymd;
  return `${m[3]}/${m[2]}/${m[1]}`;
}

export function adminPeriodAlertMessageFr(meta: PlanningPeriodEnriched): string | null {
  if (meta.status === "expired") {
    const since =
      meta.daysSinceExpiry != null && meta.daysSinceExpiry > 0
        ? ` depuis ${meta.daysSinceExpiry} jour${meta.daysSinceExpiry > 1 ? "s" : ""}`
        : "";
    return `La période de réservation est terminée${since} (${meta.periodLabel}). Les adhérents ne peuvent plus réserver en ligne.`;
  }
  if (
    meta.status === "active" &&
    meta.daysUntilEnd != null &&
    meta.daysUntilEnd <= PERIOD_END_WARNING_DAYS
  ) {
    return `La période se termine ${
      meta.daysUntilEnd === 0 ? "aujourd'hui" : `dans ${meta.daysUntilEnd} jour${meta.daysUntilEnd > 1 ? "s" : ""}`
    } (${formatShortYmdFr(meta.periodEndYmd)}). Pensez à renouveler la période pour la suite.`;
  }
  return null;
}

export function memberPeriodBlockedMessageFr(meta: PlanningPeriodEnriched): string | null {
  if (meta.status === "expired") {
    return `La période de réservation en ligne est terminée (jusqu'au ${formatShortYmdFr(meta.periodEndYmd)}). Le studio publiera prochainement les nouvelles dates. Contactez le studio si besoin.`;
  }
  if (meta.status === "upcoming" && meta.daysUntilStart != null) {
    return `Les réservations ouvriront le ${formatShortYmdFr(meta.periodStartYmd)}.`;
  }
  return null;
}

export function publicPeriodNoticeFr(meta: PlanningPeriodEnriched): string | null {
  if (meta.status === "expired") {
    return "Planning indicatif — réservations en ligne temporairement fermées. Prochaine période à venir.";
  }
  if (meta.status === "upcoming") {
    return `Réservations en ligne à partir du ${formatShortYmdFr(meta.periodStartYmd)}.`;
  }
  return `Réservations en ligne ouvertes jusqu'au ${formatShortYmdFr(meta.periodEndYmd)}.`;
}
