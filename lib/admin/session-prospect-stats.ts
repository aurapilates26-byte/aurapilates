import "server-only";

import { prisma } from "@/lib/prisma";

/** Statuts qui occupent une place sur le créneau (essai en cours ou séance payée à l'unité). */
export const SESSION_PROSPECT_OCCUPYING_STATUSES = ["ACTIVE", "PAID_TRIAL"] as const;

export async function countOccupyingProspectsByPlanning(
  planningIds: string[],
  sessionDateDb: Date,
): Promise<Record<string, number>> {
  if (planningIds.length === 0) return {};

  const rows = await prisma.sessionProspect.groupBy({
    by: ["planningId"],
    where: {
      planningId: { in: planningIds },
      sessionDate: sessionDateDb,
      status: { in: [...SESSION_PROSPECT_OCCUPYING_STATUSES] },
    },
    _count: { _all: true },
  });

  return rows.reduce<Record<string, number>>((acc, row) => {
    acc[row.planningId] = row._count._all;
    return acc;
  }, {});
}
