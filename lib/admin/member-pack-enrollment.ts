import "server-only";

import type { MemberPackEnrollmentStatus, Prisma } from "@prisma/client";
import { formatYmdLocal, parseYmdToPrismaDate } from "@/lib/calendar-day";
import { addPackDurationToStartDate } from "@/lib/pack-duration";
import { packExpiresAtLocal, packStartDateLocal } from "@/lib/member-pack-period";
import { prisma } from "@/lib/prisma";

const CONSUMING_RESERVATION_STATUSES = {
  OR: [
    { status: { in: ["BOOKED", "ATTENDED"] as const } },
    { status: "CANCELLED" as const, packRefundedAt: null },
  ],
} satisfies Pick<Prisma.ReservationWhereInput, "OR">;

/** Présence réelle ou annulation tardive — pour l'affichage « séances consommées ». */
const DISPLAY_CONSUMED_RESERVATION_STATUSES = {
  OR: [
    { status: "ATTENDED" as const },
    { status: "CANCELLED" as const, packRefundedAt: null },
  ],
} satisfies Pick<Prisma.ReservationWhereInput, "OR">;

export async function closeOpenEnrollmentsForPack(
  tx: Prisma.TransactionClient,
  memberId: string,
  packId: string,
  status: Extract<MemberPackEnrollmentStatus, "REPLACED" | "EXPIRED">,
): Promise<void> {
  const now = new Date();
  await tx.memberPackEnrollment.updateMany({
    where: {
      memberId,
      packId,
      status: { in: ["PENDING_START", "ACTIVE"] },
    },
    data: { status, closedAt: now },
  });
}

export async function createPackEnrollmentAfterPayment(
  tx: Prisma.TransactionClient,
  input: {
    memberId: string;
    packId: string;
    packPaymentId: string;
    purchasedAt: Date;
  },
): Promise<string> {
  const row = await tx.memberPackEnrollment.create({
    data: {
      memberId: input.memberId,
      packId: input.packId,
      packPaymentId: input.packPaymentId,
      purchasedAt: input.purchasedAt,
      status: "PENDING_START",
    },
  });
  return row.id;
}

export async function syncActiveEnrollmentDates(
  tx: Prisma.TransactionClient,
  input: {
    memberId: string;
    packId: string;
    packStartedAt: Date;
    durationDays: string | null;
  },
): Promise<void> {
  const packExpiresAt = addPackDurationToStartDate(input.packStartedAt, input.durationDays) ?? null;
  const enrollment = await tx.memberPackEnrollment.findFirst({
    where: {
      memberId: input.memberId,
      packId: input.packId,
      status: { in: ["PENDING_START", "ACTIVE"] },
    },
    orderBy: [{ purchasedAt: "desc" }, { createdAt: "desc" }],
    select: { id: true },
  });
  if (!enrollment) return;

  await tx.memberPackEnrollment.update({
    where: { id: enrollment.id },
    data: {
      packStartedAt: input.packStartedAt,
      packExpiresAt,
      status: "ACTIVE",
    },
  });
}

