import "server-only";

import type { Prisma } from "@prisma/client";
import {
  formatYmdLocal,
  formatYmdPrismaDate,
  parseYmdLocal,
  parseYmdToPrismaDate,
  prismaDayOfWeekFromLocalDate,
} from "@/lib/calendar-day";
import { getPlanningPeriodConfig } from "@/lib/admin/planning-period-config";
import {
  isPlanningOccurrenceVisibleToPublic,
  readStaggeredPublicationContext,
} from "@/lib/admin/planning-staggered-publish";
import { planningSlotOccurrenceDates } from "@/lib/planning-slot-occurrences";
import { isSessionYmdWithinPlanningPeriod } from "@/lib/planning-period-status";
import { prisma } from "@/lib/prisma";

const coachSelect = { select: { firstName: true, lastName: true, imageUrl: true } } as const;

export type OperationalPlanningSlot = Prisma.PlanningGetPayload<{
  include: { coach: typeof coachSelect };
}>;

export function planningSlotOccursOnSessionYmd(
  slot: { dayOfWeek: OperationalPlanningSlot["dayOfWeek"]; anchorSessionYmd: Date | null },
  sessionYmd: string,
): boolean {
  const day = parseYmdLocal(sessionYmd);
  if (!day) return false;
  return planningSlotOccurrenceDates(
    { dayOfWeek: slot.dayOfWeek, anchorSessionYmd: slot.anchorSessionYmd },
    day,
    day,
  ).some((d) => formatYmdLocal(d) === sessionYmd);
}

/**
 * Créneaux opérationnels admin pour une date : alignés sur la période publiée
 * (même logique que GET /api/admin/planning?scope=published) + visibilité échelonnée staff.
 */
export async function getAdminOperationalPlanningSlotsForDate(
  sessionYmd: string,
): Promise<OperationalPlanningSlot[]> {
  const day = parseYmdLocal(sessionYmd);
  if (!day) return [];

  const period = await getPlanningPeriodConfig();
  if (!isSessionYmdWithinPlanningPeriod(sessionYmd, period)) {
    return [];
  }

  const periodStart = parseYmdToPrismaDate(period.periodStartYmd);
  const periodEnd = parseYmdToPrismaDate(period.periodEndYmd);
  if (!periodStart || !periodEnd) return [];

  const dayOfWeek = prismaDayOfWeekFromLocalDate(day);
  const staggeredCtx = (await readStaggeredPublicationContext()) ?? {
    mode: "normal" as const,
    published: period,
    draft: null,
    partialLegacySundayYmd: null,
  };

  const candidates = await prisma.planning.findMany({
    where: {
      dayOfWeek,
      ...(staggeredCtx.mode === "partial"
        ? {}
        : {
            isDraft: false,
            anchorSessionYmd: { gte: periodStart, lte: periodEnd },
          }),
    },
    include: { coach: coachSelect },
    orderBy: [{ startTime: "asc" }],
  });

  return candidates.filter((slot) => {
    if (staggeredCtx.mode === "normal") {
      if (slot.isDraft) return false;
      if (!slot.anchorSessionYmd) return false;
      const anchorYmd = formatYmdPrismaDate(slot.anchorSessionYmd);
      if (!isSessionYmdWithinPlanningPeriod(anchorYmd, period)) return false;
    }
    if (!planningSlotOccursOnSessionYmd(slot, sessionYmd)) return false;
    if (!isPlanningOccurrenceVisibleToPublic(staggeredCtx, slot, sessionYmd)) return false;
    return true;
  });
}

export function pickActiveOperationalSlot(
  slots: OperationalPlanningSlot[],
  nowTime: string,
  leadMinutes = 15,
): OperationalPlanningSlot | null {
  const [h, m] = nowTime.split(":").map(Number);
  const now = new Date(2000, 0, 1, h ?? 0, m ?? 0);
  const open = new Date(now.getTime() + leadMinutes * 60_000);
  const openHm = `${String(open.getHours()).padStart(2, "0")}:${String(open.getMinutes()).padStart(2, "0")}`;

  return (
    slots
      .filter((s) => s.startTime <= openHm && s.endTime >= nowTime)
      .sort((a, b) => b.startTime.localeCompare(a.startTime))[0] ?? null
  );
}
