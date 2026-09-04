import "server-only";

import type { MemberPackEnrollmentStatus, Prisma } from "@prisma/client";
import { startOfLocalToday, formatYmdLocal, parseYmdToPrismaDate } from "@/lib/calendar-day";
import {
  allocateConsumedSessionsAcrossMemberEnrollments,
  ensureMemberPackEnrollmentsBackfilled,
  findFirstEnrollmentConsumedSessionDate,
  getEnrollmentPaymentTotals,
  reopenSingleSessionPackAfterFullRefund,
  repairFifoEnrollmentActivationForPack,
  resetPackStartWhenNoConsumption,
} from "@/lib/admin/member-pack-enrollment";
import {
  resetMemberPackBalancesForPack,
} from "@/lib/admin/member-pack-renewal";
import { addPackDurationToStartDate } from "@/lib/pack-duration";
import type { PackPaymentMethodValue } from "@/lib/pack-payment-method";
import { courseLabel } from "@/lib/course-labels";
import { getEnrollmentPeriodBounds } from "@/lib/member-pack-enrollment-period";
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
  prolongedAt: string | null;
  packPaymentMethod: PackPaymentMethodValue | null;
  depositPaymentMethod: PackPaymentMethodValue | null;
  totalSessions: number | null;
  consumedSessions: number;
  remainingSessions: number;
  totalPaidDinars: number;
  additionalSessionsCredit: number;
  categoryReassignedAt: string | null;
  courseQuotaRemaining: { courseLabel: string; consumed: number; remaining: number; total: number }[];
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
  // Pack parallèle encore marqué remplacé mais avec séances → traiter comme en cours.
  if (enrollmentStatus === "REPLACED" && remainingSessions > 0) return "pending";
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

function toPrismaDateLocal(d: Date): Date {
  return parseYmdToPrismaDate(formatYmdLocal(d))!;
}

/**
 * Corrige les inscriptions dont `packStartedAt` est antérieur à `purchasedAt`
 * (souvent le renouvellement a hérité de la 1ʳᵉ séance du pack précédent).
 */
async function repairEnrollmentStartsBeforePurchase(memberId: string): Promise<void> {
  const enrollments = await prisma.memberPackEnrollment.findMany({
    where: {
      memberId,
      packStartedAt: { not: null },
    },
    orderBy: [{ purchasedAt: "asc" }, { createdAt: "asc" }],
    include: {
      pack: {
        select: {
          durationDays: true,
          courseQuotas: { select: { courseSlug: true, sessionCount: true } },
        },
      },
    },
  });

  const enrollmentsAsc = enrollments.map((e) => ({
    id: e.id,
    packId: e.packId,
    purchasedAt: e.purchasedAt,
    closedAt: e.closedAt,
    packStartedAt: e.packStartedAt,
    status: e.status,
  }));

  for (const enrollment of enrollments) {
    if (!enrollment.packStartedAt) continue;
    const started = toPrismaDateLocal(enrollment.packStartedAt);
    const purchased = toPrismaDateLocal(enrollment.purchasedAt);
    if (started.getTime() >= purchased.getTime()) continue;

    const { periodStart, periodEndExclusive } = getEnrollmentPeriodBounds(enrollment, enrollmentsAsc);
    const firstSessionDate = await findFirstEnrollmentConsumedSessionDate({
      memberId,
      packId: enrollment.packId,
      courseQuotas: enrollment.pack.courseQuotas,
      periodStart,
      periodEndExclusive,
    });

    if (firstSessionDate) {
      const packExpiresAt =
        addPackDurationToStartDate(firstSessionDate, enrollment.pack.durationDays) ?? null;
      await prisma.memberPackEnrollment.update({
        where: { id: enrollment.id },
        data: {
          packStartedAt: firstSessionDate,
          packExpiresAt,
          status: enrollment.status === "PENDING_START" ? "ACTIVE" : enrollment.status,
          closedAt: null,
        },
      });
    } else {
      await prisma.memberPackEnrollment.update({
        where: { id: enrollment.id },
        data: {
          packStartedAt: null,
          packExpiresAt: null,
          status: "PENDING_START",
          closedAt: null,
        },
      });
    }
  }

  // Aligner le début « membre » sur l'inscription ACTIVE courante (évite de réinjecter une date héritée).
  const member = await prisma.member.findUnique({
    where: { id: memberId },
    select: { packId: true },
  });
  if (member?.packId) {
    const current = await prisma.memberPackEnrollment.findFirst({
      where: {
        memberId,
        packId: member.packId,
        status: { in: ["ACTIVE", "PENDING_START"] },
      },
      orderBy: [{ purchasedAt: "desc" }, { createdAt: "desc" }],
      select: { packStartedAt: true },
    });
    if (current) {
      await prisma.member.update({
        where: { id: memberId },
        data: { packStartedAt: current.packStartedAt },
      });
    }
  }
}