/** Backfill depuis pack_payments pour les adhérentes existantes (une fois par membre). */
export async function ensureMemberPackEnrollmentsBackfilled(memberId: string): Promise<void> {
  const existingCount = await prisma.memberPackEnrollment.count({ where: { memberId } });
  if (existingCount > 0) return;

  const [member, payments] = await Promise.all([
    prisma.member.findUnique({
      where: { id: memberId },
      select: { packId: true, packStartedAt: true },
    }),
    prisma.packPayment.findMany({
      where: { memberId, paymentKind: { in: ["FULL", "DEPOSIT"] } },
      orderBy: [{ paidAt: "asc" }, { createdAt: "asc" }],
      select: {
        id: true,
        packId: true,
        paidAt: true,
        createdAt: true,
      },
    }),
  ]);

  if (!member || payments.length === 0) return;

  const packIds = [...new Set(payments.map((p) => p.packId))];
  const packs = await prisma.pack.findMany({
    where: { id: { in: packIds } },
    select: { id: true, durationDays: true },
  });
  const durationByPackId = new Map(packs.map((p) => [p.id, p.durationDays]));

  await prisma.$transaction(async (tx) => {
    const enrollmentIds: { id: string; packId: string; purchasedAt: Date }[] = [];

    for (const payment of payments) {
      const row = await tx.memberPackEnrollment.create({
        data: {
          memberId,
          packId: payment.packId,
          packPaymentId: payment.id,
          purchasedAt: payment.paidAt ?? payment.createdAt,
          status: "PENDING_START",
        },
      });
      enrollmentIds.push({ id: row.id, packId: payment.packId, purchasedAt: row.purchasedAt });
    }

    const byPack = new Map<string, typeof enrollmentIds>();
    for (const row of enrollmentIds) {
      const list = byPack.get(row.packId) ?? [];
      list.push(row);
      byPack.set(row.packId, list);
    }

    for (const [packId, rows] of byPack) {
      const sorted = [...rows].sort((a, b) => a.purchasedAt.getTime() - b.purchasedAt.getTime());
      const isCurrentPack = member.packId === packId;
      const latest = sorted[sorted.length - 1];

      for (let i = 0; i < sorted.length - 1; i++) {
        await tx.memberPackEnrollment.update({
          where: { id: sorted[i].id },
          data: { status: "REPLACED", closedAt: sorted[i + 1].purchasedAt },
        });
      }

      if (isCurrentPack && member.packStartedAt) {
        const durationDays = durationByPackId.get(packId) ?? null;
        const packExpiresAt = addPackDurationToStartDate(member.packStartedAt, durationDays);
        await tx.memberPackEnrollment.update({
          where: { id: latest.id },
          data: {
            packStartedAt: member.packStartedAt,
            packExpiresAt: packExpiresAt ?? null,
            status: "ACTIVE",
          },
        });
      } else if (!isCurrentPack || !member.packStartedAt) {
        if (sorted.length > 1 || !isCurrentPack) {
          const lastStatus = isCurrentPack ? "PENDING_START" : "REPLACED";
          await tx.memberPackEnrollment.update({
            where: { id: latest.id },
            data: lastStatus === "REPLACED" ? { status: "REPLACED", closedAt: new Date() } : { status: "PENDING_START" },
          });
        }
      }
    }
  });
}

export async function getEnrollmentPaymentTotals(
  memberId: string,
  packPaymentId: string | null,
): Promise<{
  totalPaidDinars: number;
  packPaymentMethod: import("@/lib/pack-payment-method").PackPaymentMethodValue | null;
  depositPaymentMethod: import("@/lib/pack-payment-method").PackPaymentMethodValue | null;
}> {
  if (!packPaymentId) {
    return { totalPaidDinars: 0, packPaymentMethod: null, depositPaymentMethod: null };
  }

  const payment = await prisma.packPayment.findUnique({
    where: { id: packPaymentId },
    select: {
      amountDinars: true,
      paymentKind: true,
      paymentMethod: true,
      packSaleTotalDinars: true,
      paidAt: true,
      packId: true,
    },
  });
  if (!payment) {
    return { totalPaidDinars: 0, packPaymentMethod: null, depositPaymentMethod: null };
  }

  if (payment.paymentKind === "DEPOSIT" && payment.packSaleTotalDinars != null) {
    const related = await prisma.packPayment.findMany({
      where: {
        memberId,
        packId: payment.packId,
        packSaleTotalDinars: payment.packSaleTotalDinars,
        paidAt: { gte: payment.paidAt },
      },
      orderBy: [{ paidAt: "asc" }, { createdAt: "asc" }],
      select: { amountDinars: true, paymentKind: true, paymentMethod: true },
    });
    const totalPaidDinars = related.reduce((sum, row) => sum + row.amountDinars, 0);
    const deposit = related.find((r) => r.paymentKind === "DEPOSIT");
    const balance = related.find((r) => r.paymentKind === "BALANCE");
    const full = related.find((r) => r.paymentKind === "FULL");
    const packPaymentMethod = balance?.paymentMethod ?? full?.paymentMethod ?? deposit?.paymentMethod ?? null;
    const depositPaymentMethod = deposit?.paymentMethod ?? null;
    return { totalPaidDinars, packPaymentMethod, depositPaymentMethod };
  }

  return {
    totalPaidDinars: payment.amountDinars,
    packPaymentMethod: payment.paymentMethod,
    depositPaymentMethod: null,
  };
}

