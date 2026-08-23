import "server-only";

import { Prisma, type MemberPackEnrollmentStatus } from "@prisma/client";
import { formatYmdLocal, parseYmdToPrismaDate } from "@/lib/calendar-day";
import { addPackDurationToStartDate } from "@/lib/pack-duration";
import { packExpiresAtLocal, packStartDateLocal } from "@/lib/member-pack-period";
import { getEligibilityForPack } from "@/lib/pack-eligibility";
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
  // FIFO : démarrer la plus ancienne inscription pas encore démarrée, sinon l'ACTIVE courante.
  const enrollment =
    (await tx.memberPackEnrollment.findFirst({
      where: {
        memberId: input.memberId,
        packId: input.packId,
        status: "PENDING_START",
      },
      orderBy: [{ purchasedAt: "asc" }, { createdAt: "asc" }],
      select: { id: true, purchasedAt: true },
    })) ??
    (await tx.memberPackEnrollment.findFirst({
      where: {
        memberId: input.memberId,
        packId: input.packId,
        status: "ACTIVE",
      },
      orderBy: [{ purchasedAt: "asc" }, { createdAt: "asc" }],
      select: { id: true, purchasedAt: true },
    }));
  if (!enrollment) return;

  // Ne jamais démarrer une inscription avant sa date d'achat (évite de coller le début du pack précédent sur le renouvellement).
  const purchasedYmd = formatYmdLocal(enrollment.purchasedAt);
  const startedYmd = formatYmdLocal(input.packStartedAt);
  const clampedStart =
    startedYmd < purchasedYmd
      ? parseYmdToPrismaDate(purchasedYmd)!
      : input.packStartedAt;

  const packExpiresAt = addPackDurationToStartDate(clampedStart, input.durationDays) ?? null;

  await tx.memberPackEnrollment.update({
    where: { id: enrollment.id },
    data: {
      packStartedAt: clampedStart,
      packExpiresAt,
      status: "ACTIVE",
      closedAt: null,
    },
  });
}

/**
 * Après un débit de séance : rattache la conso à la plus ancienne inscription ouverte
 * (packs parallèles 1 séance « Pas encore démarré »).
 */
export async function consumeOldestOpenEnrollmentOnDebit(
  tx: Prisma.TransactionClient,
  input: {
    memberId: string;
    packId: string;
    sessionDateDb: Date;
    durationDays: string | null;
  },
): Promise<void> {
  const unstarted = await tx.memberPackEnrollment.findFirst({
    where: {
      memberId: input.memberId,
      packId: input.packId,
      status: { in: ["PENDING_START", "ACTIVE"] },
      packStartedAt: null,
    },
    orderBy: [{ purchasedAt: "asc" }, { createdAt: "asc" }],
    select: { id: true },
  });
  if (!unstarted) return;

  const packExpiresAt = addPackDurationToStartDate(input.sessionDateDb, input.durationDays) ?? null;
  await tx.memberPackEnrollment.update({
    where: { id: unstarted.id },
    data: {
      packStartedAt: input.sessionDateDb,
      packExpiresAt,
      status: "ACTIVE",
      closedAt: null,
    },
  });
}

async function countPackConsumingReservations(
  tx: Prisma.TransactionClient,
  memberId: string,
  packId: string,
): Promise<number> {
  return tx.reservation.count({
    where: {
      memberId,
      debitedPackId: packId,
      AND: [CONSUMING_RESERVATION_STATUSES],
    },
  });
}

/**
 * Si plus aucune réservation ne consomme le pack, efface packStartedAt (inscription + membre)
 * pour que « 1ʳᵉ réservation » redevienne « Pas encore démarré ».
 */
export async function resetPackStartWhenNoConsumption(
  tx: Prisma.TransactionClient,
  input: { memberId: string; packId: string; enrollmentId?: string },
): Promise<boolean> {
  const stillConsuming = await countPackConsumingReservations(tx, input.memberId, input.packId);
  if (stillConsuming > 0) return false;

  await tx.memberPackEnrollment.updateMany({
    where: {
      memberId: input.memberId,
      packId: input.packId,
      status: { in: ["PENDING_START", "ACTIVE"] },
      packStartedAt: { not: null },
      ...(input.enrollmentId ? { id: input.enrollmentId } : {}),
    },
    data: {
      packStartedAt: null,
      packExpiresAt: null,
      status: "PENDING_START",
      closedAt: null,
    },
  });

  const member = await tx.member.findUnique({
    where: { id: input.memberId },
    select: { packId: true, packStartedAt: true },
  });
  if (member?.packId === input.packId && member.packStartedAt) {
    await tx.member.update({
      where: { id: input.memberId },
      data: { packStartedAt: null },
    });
  }

  return true;
}