export async function listMemberOwnedPacks(memberId: string): Promise<MemberOwnedPackDto[]> {
  await prisma.$transaction(async (tx) => {
    await migratePendingPacksToParallel(tx, memberId);
  });

  await ensureMemberPackEnrollmentsBackfilled(memberId);

  // Packs « Pas encore démarré » encore remplacés à tort → rouvrir pour affichage + débit.
  await reopenUnusedReplacedEnrollments(memberId);

  // Renouvellements dont le début a été hérité du pack précédent → recalage sur l'achat / 1ʳᵉ séance post-achat.
  await repairEnrollmentStartsBeforePurchase(memberId);

  // FIFO : finir le pack le plus ancien avant d'ouvrir le suivant (réattribue les conso + reset à 0).
  {
    const openForRepair = await prisma.memberPackEnrollment.findMany({
      where: { memberId, status: { in: ["PENDING_START", "ACTIVE"] } },
      select: {
        packId: true,
        pack: {
          select: {
            durationDays: true,
            sessionCount: true,
            category: true,
            courseQuotas: { select: { courseSlug: true, sessionCount: true } },
          },
        },
      },
    });
    const seenPackIds = new Set<string>();
    for (const row of openForRepair) {
      if (seenPackIds.has(row.packId)) continue;
      seenPackIds.add(row.packId);
      const samePackCount = openForRepair.filter((e) => e.packId === row.packId).length;
      if (samePackCount < 2) continue;
      await repairFifoEnrollmentActivationForPack({
        memberId,
        packId: row.packId,
        durationDays: row.pack.durationDays,
        courseQuotas: row.pack.courseQuotas,
        sessionCount: row.pack.sessionCount,
        category: row.pack.category,
      });
    }
  }

  const member = await prisma.member.findUnique({
    where: { id: memberId },
    select: { packId: true },
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

  const consumptionByEnrollment = await allocateConsumedSessionsAcrossMemberEnrollments({
    memberId,
    enrollmentsAsc,
    countingMode: "display",
  });

  // Recalcule les soldes = somme des séances restantes sur les inscriptions ouvertes du même pack.
  await syncBalancesFromOpenEnrollments(memberId, enrollmentsAsc);

  const memberPackBalances = await prisma.memberPackBalance.findMany({
    where: { memberId },
    select: { packId: true, courseSlug: true, remaining: true },
  });

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

    let displayTotalSessions = totalSessions;

    let packStartedAt = enrollment.packStartedAt;
    let packExpiresAt = enrollment.packExpiresAt;
    let enrollmentStatus = enrollment.status;
    const isProlonged = enrollment.prolongedAt != null;

    if (isProlonged) {
      const { periodEndExclusive } = getEnrollmentPeriodBounds(enrollment, enrollmentsAsc);
      const firstConsumed = await findFirstEnrollmentConsumedSessionDate({
        memberId,
        packId: pack.id,
        courseQuotas: pack.courseQuotas,
        periodStart: enrollment.purchasedAt,
        periodEndExclusive,
      });
      if (firstConsumed) {
        const firstDay = toPrismaDateLocal(firstConsumed);
        const startDay = packStartedAt ? toPrismaDateLocal(packStartedAt) : null;
        if (!startDay || startDay.getTime() > firstDay.getTime()) {
          packStartedAt = firstConsumed;
          await prisma.memberPackEnrollment.update({
            where: { id: enrollment.id },
            data: { packStartedAt: firstConsumed },
          });
          if (isPrimary) {
            const memberRow = await prisma.member.findUnique({
              where: { id: memberId },
              select: { packStartedAt: true },
            });
            const memberStartDay = memberRow?.packStartedAt
              ? toPrismaDateLocal(memberRow.packStartedAt)
              : null;
            if (!memberStartDay || memberStartDay.getTime() > firstDay.getTime()) {
              await prisma.member.update({
                where: { id: memberId },
                data: { packStartedAt: firstConsumed },
              });
            }
          }
        }
      }
    }

    let consumedSessions: number;
    let remainingSessions: number;
    let courseQuotaRemaining: MemberOwnedPackDto["courseQuotaRemaining"] = [];

    const fifoAlloc = consumptionByEnrollment.get(enrollment.id);

    // Pack « 1 séance » : packStartedAt seul ne suffit pas (ex. présence puis remboursement).
    if (totalSessions === 1 && pack.courseQuotas.length === 0 && packStartedAt && fifoAlloc) {
      const consumedRaw = fifoAlloc.consumedTotal;
      if (consumedRaw > 0) {
        consumedSessions = 1;
        remainingSessions = 0;
        if (!packExpiresAt && pack.durationDays) {
          packExpiresAt = addPackDurationToStartDate(packStartedAt, pack.durationDays);
        }
      } else {
        // Séance rendue au pack → réaffichage comme non démarré / disponible.
        consumedSessions = 0;
        remainingSessions = 1;
        packStartedAt = null;
        packExpiresAt = null;
        if (enrollmentStatus === "ACTIVE") {
          enrollmentStatus = "PENDING_START";
        }
        await prisma.$transaction(async (tx) => {
          await reopenSingleSessionPackAfterFullRefund(tx, {
            memberId,
            packId: pack.id,
            sessionCount: pack.sessionCount,
            courseQuotas: pack.courseQuotas,
          });
        });
      }
    } else if (fifoAlloc) {
      consumedSessions =
        totalSessions != null ? Math.min(fifoAlloc.consumedTotal, totalSessions) : fifoAlloc.consumedTotal;
      remainingSessions =
        totalSessions != null ? Math.max(0, totalSessions - consumedSessions) : fifoAlloc.remainingTotal;
      if (pack.courseQuotas.length > 0) {
        courseQuotaRemaining = pack.courseQuotas.map((q) => {
          const consumed = fifoAlloc.consumedByCourse.get(q.courseSlug) ?? 0;
          return {
            courseLabel: courseLabel(q.courseSlug),
            total: q.sessionCount,
            consumed: Math.min(consumed, q.sessionCount),
            remaining: Math.max(0, q.sessionCount - Math.min(consumed, q.sessionCount)),
          };
        });
      }
      if (!isProlonged && consumedSessions <= 0) {
        packStartedAt = null;
        packExpiresAt = null;
        enrollmentStatus = "PENDING_START";
      } else if (!isProlonged && fifoAlloc.firstSessionDate) {
        packStartedAt = fifoAlloc.firstSessionDate;
        packExpiresAt = pack.durationDays
          ? addPackDurationToStartDate(fifoAlloc.firstSessionDate, pack.durationDays)
          : packExpiresAt;
        enrollmentStatus = "ACTIVE";
      } else if (isProlonged) {
        packStartedAt = enrollment.packStartedAt ?? packStartedAt;
        packExpiresAt = enrollment.packExpiresAt ?? packExpiresAt;
        enrollmentStatus = "ACTIVE";
      }
    } else {
      consumedSessions = 0;
      remainingSessions = totalSessions ?? 0;
    }

    if (enrollment.categoryReassignedAt != null || enrollment.additionalSessionsCredit > 0) {
      if (displayTotalSessions != null) {
        displayTotalSessions = displayTotalSessions + enrollment.additionalSessionsCredit;
        remainingSessions = Math.max(0, displayTotalSessions - consumedSessions);
      } else {
        const balancesForPack = memberPackBalances.filter((b) => b.packId === pack.id);
        if (balancesForPack.length > 0) {
          remainingSessions = balancesForPack.reduce((sum, b) => sum + b.remaining, 0);
        }
      }
    }

    const status = mapEnrollmentStatusToDisplay(
      enrollmentStatus,
      remainingSessions,
      packExpiresAt,
    );

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
      enrollmentStatus,
      packStartedAt: packStartedAt?.toISOString() ?? null,
      packExpiresAt: packExpiresAt?.toISOString() ?? null,
      prolongedAt: enrollment.prolongedAt?.toISOString() ?? null,
      packPaymentMethod: paymentTotals.packPaymentMethod,
      depositPaymentMethod: paymentTotals.depositPaymentMethod,
      totalSessions: displayTotalSessions,
      consumedSessions,
      remainingSessions,
      courseQuotaRemaining,
      totalPaidDinars: paymentTotals.totalPaidDinars,
      additionalSessionsCredit: enrollment.additionalSessionsCredit,
      categoryReassignedAt: enrollment.categoryReassignedAt?.toISOString() ?? null,
    });
  }

  return items;
}

