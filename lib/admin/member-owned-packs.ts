import "server-only";

import type { MemberPackEnrollmentStatus, Prisma } from "@prisma/client";
import { startOfLocalToday, formatYmdLocal, parseYmdToPrismaDate } from "@/lib/calendar-day";
import {
  backfillEnrollmentStartFromFirstConsumption,
  countEnrollmentConsumedSessionsByCourseInPeriod,
  countEnrollmentConsumedSessionsInPeriod,
  ensureMemberPackEnrollmentsBackfilled,
  findFirstEnrollmentConsumedSessionDate,
  getEnrollmentPaymentTotals,
  reopenSingleSessionPackAfterFullRefund,
  resetPackStartWhenNoConsumption,
} from "@/lib/admin/member-pack-enrollment";
import {
  resetMemberPackBalancesForPack,
} from "@/lib/admin/member-pack-renewal";
import { addPackDurationToStartDate } from "@/lib/pack-duration";
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

function courseQuotaUsageLines(
  pack: { courseQuotas: { courseSlug: string; sessionCount: number }[] },
  consumedByCourse: Map<string, number>,
): { courseLabel: string; consumed: number; remaining: number; total: number }[] {
  return pack.courseQuotas.map((q) => {
    const consumed = Math.min(q.sessionCount, Math.max(0, consumedByCourse.get(q.courseSlug) ?? 0));
    return {
      courseLabel: courseLabel(q.courseSlug),
      consumed,
      remaining: Math.max(0, q.sessionCount - consumed),
      total: q.sessionCount,
    };
  });
}

function toPrismaDateLocal(d: Date): Date {
  return parseYmdToPrismaDate(formatYmdLocal(d))!;
}

type EnrollmentPeriodRow = {
  id: string;
  packId: string;
  purchasedAt: Date;
  closedAt: Date | null;
  packStartedAt: Date | null;
  status?: string;
};

/**
 * Bornes de consommation d'une inscription (FIFO par date d'achat).
 * - Fin : date d'achat du renouvellement suivant du même pack catalogue (pas un `packStartedAt`
 *   antérieur à cet achat — sinon le renouvellement « vole » les séances du pack précédent).
 * - Début : jamais avant `purchasedAt`. Pack pas encore démarré → borne = achat (évite d'absorber
 *   l'historique d'un autre pack après une modification admin).
 */
