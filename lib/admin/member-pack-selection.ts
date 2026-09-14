import "server-only";

import type { Prisma } from "@prisma/client";
import { courseLabel } from "@/lib/course-labels";
import { startOfLocalToday, formatYmdPrismaDate, parseYmdLocal } from "@/lib/calendar-day";
import { PACK_ERRORS } from "@/lib/create-member-reservation";
import {
  getEligibilityForPack,
  isCourseAllowedForPack,
  type PackEligibility,
} from "@/lib/pack-eligibility";
import { addPackDurationToStartDate } from "@/lib/pack-duration";
import {
  isSessionDateWithinPackPeriod,
  packExpiresAtLocal,
  packStartDateLocal,
} from "@/lib/member-pack-period";
import { debitMemberPackSession } from "@/lib/member-pack-session-ledger";
import { activateSelectedPackOnSessionDate } from "@/lib/admin/member-pack-activation";
import {
  allocateConsumedSessionsAcrossMemberEnrollments,
  consumeOldestOpenEnrollmentOnDebit,
} from "@/lib/admin/member-pack-enrollment";
import { ensureMemberParallelPackStockForDebit } from "@/lib/admin/member-owned-packs";
import type { EnrollmentConsumptionAlloc } from "@/lib/member-pack-consumption-assign";
import {
  remainingForCourseFromBalances,
  totalRemainingFromBalances,
  type PackQuotaShape,
} from "@/lib/member-pack-recorded-remaining";
import { prisma } from "@/lib/prisma";

type ResolvePackOptions = {
  preferredPackId?: string | null;
  /** Présence admin : autorise une séance avant packStartedAt (recul à l'activation). */
  allowSessionBeforePackStart?: boolean;
  /**
   * Présence admin : si plusieurs packs valides et pas de preferredPackId,
   * choisit automatiquement (plus consommé, puis plus ancien).
   */
  autoPickWhenAmbiguous?: boolean;
};

export type BookablePackOptionDto = {
  packId: string;
  packName: string;
  totalSessions: number | null;
  consumedSessions: number;
  remainingSessions: number;
  remainingForCourse: number;
  courseCoverageLabel: string;
  purchasedAt: string;
  packStartedAt: string | null;
  isProlonged: boolean;
};

type PackCandidate = {
  packId: string;
  packName: string;
  pack: {
    id: string;
    name: string;
    category: string | null;
    durationDays: string | null;
    sessionCount: number | null;
    isActive: boolean;
    courseQuotas: { courseSlug: string; sessionCount: number }[];
  };
  purchasedAt: Date;
  packStartedAt: Date | null;
  packExpiresAt: Date | null;
  isProlonged: boolean;
  remainingSessions: number;
  remainingForCourse: number;
  courseCoverageLabel: string;
};

function totalRemaining(
  balances: { courseSlug: string | null; remaining: number }[],
  pack: PackQuotaShape,
): number {
  return totalRemainingFromBalances(balances, pack);
}

function remainingForCourseSlug(
  balances: { courseSlug: string | null; remaining: number }[],
  pack: PackQuotaShape,
  courseSlug: string,
): number {
  return remainingForCourseFromBalances(balances, pack, courseSlug);
}

function debitRemainingFromAllocations(input: {
  packId: string;
  courseSlug: string;
  pack: PackQuotaShape;
  enrollments: {
    id: string;
    packId: string;
    status: string;
    additionalSessionsCredit?: number;
    categoryReassignedAt?: Date | null;
  }[];
  allocations: Map<string, EnrollmentConsumptionAlloc>;
}): { remainingSessions: number; remainingForCourse: number } | null {
  const open = input.enrollments.filter(
    (row) =>
      row.packId === input.packId &&
      (row.status === "ACTIVE" || row.status === "PENDING_START"),
  );
  if (
    open.some(
      (row) =>
        (row.additionalSessionsCredit ?? 0) > 0 || row.categoryReassignedAt != null,
    )
  ) {
    return null;
  }

  let remainingSessions = 0;
  let remainingForCourse = 0;
  for (const enrollment of open) {
    const alloc = input.allocations.get(enrollment.id);
    if (!alloc) continue;
    const remaining = alloc.remainingTotal;
    if (Number.isFinite(remaining)) remainingSessions += remaining;
    if (input.pack.courseQuotas.length > 0) {
      remainingForCourse += alloc.remainingByCourse.get(input.courseSlug) ?? 0;
    } else if (Number.isFinite(remaining)) {
      remainingForCourse += remaining;
    }
  }
  return { remainingSessions, remainingForCourse };
}