export async function reopenUnusedReplacedEnrollments(memberId: string): Promise<void> {
  const replaced = await prisma.memberPackEnrollment.findMany({
    where: {
      memberId,
      status: "REPLACED",
      packStartedAt: null,
    },
    include: {
      pack: {
        select: {
          sessionCount: true,
          category: true,
          courseQuotas: { select: { courseSlug: true, sessionCount: true } },
        },
      },
    },
    orderBy: [{ purchasedAt: "asc" }, { createdAt: "asc" }],
  });
  if (replaced.length === 0) return;

  const all = await prisma.memberPackEnrollment.findMany({
    where: { memberId },
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
    memberId,
    enrollmentsAsc: all,
    countingMode: "display",
  });

  for (const enrollment of replaced) {
    const totalSessions =
      enrollment.pack.courseQuotas.length > 0
        ? enrollment.pack.courseQuotas.reduce((sum, q) => sum + q.sessionCount, 0)
        : enrollment.pack.sessionCount;
    if (totalSessions == null || totalSessions <= 0) continue;

    const consumed = allocations.get(enrollment.id)?.consumedTotal ?? 0;
    if (consumed >= totalSessions) continue;

    await prisma.memberPackEnrollment.update({
      where: { id: enrollment.id },
      data: { status: "PENDING_START", closedAt: null },
    });
  }
}