/**
 * Pack « 1 séance » : après remboursement intégral, efface packStartedAt pour que le pack
 * ne reste pas « Terminé » (l'affichage / le solde traitent packStartedAt comme consommation).
 */
export async function reopenSingleSessionPackAfterFullRefund(
  tx: Prisma.TransactionClient,
  input: {
    memberId: string;
    packId: string;
    sessionCount: number | null;
    courseQuotas: { courseSlug: string; sessionCount: number }[];
  },
): Promise<boolean> {
  const reset = await resetPackStartWhenNoConsumption(tx, {
    memberId: input.memberId,
    packId: input.packId,
  });
  if (!reset) return false;

  if (input.courseQuotas.length > 0) return true;
  if (input.sessionCount !== 1) return true;

  await tx.memberPackBalance.deleteMany({
    where: { memberId: input.memberId, packId: input.packId },
  });
  await tx.memberPackBalance.create({
    data: {
      memberId: input.memberId,
      packId: input.packId,
      courseSlug: null,
      remaining: 1,
    },
  });

  return true;
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

  try {
    await prisma.$transaction(async (tx) => {
      // Re-check inside the transaction to avoid concurrent double-backfill races.
      const lockedCount = await tx.memberPackEnrollment.count({ where: { memberId } });
      if (lockedCount > 0) return;

      const enrollmentIds: { id: string; packId: string; purchasedAt: Date }[] = [];

      for (const payment of payments) {
        const existingForPayment = await tx.memberPackEnrollment.findUnique({
          where: { packPaymentId: payment.id },
          select: { id: true, packId: true, purchasedAt: true, memberId: true },
        });
        if (existingForPayment) {
          if (existingForPayment.memberId === memberId) {
            enrollmentIds.push({
              id: existingForPayment.id,
              packId: existingForPayment.packId,
              purchasedAt: existingForPayment.purchasedAt,
            });
          }
          continue;
        }

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

      if (enrollmentIds.length === 0) return;

      const byPack = new Map<string, typeof enrollmentIds>();
      for (const row of enrollmentIds) {
        const list = byPack.get(row.packId) ?? [];
        list.push(row);
        byPack.set(row.packId, list);
      }

      for (const [packId, rows] of byPack) {
        const sorted = [...rows].sort((a, b) => a.purchasedAt.getTime() - b.purchasedAt.getTime());
        const isCurrentPack = member.packId === packId;
        const latest = sorted[sorted.length - 1]!;

        for (let i = 0; i < sorted.length - 1; i++) {
          await tx.memberPackEnrollment.update({
            where: { id: sorted[i]!.id },
            data: { status: "REPLACED", closedAt: sorted[i + 1]!.purchasedAt },
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
              data:
                lastStatus === "REPLACED"
                  ? { status: "REPLACED", closedAt: new Date() }
                  : { status: "PENDING_START" },
            });
          }
        }
      }
    });
  } catch (error) {
    // Concurrent request already created the enrollments — treat as success.
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002" &&
      Array.isArray(error.meta?.target) &&
      error.meta.target.includes("packPaymentId")
    ) {
      return;
    }
    throw error;
  }
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

function enrollmentPeriodSessionDateFilter(input: {
  periodStart: Date | null;
  periodEndExclusive: Date | null;
}): Prisma.DateTimeFilter | undefined {
  const filter: Prisma.DateTimeFilter = {
    ...(input.periodStart ? { gte: input.periodStart } : {}),
    ...(input.periodEndExclusive ? { lt: input.periodEndExclusive } : {}),
  };
  return Object.keys(filter).length > 0 ? filter : undefined;
}

function enrollmentConsumedWhere(input: {
  memberId: string;
  packId: string;
  courseQuotas: { courseSlug: string; sessionCount: number }[];
  /** Catégorie catalogue — filtre les cours quand le pack n'a pas de quotas. */
  category?: string | null;
  periodStart: Date | null;
  periodEndExclusive: Date | null;
}): Prisma.ReservationWhereInput {
  const sessionDate = enrollmentPeriodSessionDateFilter(input);
  const quotaSlugs = input.courseQuotas.map((q) => q.courseSlug);
  const eligibilitySlugs =
    quotaSlugs.length > 0
      ? quotaSlugs
      : getEligibilityForPack({
          category: input.category ?? null,
          courseQuotas: [],
        }).allowedCourseSlugs;

  return {
    memberId: input.memberId,
    ...(sessionDate ? { sessionDate } : {}),
    AND: [
      DISPLAY_CONSUMED_RESERVATION_STATUSES,
      {
        OR: [
          { debitedPackId: input.packId },
          { debitedPackId: null, status: "ATTENDED" },
        ],
      },
    ],
    ...(eligibilitySlugs.length > 0
      ? { planning: { courseSlug: { in: eligibilitySlugs } } }
      : {}),
  };
}

