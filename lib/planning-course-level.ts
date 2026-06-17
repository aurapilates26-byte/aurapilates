import type { PlanningLevel } from "@prisma/client";

/** Seul le reformer impose un niveau (débutant, etc.) à la réservation. */
export const REFORMER_PLANNING_COURSE_SLUG = "pilates-reformer" as const;

/** Créneau historique / admin sans type de cours précis. */
export const PLANNING_NO_COURSE_SLUG = "sans-cours" as const;

export function planningCourseRequiresLevel(courseSlug: string): boolean {
  if (courseSlug === PLANNING_NO_COURSE_SLUG) return false;
  return courseSlug === REFORMER_PLANNING_COURSE_SLUG;
}

export function normalizePlanningLevelForDb(
  courseSlug: string,
  level: PlanningLevel | null | undefined
): PlanningLevel | null {
  if (planningCourseRequiresLevel(courseSlug)) {
    return level ?? null;
  }
  if (level == null || level === "ALL_LEVELS") return null;
  return level;
}

export function resolvePlanningLevelForCourse(
  courseSlug: string,
  level: PlanningLevel | "NONE"
): { ok: true; level: PlanningLevel | null } | { ok: false; message: string } {
  if (level === "NONE") {
    return { ok: true, level: null };
  }
  return { ok: true, level: normalizePlanningLevelForDb(courseSlug, level) };
}