function getEnrollmentPeriodBounds(
  enrollment: EnrollmentPeriodRow,
  enrollmentsAsc: EnrollmentPeriodRow[],
): { periodStart: Date | null; periodEndExclusive: Date | null } {
  const index = enrollmentsAsc.findIndex((row) => row.id === enrollment.id);
  const purchased = toPrismaDateLocal(enrollment.purchasedAt);

  let periodEndExclusive: Date | null = null;
  for (let i = index + 1; i < enrollmentsAsc.length; i++) {
    const next = enrollmentsAsc[i]!;
    if (next.packId === enrollment.packId) {
      // Frontière = achat du suivant (stable), pas un début d'usage éventuellement mal daté.
      periodEndExclusive = toPrismaDateLocal(next.purchasedAt);
      break;
    }
  }
  if (periodEndExclusive == null && enrollment.closedAt) {
    periodEndExclusive = toPrismaDateLocal(enrollment.closedAt);
  }

  let hasPreviousSamePack = false;
  for (let i = index - 1; i >= 0; i--) {
    if (enrollmentsAsc[i]!.packId === enrollment.packId) {
      hasPreviousSamePack = true;
      break;
    }
  }

  let periodStart: Date | null = null;
  if (hasPreviousSamePack || enrollment.status === "PENDING_START") {
    // Renouvellement ou pack non démarré : borner à l'achat (évite d'absorber un autre historique).
    periodStart = purchased;
  } else if (enrollment.packStartedAt) {
    const started = toPrismaDateLocal(enrollment.packStartedAt);
    // Ne jamais compter avant la date d'achat (ex. packStartedAt hérité / erroné).
    periodStart = started.getTime() >= purchased.getTime() ? started : purchased;
  }
  // sinon 1ᵉʳ pack ACTIVE sans début : pas de borne basse (historique legacy)

  return { periodStart, periodEndExclusive };
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

  // Recalcule les soldes = somme des séances restantes sur les inscriptions ouvertes du même pack.
  await syncBalancesFromOpenEnrollments(memberId, enrollmentsAsc);

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

    let packStartedAt = enrollment.packStartedAt;
    let packExpiresAt = enrollment.packExpiresAt;
    let enrollmentStatus = enrollment.status;

    let consumedSessions: number;
    let remainingSessions: number;
    let courseQuotaRemaining: MemberOwnedPackDto["courseQuotaRemaining"] = [];

    // Pack « 1 séance » : packStartedAt seul ne suffit pas (ex. présence puis remboursement).
    if (totalSessions === 1 && pack.courseQuotas.length === 0 && packStartedAt) {
      const { periodStart, periodEndExclusive } = getEnrollmentPeriodBounds(enrollment, enrollmentsAsc);
      const consumedRaw = await countEnrollmentConsumedSessionsInPeriod({
        memberId,
        packId: pack.id,
        courseQuotas: [],
        sessionCount: pack.sessionCount,
        category: pack.category,
        periodStart,
        periodEndExclusive,
      });
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
    } else {
      const { periodStart, periodEndExclusive } = getEnrollmentPeriodBounds(enrollment, enrollmentsAsc);

      if (pack.courseQuotas.length > 0) {
        const consumedByCourse = await countEnrollmentConsumedSessionsByCourseInPeriod({
          memberId,
          packId: pack.id,
          courseQuotas: pack.courseQuotas,
          sessionCount: pack.sessionCount,
          category: pack.category,
          periodStart,
          periodEndExclusive,
        });
        courseQuotaRemaining = courseQuotaUsageLines(pack, consumedByCourse);
        const consumedRaw = courseQuotaRemaining.reduce((sum, q) => sum + q.consumed, 0);
        consumedSessions =
          totalSessions != null ? Math.min(consumedRaw, totalSessions) : consumedRaw;
      } else {
        const consumedRaw = await countEnrollmentConsumedSessionsInPeriod({
          memberId,
          packId: pack.id,
          courseQuotas: pack.courseQuotas,
          sessionCount: pack.sessionCount,
          category: pack.category,
          periodStart,
          periodEndExclusive,
        });
        consumedSessions =
          totalSessions != null ? Math.min(consumedRaw, totalSessions) : consumedRaw;
      }

      remainingSessions =
        totalSessions != null ? Math.max(0, totalSessions - consumedSessions) : 0;

      if (packStartedAt && consumedSessions <= 0) {
        packStartedAt = null;
        packExpiresAt = null;
        enrollmentStatus = "PENDING_START";
        await prisma.$transaction(async (tx) => {
          await resetPackStartWhenNoConsumption(tx, {
            memberId,
            packId: pack.id,
            enrollmentId: enrollment.id,
          });
        });
      } else if (!packStartedAt && consumedSessions > 0) {
        const backfilled = await backfillEnrollmentStartFromFirstConsumption({
          enrollmentId: enrollment.id,
          memberId,
          packId: pack.id,
          courseQuotas: pack.courseQuotas,
          durationDays: pack.durationDays,
          periodStart,
          periodEndExclusive,
        });
        if (backfilled) {
          packStartedAt = backfilled.packStartedAt;
          packExpiresAt = backfilled.packExpiresAt;
          enrollmentStatus = "ACTIVE";
        }
      } else if (
        packStartedAt &&
        toPrismaDateLocal(packStartedAt).getTime() < toPrismaDateLocal(enrollment.purchasedAt).getTime()
      ) {
        // Sécurité affichage + DB : ne jamais montrer un début avant l'achat.
        const purchased = toPrismaDateLocal(enrollment.purchasedAt);
        const repairedStart =
          periodStart && periodStart.getTime() >= purchased.getTime() ? periodStart : purchased;
        // Si aucune conso post-achat, remettre « pas encore démarré ».
        if (consumedSessions <= 0) {
          packStartedAt = null;
          packExpiresAt = null;
          enrollmentStatus = "PENDING_START";
          await prisma.memberPackEnrollment.update({
            where: { id: enrollment.id },
            data: {
              packStartedAt: null,
              packExpiresAt: null,
              status: "PENDING_START",
              closedAt: null,
            },
          });
        } else {
          packStartedAt = repairedStart;
          packExpiresAt = pack.durationDays
            ? addPackDurationToStartDate(repairedStart, pack.durationDays)
            : packExpiresAt;
          await prisma.memberPackEnrollment.update({
            where: { id: enrollment.id },
            data: {
              packStartedAt: repairedStart,
              packExpiresAt,
              status: enrollmentStatus === "PENDING_START" ? "ACTIVE" : enrollmentStatus,
            },
          });
        }
      } else if (packStartedAt && !packExpiresAt && pack.durationDays) {
        packExpiresAt = addPackDurationToStartDate(packStartedAt, pack.durationDays);
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
      packPaymentMethod: paymentTotals.packPaymentMethod,
      depositPaymentMethod: paymentTotals.depositPaymentMethod,
      totalSessions,
      consumedSessions,
      remainingSessions,
      totalPaidDinars: paymentTotals.totalPaidDinars,
      courseQuotaRemaining,
    });
  }

  return items;
}

