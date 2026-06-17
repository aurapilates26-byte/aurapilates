import type { Prisma } from "@prisma/client";
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

/** Séances restantes sur le pack actuellement assigné à l'adhérent. */
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

export async function resetMemberPackBalancesForPack(
  tx: typeof prisma | Prisma.TransactionClient,
  input: { memberId: string; packId: string }
) {
  const pack = await tx.pack.findUnique({
    where: { id: input.packId },
    select: { id: true, sessionCount: true, courseQuotas: { select: { courseSlug: true, sessionCount: true } } },
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
 * Si le pack actuel est terminé (expiré ou sans séances), active le prochain pack en file d'attente.
 */
export async function tryActivatePendingPackIfCurrentFinished(
  tx: typeof prisma | Prisma.TransactionClient,
  memberId: string
): Promise<boolean> {
  const state = await loadMemberPackState(tx, memberId);
  if (!state) return false;

  const decision = decidePackRenewal(state);
  if (decision.mode === "queued") return false;

  return activateNextPendingPack(tx, memberId);
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
  return `Le pack actuel a encore ${decision.remainingSessions} ${sessionsWord}. Le pack${packLabel} a été ajouté en file d'attente et s'activera automatiquement à la fin du pack en cours.`;
}
