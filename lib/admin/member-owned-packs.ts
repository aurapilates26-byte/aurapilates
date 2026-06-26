import "server-only";

import type { Prisma } from "@prisma/client";
import { startOfLocalToday } from "@/lib/calendar-day";
import { addPackDurationToStartDate } from "@/lib/pack-duration";
import {
  getRemainingSessionsForPack,
  resetMemberPackBalancesForPack,
  type MemberPackState,
} from "@/lib/admin/member-pack-renewal";
import { sumPackPaymentsForMemberPack } from "@/lib/admin/pack-payment";
import type { PackPaymentMethodValue } from "@/lib/pack-payment-method";
import { prisma } from "@/lib/prisma";

export type MemberOwnedPackStatus = "active" | "expired";

export type MemberOwnedPackDto = {
  packId: string;
  packName: string;
  category: string | null;
  durationDays: string | null;
  priceCents: number | null;
  sessionCount: number | null;
  courseQuotas: { courseSlug: string; sessionCount: number }[];
  purchasedAt: string;
  isPrimary: boolean;
  status: MemberOwnedPackStatus;
  packStartedAt: string | null;
  packExpiresAt: string | null;
  packPaymentMethod: PackPaymentMethodValue | null;
  depositPaymentMethod: PackPaymentMethodValue | null;
  totalSessions: number | null;
  consumedSessions: number;
  remainingSessions: number;
  totalPaidDinars: number;
};

async function migratePendingPacksToParallel(
  tx: Prisma.TransactionClient,
  memberId: string,
): Promise<void> {
  const pending = await tx.memberPendingPack.findMany({
    where: { memberId },
    orderBy: [{ position: "asc" }, { createdAt: "asc" }],
    select: { id: true, packId: true },
  });

  for (const row of pending) {
    await resetMemberPackBalancesForPack(tx, { memberId, packId: row.packId });
    await tx.memberPendingPack.delete({ where: { id: row.id } });
  }
}

/** Ajoute un pack sans retirer les soldes des packs déjà actifs. */
export async function addParallelMemberPack(
  tx: Prisma.TransactionClient,
  input: { memberId: string; packId: string },
): Promise<void> {
  await migratePendingPacksToParallel(tx, input.memberId);
  await resetMemberPackBalancesForPack(tx, input);
  await tx.member.update({
    where: { id: input.memberId },
    data: { packId: input.packId, packStartedAt: null },
  });
}

function packUsageFromState(
  pack: {
    id: string;
    sessionCount: number | null;
    courseQuotas: { courseSlug: string; sessionCount: number }[];
  },
  balances: { packId: string; courseSlug: string | null; remaining: number }[],
): { totalSessions: number | null; remainingSessions: number; consumedSessions: number } {
  const state: MemberPackState = {
    packId: pack.id,
    packStartedAt: null,
    durationDays: null,
    sessionCount: pack.sessionCount,
    courseQuotas: pack.courseQuotas,
    balances,
  };
  const remainingSessions = getRemainingSessionsForPack(state);
  const totalSessions =
    pack.courseQuotas.length > 0
      ? pack.courseQuotas.reduce((sum, q) => sum + q.sessionCount, 0)
      : pack.sessionCount;
  const consumedSessions =
    totalSessions != null ? Math.max(0, totalSessions - remainingSessions) : 0;
  return { totalSessions, remainingSessions, consumedSessions };
}

function computeOwnedPackStatus(input: {
  remainingSessions: number;
  packExpiresAt: Date | null;
}): MemberOwnedPackStatus {
  if (input.remainingSessions <= 0) return "expired";
  if (input.packExpiresAt) {
    const today = startOfLocalToday();
    const expiresDay = new Date(
      input.packExpiresAt.getFullYear(),
      input.packExpiresAt.getMonth(),
      input.packExpiresAt.getDate(),
    );
    if (expiresDay.getTime() < today.getTime()) return "expired";
  }
  return "active";
}

export async function listMemberOwnedPacks(memberId: string): Promise<MemberOwnedPackDto[]> {
  await prisma.$transaction(async (tx) => {
    await migratePendingPacksToParallel(tx, memberId);
  });

  const member = await prisma.member.findUnique({
    where: { id: memberId },
    select: {
      packId: true,
      packStartedAt: true,
      packBalances: { select: { packId: true, courseSlug: true, remaining: true } },
      packPayments: {
        orderBy: [{ paidAt: "desc" }, { createdAt: "desc" }],
        select: { packId: true, paidAt: true, createdAt: true, amountDinars: true },
      },
    },
  });
  if (!member) return [];

  const packIds = new Set<string>();
  if (member.packId) packIds.add(member.packId);
  for (const balance of member.packBalances) packIds.add(balance.packId);
  for (const payment of member.packPayments) packIds.add(payment.packId);
  if (packIds.size === 0) return [];

  const packs = await prisma.pack.findMany({
    where: { id: { in: [...packIds] } },
    select: {
      id: true,
      name: true,
      category: true,
      durationDays: true,
      priceCents: true,
      sessionCount: true,
      courseQuotas: { select: { courseSlug: true, sessionCount: true } },
    },
  });

  const purchasedAtByPack = new Map<string, Date>();
  for (const payment of member.packPayments) {
    const current = purchasedAtByPack.get(payment.packId);
    const candidate = payment.paidAt ?? payment.createdAt;
    if (!current || candidate.getTime() > current.getTime()) {
      purchasedAtByPack.set(payment.packId, candidate);
    }
  }

  const items: MemberOwnedPackDto[] = [];

  for (const pack of packs) {
    const balancesForPack = member.packBalances.filter((b) => b.packId === pack.id);
    const usage = packUsageFromState(pack, balancesForPack);
    const paymentTotals = await sumPackPaymentsForMemberPack(memberId, pack.id);
    const isPrimary = member.packId === pack.id;
    const packStartedAt =
      isPrimary && member.packStartedAt ? member.packStartedAt.toISOString() : null;
    const packExpiresAt =
      isPrimary && member.packStartedAt && pack.durationDays
        ? addPackDurationToStartDate(member.packStartedAt, pack.durationDays) ?? null
        : null;
    const status = computeOwnedPackStatus({
      remainingSessions: usage.remainingSessions,
      packExpiresAt,
    });

    items.push({
      packId: pack.id,
      packName: pack.name,
      category: pack.category,
      durationDays: pack.durationDays,
      priceCents: pack.priceCents,
      sessionCount: pack.sessionCount,
      courseQuotas: pack.courseQuotas,
      purchasedAt: (purchasedAtByPack.get(pack.id) ?? new Date(0)).toISOString(),
      isPrimary,
      status,
      packStartedAt,
      packExpiresAt: packExpiresAt?.toISOString() ?? null,
      packPaymentMethod: paymentTotals.packPaymentMethod,
      depositPaymentMethod: paymentTotals.depositPaymentMethod,
      totalSessions: usage.totalSessions,
      consumedSessions: usage.consumedSessions,
      remainingSessions: usage.remainingSessions,
      totalPaidDinars: paymentTotals.totalPaid,
    });
  }

  return items.sort((a, b) => b.purchasedAt.localeCompare(a.purchasedAt));
}
