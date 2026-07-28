import { Prisma } from "@prisma/client";
import { startOfLocalToday } from "@/lib/calendar-day";
import { packExpiresAtLocal } from "@/lib/member-pack-period";
import { prisma } from "@/lib/prisma";

export type MemberPackRenewalMode = "immediate" | "queued";

export type MemberPackState = {
  packId: string | null;
  packStartedAt: Date | null;
  durationDays: string | null;
  sessionCount: number | null;
  courseQuotas: { courseSlug: string; sessionCount: number }[];
  balances: { packId: string; courseSlug: string | null; remaining: number }[];
};

export type PackRenewalDecision = {
  mode: MemberPackRenewalMode;
  remainingSessions: number;
  isExpired: boolean;
  hasActivePack: boolean;
};

function startOfLocalDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function isMemberPackExpiredByDate(
  packStartedAt: Date | null | undefined,
  durationDays: string | null | undefined,
  today: Date = startOfLocalToday()
): boolean {
  if (!packStartedAt) return false;
  const expires = packExpiresAtLocal(packStartedAt, durationDays);
  if (!expires) return false;
  return expires.getTime() < startOfLocalDay(today).getTime();
}

/** Séances restantes sur le pack actuellement assigné à l'adhérente. */
export function getRemainingSessionsForPack(state: MemberPackState): number {
  if (!state.packId) return 0;

  const balancesForPack = state.balances.filter((b) => b.packId === state.packId);
  if (balancesForPack.length > 0) {
    return balancesForPack.reduce((sum, b) => sum + Math.max(0, b.remaining), 0);
  }

  if (state.courseQuotas.length > 0) {
    return state.courseQuotas.reduce((sum, q) => sum + q.sessionCount, 0);
  }

  return state.sessionCount ?? 0;
}

/**
 * Détermine si un nouveau pack doit être mis en file d'attente ou activé tout de suite.
 * File d'attente si le pack actuel n'est pas expiré et contient encore des séances.
 */
export function decidePackRenewal(state: MemberPackState, today: Date = startOfLocalToday()): PackRenewalDecision {
  if (!state.packId) {
    return { mode: "immediate", remainingSessions: 0, isExpired: false, hasActivePack: false };
  }

  const isExpired = isMemberPackExpiredByDate(state.packStartedAt, state.durationDays, today);
  const remainingSessions = getRemainingSessionsForPack(state);

  if (isExpired || remainingSessions <= 0) {
    return { mode: "immediate", remainingSessions, isExpired, hasActivePack: true };
  }

  return { mode: "queued", remainingSessions, isExpired: false, hasActivePack: true };
}

