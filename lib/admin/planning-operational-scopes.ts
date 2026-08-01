import { formatYmdPrismaDate } from "@/lib/calendar-day";
import { isSessionYmdWithinPlanningPeriod } from "@/lib/planning-period-status";
import type { PlanningPeriodConfig } from "@/types/admin/planning";

export type AdminOperationalSlotScope = "published" | "draft";

type PeriodRange = Pick<PlanningPeriodConfig, "periodStartYmd" | "periodEndYmd">;

/**
 * Portées admin pour une date de séance : publié et/ou brouillon
 * (aligné sur le grid planning scope=published | draft).
 */
export function resolveAdminOperationalScopesForDate(
  sessionYmd: string,
  published: PeriodRange,
  draft: PeriodRange | null,
): AdminOperationalSlotScope[] {
  const scopes: AdminOperationalSlotScope[] = [];
  if (isSessionYmdWithinPlanningPeriod(sessionYmd, published)) {
    scopes.push("published");
  }
  if (draft && isSessionYmdWithinPlanningPeriod(sessionYmd, draft)) {
    scopes.push("draft");
  }
  return scopes;
}

/**
 * Un créneau est éligible pour la réservation admin si son ancre est dans
 * la bonne période (publiée non-draft / brouillon draft) et qu'il tombe ce jour-là.
 */
export function isAdminOperationalSlotInScope(
  slot: {
    isDraft: boolean;
    anchorSessionYmd: Date | string | null;
  },
  scopes: AdminOperationalSlotScope[],
  published: PeriodRange,
  draft: PeriodRange | null,
): boolean {
  if (!slot.anchorSessionYmd) return false;

  const anchorYmd =
    typeof slot.anchorSessionYmd === "string"
      ? slot.anchorSessionYmd.trim()
      : formatYmdPrismaDate(slot.anchorSessionYmd);

  if (scopes.includes("published") && !slot.isDraft) {
    if (isSessionYmdWithinPlanningPeriod(anchorYmd, published)) return true;
  }
  if (scopes.includes("draft") && slot.isDraft && draft) {
    if (isSessionYmdWithinPlanningPeriod(anchorYmd, draft)) return true;
  }
  return false;
}
