import type { DayOfWeek } from "@prisma/client";

const JS_TO_PRISMA: DayOfWeek[] = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

const PRISMA_TO_JS: Record<DayOfWeek, number> = {
  SUN: 0,
  MON: 1,
  TUE: 2,
  WED: 3,
  THU: 4,
  FRI: 5,
  SAT: 6,
};

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

/** Start of today in local timezone (date only, midnight local). */
export function startOfLocalToday(): Date {
  const n = new Date();
  return new Date(n.getFullYear(), n.getMonth(), n.getDate());
}

export function prismaDayOfWeekLocalNow(): DayOfWeek {
  return JS_TO_PRISMA[new Date().getDay()]!;
}

export function prismaDayOfWeekFromLocalDate(d: Date): DayOfWeek {
  return JS_TO_PRISMA[d.getDay()]!;
}

export function formatYmdLocal(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

/**
 * Date calendaire Y-M-D lue depuis Prisma (`@db.Date` / PostgreSQL `date`),
 * sérialisée en JS à minuit UTC. À utiliser pour agréger les réservations
 * sans décalage du jour selon le fuseau (évite places affichées à tort pleines).
 */
export function formatYmdPrismaDate(d: Date): string {
  return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}`;
}

export function parseYmdLocal(ymd: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd.trim());
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  if (!y || !mo || !d) return null;
  return new Date(y, mo - 1, d);
}

/** Date UTC canonique pour persister un `@db.Date` depuis un input YYYY-MM-DD. */
export function parseYmdToPrismaDate(ymd: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd.trim());
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  if (!y || !mo || !d) return null;
  return new Date(Date.UTC(y, mo - 1, d));
}

export function addLocalDays(base: Date, days: number): Date {
  const d = new Date(base.getFullYear(), base.getMonth(), base.getDate());
  d.setDate(d.getDate() + days);
  return d;
}

/**
 * Bornes pour filtrer `@db.Date` côté Prisma/PostgreSQL sans décaler le jour :
 * minuit UTC sur chaque date calendaire locale (inclusif).
 */
export function prismaDateInclusiveUtcRange(fromCal: Date, toCal: Date): { gte: Date; lte: Date } {
  const a = formatYmdLocal(fromCal);
  const b = formatYmdLocal(toCal);
  const [y1, mo1, d1] = a.split("-").map(Number);
  const [y2, mo2, d2] = b.split("-").map(Number);
  return {
    gte: new Date(Date.UTC(y1, mo1 - 1, d1)),
    lte: new Date(Date.UTC(y2, mo2 - 1, d2)),
  };
}

/** Minuit UTC du jour calendaire local (borne basse `gte` pour `@db.Date`). */
export function prismaDateGteFromLocal(fromCal: Date): Date {
  const a = formatYmdLocal(fromCal);
  const [y, mo, d] = a.split("-").map(Number);
  return new Date(Date.UTC(y, mo - 1, d));
}

/** Filtre une liste de dates Prisma @db.Date : garde celles dont le jour Y-M-D est dans [fromYmd, toYmd]. */
export function isYmdInInclusiveWindow(ymd: string, fromYmd: string, toYmd: string): boolean {
  return ymd >= fromYmd && ymd <= toYmd;
}

/** Inclusive range [from, to] on calendar days (local), only dates matching planning dayOfWeek. */
export function eachOccurrenceInRange(from: Date, to: Date, dayOfWeek: DayOfWeek): Date[] {
  const target = PRISMA_TO_JS[dayOfWeek];
  const out: Date[] = [];
  const cur = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const end = new Date(to.getFullYear(), to.getMonth(), to.getDate());
  while (cur <= end) {
    if (cur.getDay() === target) {
      out.push(new Date(cur.getFullYear(), cur.getMonth(), cur.getDate()));
    }
    cur.setDate(cur.getDate() + 1);
  }
  return out;
}

/** Normalise un horaire "HH:MM", "H:M" ou "HH:MM:SS" vers "HH:MM". */
export function normalizeClockHHMM(clock: string): string {
  const parts = clock.trim().split(":");
  const h = pad2(Number(parts[0] ?? 0));
  const m = pad2(Number(parts[1] ?? 0));
  return `${h}:${m}`;
}

/** Fin d'un créneau (date locale Y-M-D + heure de fin HH:MM). */
export function sessionEndLocalFromYmd(ymd: string, endTime: string): Date | null {
  const day = parseYmdLocal(ymd);
  if (!day) return null;
  const clock = normalizeClockHHMM(endTime);
  const [h, m] = clock.split(":").map(Number);
  return new Date(day.getFullYear(), day.getMonth(), day.getDate(), h ?? 0, m ?? 0, 0, 0);
}

/** Compare deux horaires "HH:MM" ou "H:M" / "HH:MM:SS" (heure locale). */
function compareClockHHMM(a: string, b: string): number {
  return normalizeClockHHMM(a).localeCompare(normalizeClockHHMM(b));
}

/** True si l'heure de début du créneau correspond au filtre (ex. 14:00). */
export function planningSlotMatchesStartTime(startTime: string, filterTime: string): boolean {
  return normalizeClockHHMM(startTime) === normalizeClockHHMM(filterTime);
}

/**
 * True si le créneau (jour du cours au format Y-M-D Prisma + heure de fin du planning) est déjà passé
 * en fuseau local. Sert à classer une réservation BOOKED/WAITLIST dans l'historique après la fin du cours.
 */
export function isSessionSlotEndedLocal(
  sessionYmdPrisma: string,
  planningEndTime: string,
  referenceNow: Date = new Date(),
): boolean {
  const todayLocalYmd = formatYmdLocal(
    new Date(referenceNow.getFullYear(), referenceNow.getMonth(), referenceNow.getDate()),
  );
  if (sessionYmdPrisma < todayLocalYmd) return true;
  if (sessionYmdPrisma > todayLocalYmd) return false;
  const nowClock = `${pad2(referenceNow.getHours())}:${pad2(referenceNow.getMinutes())}`;
  return compareClockHHMM(planningEndTime, nowClock) <= 0;
}

/** Inverse de {@link isSessionSlotEndedLocal} — créneau encore réservable. */
export function isSessionSlotBookableLocal(
  sessionYmdLocal: string,
  planningEndTime: string,
  referenceNow: Date = new Date(),
): boolean {
  return !isSessionSlotEndedLocal(sessionYmdLocal, planningEndTime, referenceNow);
}

/** Filtre les créneaux d'un jour : exclut ceux dont l'heure de fin est déjà passée. */
export function filterBookablePlanningSlots<T extends { endTime: string }>(
  sessionYmdLocal: string,
  slots: T[],
  referenceNow?: Date
): T[] {
  return slots.filter((slot) =>
    isSessionSlotBookableLocal(sessionYmdLocal, slot.endTime, referenceNow)
  );
}