/**
 * Réouvre les inscriptions remplacées jamais démarrées qui ont encore des séances
 * (achats parallèles du même pack catalogue).
 */
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
    select: { id: true, packId: true, purchasedAt: true, closedAt: true, packStartedAt: true },
  });

  for (const enrollment of replaced) {
    const totalSessions =
      enrollment.pack.courseQuotas.length > 0
        ? enrollment.pack.courseQuotas.reduce((sum, q) => sum + q.sessionCount, 0)
        : enrollment.pack.sessionCount;
    if (totalSessions == null || totalSessions <= 0) continue;

    const { periodStart, periodEndExclusive } = getEnrollmentPeriodBounds(enrollment, all);
    const consumed = await countEnrollmentConsumedSessionsInPeriod({
      memberId,
      packId: enrollment.packId,
      courseQuotas: enrollment.pack.courseQuotas,
      sessionCount: enrollment.pack.sessionCount,
      category: enrollment.pack.category,
      periodStart,
      periodEndExclusive,
    });
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

  for (const [packId, openRows] of openByPack) {
    const pack = openRows[0]!.pack;
    if (pack.courseQuotas.length > 0) {
      continue;
    }
    if (pack.sessionCount == null) continue;

    let remainingTotal = 0;
    for (const enrollment of openRows) {
      const { periodStart, periodEndExclusive } = getEnrollmentPeriodBounds(enrollment, rows);

      // Pack unique 1 séance : se baser sur les réservations encore consommatrices, pas seulement packStartedAt.
      if (pack.sessionCount === 1) {
        const consumed = await countEnrollmentConsumedSessionsInPeriod({
          memberId,
          packId,
          courseQuotas: [],
          sessionCount: 1,
          category: pack.category ?? null,
          periodStart,
          periodEndExclusive,
        });
        if (consumed <= 0) remainingTotal += 1;
        continue;
      }

      const consumed = await countEnrollmentConsumedSessionsInPeriod({
        memberId,
        packId,
        courseQuotas: [],
        sessionCount: pack.sessionCount,
        category: pack.category ?? null,
        periodStart,
        periodEndExclusive,
      });
      remainingTotal += Math.max(0, pack.sessionCount - Math.min(consumed, pack.sessionCount));
    }

    await prisma.memberPackBalance.deleteMany({ where: { memberId, packId } });
    await prisma.memberPackBalance.create({
      data: {
        memberId,
        packId,
        courseSlug: null,
        remaining: remainingTotal,
      },
    });
  }
}

/**
 * Prépare le stock débitable avant une réservation / présence :
 * réouvre les packs parallèles inutilisés et recalcule les soldes.
 */
export async function ensureMemberParallelPackStockForDebit(memberId: string): Promise<void> {
  await reopenUnusedReplacedEnrollments(memberId);
  await repairEnrollmentStartsBeforePurchase(memberId);
  await syncBalancesFromOpenEnrollments(memberId);
}
