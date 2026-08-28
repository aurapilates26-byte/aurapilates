import { addMinutesToClockHHMM, normalizeClockHHMM } from "@/lib/calendar-day";

/** Bloc horaire réservé dans le planning (salle) : toujours 1 h à partir du début. */
export const PLANNING_GLOBAL_SLOT_MINUTES = 60;

export const DEFAULT_PLANNING_COURSE_MINUTES = 50;
export const DEFAULT_PLANNING_CAPACITY = 6;
export const DEFAULT_PLANNING_WAITLIST_CAPACITY = 2;

/** Capacité max par type de cours (places réservables sur le créneau). */
export const SESSION_CAPACITY_BY_COURSE_SLUG: Record<string, number> = {
  "pilates-reformer": 6,
  "mat-pilates": 5,
  "coaching-prive": 1,
  "cours-de-yoga": 5,
  yoga: 5,
  "cours-de-dance": 6,
  dance: 6,
};

export function sessionCapacityForCourseSlug(courseSlug: string): number {
  return SESSION_CAPACITY_BY_COURSE_SLUG[courseSlug] ?? DEFAULT_PLANNING_CAPACITY;
}

/** Capacité effective pour affichage, réservation et décompte des places. */
export function effectivePlanningCapacity(courseSlug: string, storedCapacity?: number | null): number {
  if (Object.prototype.hasOwnProperty.call(SESSION_CAPACITY_BY_COURSE_SLUG, courseSlug)) {
    return SESSION_CAPACITY_BY_COURSE_SLUG[courseSlug]!;
  }
  if (storedCapacity != null && storedCapacity > 0) return storedCapacity;
  return DEFAULT_PLANNING_CAPACITY;
}

export const PLANNING_SLOT_OVERLAP_ERROR =
  "Ce créneau chevauche une séance existante du même cours sur cette date (bloc d'1 heure).";

export type PlanningSlotIdentity = {
  id: string;
  courseSlug: string;
  anchorSessionYmd: string | null;
  startTime: string;
};

export function clockHHMMToMinutes(clock: string): number | null {
  const normalized = normalizeClockHHMM(clock);
  const [hRaw, mRaw] = normalized.split(":");
  const hours = Number(hRaw);
  const minutes = Number(mRaw);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
  return hours * 60 + minutes;
}

export function computePlanningGlobalSlotEnd(startTime: string): string | null {
  return addMinutesToClockHHMM(startTime, PLANNING_GLOBAL_SLOT_MINUTES);
}

export function computePlanningCourseEnd(startTime: string, courseMinutes: number): string | null {
  if (!Number.isFinite(courseMinutes) || courseMinutes <= 0) return null;
  return addMinutesToClockHHMM(startTime, courseMinutes);
}

export function isSamePlanningDay(
  anchorA: string | null | undefined,
  anchorB: string | null | undefined,
): boolean {
  const ymdA = anchorA?.trim();
  const ymdB = anchorB?.trim();
  return Boolean(ymdA && ymdB && ymdA === ymdB);
}

/** True si les blocs globaux d'1 h (même jour implicite) se chevauchent. */
export function doPlanningGlobalSlotsOverlap(startA: string, startB: string): boolean {
  const a = clockHHMMToMinutes(startA);
  const b = clockHHMMToMinutes(startB);
  if (a == null || b == null) return false;
  const endA = a + PLANNING_GLOBAL_SLOT_MINUTES;
  const endB = b + PLANNING_GLOBAL_SLOT_MINUTES;
  return a < endB && b < endA;
}

export function hasPlanningSlotOverlap(
  items: PlanningSlotIdentity[],
  anchorSessionYmd: string,
  courseSlug: string,
  startTime: string,
  excludeId?: string | null,
): boolean {
  const normalizedCourse = courseSlug.trim();
  return items.some(
    (item) =>
      item.id !== excludeId &&
      item.courseSlug === normalizedCourse &&
      isSamePlanningDay(item.anchorSessionYmd, anchorSessionYmd) &&
      doPlanningGlobalSlotsOverlap(item.startTime, startTime),
  );
}
