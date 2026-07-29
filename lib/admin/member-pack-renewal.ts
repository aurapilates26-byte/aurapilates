import "server-only";

import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  type MemberPackState,
  packBalanceCapacityUnits,
  computePackCourseRemaining,
} from "@/lib/admin/member-pack-renewal-shared";

export type {
  MemberPackRenewalMode,
  MemberPackState,
  PackRenewalDecision,
} from "@/lib/admin/member-pack-renewal-shared";

export {
  decidePackRenewal,
  getRemainingSessionsForPack,
  isMemberPackExpiredByDate,
  packBalanceCapacityUnits,
  computePackCourseRemaining,
  packRenewalMessageFr,
} from "@/lib/admin/member-pack-renewal-shared";

function isUniqueConstraintError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002"
  );
}

/**
 * Écriture idempotente du solde (évite P2002 en concurrence delete+create).
 * updateMany → create → en cas de course, updateMany à nouveau.
 */
export async function setMemberPackBalanceRemaining(
  tx: typeof prisma | Prisma.TransactionClient,
  input: {
    memberId: string;
    packId: string;
    courseSlug: string | null;
    remaining: number;
  },
): Promise<void> {
  const remaining = Math.max(0, input.remaining);
  const updated = await tx.memberPackBalance.updateMany({
    where: {
      memberId: input.memberId,
      packId: input.packId,
      courseSlug: input.courseSlug,
    },
    data: { remaining },
  });
  if (updated.count > 0) return;

  try {
    await tx.memberPackBalance.create({
      data: {
        memberId: input.memberId,
        packId: input.packId,
        courseSlug: input.courseSlug,
        remaining,
      },
    });
  } catch (error) {
    if (!isUniqueConstraintError(error)) throw error;
    await tx.memberPackBalance.updateMany({
      where: {
        memberId: input.memberId,
        packId: input.packId,
        courseSlug: input.courseSlug,
      },
      data: { remaining },
    });
  }
}

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
          courseQuotas: { select: { courseSlug: true, sessionCount: true } },
        },
      },
      packBalances: { select: { packId: true, courseSlug: true, remaining: true } },
    },
  });

  if (!member) return null;

  return {
    packId: member.packId,
    packStartedAt: member.packStartedAt,
    durationDays: member.pack?.durationDays ?? null,
    sessionCount: member.pack?.sessionCount ?? null,
    courseQuotas: member.pack?.courseQuotas ?? [],
    balances: member.packBalances,
  };
}

function dedupeCourseQuotas(
  courseQuotas: { courseSlug: string; sessionCount: number }[],
): { courseSlug: string; sessionCount: number }[] {
  const bySlug = new Map<string, number>();
  for (const quota of courseQuotas) {
    bySlug.set(quota.courseSlug, quota.sessionCount);
  }
  return [...bySlug.entries()].map(([courseSlug, sessionCount]) => ({ courseSlug, sessionCount }));
}

/** Initialise / aligne le solde (délègue au recalcul dès qu'il existe des inscriptions). */
export async function resetMemberPackBalancesForPack(
  tx: typeof prisma | Prisma.TransactionClient,
  input: { memberId: string; packId: string },
) {
  const enrollmentCount = await tx.memberPackEnrollment.count({
    where: { memberId: input.memberId, packId: input.packId },
  });
  if (enrollmentCount > 0) {
    const { recomputeMemberPackBalancesForPack } = await import(
      "@/lib/admin/member-pack-balance-recompute"
    );
    await recomputeMemberPackBalancesForPack(tx, input);
    return;
  }

  const pack = await tx.pack.findUnique({
    where: { id: input.packId },
    select: { id: true, sessionCount: true, courseQuotas: { select: { courseSlug: true, sessionCount: true } } },
  });
  if (!pack) return;

  const quotas = dedupeCourseQuotas(pack.courseQuotas);
  if (quotas.length > 0) {
    await tx.memberPackBalance.deleteMany({
      where: {
        memberId: input.memberId,
        packId: input.packId,
        OR: [{ courseSlug: null }, { courseSlug: { notIn: quotas.map((q) => q.courseSlug) } }],
      },
    });
    for (const quota of quotas) {
      await setMemberPackBalanceRemaining(tx, {
        memberId: input.memberId,
        packId: pack.id,
        courseSlug: quota.courseSlug,
        remaining: quota.sessionCount,
      });
    }
    return;
  }

  if (pack.sessionCount != null) {
    await tx.memberPackBalance.deleteMany({
      where: {
        memberId: input.memberId,
        packId: input.packId,
        courseSlug: { not: null },
      },
    });
    await setMemberPackBalanceRemaining(tx, {
      memberId: input.memberId,
      packId: pack.id,
      courseSlug: null,
      remaining: pack.sessionCount,
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
