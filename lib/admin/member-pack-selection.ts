import "server-only";

import type { Prisma } from "@prisma/client";
import { startOfLocalToday } from "@/lib/calendar-day";
import { PACK_ERRORS } from "@/lib/create-member-reservation";
import { getEligibilityForPack, isCourseAllowedForPack } from "@/lib/pack-eligibility";
import {
  isSessionDateWithinPackPeriod,
  packExpiresAtLocal,
} from "@/lib/member-pack-period";
import { debitMemberPackSession } from "@/lib/member-pack-session-ledger";
import { prisma } from "@/lib/prisma";

type PackCandidate = {
  packId: string;
  pack: {
    id: string;
    category: string | null;
    durationDays: string | null;
    sessionCount: number | null;
    isActive: boolean;
    courseQuotas: { courseSlug: string; sessionCount: number }[];
  };
  purchasedAt: Date;
  isPrimary: boolean;
  remainingSessions: number;
};

function totalRemaining(
  balances: { courseSlug: string | null; remaining: number }[],
  pack: PackCandidate["pack"],
): number {
  const forPack = balances.filter((b) => b.remaining > 0);
  if (forPack.length > 0) return forPack.reduce((sum, b) => sum + b.remaining, 0);
  if (pack.courseQuotas.length > 0) {
    return pack.courseQuotas.reduce((sum, q) => sum + q.sessionCount, 0);
  }
  return pack.sessionCount ?? 0;
}

async function loadPackCandidates(
  tx: Prisma.TransactionClient,
  memberId: string,
  courseSlug: string,
): Promise<PackCandidate[]> {
  const member = await tx.member.findUnique({
    where: { id: memberId },
    select: {
      packId: true,
      packStartedAt: true,
      packBalances: { select: { packId: true, courseSlug: true, remaining: true } },
      packPayments: {
        select: { packId: true, paidAt: true, createdAt: true },
        orderBy: [{ paidAt: "desc" }, { createdAt: "desc" }],
      },
    },
  });
  if (!member) return [];

  const packIds = new Set<string>();
  if (member.packId) packIds.add(member.packId);
  for (const balance of member.packBalances) packIds.add(balance.packId);
  for (const payment of member.packPayments) packIds.add(payment.packId);
  if (packIds.size === 0) return [];

  const purchasedAtByPack = new Map<string, Date>();
  for (const payment of member.packPayments) {
    const current = purchasedAtByPack.get(payment.packId);
    const candidate = payment.paidAt ?? payment.createdAt;
    if (!current || candidate.getTime() > current.getTime()) {
      purchasedAtByPack.set(payment.packId, candidate);
    }
  }

  const packs = await tx.pack.findMany({
    where: { id: { in: [...packIds] }, isActive: true },
    select: {
      id: true,
      category: true,
      durationDays: true,
      sessionCount: true,
      isActive: true,
      courseQuotas: { select: { courseSlug: true, sessionCount: true } },
    },
  });

  const candidates: PackCandidate[] = [];
  for (const pack of packs) {
    const eligibility = getEligibilityForPack({
      category: pack.category ?? null,
      courseQuotas: pack.courseQuotas,
    });
    if (!isCourseAllowedForPack(eligibility, courseSlug)) continue;

    const balances = member.packBalances.filter((b) => b.packId === pack.id);
    const remainingSessions = totalRemaining(balances, pack);
    if (remainingSessions <= 0) continue;

    candidates.push({
      packId: pack.id,
      pack,
      purchasedAt: purchasedAtByPack.get(pack.id) ?? new Date(0),
      isPrimary: member.packId === pack.id,
      remainingSessions,
    });
  }

  return candidates.sort((a, b) => {
    if (a.isPrimary !== b.isPrimary) return a.isPrimary ? -1 : 1;
    return b.purchasedAt.getTime() - a.purchasedAt.getTime();
  });
}

export async function listBookablePacksForMember(
  memberId: string,
  courseSlug: string,
): Promise<PackCandidate[]> {
  return prisma.$transaction((tx) => loadPackCandidates(tx, memberId, courseSlug));
}

export async function resolvePackForMemberBooking(
  tx: Prisma.TransactionClient,
  input: {
    memberId: string;
    courseSlug: string;
    sessionDateLocal: Date;
    preferredPackId?: string | null;
    primaryPackStartedAt: Date | null;
  },
): Promise<PackCandidate> {
  const candidates = await loadPackCandidates(tx, input.memberId, input.courseSlug);
  if (candidates.length === 0) throw new Error(PACK_ERRORS.noSessionsLeft);

  let selected: PackCandidate | undefined;
  if (input.preferredPackId) {
    selected = candidates.find((c) => c.packId === input.preferredPackId);
    if (!selected) throw new Error(PACK_ERRORS.noSessionsLeft);
  } else {
    selected = candidates[0];
  }

  if (selected.isPrimary && input.primaryPackStartedAt) {
    if (
      !isSessionDateWithinPackPeriod(
        input.sessionDateLocal,
        input.primaryPackStartedAt,
        selected.pack.durationDays,
      )
    ) {
      const expiresAt = packExpiresAtLocal(input.primaryPackStartedAt, selected.pack.durationDays);
      if (expiresAt && input.sessionDateLocal.getTime() > expiresAt.getTime()) {
        throw new Error(PACK_ERRORS.packExpired);
      }
      throw new Error(PACK_ERRORS.packNotStarted);
    }
    const expiresAt = packExpiresAtLocal(input.primaryPackStartedAt, selected.pack.durationDays);
    const today = startOfLocalToday();
    if (expiresAt && expiresAt.getTime() < today.getTime()) {
      throw new Error(PACK_ERRORS.packExpired);
    }
  }

  return selected;
}

export async function debitSelectedPackSession(
  tx: Prisma.TransactionClient,
  input: {
    memberId: string;
    pack: PackCandidate["pack"];
    courseSlug: string;
  },
): Promise<void> {
  await debitMemberPackSession(tx, {
    memberId: input.memberId,
    pack: input.pack,
    courseSlug: input.courseSlug,
  });
}

export type { PackCandidate };