function buildCourseCoverageLabel(pack: PackCandidate["pack"], courseSlug: string): string {
  if (pack.courseQuotas.length > 0) {
    const quota = pack.courseQuotas.find((q) => q.courseSlug === courseSlug);
    if (quota) {
      return `${courseLabel(courseSlug)} (${quota.sessionCount} séances pack)`;
    }
    return pack.courseQuotas.map((q) => courseLabel(q.courseSlug)).join(" · ");
  }
  const eligibility = getEligibilityForPack({
    category: pack.category ?? null,
    courseQuotas: pack.courseQuotas,
  });
  if (eligibility.allowedCourseSlugs.length === 0) {
    return "Tous les cours";
  }
  if (eligibility.allowedCourseSlugs.length === 1) {
    return courseLabel(eligibility.allowedCourseSlugs[0]!);
  }
  return eligibility.allowedCourseSlugs.map((slug) => courseLabel(slug)).join(" · ");
}

function resolvePackPeriod(input: {
  packId: string;
  memberPackId: string | null;
  memberPackStartedAt: Date | null;
  enrollmentStartedAt: Date | null;
  enrollmentExpiresAt: Date | null;
}): { packStartedAt: Date | null; packExpiresAt: Date | null } {
  if (input.enrollmentStartedAt) {
    return {
      packStartedAt: input.enrollmentStartedAt,
      packExpiresAt: input.enrollmentExpiresAt,
    };
  }
  if (input.memberPackId === input.packId && input.memberPackStartedAt) {
    return { packStartedAt: input.memberPackStartedAt, packExpiresAt: null };
  }
  return { packStartedAt: null, packExpiresAt: null };
}

function totalSessionsForPack(pack: PackCandidate["pack"]): number | null {
  if (pack.courseQuotas.length > 0) {
    return pack.courseQuotas.reduce((sum, q) => sum + q.sessionCount, 0);
  }
  return pack.sessionCount;
}

function isPackUnused(candidate: PackCandidate): boolean {
  const total = totalSessionsForPack(candidate.pack);
  if (total == null) return candidate.packStartedAt == null;
  return candidate.remainingSessions >= total;
}

/**
 * Expiration candidate : durée depuis démarrage (comme la fiche), pas la DB périmée.
 * Prolongation admin → date stockée.
 */
function resolveCandidateExpiresAt(candidate: PackCandidate): Date | null {
  if (candidate.isProlonged && candidate.packExpiresAt) {
    return packStartDateLocal(candidate.packExpiresAt);
  }
  const fromDuration = packExpiresAtLocal(candidate.packStartedAt, candidate.pack.durationDays);
  if (fromDuration) return fromDuration;
  if (candidate.packExpiresAt) return packStartDateLocal(candidate.packExpiresAt);
  return null;
}

/**
 * Période bookable = même vérité que le panneau packs (1ʳᵉ séance FIFO display + durée).
 * Ne jamais faire confiance seul à enrollment.packExpiresAt (souvent une ancienne activation).
 */
