import type { Prisma } from "@prisma/client";
import { formatYmdLocal, parseYmdToPrismaDate } from "@/lib/calendar-day";
import { addPackDurationToStartDate } from "@/lib/pack-duration";
import { getEligibilityForPack, isCourseAllowedForPack } from "@/lib/pack-eligibility";
import { isPackSessionDebited } from "@/lib/pack-session-consumption";
import { syncBalancesFromOpenEnrollments } from "@/lib/admin/member-owned-packs";
import {
  allocateConsumedSessionsAcrossMemberEnrollments,
  repairFifoEnrollmentActivationForMember,
} from "@/lib/admin/member-pack-enrollment";
import { prisma } from "@/lib/prisma";

function toDay(d: Date): Date {
  return parseYmdToPrismaDate(formatYmdLocal(d))!;
}

/**
 * Après upgrade d'inscription (ex. START → GLOW) ou réparation manuelle :
 * récupère les séances encore débitées sur des packs **achetés plus tard**
 * tant que le pack cible a de la capacité FIFO et que la séance tombe dans sa fenêtre
 * (1ʳᵉ séance + durée catalogue).
 *
 * Corrige le cas Anissa : GLOW a des restants mais l'historique affiche INFINITY.
 */
export async function reclaimSessionsOntoEnrollmentFromNewerPacks(input: {
  memberId: string;
  enrollmentId: string;
  db?: Prisma.TransactionClient | typeof prisma;
}): Promise<number> {
  const db = input.db ?? prisma;

  const enrollment = await db.memberPackEnrollment.findFirst({
    where: { id: input.enrollmentId, memberId: input.memberId },
    select: {
      id: true,
      packId: true,
      purchasedAt: true,
      packStartedAt: true,
      packExpiresAt: true,
      prolongedAt: true,
      status: true,
      additionalSessionsCredit: true,
      pack: {
        select: {
          id: true,
          sessionCount: true,
          durationDays: true,
          category: true,
          courseQuotas: { select: { courseSlug: true, sessionCount: true } },
        },
      },
    },
  });
  if (!enrollment) return 0;
  if (enrollment.status !== "ACTIVE" && enrollment.status !== "PENDING_START") return 0;

  const allEnrollments = await db.memberPackEnrollment.findMany({
    where: { memberId: input.memberId },
    orderBy: [{ purchasedAt: "asc" }, { createdAt: "asc" }],
    include: {
      pack: {
        select: {
          sessionCount: true,
          category: true,
          courseQuotas: { select: { courseSlug: true, sessionCount: true } },
        },
      },
    },
  });

  const allocations = await allocateConsumedSessionsAcrossMemberEnrollments({
    memberId: input.memberId,
    enrollmentsAsc: allEnrollments,
    countingMode: "debit",
    db,
  });
  const alloc = allocations.get(enrollment.id);
  let remainingSlots = alloc?.remainingTotal ?? 0;
  if (!Number.isFinite(remainingSlots) || remainingSlots <= 0) return 0;

  const windowStart = toDay(
    alloc?.firstSessionDate ?? enrollment.packStartedAt ?? enrollment.purchasedAt,
  );
  let windowEnd: Date | null = null;
  if (enrollment.prolongedAt && enrollment.packExpiresAt) {
    windowEnd = toDay(enrollment.packExpiresAt);
  } else {
    const startForDuration =
      alloc?.firstSessionDate ?? enrollment.packStartedAt ?? enrollment.purchasedAt;
    const fromDuration = addPackDurationToStartDate(
      startForDuration,
      enrollment.pack.durationDays,
    );
    windowEnd = fromDuration
      ? toDay(fromDuration)
      : enrollment.packExpiresAt
        ? toDay(enrollment.packExpiresAt)
        : null;
  }

  const newerEnrollments = await db.memberPackEnrollment.findMany({
    where: {
      memberId: input.memberId,
      id: { not: enrollment.id },
      purchasedAt: { gt: enrollment.purchasedAt },
      status: { in: ["ACTIVE", "PENDING_START", "EXPIRED", "REPLACED"] },
    },
    select: { packId: true },
  });
  const newerPackIds = [...new Set(newerEnrollments.map((row) => row.packId))];
  if (newerPackIds.length === 0) return 0;

  const eligibility = getEligibilityForPack({
    category: enrollment.pack.category ?? null,
    courseQuotas: enrollment.pack.courseQuotas,
  });

  const candidates = await db.reservation.findMany({
    where: {
      memberId: input.memberId,
      debitedPackId: { in: newerPackIds },
      status: { in: ["BOOKED", "ATTENDED", "CANCELLED"] },
      sessionDate: {
        gte: windowStart,
        ...(windowEnd ? { lte: windowEnd } : {}),
      },
    },
    orderBy: [{ sessionDate: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      status: true,
      packRefundedAt: true,
      sessionDate: true,
      planning: { select: { courseSlug: true } },
    },
  });

  const toReassign: string[] = [];
  for (const row of candidates) {
    if (remainingSlots <= 0) break;
    if (
      !isPackSessionDebited({
        status: row.status,
        packRefundedAt: row.packRefundedAt,
      })
    ) {
      continue;
    }
    if (!isCourseAllowedForPack(eligibility, row.planning.courseSlug)) continue;
    toReassign.push(row.id);
    remainingSlots -= 1;
  }

  if (toReassign.length === 0) return 0;

  await db.reservation.updateMany({
    where: { id: { in: toReassign } },
    data: { debitedPackId: enrollment.packId },
  });

  return toReassign.length;
}

/**
 * Parcourt les inscriptions ouvertes (anciennes → récentes) et rapatrie
 * les séances indûment débitées sur des packs plus récents.
 */
export async function repairMemberParallelPackDebitsFifo(memberId: string): Promise<{
  reassigned: number;
  byEnrollment: { enrollmentId: string; packId: string; count: number }[];
}> {
  const enrollments = await prisma.memberPackEnrollment.findMany({
    where: {
      memberId,
      status: { in: ["ACTIVE", "PENDING_START"] },
    },
    orderBy: [{ purchasedAt: "asc" }, { createdAt: "asc" }],
    select: { id: true, packId: true },
  });

  const byEnrollment: { enrollmentId: string; packId: string; count: number }[] = [];
  let reassigned = 0;

  for (const enrollment of enrollments) {
    const count = await reclaimSessionsOntoEnrollmentFromNewerPacks({
      memberId,
      enrollmentId: enrollment.id,
    });
    if (count > 0) {
      byEnrollment.push({
        enrollmentId: enrollment.id,
        packId: enrollment.packId,
        count,
      });
      reassigned += count;
    }
  }

  await syncBalancesFromOpenEnrollments(memberId);
  await repairFifoEnrollmentActivationForMember(memberId);

  return { reassigned, byEnrollment };
}
