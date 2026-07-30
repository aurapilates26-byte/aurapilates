import "server-only";

import { Prisma, type MemberPackEnrollmentStatus } from "@prisma/client";
import { startOfLocalToday, formatYmdLocal, parseYmdToPrismaDate } from "@/lib/calendar-day";
import {
  allocateConsumedSessionsForMemberEnrollments,
  backfillEnrollmentStartFromFirstConsumption,
  countEnrollmentConsumedSessionsByCourseInPeriod,
  countEnrollmentConsumedSessionsInPeriod,
  ensureMemberPackEnrollmentsBackfilled,
  findFirstEnrollmentConsumedSessionDate,
  getEnrollmentPaymentTotals,
} from "@/lib/admin/member-pack-enrollment";
import {
  recomputeAllMemberPackBalancesForMember,
  recomputeMemberPackBalancesForPack,
} from "@/lib/admin/member-pack-balance-recompute";
import { resetMemberPackBalancesForPack } from "@/lib/admin/member-pack-renewal";
import { addPackDurationToStartDate } from "@/lib/pack-duration";
import type { PackPaymentMethodValue } from "@/lib/pack-payment-method";
import { courseLabel } from "@/lib/course-labels";
import {
  clampPackStartToPurchasedAt,
  isPackStartBeforePurchase,
} from "@/lib/member-pack-period";
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
    await recomputeMemberPackBalancesForPack(tx, { memberId, packId: row.packId });
    await tx.memberPendingPack.delete({ where: { id: row.id } });
  }
}

/** Ajoute un pack sans écraser le solde des achats déjà présents du même catalogue. */
export async function addParallelMemberPack(
  tx: Prisma.TransactionClient,
  input: { memberId: string; packId: string },
): Promise<void> {
  await migratePendingPacksToParallel(tx, input.memberId);
  await tx.member.update({
    where: { id: input.memberId },
    data: { packId: input.packId, packStartedAt: null },
  });
  // Solde = quotas × nombre d'inscriptions (recalculé après création d'enrollment côté paiement).
  await recomputeMemberPackBalancesForPack(tx, input);
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
};

/**
 * Bornes de consommation d'une inscription (FIFO par date d'achat).
 * - Fin : date d'achat du renouvellement suivant du même pack catalogue (pas un `packStartedAt`
 *   antérieur à cet achat — sinon le renouvellement « vole » les séances du pack précédent).
 * - Début : `packStartedAt` s'il est cohérent (>= achat pour un renouvellement) ; sinon `purchasedAt`
 *   pour un renouvellement ; sinon aucune borne basse pour le 1ᵉʳ pack (historique).
 */