export async function loadMemberPackState(
  tx: typeof prisma | Prisma.TransactionClient,
  memberId: string
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

/** Capacité totale = quota catalogue × nombre d'achats (inscriptions) du même pack. */
export function packBalanceCapacityUnits(enrollmentCount: number, memberHasPackAssigned: boolean): number {
  if (enrollmentCount > 0) return enrollmentCount;
  return memberHasPackAssigned ? 1 : 0;
}

export function computePackCourseRemaining(capacityPerPurchase: number, units: number, used: number): number {
  return Math.max(0, capacityPerPurchase * units - Math.max(0, used));
}

const CONSUMING_FOR_BALANCE_RECOMPUTE = {
  OR: [
    { status: { in: ["BOOKED", "ATTENDED"] as const } },
    { status: "CANCELLED" as const, packRefundedAt: null },
  ],
} satisfies Pick<Prisma.ReservationWhereInput, "OR">;

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

function dedupeCourseQuotas(
  courseQuotas: { courseSlug: string; sessionCount: number }[],
): { courseSlug: string; sessionCount: number }[] {
  const bySlug = new Map<string, number>();
  for (const quota of courseQuotas) {
    bySlug.set(quota.courseSlug, quota.sessionCount);
  }
  return [...bySlug.entries()].map(([courseSlug, sessionCount]) => ({ courseSlug, sessionCount }));
}

/**
 * Recalcule le solde réel d'un pack catalogue pour une adhérente.
 * 2 achats AURA SCULPT (15 Ref + 15 Mat) → capacité 30 Ref + 30 Mat, moins les séances déjà débitées.
 * Idempotent et sûr en concurrence (pas de delete+create naïf).
 */
export async function recomputeMemberPackBalancesForPack(
  tx: typeof prisma | Prisma.TransactionClient,
  input: { memberId: string; packId: string },
): Promise<void> {
  const [pack, enrollmentCount, member] = await Promise.all([
    tx.pack.findUnique({
      where: { id: input.packId },
      select: {
        id: true,
        sessionCount: true,
        courseQuotas: { select: { courseSlug: true, sessionCount: true } },
      },
    }),
    tx.memberPackEnrollment.count({
      where: { memberId: input.memberId, packId: input.packId },
    }),
    tx.member.findUnique({
      where: { id: input.memberId },
      select: { packId: true },
    }),
  ]);
  if (!pack) return;

  const units = packBalanceCapacityUnits(enrollmentCount, member?.packId === input.packId);
  if (units === 0) {
    await tx.memberPackBalance.deleteMany({
      where: { memberId: input.memberId, packId: input.packId },
    });
    return;
  }

  const quotas = dedupeCourseQuotas(pack.courseQuotas);

  if (quotas.length > 0) {
    const desiredSlugs = quotas.map((q) => q.courseSlug);
    await tx.memberPackBalance.deleteMany({
      where: {
        memberId: input.memberId,
        packId: input.packId,
        OR: [{ courseSlug: null }, { courseSlug: { notIn: desiredSlugs } }],
      },
    });

    for (const quota of quotas) {
      const used = await tx.reservation.count({
        where: {
          memberId: input.memberId,
          ...CONSUMING_FOR_BALANCE_RECOMPUTE,
          planning: { courseSlug: quota.courseSlug },
          OR: [
            { debitedPackId: input.packId },
            { debitedPackId: null, status: "ATTENDED" },
          ],
        },
      });
      await setMemberPackBalanceRemaining(tx, {
        memberId: input.memberId,
        packId: pack.id,
        courseSlug: quota.courseSlug,
        remaining: computePackCourseRemaining(quota.sessionCount, units, used),
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

    const used = await tx.reservation.count({
      where: {
        memberId: input.memberId,
        ...CONSUMING_FOR_BALANCE_RECOMPUTE,
        OR: [
          { debitedPackId: input.packId },
          { debitedPackId: null, status: "ATTENDED" },
        ],
      },
    });
    await setMemberPackBalanceRemaining(tx, {
      memberId: input.memberId,
      packId: pack.id,
      courseSlug: null,
      remaining: computePackCourseRemaining(pack.sessionCount, units, used),
    });
  }
}

/** Initialise / aligne le solde (délègue au recalcul dès qu'il existe des inscriptions). */
export async function resetMemberPackBalancesForPack(
  tx: typeof prisma | Prisma.TransactionClient,
  input: { memberId: string; packId: string }
) {
  const enrollmentCount = await tx.memberPackEnrollment.count({
    where: { memberId: input.memberId, packId: input.packId },
  });
  if (enrollmentCount > 0) {
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
  memberId: string
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
  input: { memberId: string; packId: string }
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
  memberId: string
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

export function packRenewalMessageFr(decision: PackRenewalDecision, queuedPackName?: string): string {
  if (decision.mode === "immediate") {
    if (!decision.hasActivePack) {
      return "Le pack sera activé dès la première réservation.";
    }
    if (decision.isExpired) {
      return "Le pack actuel est expiré : le nouveau pack remplace l'ancien et démarrera à la première réservation.";
    }
    return "Les séances du pack actuel sont épuisées : le nouveau pack est activé et démarrera à la première réservation.";
  }

  const sessionsWord = decision.remainingSessions === 1 ? "séance" : "séances";
  const packLabel = queuedPackName ? ` « ${queuedPackName} »` : "";
  return `Le pack${packLabel} a été ajouté. L'adhérente dispose maintenant de plusieurs packs utilisables en parallèle (${decision.remainingSessions} ${sessionsWord} restantes sur le pack précédent).`;
}