export async function countEnrollmentConsumedSessions(input: {
  memberId: string;
  packId: string;
  courseQuotas: { courseSlug: string; sessionCount: number }[];
  sessionCount: number | null;
  packStartedAt: Date | null;
  packExpiresAt: Date | null;
}): Promise<number> {
  if (!input.packStartedAt) return 0;

  const packStartDate = packStartDateLocal(input.packStartedAt);
  if (!packStartDate) return 0;

  const expiresAt = input.packExpiresAt
    ? packStartDateLocal(input.packExpiresAt)
    : packExpiresAtLocal(input.packStartedAt, null);

  const dateFilter = {
    gte: packStartDate,
    ...(expiresAt ? { lte: expiresAt } : {}),
  };

  if (input.courseQuotas.length > 0) {
    const rows = await prisma.reservation.findMany({
      where: {
        memberId: input.memberId,
        ...CONSUMING_RESERVATION_STATUSES,
        sessionDate: dateFilter,
        planning: { courseSlug: { in: input.courseQuotas.map((q) => q.courseSlug) } },
      },
      select: { id: true },
    });
    return rows.length;
  }

  if (input.sessionCount != null) {
    return prisma.reservation.count({
      where: {
        memberId: input.memberId,
        ...CONSUMING_RESERVATION_STATUSES,
        sessionDate: dateFilter,
      },
    });
  }

  return 0;
}

/**
 * Compte les séances consommées sur la période d'une inscription pack
 * (achat → renouvellement suivant), indépendamment de packStartedAt.
 */
export async function countEnrollmentConsumedSessionsInPeriod(input: {
  memberId: string;
  packId: string;
  courseQuotas: { courseSlug: string; sessionCount: number }[];
  sessionCount: number | null;
  periodStart: Date;
  periodEndExclusive: Date | null;
}): Promise<number> {
  const sessionDateFilter: Prisma.DateTimeFilter = {
    gte: input.periodStart,
    ...(input.periodEndExclusive ? { lt: input.periodEndExclusive } : {}),
  };

  const totalCap =
    input.courseQuotas.length > 0
      ? input.courseQuotas.reduce((sum, q) => sum + q.sessionCount, 0)
      : input.sessionCount;

  const baseWhere: Prisma.ReservationWhereInput = {
    memberId: input.memberId,
    sessionDate: sessionDateFilter,
    AND: [
      DISPLAY_CONSUMED_RESERVATION_STATUSES,
      {
        OR: [
          { debitedPackId: input.packId },
          { debitedPackId: null, status: "ATTENDED" },
        ],
      },
    ],
  };

  const courseSlugFilter =
    input.courseQuotas.length > 0
      ? { planning: { courseSlug: { in: input.courseQuotas.map((q) => q.courseSlug) } } }
      : {};

  if (totalCap == null) {
    return prisma.reservation.count({ where: { ...baseWhere, ...courseSlugFilter } });
  }

  const rows = await prisma.reservation.findMany({
    where: { ...baseWhere, ...courseSlugFilter },
    orderBy: [{ sessionDate: "asc" }, { createdAt: "asc" }],
    take: totalCap,
    select: { id: true },
  });
  return rows.length;
}
