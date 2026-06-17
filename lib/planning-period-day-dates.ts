import type { DayOfWeek } from "@prisma/client";
import {
  eachOccurrenceInRange,
  formatYmdLocal,
  parseYmdLocal,
  prismaDayOfWeekFromLocalDate,
} from "@/lib/calendar-day";
import { DAY_LABEL_FR } from "@/lib/planning-public-labels";

const JS_TO_PRISMA: DayOfWeek[] = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

const ORDERED_WEEKDAYS: DayOfWeek[] = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

export type PeriodDaySelectOption = {
  /** Valeur formulaire = date Y-M-D */
  value: string;
  label: string;
  dayOfWeek: DayOfWeek;
  sessionYmd: string;
};

/** Tous les jours calendaires de la période [début, fin], tri lundi → dimanche. */
export function buildPeriodDaySelectOptions(
  periodStartYmd: string,
  periodEndYmd: string,
): PeriodDaySelectOption[] {
  const start = parseYmdLocal(periodStartYmd);
  const end = parseYmdLocal(periodEndYmd);
  if (!start || !end || start > end) return [];

  const options: PeriodDaySelectOption[] = [];
  const cur = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate());

  while (cur <= endDay) {
    const sessionYmd = formatYmdLocal(cur);
    const dayOfWeek = prismaDayOfWeekFromLocalDate(cur);
    options.push({
      value: sessionYmd,
      label: `${DAY_LABEL_FR[dayOfWeek]} — ${formatPlanningDayShortFr(sessionYmd)}`,
      dayOfWeek,
      sessionYmd,
    });
    cur.setDate(cur.getDate() + 1);
  }

  return options.sort((a, b) => {
    const dow = ORDERED_WEEKDAYS.indexOf(a.dayOfWeek) - ORDERED_WEEKDAYS.indexOf(b.dayOfWeek);
    if (dow !== 0) return dow;
    return a.sessionYmd.localeCompare(b.sessionYmd);
  });
}

/** Jours de la semaine (lun–dim) présents au moins une fois dans la période. */
export function weekdaysPresentInPeriod(periodStartYmd: string, periodEndYmd: string): DayOfWeek[] {
  const map = calendarYmdsByWeekdayInPeriod(periodStartYmd, periodEndYmd);
  return ORDERED_WEEKDAYS.filter((d) => (map.get(d)?.length ?? 0) > 0);
}

export function dayOfWeekFromSessionYmd(sessionYmd: string): DayOfWeek | null {
  const d = parseYmdLocal(sessionYmd);
  if (!d) return null;
  return prismaDayOfWeekFromLocalDate(d);
}

/** Ex. 2026-05-26 → 26/05 */
export function formatPlanningDayShortFr(ymd: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd.trim());
  if (!m) return ymd;
  return `${m[3]}/${m[2]}`;
}

/** Libellé sous le jour : une date ou plusieurs séparées par · */
export function formatPlanningDayDatesLine(ymds: string[]): string {
  return ymds.map(formatPlanningDayShortFr).join(" · ");
}

/**
 * Pour chaque jour de la semaine, liste des dates calendaires (Y-M-D)
 * comprises dans [periodStartYmd, periodEndYmd].
 */
export function calendarYmdsByWeekdayInPeriod(
  periodStartYmd: string,
  periodEndYmd: string,
): Map<DayOfWeek, string[]> {
  const start = parseYmdLocal(periodStartYmd);
  const end = parseYmdLocal(periodEndYmd);
  const map = new Map<DayOfWeek, string[]>();
  if (!start || !end) return map;

  for (const dayOfWeek of ORDERED_WEEKDAYS) {
    const dates = eachOccurrenceInRange(start, end, dayOfWeek);
    if (dates.length > 0) {
      map.set(
        dayOfWeek,
        dates.map((d) => formatYmdLocal(d)),
      );
    }
  }
  return map;
}

export function weekdayDateLineForPeriod(
  periodStartYmd: string | null | undefined,
  periodEndYmd: string | null | undefined,
  dayOfWeek: DayOfWeek,
): string | null {
  if (!periodStartYmd || !periodEndYmd) return null;
  const ymds = calendarYmdsByWeekdayInPeriod(periodStartYmd, periodEndYmd).get(dayOfWeek);
  if (!ymds?.length) return null;
  return formatPlanningDayDatesLine(ymds);
}

export function jsWeekdayDateLineForPeriod(
  periodStartYmd: string | null | undefined,
  periodEndYmd: string | null | undefined,
  jsDay: number,
): string | null {
  const dayOfWeek = JS_TO_PRISMA[jsDay];
  if (!dayOfWeek) return null;
  return weekdayDateLineForPeriod(periodStartYmd, periodEndYmd, dayOfWeek);
}