/** Solde pack = somme des séances restantes des inscriptions ouvertes (ACTIVE / PENDING). */
export async function syncBalancesFromOpenEnrollments(
  memberId: string,
  enrollmentsAsc?: {
    id: string;
    packId: string;
    purchasedAt: Date;
    closedAt: Date | null;
    packStartedAt: Date | null;
    status: string;
    additionalSessionsCredit?: number;
    categoryReassignedAt?: Date | null;
    pack: {
      sessionCount: number | null;
      category?: string | null;
      courseQuotas: { courseSlug: string; sessionCount: number }[];
    };
  }[],
): Promise<void> {
  const rows =
    enrollmentsAsc ??
    (await prisma.memberPackEnrollment.findMany({
      where: { memberId },
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
    }));

  const openByPack = new Map<string, typeof rows>();
  for (const row of rows) {
    if (row.status !== "ACTIVE" && row.status !== "PENDING_START") continue;
    const list = openByPack.get(row.packId) ?? [];
    list.push(row);
    openByPack.set(row.packId, list);
  }

  const allocations = await allocateConsumedSessionsAcrossMemberEnrollments({
    memberId,
    enrollmentsAsc: rows,
    countingMode: "debit",
  });

  for (const [packId, openRows] of openByPack) {
    const pack = openRows[0]!.pack;

    const hasManualCredit = openRows.some(
      (row) =>
        (row.additionalSessionsCredit ?? 0) > 0 || row.categoryReassignedAt != null,
    );
    if (hasManualCredit) continue;

    if (pack.courseQuotas.length > 0) {
      const remainingBySlug = new Map<string, number>();
      for (const quota of pack.courseQuotas) {
        remainingBySlug.set(quota.courseSlug, 0);
      }
      for (const enrollment of openRows) {
        const alloc = allocations.get(enrollment.id);
        if (!alloc) continue;
        for (const quota of pack.courseQuotas) {
          const remaining = alloc.remainingByCourse.get(quota.courseSlug) ?? 0;
          remainingBySlug.set(
            quota.courseSlug,
            (remainingBySlug.get(quota.courseSlug) ?? 0) + remaining,
          );
        }
      }
      await prisma.memberPackBalance.deleteMany({ where: { memberId, packId } });
      await prisma.memberPackBalance.createMany({
        data: pack.courseQuotas.map((quota) => ({
          memberId,
          packId,
          courseSlug: quota.courseSlug,
          remaining: remainingBySlug.get(quota.courseSlug) ?? quota.sessionCount,
        })),
      });
      continue;
    }

    if (pack.sessionCount == null) continue;
    let remainingTotal = 0;
    for (const enrollment of openRows) {
      const remaining = allocations.get(enrollment.id)?.remainingTotal ?? 0;
      if (!Number.isFinite(remaining)) continue;
      remainingTotal += remaining;
    }
    await prisma.memberPackBalance.deleteMany({ where: { memberId, packId } });
    await prisma.memberPackBalance.create({
      data: { memberId, packId, courseSlug: null, remaining: remainingTotal },
    });
  }
}

/** Réaligne inscriptions ouvertes + soldes avant réservation (aligné fiche pack). */
async function prepareOpenEnrollmentsForBooking(memberId: string): Promise<void> {
  const open = await prisma.memberPackEnrollment.findMany({
    where: { memberId, status: { in: ["PENDING_START", "ACTIVE"] } },
    select: { id: true, packId: true, packStartedAt: true },
  });
  if (open.length === 0) return;

  await prisma.$transaction(async (tx) => {
    for (const enrollment of open) {
      if (enrollment.packStartedAt) {
        await resetPackStartWhenNoConsumption(tx, {
          memberId,
          packId: enrollment.packId,
          enrollmentId: enrollment.id,
        });
      }
      const balanceCount = await tx.memberPackBalance.count({
        where: { memberId, packId: enrollment.packId },
      });
      if (balanceCount === 0) {
        await resetMemberPackBalancesForPack(tx, { memberId, packId: enrollment.packId });
      }
    }
  });
}

/**
 * Prépare le stock débitable avant une réservation / présence :
 * réouvre les packs parallèles inutilisés et recalcule les soldes.
 */
export async function ensureMemberParallelPackStockForDebit(memberId: string): Promise<void> {
  await reopenUnusedReplacedEnrollments(memberId);
  await repairEnrollmentStartsBeforePurchase(memberId);
  await prepareOpenEnrollmentsForBooking(memberId);
  await syncBalancesFromOpenEnrollments(memberId);
}