/**
 * Compte les séances consommées sur la période d'une inscription pack.
 * `periodStart` null = pas de borne basse (présences historiques avant la date d'achat).
 * `periodEndExclusive` = début du renouvellement suivant (`packStartedAt` / achat) ou clôture.
 */
export async function countEnrollmentConsumedSessionsInPeriod(input: {
  memberId: string;
  packId: string;
  courseQuotas: { courseSlug: string; sessionCount: number }[];
  sessionCount: number | null;
  category?: string | null;
  periodStart: Date | null;
  periodEndExclusive: Date | null;
}): Promise<number> {
  const totalCap =
    input.courseQuotas.length > 0
      ? input.courseQuotas.reduce((sum, q) => sum + q.sessionCount, 0)
      : input.sessionCount;

  const baseWhere = enrollmentConsumedWhere(input);

  if (totalCap == null) {
    return prisma.reservation.count({ where: baseWhere });
  }

  const rows = await prisma.reservation.findMany({
    where: baseWhere,
    orderBy: [{ sessionDate: "asc" }, { createdAt: "asc" }],
    take: totalCap,
    select: { id: true },
  });
  return rows.length;
}

/**
 * Répartition des séances consommées par cours (même fenêtre FIFO / plafond que le total).
 * Sert à afficher « Reformer X/15 · Mat Y/15 » cohérent avec « Séances (X+Y)/30 ».
 */
export async function countEnrollmentConsumedSessionsByCourseInPeriod(input: {
  memberId: string;
  packId: string;
  courseQuotas: { courseSlug: string; sessionCount: number }[];
  sessionCount: number | null;
  category?: string | null;
  periodStart: Date | null;
  periodEndExclusive: Date | null;
}): Promise<Map<string, number>> {
  const counts = new Map<string, number>();
  for (const q of input.courseQuotas) {
    counts.set(q.courseSlug, 0);
  }
  if (input.courseQuotas.length === 0) return counts;

  const totalCap = input.courseQuotas.reduce((sum, q) => sum + q.sessionCount, 0);
  const rows = await prisma.reservation.findMany({
    where: enrollmentConsumedWhere(input),
    orderBy: [{ sessionDate: "asc" }, { createdAt: "asc" }],
    take: totalCap,
    select: { planning: { select: { courseSlug: true } } },
  });

  for (const row of rows) {
    const slug = row.planning.courseSlug;
    if (!counts.has(slug)) continue;
    counts.set(slug, (counts.get(slug) ?? 0) + 1);
  }
  return counts;
}

/**
 * Première séance consommée (présence / annulation tardive) sur la période d'inscription.
 * Sert à renseigner Pack début / expiration quand `packStartedAt` n'a jamais été synchronisé
 * (ex. pack clôturé après renouvellement ou saisie historique).
 */
export async function findFirstEnrollmentConsumedSessionDate(input: {
  memberId: string;
  packId: string;
  courseQuotas: { courseSlug: string; sessionCount: number }[];
  periodStart: Date | null;
  periodEndExclusive: Date | null;
}): Promise<Date | null> {
  const row = await prisma.reservation.findFirst({
    where: enrollmentConsumedWhere(input),
    orderBy: [{ sessionDate: "asc" }, { createdAt: "asc" }],
    select: { sessionDate: true },
  });
  return row?.sessionDate ?? null;
}

/** Persiste packStartedAt / packExpiresAt sur une inscription à partir de la 1ʳᵉ consommation. */
export async function backfillEnrollmentStartFromFirstConsumption(input: {
  enrollmentId: string;
  memberId: string;
  packId: string;
  courseQuotas: { courseSlug: string; sessionCount: number }[];
  durationDays: string | null;
  periodStart: Date | null;
  periodEndExclusive: Date | null;
}): Promise<{ packStartedAt: Date; packExpiresAt: Date | null } | null> {
  const firstSessionDate = await findFirstEnrollmentConsumedSessionDate({
    memberId: input.memberId,
    packId: input.packId,
    courseQuotas: input.courseQuotas,
    periodStart: input.periodStart,
    periodEndExclusive: input.periodEndExclusive,
  });
  if (!firstSessionDate) return null;

  const packExpiresAt = addPackDurationToStartDate(firstSessionDate, input.durationDays) ?? null;
  await prisma.memberPackEnrollment.update({
    where: { id: input.enrollmentId },
    data: {
      packStartedAt: firstSessionDate,
      packExpiresAt,
      status: "ACTIVE",
      closedAt: null,
    },
  });
  return { packStartedAt: firstSessionDate, packExpiresAt };
}
