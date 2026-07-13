import "server-only";

import type { MemberPackEnrollmentStatus, Prisma } from "@prisma/client";
import { startOfLocalToday, formatYmdLocal, parseYmdToPrismaDate } from "@/lib/calendar-day";
import {
  countEnrollmentConsumedSessionsInPeriod,
  ensureMemberPackEnrollmentsBackfilled,
  getEnrollmentPaymentTotals,
} from "@/lib/admin/member-pack-enrollment";
import {
  resetMemberPackBalancesForPack,
} from "@/lib/admin/member-pack-renewal";
import type { PackPaymentMethodValue } from "@/lib/pack-payment-method";
import { courseLabel } from "@/lib/course-labels";
import { prisma } from "@/lib/prisma";

export type MemberOwnedPackStatus = "active" | "expired" | "pending" | "replaced";

export type MemberOwnedPackDto = {
  enrollmentId: string;
  packId: string;
  packName: string;
  category: string | null;
  durationDays: string | null;
  priceCents: number | null;
  sessionCount: number | null;
  courseQuotas: { courseSlug: string; sessionCount: number }[];
  purchasedAt: string;
  isPrimary: boolean;
  /** Inscription suivant un achat précédent du même pack catalogue. */
  isRenewal: boolean;
  status: MemberOwnedPackStatus;
  enrollmentStatus: MemberPackEnrollmentStatus;
  packStartedAt: string | null;
  packExpiresAt: string | null;
  packPaymentMethod: PackPaymentMethodValue | null;
  depositPaymentMethod: PackPaymentMethodValue | null;
  totalSessions: number | null;
  consumedSessions: number;
  remainingSessions: number;
  totalPaidDinars: number;
  courseQuotaRemaining: { courseLabel: string; remaining: number; total: number }[];
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

function mapEnrollmentStatusToDisplay(
  enrollmentStatus: MemberPackEnrollmentStatus,
  remainingSessions: number,
  packExpiresAt: Date | null,
): MemberOwnedPackStatus {
  if (enrollmentStatus === "REPLACED") return "replaced";
  if (enrollmentStatus === "EXPIRED") return "expired";
  if (enrollmentStatus === "PENDING_START") return "pending";

  if (remainingSessions <= 0) return "expired";
  if (packExpiresAt) {
    const today = startOfLocalToday();
    const expiresDay = new Date(
      packExpiresAt.getFullYear(),
      packExpiresAt.getMonth(),
      packExpiresAt.getDate(),
    );
    if (expiresDay.getTime() < today.getTime()) return "expired";
  }
  return "active";
}

function courseQuotaRemainingLines(
  pack: { courseQuotas: { courseSlug: string; sessionCount: number }[] },
  balances: { courseSlug: string | null; remaining: number }[],
): { courseLabel: string; remaining: number; total: number }[] {
  return pack.courseQuotas.map((q) => {
    const balance = balances.find((b) => b.courseSlug === q.courseSlug);
    let remaining: number;
    if (balance) remaining = Math.max(0, balance.remaining);
    else if (balances.length > 0) remaining = 0;
    else remaining = q.sessionCount;
    return {
      courseLabel: courseLabel(q.courseSlug),
      remaining,
      total: q.sessionCount,
    };
  });
}

function toPrismaDateLocal(d: Date): Date {
  return parseYmdToPrismaDate(formatYmdLocal(d))!;
}

function getEnrollmentPeriodBounds(
  enrollment: { id: string; packId: string; purchasedAt: Date; closedAt: Date | null },
  enrollmentsAsc: { id: string; packId: string; purchasedAt: Date; closedAt: Date | null }[],
): { periodStart: Date; periodEndExclusive: Date | null } {
  const periodStart = toPrismaDateLocal(enrollment.purchasedAt);
  const index = enrollmentsAsc.findIndex((row) => row.id === enrollment.id);
  for (let i = index + 1; i < enrollmentsAsc.length; i++) {
    const next = enrollmentsAsc[i]!;
    if (next.packId === enrollment.packId) {
      return { periodStart, periodEndExclusive: toPrismaDateLocal(next.purchasedAt) };
    }
  }
  if (enrollment.closedAt) {
    return { periodStart, periodEndExclusive: toPrismaDateLocal(enrollment.closedAt) };
  }
  return { periodStart, periodEndExclusive: null };
}

export async function listMemberOwnedPacks(memberId: string): Promise<MemberOwnedPackDto[]> {
  await prisma.$transaction(async (tx) => {
    await migratePendingPacksToParallel(tx, memberId);
  });

  await ensureMemberPackEnrollmentsBackfilled(memberId);

  const member = await prisma.member.findUnique({
    where: { id: memberId },
    select: {
      packId: true,
      packBalances: { select: { packId: true, courseSlug: true, remaining: true } },
    },
  });
  if (!member) return [];

  const enrollments = await prisma.memberPackEnrollment.findMany({
    where: { memberId },
    orderBy: [{ purchasedAt: "desc" }, { createdAt: "desc" }],
    include: {
      pack: {
        select: {
          id: true,
          name: true,
          category: true,
          durationDays: true,
          priceCents: true,
          sessionCount: true,
          courseQuotas: { select: { courseSlug: true, sessionCount: true } },
        },
      },
    },
  });

  if (enrollments.length === 0) return [];

  const latestOpenEnrollmentIdByPack = new Map<string, string>();
  for (const enrollment of enrollments) {
    if (
      (enrollment.status === "ACTIVE" || enrollment.status === "PENDING_START") &&
      !latestOpenEnrollmentIdByPack.has(enrollment.packId)
    ) {
      latestOpenEnrollmentIdByPack.set(enrollment.packId, enrollment.id);
    }
  }

  const firstEnrollmentIdByPack = new Map<string, string>();
  for (const enrollment of [...enrollments].sort(
    (a, b) =>
      a.purchasedAt.getTime() - b.purchasedAt.getTime() ||
      a.createdAt.getTime() - b.createdAt.getTime(),
  )) {
    if (!firstEnrollmentIdByPack.has(enrollment.packId)) {
      firstEnrollmentIdByPack.set(enrollment.packId, enrollment.id);
    }
  }

  const enrollmentsAsc = [...enrollments].sort(
    (a, b) =>
      a.purchasedAt.getTime() - b.purchasedAt.getTime() ||
      a.createdAt.getTime() - b.createdAt.getTime(),
  );

  const items: MemberOwnedPackDto[] = [];

  for (const enrollment of enrollments) {
    const pack = enrollment.pack;
    const isPrimary =
      member.packId === pack.id && latestOpenEnrollmentIdByPack.get(pack.id) === enrollment.id;
    const isRenewal = firstEnrollmentIdByPack.get(pack.id) !== enrollment.id;

    const paymentTotals = await getEnrollmentPaymentTotals(memberId, enrollment.packPaymentId);

    const totalSessions =
      pack.courseQuotas.length > 0
        ? pack.courseQuotas.reduce((sum, q) => sum + q.sessionCount, 0)
        : pack.sessionCount;

    const { periodStart, periodEndExclusive } = getEnrollmentPeriodBounds(enrollment, enrollmentsAsc);
    const consumedRaw = await countEnrollmentConsumedSessionsInPeriod({
      memberId,
      packId: pack.id,
      courseQuotas: pack.courseQuotas,
      sessionCount: pack.sessionCount,
      periodStart,
      periodEndExclusive,
    });
    const consumedSessions =
      totalSessions != null ? Math.min(consumedRaw, totalSessions) : consumedRaw;
    const remainingSessions =
      totalSessions != null ? Math.max(0, totalSessions - consumedSessions) : 0;

    const status = mapEnrollmentStatusToDisplay(
      enrollment.status,
      remainingSessions,
      enrollment.packExpiresAt,
    );

    const balancesForPack = member.packBalances.filter((b) => b.packId === pack.id);

    items.push({
      enrollmentId: enrollment.id,
      packId: pack.id,
      packName: pack.name,
      category: pack.category,
      durationDays: pack.durationDays,
      priceCents: pack.priceCents,
      sessionCount: pack.sessionCount,
      courseQuotas: pack.courseQuotas,
      purchasedAt: enrollment.purchasedAt.toISOString(),
      isPrimary,
      isRenewal,
      status,
      enrollmentStatus: enrollment.status,
      packStartedAt: enrollment.packStartedAt?.toISOString() ?? null,
      packExpiresAt: enrollment.packExpiresAt?.toISOString() ?? null,
      packPaymentMethod: paymentTotals.packPaymentMethod,
      depositPaymentMethod: paymentTotals.depositPaymentMethod,
      totalSessions,
      consumedSessions,
      remainingSessions,
      totalPaidDinars: paymentTotals.totalPaidDinars,
      courseQuotaRemaining:
        pack.courseQuotas.length > 0 ? courseQuotaRemainingLines(pack, balancesForPack) : [],
    });
  }

  return items;
}
