import { addLocalDays, formatYmdLocal, parseYmdLocal, startOfLocalToday } from "@/lib/calendar-day";
import type { PlanningBookingWindow } from "@/types/admin/planning";

/** Aligné sur la fenêtre de réservation membre (`/api/member/planning`). */
export const BOOKING_WINDOW_DAYS: Record<PlanningBookingWindow, number> = {
  WEEKLY: 7,
  FIFTEEN_DAYS: 15,
  ONE_MONTH: 30,
};

function formatDateFrLocal(d: Date): string {
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function bookingWindowDateRange(
  window: PlanningBookingWindow,
  fromDay: Date = startOfLocalToday()
): { from: Date; to: Date } {
  const days = BOOKING_WINDOW_DAYS[window];
  return { from: fromDay, to: addLocalDays(fromDay, days - 1) };
}

/** Ex. « Du 17/05/2026 au 23/05/2026 » */
export function formatBookingWindowIntervalFr(
  window: PlanningBookingWindow,
  fromDay: Date = startOfLocalToday()
): string {
  const { from, to } = bookingWindowDateRange(window, fromDay);
  return formatPeriodIntervalFr(from, to);
}

/** Ex. « Du 17/05/2026 au 23/05/2026 » pour une plage calendaire. */
export function formatPeriodIntervalFr(from: Date, to: Date): string {
  return `Du ${formatDateFrLocal(from)} au ${formatDateFrLocal(to)}`;
}

/** Libellé court (admin caisse / planning). */
export const BOOKING_WINDOW_SHORT_FR: Record<PlanningBookingWindow, string> = {
  WEEKLY: "Planning 7 jours",
  FIFTEEN_DAYS: "Planning 15 jours",
  ONE_MONTH: "Planning 30 jours",
};

/** Nombre de semaines type (lun–dim) répétées dans la fenêtre : 7→1, 15→2, 30→4. */
export function planningWeeklyRepetitionCount(windowDays: number): number {
  if (windowDays < 7) return 1;
  return Math.max(1, Math.floor(windowDays / 7));
}

/**
 * Découpe une plage [from, to] en périodes consécutives de `windowDays` jours
 * (aligné sur la fenêtre planning hebdo / 15 j / mois).
 */
export function partitionRangeIntoBookingPeriods(
  from: Date,
  to: Date,
  windowDays: number,
): { from: Date; to: Date }[] {
  if (windowDays < 1) return [];

  const periods: { from: Date; to: Date }[] = [];
  let cur = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const end = new Date(to.getFullYear(), to.getMonth(), to.getDate());

  while (cur <= end) {
    const periodEnd = addLocalDays(cur, windowDays - 1);
    const clippedEnd = periodEnd > end ? end : periodEnd;
    periods.push({
      from: new Date(cur.getFullYear(), cur.getMonth(), cur.getDate()),
      to: new Date(clippedEnd.getFullYear(), clippedEnd.getMonth(), clippedEnd.getDate()),
    });
    cur = addLocalDays(clippedEnd, 1);
  }

  return periods;
}

/**
 * Intersection entre la période planning active (config studio) et un mois caisse.
 * Les charges coach ne comptent que les séances dans cette plage (pas tout le mois calendaire).
 */
export function intersectionOfMonthAndActivePlanningPeriod(
  periodStartYmd: string,
  periodEndYmd: string,
  monthFrom: Date,
  monthTo: Date,
): { billFrom: Date; billTo: Date; billFromYmd: string; billToYmd: string } | null {
  const periodStart = parseYmdLocal(periodStartYmd);
  const periodEnd = parseYmdLocal(periodEndYmd);
  if (!periodStart || !periodEnd) return null;

  const monthStart = new Date(monthFrom.getFullYear(), monthFrom.getMonth(), monthFrom.getDate());
  const monthEnd = new Date(monthTo.getFullYear(), monthTo.getMonth(), monthTo.getDate());

  const billFrom = periodStart > monthStart ? periodStart : monthStart;
  const billTo = periodEnd < monthEnd ? periodEnd : monthEnd;

  if (billFrom > billTo) return null;

  return {
    billFrom,
    billTo,
    billFromYmd: formatYmdLocal(billFrom),
    billToYmd: formatYmdLocal(billTo),
  };
}

/**
 * Périodes planning alignées sur une date de début fixe (ex. hier pour 15 j),
 * qui recoupent la plage [rangeFrom, rangeTo] (ex. un mois caisse).
 */
export function alignedPlanningPeriodsOverlappingRange(
  anchorStart: Date,
  windowDays: number,
  rangeFrom: Date,
  rangeTo: Date,
): { from: Date; to: Date }[] {
  if (windowDays < 1) return [];

  const anchor = new Date(anchorStart.getFullYear(), anchorStart.getMonth(), anchorStart.getDate());
  let cur = new Date(anchor);
  const rangeFromDay = new Date(rangeFrom.getFullYear(), rangeFrom.getMonth(), rangeFrom.getDate());
  const rangeToDay = new Date(rangeTo.getFullYear(), rangeTo.getMonth(), rangeTo.getDate());

  while (addLocalDays(cur, windowDays - 1) >= rangeFromDay) {
    cur = addLocalDays(cur, -windowDays);
  }

  const periods: { from: Date; to: Date }[] = [];

  while (cur <= rangeToDay) {
    const periodEnd = addLocalDays(cur, windowDays - 1);
    if (periodEnd >= rangeFromDay) {
      const clipFrom = cur < rangeFromDay ? rangeFromDay : new Date(cur);
      const clipTo = periodEnd > rangeToDay ? rangeToDay : periodEnd;
      periods.push({
        from: new Date(clipFrom.getFullYear(), clipFrom.getMonth(), clipFrom.getDate()),
        to: new Date(clipTo.getFullYear(), clipTo.getMonth(), clipTo.getDate()),
      });
    }
    cur = addLocalDays(periodEnd, 1);
  }

  return periods;
}
