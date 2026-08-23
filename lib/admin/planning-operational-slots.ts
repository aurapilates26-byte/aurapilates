import "server-only";

import type { DayOfWeek, Prisma } from "@prisma/client";
import {
  formatYmdLocal,
  formatYmdPrismaDate,
  parseYmdLocal,
  parseYmdToPrismaDate,
  prismaDayOfWeekFromLocalDate,
} from "@/lib/calendar-day";
import {
  draftPeriodConfigOrNull,
  getAdminPlanningPeriodWindow,
} from "@/lib/admin/planning-period-draft";
import { getPlanningPeriodConfig } from "@/lib/admin/planning-period-config";
import {
  isPlanningOccurrenceVisibleToPublic,
  readStaggeredPublicationContext,
  type StaggeredPublicationContext,
} from "@/lib/admin/planning-staggered-publish";
import { planningSlotOccurrenceDates } from "@/lib/planning-slot-occurrences";
import { isSessionYmdWithinPlanningPeriod } from "@/lib/planning-period-status";
import { prisma } from "@/lib/prisma";
import type { PlanningPeriodConfig } from "@/types/admin/planning";

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

async function queryPublishedOperationalSlots(input: {
  sessionYmd: string;
  dayOfWeek: DayOfWeek;
  period: PlanningPeriodConfig;
  staggeredCtx: StaggeredPublicationContext;
}): Promise<OperationalPlanningSlot[]> {
  const periodStart = parseYmdToPrismaDate(input.period.periodStartYmd);
  const periodEnd = parseYmdToPrismaDate(input.period.periodEndYmd);
  if (!periodStart || !periodEnd) return [];

  const candidates = await prisma.planning.findMany({
    where: {
      dayOfWeek: input.dayOfWeek,
      ...(input.staggeredCtx.mode === "partial"
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
    if (input.staggeredCtx.mode === "normal") {
      if (slot.isDraft) return false;
      if (!slot.anchorSessionYmd) return false;
      const anchorYmd = formatYmdPrismaDate(slot.anchorSessionYmd);
      if (!isSessionYmdWithinPlanningPeriod(anchorYmd, input.period)) return false;
    }
    if (!planningSlotOccursOnSessionYmd(slot, input.sessionYmd)) return false;
    if (!isPlanningOccurrenceVisibleToPublic(input.staggeredCtx, slot, input.sessionYmd)) return false;
    return true;
  });
}

async function queryDraftOperationalSlots(input: {
  sessionYmd: string;
  dayOfWeek: DayOfWeek;
  draftPeriod: PlanningPeriodConfig;
}): Promise<OperationalPlanningSlot[]> {
  const periodStart = parseYmdToPrismaDate(input.draftPeriod.periodStartYmd);
  const periodEnd = parseYmdToPrismaDate(input.draftPeriod.periodEndYmd);
  if (!periodStart || !periodEnd) return [];

  const candidates = await prisma.planning.findMany({
    where: {
      dayOfWeek: input.dayOfWeek,
      isDraft: true,
      anchorSessionYmd: { gte: periodStart, lte: periodEnd },
    },
    include: { coach: coachSelect },
    orderBy: [{ startTime: "asc" }],
  });

  return candidates.filter((slot) => {
    if (!slot.anchorSessionYmd) return false;
    const anchorYmd = formatYmdPrismaDate(slot.anchorSessionYmd);
    if (!isSessionYmdWithinPlanningPeriod(anchorYmd, input.draftPeriod)) return false;
    if (!planningSlotOccursOnSessionYmd(slot, input.sessionYmd)) return false;
    return true;
  });
}

/**
 * Créneaux opérationnels admin pour une date : période publiée + brouillon admin
 * (aligné sur GET /api/admin/planning?scope=published|draft) + visibilité échelonnée staff.
 */
export async function getAdminOperationalPlanningSlotsForDate(
  sessionYmd: string,
): Promise<OperationalPlanningSlot[]> {
  const day = parseYmdLocal(sessionYmd);
  if (!day) return [];

  const period = await getPlanningPeriodConfig();
  const { draft: draftSchedule } = await getAdminPlanningPeriodWindow();
  const draftPeriod = draftPeriodConfigOrNull(draftSchedule);

  const inPublished = isSessionYmdWithinPlanningPeriod(sessionYmd, period);
  const inDraft =
    draftPeriod != null && isSessionYmdWithinPlanningPeriod(sessionYmd, draftPeriod);

  if (!inPublished && !inDraft) return [];

  const dayOfWeek = prismaDayOfWeekFromLocalDate(day);
  const staggeredCtx = (await readStaggeredPublicationContext()) ?? {
    mode: "normal" as const,
    published: period,
    draft: draftPeriod,
    partialLegacySundayYmd: null,
  };

  const isPartialLegacySunday =
    staggeredCtx.mode === "partial" &&
    staggeredCtx.partialLegacySundayYmd === sessionYmd;

  const slots: OperationalPlanningSlot[] = [];

  if (inPublished && (isPartialLegacySunday || !inDraft)) {
    slots.push(
      ...(await queryPublishedOperationalSlots({
        sessionYmd,
        dayOfWeek,
        period,
        staggeredCtx,
      })),
    );
  }

  if (inDraft && draftPeriod && !isPartialLegacySunday) {
    slots.push(
      ...(await queryDraftOperationalSlots({
        sessionYmd,
        dayOfWeek,
        draftPeriod,
      })),
    );
  }

  return slots.sort((a, b) => a.startTime.localeCompare(b.startTime));
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
