import "server-only";

import type { Prisma } from "@prisma/client";
import { allocateConsumedSessionsAcrossMemberEnrollments } from "@/lib/admin/member-pack-enrollment";
import { prisma } from "@/lib/prisma";
import type { MemberPackState } from "@/lib/admin/member-pack-renewal-decision";

export {
  decidePackRenewal,
  getRemainingSessionsForPack,
  isMemberPackExpiredByDate,
  packRenewalMessageFr,
  type MemberPackRenewalMode,
  type MemberPackState,
  type PackRenewalDecision,
} from "@/lib/admin/member-pack-renewal-decision";

export async function loadMemberPackState(
  tx: typeof prisma | Prisma.TransactionClient,
  memberId: string,
): Promise<MemberPackState | null> {
  const member = await tx.member.findUnique({
    where: { id: memberId },
    select: {
      packId: true,
      packStartedAt: true,
      pack: {
        select: {
          id: true,
          durationDays: true,
          sessionCount: true,
          category: true,
          courseQuotas: { select: { courseSlug: true, sessionCount: true } },
        },
      },
      packBalances: { select: { packId: true, courseSlug: true, remaining: true } },
      packEnrollments: {
        orderBy: [{ purchasedAt: "asc" }, { createdAt: "asc" }],
        select: {
          id: true,
          packId: true,
          status: true,
          purchasedAt: true,
          closedAt: true,
          packStartedAt: true,
          additionalSessionsCredit: true,
          pack: {
            select: {
              sessionCount: true,
              category: true,
              courseQuotas: { select: { courseSlug: true, sessionCount: true } },
            },
          },
        },
      },
    },
  });

  if (!member) return null;

  let balances = member.packBalances;

  // Source de vérité = inscriptions ouvertes + FIFO (comme le badge Terminé / En cours).
  if (member.packId) {
    const openForPack = member.packEnrollments.filter(
      (e) =>
        e.packId === member.packId &&
        (e.status === "ACTIVE" || e.status === "PENDING_START"),
    );

    if (openForPack.length === 0) {
      balances = member.packBalances.filter((b) => b.packId !== member.packId);
    } else {
      const allocations = await allocateConsumedSessionsAcrossMemberEnrollments({
        memberId,
        enrollmentsAsc: member.packEnrollments,
        countingMode: "display",
        db: tx,
      });
      let remainingTotal = 0;
      for (const enrollment of openForPack) {
        const alloc = allocations.get(enrollment.id);
        if (!alloc) continue;
        remainingTotal += Math.max(0, alloc.remainingTotal);
      }
      balances = [
        ...member.packBalances.filter((b) => b.packId !== member.packId),
        {
          packId: member.packId,
          courseSlug: null,
          remaining: remainingTotal,
        },
      ];
    }
  }

  return {
    packId: member.packId,
    packStartedAt: member.packStartedAt,
    durationDays: member.pack?.durationDays ?? null,
    sessionCount: member.pack?.sessionCount ?? null,
    courseQuotas: member.pack?.courseQuotas ?? [],
    balances,
  };
}

export async function resetMemberPackBalancesForPack(
  tx: typeof prisma | Prisma.TransactionClient,
  input: { memberId: string; packId: string },
) {
  const pack = await tx.pack.findUnique({
    where: { id: input.packId },
    select: {
      id: true,
      sessionCount: true,
      courseQuotas: { select: { courseSlug: true, sessionCount: true } },
    },
  });
  if (!pack) return;

  await tx.memberPackBalance.deleteMany({
    where: { memberId: input.memberId, packId: input.packId },
  });

  if (pack.courseQuotas.length > 0) {
    await tx.memberPackBalance.createMany({
      data: pack.courseQuotas.map((q) => ({
        memberId: input.memberId,
        packId: pack.id,
        courseSlug: q.courseSlug,
        remaining: q.sessionCount,
      })),
    });
    return;
  }

  if (pack.sessionCount != null) {
    await tx.memberPackBalance.create({
      data: {
        memberId: input.memberId,
        packId: pack.id,
        courseSlug: null,
        remaining: pack.sessionCount,
      },
    });
  }
}

async function nextPendingPosition(
  tx: typeof prisma | Prisma.TransactionClient,
  memberId: string,
): Promise<number> {
  const last = await tx.memberPendingPack.findFirst({
    where: { memberId },
    orderBy: { position: "desc" },
    select: { position: true },
  });
  return (last?.position ?? -1) + 1;
}

export async function queueMemberPendingPack(
  tx: typeof prisma | Prisma.TransactionClient,
  input: { memberId: string; packId: string },
) {
  const position = await nextPendingPosition(tx, input.memberId);
  return tx.memberPendingPack.create({
    data: { memberId: input.memberId, packId: input.packId, position },
    select: { id: true, packId: true, position: true, createdAt: true },
  });
}

/** Active le prochain pack en attente (remplace le pack courant sur la fiche membre). */
export async function activateNextPendingPack(
  tx: typeof prisma | Prisma.TransactionClient,
  memberId: string,
): Promise<boolean> {
  const pending = await tx.memberPendingPack.findFirst({
    where: { memberId },
    orderBy: [{ position: "asc" }, { createdAt: "asc" }],
    select: { id: true, packId: true },
  });
  if (!pending) return false;

  await tx.memberPendingPack.delete({ where: { id: pending.id } });

  await tx.member.update({
    where: { id: memberId },
    data: { packId: pending.packId, packStartedAt: null, isActive: false },
  });

  await resetMemberPackBalancesForPack(tx, { memberId, packId: pending.packId });
  return true;
}

/**
 * Les packs en attente sont désormais activés en parallèle (plus de bascule automatique).
 */
export async function tryActivatePendingPackIfCurrentFinished(
  _tx: typeof prisma | Prisma.TransactionClient,
  _memberId: string,
): Promise<boolean> {
  return false;
}

export async function listMemberPendingPacks(memberId: string) {
  if (!("memberPendingPack" in prisma) || !prisma.memberPendingPack) {
    return [];
  }

  return prisma.memberPendingPack.findMany({
    where: { memberId },
    orderBy: [{ position: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      packId: true,
      position: true,
      createdAt: true,
      pack: { select: { id: true, name: true, durationDays: true, sessionCount: true } },
    },
  });
}
