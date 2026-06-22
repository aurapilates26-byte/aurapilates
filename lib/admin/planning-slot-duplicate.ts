import "server-only";

import type { Prisma, PrismaClient } from "@prisma/client";
import { formatYmdPrismaDate } from "@/lib/calendar-day";
import {
  doPlanningGlobalSlotsOverlap,
  isSamePlanningDay,
  PLANNING_SLOT_OVERLAP_ERROR,
} from "@/lib/planning-session-slot";

type DbClient = PrismaClient | Prisma.TransactionClient;

export { PLANNING_SLOT_OVERLAP_ERROR };

export async function findOverlappingPlanningSlot(
  db: DbClient,
  input: {
    anchorSessionYmd: Date;
    startTime: string;
    isDraft: boolean;
    excludeId?: string;
  },
): Promise<{ id: string; startTime: string } | null> {
  const candidates = await db.planning.findMany({
    where: {
      anchorSessionYmd: input.anchorSessionYmd,
      isDraft: input.isDraft,
      ...(input.excludeId ? { id: { not: input.excludeId } } : {}),
    },
    select: { id: true, startTime: true, anchorSessionYmd: true },
  });

  const anchorYmd = formatYmdPrismaDate(input.anchorSessionYmd);

  for (const slot of candidates) {
    const slotAnchor = slot.anchorSessionYmd ? formatYmdPrismaDate(slot.anchorSessionYmd) : null;
    if (
      isSamePlanningDay(slotAnchor, anchorYmd) &&
      doPlanningGlobalSlotsOverlap(slot.startTime, input.startTime)
    ) {
      return { id: slot.id, startTime: slot.startTime };
    }
  }

  return null;
}

/** @deprecated Alias pour findOverlappingPlanningSlot */
export const findDuplicatePlanningSlot = findOverlappingPlanningSlot;

/** @deprecated Utiliser PLANNING_SLOT_OVERLAP_ERROR */
export const PLANNING_SLOT_DUPLICATE_ERROR = PLANNING_SLOT_OVERLAP_ERROR;
