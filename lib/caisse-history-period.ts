import { formatYmdLocal, startOfLocalToday } from "@/lib/calendar-day";
import type { CaisseLedgerEntryDto } from "@/types/admin/caisse-ledger";

/** Nombre de jours chargés une seule fois côté API (filtre client ensuite). */
export const CAISSE_HISTORY_FETCH_DAYS = 366;

/** Premier mois avec des données caisse exploitables dans l'historique. */
export const CAISSE_HISTORY_MIN_YEAR_MONTH = "2026-05";

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

export function currentYearMonthLocal(now = startOfLocalToday()): string {
  return `${now.getFullYear()}-${pad2(now.getMonth() + 1)}`;
}

export function daysInCalendarMonth(yearMonth: string): number {
  const m = /^(\d{4})-(\d{2})$/.exec(yearMonth);
  if (!m) return 31;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  return new Date(y, mo, 0).getDate();
}

/** Jour max sélectionnable : aujourd'hui si mois courant, fin du mois si mois passé. */
export function maxSelectableDayInHistoryMonth(yearMonth: string, now = startOfLocalToday()): number {
  const currentYm = currentYearMonthLocal(now);
  if (yearMonth > currentYm) return 1;
  if (yearMonth === currentYm) return now.getDate();
  return daysInCalendarMonth(yearMonth);
}

/** Jour par défaut dans l'input : jour courant (mois en cours) ou tout le mois (mois passé). */
export function defaultHistoryDayThrough(yearMonth: string, now = startOfLocalToday()): number {
  return maxSelectableDayInHistoryMonth(yearMonth, now);
}

export function clampHistoryDayInMonth(yearMonth: string, day: number, now = startOfLocalToday()): number {
  const max = maxSelectableDayInHistoryMonth(yearMonth, now);
  if (!Number.isFinite(day)) return defaultHistoryDayThrough(yearMonth, now);
  return Math.min(Math.max(Math.round(day), 1), max);
}

/** Mois sélectionnables : de 05/2026 au mois courant (pas de mois futur). */
export function listPastHistoryYearMonths(monthCount = 24, now = startOfLocalToday()): string[] {
  const currentYm = currentYearMonthLocal(now);
  const minYm = CAISSE_HISTORY_MIN_YEAR_MONTH;
  const result: string[] = [];
  let y = now.getFullYear();
  let m = now.getMonth();
  for (let i = 0; i < monthCount; i += 1) {
    const ym = `${y}-${pad2(m + 1)}`;
    if (ym < minYm) break;
    if (ym <= currentYm) result.push(ym);
    m -= 1;
    if (m < 0) {
      m = 11;
      y -= 1;
    }
  }
  return result;
}

export function isSelectableHistoryYearMonth(yearMonth: string, now = startOfLocalToday()): boolean {
  return (
    /^\d{4}-\d{2}$/.test(yearMonth) &&
    yearMonth >= CAISSE_HISTORY_MIN_YEAR_MONTH &&
    yearMonth <= currentYearMonthLocal(now)
  );
}

/** Années disponibles dans le sélecteur caisse (05/2026 → année courante). */
export function listSelectableCaisseYears(now = startOfLocalToday()): number[] {
  const minYear = Number(CAISSE_HISTORY_MIN_YEAR_MONTH.slice(0, 4));
  const currentYear = Number(currentYearMonthLocal(now).slice(0, 4));
  const years: number[] = [];
  for (let y = minYear; y <= currentYear; y += 1) years.push(y);
  return years;
}

export function clampHistoryYearMonth(yearMonth: string, now = startOfLocalToday()): string {
  const currentYm = currentYearMonthLocal(now);
  if (!/^\d{4}-\d{2}$/.test(yearMonth)) return currentYm;
  if (yearMonth < CAISSE_HISTORY_MIN_YEAR_MONTH) return CAISSE_HISTORY_MIN_YEAR_MONTH;
  if (yearMonth > currentYm) return currentYm;
  return yearMonth;
}

export function historyMonthPeriodRange(yearMonth: string, dayThrough: number, now = startOfLocalToday()) {
  const day = clampHistoryDayInMonth(yearMonth, dayThrough, now);
  const maxDay = maxSelectableDayInHistoryMonth(yearMonth, now);
  return {
    yearMonth,
    dayThrough: day,
    fromYmd: `${yearMonth}-01`,
    toYmd: `${yearMonth}-${pad2(day)}`,
    daysShown: day,
    daysInMonth: daysInCalendarMonth(yearMonth),
    maxDay,
  };
}

export function filterLedgerByMonth(
  ledger: CaisseLedgerEntryDto[],
  yearMonth: string,
  dayThrough: number,
  now = startOfLocalToday(),
): CaisseLedgerEntryDto[] {
  const { fromYmd, toYmd } = historyMonthPeriodRange(yearMonth, dayThrough, now);
  return ledger.filter((e) => e.dateYmd >= fromYmd && e.dateYmd <= toYmd);
}

// ——— Ancien filtre « N derniers jours » (API serveur) ———

export function clampHistoryDays(days: number): number {
  if (!Number.isFinite(days)) return 7;
  return Math.min(Math.max(Math.round(days), 1), CAISSE_HISTORY_FETCH_DAYS);
}

export function historyPeriodRange(days: number): {
  days: number;
  fromYmd: string;
  toYmd: string;
} {
  const n = clampHistoryDays(days);
  const to = startOfLocalToday();
  const from = new Date(to.getFullYear(), to.getMonth(), to.getDate() - (n - 1));
  return {
    days: n,
    fromYmd: formatYmdLocal(from),
    toYmd: formatYmdLocal(to),
  };
}

export function filterLedgerByDays(ledger: CaisseLedgerEntryDto[], days: number): CaisseLedgerEntryDto[] {
  const { fromYmd, toYmd } = historyPeriodRange(days);
  return ledger.filter((e) => e.dateYmd >= fromYmd && e.dateYmd <= toYmd);
}