function resolveBookingPeriodFromDisplayFifo(input: {
  enrollment: {
    status: string;
    packStartedAt: Date | null;
    packExpiresAt: Date | null;
    prolongedAt: Date | null;
  };
  displayAlloc: EnrollmentConsumptionAlloc | undefined;
  durationDays: string | null;
  packId: string;
  memberPackId: string | null;
  memberPackStartedAt: Date | null;
}): { packStartedAt: Date | null; packExpiresAt: Date | null } {
  if (input.enrollment.prolongedAt) {
    return {
      packStartedAt: input.enrollment.packStartedAt,
      packExpiresAt: input.enrollment.packExpiresAt,
    };
  }

  const consumed = input.displayAlloc?.consumedTotal ?? 0;
  const firstRaw = input.displayAlloc?.firstSessionDate ?? null;

  // Aucune conso FIFO → pack non démarré (1ʳᵉ réservation autorisée).
  if (consumed <= 0 || !firstRaw) {
    if (
      input.enrollment.status === "PENDING_START" ||
      !input.enrollment.packStartedAt ||
      consumed <= 0
    ) {
      return { packStartedAt: null, packExpiresAt: null };
    }
  }

  if (firstRaw) {
    const firstYmd = formatYmdPrismaDate(firstRaw);
    const firstLocal = parseYmdLocal(firstYmd) ?? packStartDateLocal(firstRaw);
    const expires =
      firstLocal && input.durationDays
        ? addPackDurationToStartDate(firstLocal, input.durationDays)
        : input.enrollment.packExpiresAt;
    return {
      packStartedAt: firstLocal ?? firstRaw,
      packExpiresAt: expires,
    };
  }

  return resolvePackPeriod({
    packId: input.packId,
    memberPackId: input.memberPackId,
    memberPackStartedAt: input.memberPackStartedAt,
    enrollmentStartedAt: input.enrollment.packStartedAt,
    enrollmentExpiresAt: input.enrollment.packExpiresAt,
  });
}

function isCandidateValidForSessionDate(
  candidate: PackCandidate,
  sessionDateLocal: Date,
  options?: Pick<ResolvePackOptions, "allowSessionBeforePackStart">,
): boolean {
  // Pack jamais consommé : la 1ʳᵉ réservation démarre le pack (ignorer une date de début fantôme).
  if (!candidate.packStartedAt || isPackUnused(candidate)) return true;

  const expiresAt = resolveCandidateExpiresAt(candidate);

  if (expiresAt && sessionDateLocal.getTime() > expiresAt.getTime()) {
    return false;
  }

  const start = packStartDateLocal(candidate.packStartedAt);
  if (start && sessionDateLocal.getTime() < start.getTime()) {
    return options?.allowSessionBeforePackStart === true;
  }

  if (options?.allowSessionBeforePackStart) {
    return isSessionDateWithinPackPeriod(
      sessionDateLocal,
      candidate.packStartedAt,
      candidate.pack.durationDays,
      candidate.packExpiresAt,
    );
  }

  if (
    !isSessionDateWithinPackPeriod(
      sessionDateLocal,
      candidate.packStartedAt,
      candidate.pack.durationDays,
      candidate.packExpiresAt,
    )
  ) {
    return false;
  }

  const today = startOfLocalToday();
  if (expiresAt && expiresAt.getTime() < today.getTime()) {
    return false;
  }

  return true;
}

