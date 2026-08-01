import "server-only";

import type { Prisma } from "@prisma/client";
import {
  formatYmdLocal,
  parseYmdLocal,
  parseYmdToPrismaDate,
  prismaDayOfWeekFromLocalDate,
} from "@/lib/calendar-day";
import {
  draftPeriodConfigOrNull,
  getAdminPlanningPeriodWindow,
} from "@/lib/admin/planning-period-draft";
import {
  isAdminOperationalSlotInScope,
  resolveAdminOperationalScopesForDate,
} from "@/lib/admin/planning-operational-scopes";
import { planningSlotOccurrenceDates } from "@/lib/planning-slot-occurrences";
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
 * Créneaux opérationnels admin pour une date : période publiée et/ou brouillon
 * (même portées que GET /api/admin/planning?scope=published|draft).
 * Indépendant de la visibilité adhérente / site public.
 */
export async function getAdminOperationalPlanningSlotsForDate(
  sessionYmd: string,
): Promise<OperationalPlanningSlot[]> {
  const day = parseYmdLocal(sessionYmd);
  if (!day) return [];

  const window = await getAdminPlanningPeriodWindow();
  const published = window.published;
  const draft = draftPeriodConfigOrNull(window.draft);

  const scopes = resolveAdminOperationalScopesForDate(sessionYmd, published, draft);
  if (scopes.length === 0) return [];

  const dayOfWeek = prismaDayOfWeekFromLocalDate(day);
  const orConditions: Prisma.PlanningWhereInput[] = [];

  if (scopes.includes("published")) {
    const periodStart = parseYmdToPrismaDate(published.periodStartYmd);
    const periodEnd = parseYmdToPrismaDate(published.periodEndYmd);
    if (periodStart && periodEnd) {
      orConditions.push({
        isDraft: false,
        anchorSessionYmd: { gte: periodStart, lte: periodEnd },
      });
    }
  }

  if (scopes.includes("draft") && draft) {
    const draftStart = parseYmdToPrismaDate(draft.periodStartYmd);
    const draftEnd = parseYmdToPrismaDate(draft.periodEndYmd);
    if (draftStart && draftEnd) {
      orConditions.push({
        isDraft: true,
        anchorSessionYmd: { gte: draftStart, lte: draftEnd },
      });
    }
  }

  if (orConditions.length === 0) return [];

  const candidates = await prisma.planning.findMany({
    where: {
      dayOfWeek,
      OR: orConditions,
    },
    include: { coach: coachSelect },
    orderBy: [{ startTime: "asc" }],
  });

  const byId = new Map<string, OperationalPlanningSlot>();
  for (const slot of candidates) {
    if (!planningSlotOccursOnSessionYmd(slot, sessionYmd)) continue;
    if (!isAdminOperationalSlotInScope(slot, scopes, published, draft)) continue;
    byId.set(slot.id, slot);
  }

  return [...byId.values()].sort((a, b) => a.startTime.localeCompare(b.startTime));
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