function getEnrollmentPeriodBounds(
  enrollment: EnrollmentPeriodRow,
  enrollmentsAsc: EnrollmentPeriodRow[],
): { periodStart: Date | null; periodEndExclusive: Date | null } {
  const index = enrollmentsAsc.findIndex((row) => row.id === enrollment.id);

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

  const purchased = toPrismaDateLocal(enrollment.purchasedAt);
  let hasPreviousSamePack = false;
  for (let i = index - 1; i >= 0; i--) {
    if (enrollmentsAsc[i]!.packId === enrollment.packId) {
      hasPreviousSamePack = true;
      break;
    }
  }

  let periodStart: Date | null = null;
  if (hasPreviousSamePack) {
    // Frontière basse = date d'achat (séances du jour d'achat → renouvellement).
    periodStart = purchased;
  } else if (enrollment.packStartedAt) {
    const started = toPrismaDateLocal(enrollment.packStartedAt);
    // Ne jamais ouvrir la fenêtre avant l'achat (évite l'héritage d'un packStartedAt global).
    periodStart = started.getTime() < purchased.getTime() ? purchased : started;
  }

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
  }));

  for (const enrollment of enrollments) {
    if (!enrollment.packStartedAt) continue;
    if (!isPackStartBeforePurchase(enrollment.packStartedAt, enrollment.purchasedAt)) continue;

    const purchased = toPrismaDateLocal(enrollment.purchasedAt);
    // Toujours chercher la 1ʳᵉ conso à partir de l'achat — jamais depuis le faux packStartedAt hérité.
    const { periodEndExclusive } = getEnrollmentPeriodBounds(enrollment, enrollmentsAsc);
    const firstSessionDate = await findFirstEnrollmentConsumedSessionDate({
      memberId,
      packId: enrollment.packId,
      courseQuotas: enrollment.pack.courseQuotas,
      periodStart: purchased,
      periodEndExclusive,
      purchasedAt: enrollment.purchasedAt,
    });

    if (firstSessionDate && !isPackStartBeforePurchase(firstSessionDate, enrollment.purchasedAt)) {
      const start = clampPackStartToPurchasedAt(firstSessionDate, enrollment.purchasedAt);
      const packExpiresAt =
        addPackDurationToStartDate(start, enrollment.pack.durationDays) ?? null;
      await prisma.memberPackEnrollment.update({
        where: { id: enrollment.id },
        data: {
          packStartedAt: start,
          packExpiresAt,
          status: enrollment.status === "PENDING_START" ? "ACTIVE" : enrollment.status,
          closedAt: enrollment.status === "REPLACED" || enrollment.status === "EXPIRED"
            ? enrollment.closedAt
            : null,
        },
      });
    } else {
      const reopen =
        enrollment.status === "ACTIVE" || enrollment.status === "PENDING_START";
      await prisma.memberPackEnrollment.update({
        where: { id: enrollment.id },
        data: {
          packStartedAt: null,
          packExpiresAt: null,
          ...(reopen ? { status: "PENDING_START" as const, closedAt: null } : {}),
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

  // Affichage = attribution FIFO (réservations). Pas de recalcul des soldes ici :
  // évite les courses Serializable avec présence / réservation (sync uniquement avant débit).
  const fifoByEnrollmentId = await allocateConsumedSessionsForMemberEnrollments({
    memberId,
    enrollmentsAsc,
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

    let packStartedAt = enrollment.packStartedAt;
    let packExpiresAt = enrollment.packExpiresAt;
    let enrollmentStatus = enrollment.status;

    let consumedSessions: number;
    let remainingSessions: number;
    let courseQuotaRemaining: MemberOwnedPackDto["courseQuotaRemaining"] = [];

    // Pack « 1 séance » : le débit pose packStartedAt → immédiatement terminé (évite les bornes FIFO incohérentes).
    if (totalSessions === 1 && pack.courseQuotas.length === 0 && packStartedAt) {
      consumedSessions = 1;
      remainingSessions = 0;
      if (!packExpiresAt && pack.durationDays) {
        packExpiresAt = addPackDurationToStartDate(packStartedAt, pack.durationDays);
      }
    } else {
      const { periodStart, periodEndExclusive } = getEnrollmentPeriodBounds(enrollment, enrollmentsAsc);
      const fifo = fifoByEnrollmentId.get(enrollment.id);

      if (fifo) {
        if (pack.courseQuotas.length > 0) {
          courseQuotaRemaining = courseQuotaUsageLines(pack, fifo.byCourse);
          const consumedRaw = courseQuotaRemaining.reduce((sum, q) => sum + q.consumed, 0);
          consumedSessions =
            totalSessions != null ? Math.min(consumedRaw, totalSessions) : consumedRaw;
        } else {
          consumedSessions =
            totalSessions != null ? Math.min(fifo.total, totalSessions) : fifo.total;
        }
      } else if (pack.courseQuotas.length > 0) {
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

      if (!packStartedAt && consumedSessions > 0) {
        const backfilled = await backfillEnrollmentStartFromFirstConsumption({
          enrollmentId: enrollment.id,
          memberId,
          packId: pack.id,
          courseQuotas: pack.courseQuotas,
          durationDays: pack.durationDays,
          periodStart,
          periodEndExclusive,
          purchasedAt: enrollment.purchasedAt,
        });
        if (backfilled) {
          packStartedAt = backfilled.packStartedAt;
          packExpiresAt = backfilled.packExpiresAt;
          enrollmentStatus = "ACTIVE";
        }
      } else if (packStartedAt && isPackStartBeforePurchase(packStartedAt, enrollment.purchasedAt)) {
        // Sécurité affichage + persistance : jamais de début avant l'achat (héritage).
        packStartedAt = null;
        packExpiresAt = null;
        const reopen =
          enrollmentStatus === "ACTIVE" || enrollmentStatus === "PENDING_START";
        if (reopen) enrollmentStatus = "PENDING_START";
        await prisma.memberPackEnrollment.update({
          where: { id: enrollment.id },
          data: {
            packStartedAt: null,
            packExpiresAt: null,
            ...(reopen ? { status: "PENDING_START" as const, closedAt: null } : {}),
          },
        });
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

/** Solde pack = quotas catalogue × nombre d'achats − séances déjà consommées. */
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
      select: { packId: true },
    }));

  const packIds = [...new Set(rows.map((row) => row.packId))];
  const member = await prisma.member.findUnique({
    where: { id: memberId },
    select: { packId: true },
  });
  if (member?.packId && !packIds.includes(member.packId)) {
    packIds.push(member.packId);
  }
  if (packIds.length === 0) return;

  // ReadCommitted suffit (recalcul idempotent) ; Serializable provoquait P2034 en concurrence.
  let lastError: unknown;
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      await prisma.$transaction(
        async (tx) => {
          await recomputeAllMemberPackBalancesForMember(tx, memberId);
        },
        {
          isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
          maxWait: 8000,
          timeout: 20000,
        },
      );
      return;
    } catch (error) {
      lastError = error;
      const retryable =
        error instanceof Prisma.PrismaClientKnownRequestError &&
        (error.code === "P2034" || error.code === "P2002");
      if (!retryable || attempt === 4) throw error;
      await new Promise((r) => setTimeout(r, 50 * (attempt + 1)));
    }
  }
  throw lastError;
}

const memberPackStockLocks = new Map<string, Promise<void>>();

/**
 * Prépare le stock débitable avant une réservation / présence :
 * réouvre les packs parallèles inutilisés et recalcule les soldes.
 * Verrou par adhérente pour éviter les courses entre fiche + présence.
 */
export async function ensureMemberParallelPackStockForDebit(memberId: string): Promise<void> {
  const previous = memberPackStockLocks.get(memberId) ?? Promise.resolve();
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  memberPackStockLocks.set(memberId, gate);

  await previous.catch(() => undefined);
  try {
    await reopenUnusedReplacedEnrollments(memberId);
    await repairEnrollmentStartsBeforePurchase(memberId);
    await syncBalancesFromOpenEnrollments(memberId);
  } finally {
    release();
    if (memberPackStockLocks.get(memberId) === gate) {
      memberPackStockLocks.delete(memberId);
    }
  }
}

/** Recalcule les soldes sans réouverture / réparation (retry présence après P2034). */
export async function refreshMemberPackBalancesForDebit(memberId: string): Promise<void> {
  const previous = memberPackStockLocks.get(memberId) ?? Promise.resolve();
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  memberPackStockLocks.set(memberId, gate);

  await previous.catch(() => undefined);
  try {
    await syncBalancesFromOpenEnrollments(memberId);
  } finally {
    release();
    if (memberPackStockLocks.get(memberId) === gate) {
      memberPackStockLocks.delete(memberId);
    }
  }
}