async function loadPackCandidates(
  tx: Prisma.TransactionClient,
  memberId: string,
  courseSlug: string,
): Promise<PackCandidate[]> {
  // Ne pas appeler ensure* ici : écritures hors-tx pendant une transaction → conflit / deadlock.
  const member = await tx.member.findUnique({
    where: { id: memberId },
    select: {
      packId: true,
      packStartedAt: true,
      packBalances: { select: { packId: true, courseSlug: true, remaining: true } },
      packEnrollments: {
        where: { status: { in: ["PENDING_START", "ACTIVE"] } },
        orderBy: [{ purchasedAt: "desc" }, { createdAt: "desc" }],
        select: {
          packId: true,
          purchasedAt: true,
          packStartedAt: true,
          packExpiresAt: true,
          prolongedAt: true,
          status: true,
        },
      },
    },
  });
  if (!member) return [];

  const allEnrollments = await tx.memberPackEnrollment.findMany({
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

  const debitAllocations = await allocateConsumedSessionsAcrossMemberEnrollments({
    memberId,
    enrollmentsAsc: allEnrollments,
    countingMode: "debit",
    db: tx,
  });
  const displayAllocations = await allocateConsumedSessionsAcrossMemberEnrollments({
    memberId,
    enrollmentsAsc: allEnrollments,
    countingMode: "display",
    db: tx,
  });

  const packIds = new Set<string>();
  for (const balance of member.packBalances) {
    if (balance.remaining > 0) packIds.add(balance.packId);
  }
  for (const enrollment of member.packEnrollments) {
    packIds.add(enrollment.packId);
  }
  if (member.packId) packIds.add(member.packId);
  if (packIds.size === 0) return [];

  const refreshedBalances = await tx.memberPackBalance.findMany({
    where: { memberId, packId: { in: [...packIds] } },
    select: { packId: true, courseSlug: true, remaining: true },
  });

  const packs = await tx.pack.findMany({
    where: { id: { in: [...packIds] }, isActive: true },
    select: {
      id: true,
      name: true,
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

    const balances = refreshedBalances.filter((b) => b.packId === pack.id);
    const openEnrollments = allEnrollments
      .filter(
        (row) =>
          row.packId === pack.id &&
          (row.status === "ACTIVE" || row.status === "PENDING_START"),
      )
      .sort(
        (a, b) =>
          a.purchasedAt.getTime() - b.purchasedAt.getTime() ||
          a.createdAt.getTime() - b.createdAt.getTime(),
      );

    const hasManualCredit = openEnrollments.some(
      (row) =>
        (row.additionalSessionsCredit ?? 0) > 0 || row.categoryReassignedAt != null,
    );

    // Inscription FIFO encore débitable pour ce cours (ancien pack d'abord).
    let fifoEnrollment: (typeof openEnrollments)[number] | null = null;
    let debitRemainingForCourse = 0;
    if (!hasManualCredit) {
      for (const enrollment of openEnrollments) {
        const alloc = debitAllocations.get(enrollment.id);
        if (!alloc) continue;
        const forCourse =
          pack.courseQuotas.length > 0
            ? (alloc.remainingByCourse.get(courseSlug) ?? 0)
            : Number.isFinite(alloc.remainingTotal)
              ? alloc.remainingTotal
              : 0;
        if (forCourse <= 0) continue;
        fifoEnrollment = enrollment;
        debitRemainingForCourse = forCourse;
        break;
      }
    }

    if (!fifoEnrollment) {
      const fromAlloc = debitRemainingFromAllocations({
        packId: pack.id,
        courseSlug,
        pack,
        enrollments: allEnrollments,
        allocations: debitAllocations,
      });
      const remainingForCourse =
        fromAlloc?.remainingForCourse ?? remainingForCourseSlug(balances, pack, courseSlug);
      if (remainingForCourse <= 0) continue;

      const latest = openEnrollments[openEnrollments.length - 1] ?? null;
      const unstarted = openEnrollments.find(
        (e) => e.status === "PENDING_START" || !e.packStartedAt,
      );
      const openEnrollment = unstarted ?? latest;
      const period = unstarted
        ? { packStartedAt: null as Date | null, packExpiresAt: null as Date | null }
        : resolveBookingPeriodFromDisplayFifo({
            enrollment: openEnrollment ?? {
              status: "PENDING_START",
              packStartedAt: null,
              packExpiresAt: null,
              prolongedAt: null,
            },
            displayAlloc: openEnrollment
              ? displayAllocations.get(openEnrollment.id)
              : undefined,
            durationDays: pack.durationDays,
            packId: pack.id,
            memberPackId: member.packId,
            memberPackStartedAt: member.packStartedAt,
          });

      candidates.push({
        packId: pack.id,
        packName: pack.name,
        pack,
        purchasedAt: openEnrollment?.purchasedAt ?? new Date(0),
        packStartedAt: period.packStartedAt,
        packExpiresAt: period.packExpiresAt,
        isProlonged: openEnrollments.some((e) => e.prolongedAt != null),
        remainingSessions: fromAlloc?.remainingSessions ?? totalRemaining(balances, pack),
        remainingForCourse,
        courseCoverageLabel: buildCourseCoverageLabel(pack, courseSlug),
      });
      continue;
    }

    // Affichage = mode présence (comme le panneau packs), bookabilité = mode débit.
    const displayAlloc = displayAllocations.get(fifoEnrollment.id);
    const total = totalSessionsForPack(pack);
    const displayConsumed = displayAlloc?.consumedTotal ?? 0;
    const displayRemaining =
      total != null
        ? Math.max(0, total - Math.min(displayConsumed, total))
        : (displayAlloc?.remainingTotal ?? 0);

    const period = resolveBookingPeriodFromDisplayFifo({
      enrollment: fifoEnrollment,
      displayAlloc,
      durationDays: pack.durationDays,
      packId: pack.id,
      memberPackId: member.packId,
      memberPackStartedAt: member.packStartedAt,
    });

    candidates.push({
      packId: pack.id,
      packName: pack.name,
      pack,
      purchasedAt: fifoEnrollment.purchasedAt,
      packStartedAt: period.packStartedAt,
      packExpiresAt: period.packExpiresAt,
      isProlonged: fifoEnrollment.prolongedAt != null,
      remainingSessions: displayRemaining,
      remainingForCourse: debitRemainingForCourse,
      courseCoverageLabel: buildCourseCoverageLabel(pack, courseSlug),
    });
  }

  return candidates.sort((a, b) => a.purchasedAt.getTime() - b.purchasedAt.getTime());
}

function consumedSessionsForCandidate(candidate: PackCandidate): number {
  const total = totalSessionsForPack(candidate.pack);
  if (total == null) return 0;
  return Math.max(0, total - candidate.remainingSessions);
}

/**
 * Choix auto quand plusieurs packs couvrent le cours :
 * prioriser le pack acheté le plus tôt (FIFO) pour épuiser l'ancien avant le suivant.
 * À date d'achat égale : celui déjà le plus consommé.
 */
function pickDefaultPackCandidate(candidates: PackCandidate[]): PackCandidate {
  return [...candidates].sort((a, b) => {
    const purchaseDiff = a.purchasedAt.getTime() - b.purchasedAt.getTime();
    if (purchaseDiff !== 0) return purchaseDiff;
    return consumedSessionsForCandidate(b) - consumedSessionsForCandidate(a);
  })[0]!;
}

function toBookablePackOptionDto(candidate: PackCandidate): BookablePackOptionDto {
  return {
    packId: candidate.packId,
    packName: candidate.packName,
    totalSessions: totalSessionsForPack(candidate.pack),
    consumedSessions: consumedSessionsForCandidate(candidate),
    remainingSessions: candidate.remainingSessions,
    remainingForCourse: candidate.remainingForCourse,
    courseCoverageLabel: candidate.courseCoverageLabel,
    purchasedAt: candidate.purchasedAt.toISOString(),
    packStartedAt: candidate.packStartedAt?.toISOString() ?? null,
    isProlonged: candidate.isProlonged,
  };
}

/** Cours réservables selon les séances restantes réelles (quota Mat/Reformer indépendants). */
export async function getMemberBookableCourseSlugs(memberId: string): Promise<string[]> {
  await ensureMemberParallelPackStockForDebit(memberId);

  const member = await prisma.member.findUnique({
    where: { id: memberId },
    select: {
      packBalances: { select: { packId: true, courseSlug: true, remaining: true } },
    },
  });
  if (!member) return [];

  const packIds = [...new Set(member.packBalances.map((b) => b.packId))];
  if (packIds.length === 0) return [];

  const packs = await prisma.pack.findMany({
    where: { id: { in: packIds }, isActive: true },
    select: {
      id: true,
      category: true,
      sessionCount: true,
      courseQuotas: { select: { courseSlug: true, sessionCount: true } },
    },
  });

  const slugs = new Set<string>();

  for (const pack of packs) {
    const balances = member.packBalances.filter((b) => b.packId === pack.id);
    if (pack.courseQuotas.length > 0) {
      for (const quota of pack.courseQuotas) {
        if (remainingForCourseSlug(balances, pack, quota.courseSlug) > 0) {
          slugs.add(quota.courseSlug);
        }
      }
      continue;
    }

    if (totalRemaining(balances, pack) <= 0) continue;

    const eligibility = getEligibilityForPack({
      category: pack.category ?? null,
      courseQuotas: pack.courseQuotas,
    });
    if (eligibility.allowedCourseSlugs.length === 0) {
      return [];
    }
    for (const slug of eligibility.allowedCourseSlugs) slugs.add(slug);
  }

  return [...slugs];
}

/** @deprecated Préférer getMemberBookableCourseSlugs pour l'UI membre. */
export async function getMemberCombinedPackEligibility(memberId: string): Promise<PackEligibility> {
  const slugs = await getMemberBookableCourseSlugs(memberId);
  if (slugs.length === 0) return { mode: "unknown", allowedCourseSlugs: [] };
  return {
    mode: slugs.length > 1 ? "mixed" : "single",
    allowedCourseSlugs: slugs,
  };
}

export type ListBookablePacksResult = {
  items: BookablePackOptionDto[];
  /** Message clair pour l'admin quand aucun pack n'est réservable. */
  emptyMessage?: string;
};

function formatDateFrShort(d: Date): string {
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

async function diagnoseEmptyBookablePacks(input: {
  memberId: string;
  courseSlug: string;
  sessionDateLocal: Date | null | undefined;
  eligibleCandidates: PackCandidate[];
}): Promise<string> {
  const { memberId, courseSlug, sessionDateLocal, eligibleCandidates } = input;

  if (eligibleCandidates.length > 0 && sessionDateLocal) {
    const expired = eligibleCandidates.filter((c) => {
      if (!c.packStartedAt || isPackUnused(c)) return false;
      const expiresAt = resolveCandidateExpiresAt(c);
      return expiresAt != null && sessionDateLocal.getTime() > expiresAt.getTime();
    });
    if (expired.length > 0) {
      const c = expired[0]!;
      const expiresAt = resolveCandidateExpiresAt(c);
      const expireLabel = expiresAt ? formatDateFrShort(expiresAt) : "non définie";
      return `Pack ${c.packName} expiré le ${expireLabel}. Impossible de réserver le ${formatDateFrShort(sessionDateLocal)}. Choisissez une date jusqu'au ${expireLabel}, ou renouvelez le pack (${c.remainingSessions} séance(s) encore au compteur).`;
    }

    const notStarted = eligibleCandidates.filter((c) => {
      if (!c.packStartedAt || isPackUnused(c)) return false;
      const start = packStartDateLocal(c.packStartedAt);
      return start != null && sessionDateLocal.getTime() < start.getTime();
    });
    if (notStarted.length > 0) {
      const c = notStarted[0]!;
      const start = packStartDateLocal(c.packStartedAt);
      return `Pack ${c.packName} pas encore démarré pour cette date (début : ${start ? formatDateFrShort(start) : "non défini"}). Choisissez une date à partir du début du pack.`;
    }

    const expiredVsToday = eligibleCandidates.filter((c) => {
      const expiresAt = resolveCandidateExpiresAt(c);
      return expiresAt != null && expiresAt.getTime() < startOfLocalToday().getTime();
    });
    if (expiredVsToday.length > 0) {
      const c = expiredVsToday[0]!;
      const expiresAt = resolveCandidateExpiresAt(c);
      return `Pack ${c.packName} expiré le ${expiresAt ? formatDateFrShort(expiresAt) : "non définie"}. Renouvelez le pack pour réserver (${c.remainingSessions} séance(s) encore au compteur).`;
    }
  }

  const member = await prisma.member.findUnique({
    where: { id: memberId },
    select: {
      packId: true,
      packBalances: { select: { packId: true, courseSlug: true, remaining: true } },
      packEnrollments: {
        where: { status: { in: ["PENDING_START", "ACTIVE", "EXPIRED"] } },
        orderBy: [{ purchasedAt: "desc" }, { createdAt: "desc" }],
        select: {
          packId: true,
          status: true,
          packStartedAt: true,
          packExpiresAt: true,
          pack: {
            select: {
              id: true,
              name: true,
              category: true,
              sessionCount: true,
              durationDays: true,
              isActive: true,
              courseQuotas: { select: { courseSlug: true, sessionCount: true } },
            },
          },
        },
      },
    },
  });

  if (!member) {
    return "Adhérente introuvable.";
  }

  const packIds = new Set<string>();
  for (const b of member.packBalances) packIds.add(b.packId);
  for (const e of member.packEnrollments) packIds.add(e.packId);
  if (member.packId) packIds.add(member.packId);

  if (packIds.size === 0) {
    return "Aucun pack associé à cette adhérente. Ajoutez ou renouvelez un pack avant de réserver.";
  }

  const packs = await prisma.pack.findMany({
    where: { id: { in: [...packIds] } },
    select: {
      id: true,
      name: true,
      category: true,
      sessionCount: true,
      isActive: true,
      courseQuotas: { select: { courseSlug: true, sessionCount: true } },
    },
  });

  const courseLabelFr = courseLabel(courseSlug);
  let finishedName: string | null = null;
  let anyRemaining = false;
  let wrongCourseName: string | null = null;
  let wrongCourseCoverage: string | null = null;
  let inactiveName: string | null = null;

  for (const pack of packs) {
    if (!pack.isActive) {
      inactiveName ??= pack.name;
      continue;
    }

    const eligibility = getEligibilityForPack({
      category: pack.category ?? null,
      courseQuotas: pack.courseQuotas,
    });
    const balances = member.packBalances.filter((b) => b.packId === pack.id);
    const coversCourse = isCourseAllowedForPack(eligibility, courseSlug);

    if (!coversCourse) {
      wrongCourseName ??= pack.name;
      wrongCourseCoverage ??= buildCourseCoverageLabel(
        {
          ...pack,
          durationDays: null,
        },
        courseSlug,
      );
      continue;
    }

    const remaining = remainingForCourseSlug(balances, pack, courseSlug);
    if (coversCourse && remaining > 0) {
      anyRemaining = true;
      continue;
    }
    if (coversCourse && remaining <= 0) {
      finishedName ??= pack.name;
    }
  }

  if (finishedName && !anyRemaining) {
    return `Pack ${finishedName} terminé : plus aucune séance disponible pour ce cours. Renouvelez le pack pour réserver.`;
  }

  if (wrongCourseName) {
    return `Le pack ${wrongCourseName} ne couvre pas ${courseLabelFr}. Cours autorisés : ${wrongCourseCoverage ?? "autre catégorie"}.`;
  }

  if (inactiveName) {
    return `Le pack ${inactiveName} n'est plus actif. Choisissez un autre pack ou réactivez-le.`;
  }

  return `Aucun pack utilisable pour ${courseLabelFr} à cette date. Vérifiez l'expiration, les séances restantes et le type de cours couvert.`;
}

export async function listBookablePacksForMember(
  memberId: string,
  courseSlug: string,
  sessionDateLocal?: Date | null,
): Promise<ListBookablePacksResult> {
  await ensureMemberParallelPackStockForDebit(memberId);
  const candidates = await prisma.$transaction((tx) => loadPackCandidates(tx, memberId, courseSlug));
  const filtered = sessionDateLocal
    ? candidates.filter((c) => isCandidateValidForSessionDate(c, sessionDateLocal))
    : candidates;
  const items = filtered.map(toBookablePackOptionDto);
  if (items.length > 0) return { items };

  const emptyMessage = await diagnoseEmptyBookablePacks({
    memberId,
    courseSlug,
    sessionDateLocal,
    eligibleCandidates: candidates,
  });
  return { items, emptyMessage };
}

export async function resolvePackForMemberBooking(
  tx: Prisma.TransactionClient,
  input: {
    memberId: string;
    courseSlug: string;
    sessionDateLocal: Date;
    preferredPackId?: string | null;
    allowSessionBeforePackStart?: boolean;
    autoPickWhenAmbiguous?: boolean;
  },
): Promise<PackCandidate> {
  const candidates = await loadPackCandidates(tx, input.memberId, input.courseSlug);
  const valid = candidates.filter((c) =>
    isCandidateValidForSessionDate(c, input.sessionDateLocal, {
      allowSessionBeforePackStart: input.allowSessionBeforePackStart,
    }),
  );

  if (valid.length === 0) {
    if (candidates.length > 0) throw new Error(PACK_ERRORS.packExpired);
    throw new Error(PACK_ERRORS.noSessionsLeft);
  }

  if (input.preferredPackId) {
    const selected = valid.find((c) => c.packId === input.preferredPackId);
    if (!selected) throw new Error(PACK_ERRORS.noSessionsLeft);
    return selected;
  }

  if (valid.length === 1) return valid[0]!;

  if (input.autoPickWhenAmbiguous) {
    return pickDefaultPackCandidate(valid);
  }

  throw new Error(PACK_ERRORS.packChoiceRequired);
}

/**
 * Résout le pack à débiter pour une présence admin, puis recule packStartedAt si la séance
 * est antérieure à la date d'ajout / renouvellement / première consommation.
 */
export async function preparePackForAdminPresenceDebit(
  tx: Prisma.TransactionClient,
  input: {
    memberId: string;
    memberPackId: string | null;
    memberPackStartedAt: Date | null;
    courseSlug: string;
    sessionDateDb: Date;
    sessionDateLocal: Date;
    preferredPackId?: string | null;
  },
): Promise<PackCandidate> {
  const selected = await resolvePackForMemberBooking(tx, {
    memberId: input.memberId,
    courseSlug: input.courseSlug,
    sessionDateLocal: input.sessionDateLocal,
    preferredPackId: input.preferredPackId,
    allowSessionBeforePackStart: true,
    autoPickWhenAmbiguous: true,
  });

  if (!selected.pack.isActive) throw new Error(PACK_ERRORS.packInactive);

  await activateSelectedPackOnSessionDate(tx, {
    memberId: input.memberId,
    packId: selected.pack.id,
    memberPackId: input.memberPackId,
    memberPackStartedAt: input.memberPackStartedAt,
    durationDays: selected.pack.durationDays,
    sessionDateDb: input.sessionDateDb,
    sessionDateLocal: input.sessionDateLocal,
  });

  return selected;
}

export async function debitSelectedPackSession(
  tx: Prisma.TransactionClient,
  input: {
    memberId: string;
    pack: PackCandidate["pack"];
    courseSlug: string;
    sessionDateDb: Date;
  },
): Promise<void> {
  await debitMemberPackSession(tx, {
    memberId: input.memberId,
    pack: input.pack,
    courseSlug: input.courseSlug,
  });
  await consumeOldestOpenEnrollmentOnDebit(tx, {
    memberId: input.memberId,
    packId: input.pack.id,
    sessionDateDb: input.sessionDateDb,
    durationDays: input.pack.durationDays,
  });
}

export type { PackCandidate };
