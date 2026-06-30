import "server-only";

import type { Prisma } from "@prisma/client";
import { courseLabel } from "@/lib/course-labels";
import { startOfLocalToday } from "@/lib/calendar-day";
import { PACK_ERRORS } from "@/lib/create-member-reservation";
import {
  getEligibilityForPack,
  isCourseAllowedForPack,
  type PackEligibility,
} from "@/lib/pack-eligibility";
import {
  isSessionDateWithinPackPeriod,
  packExpiresAtLocal,
} from "@/lib/member-pack-period";
import { debitMemberPackSession } from "@/lib/member-pack-session-ledger";
import { prisma } from "@/lib/prisma";

export type BookablePackOptionDto = {
  packId: string;
  packName: string;
  remainingSessions: number;
  remainingForCourse: number;
  courseCoverageLabel: string;
  purchasedAt: string;
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
  remainingSessions: number;
  remainingForCourse: number;
  courseCoverageLabel: string;
};

type PackQuotaShape = {
  sessionCount: number | null;
  courseQuotas: { courseSlug: string; sessionCount: number }[];
};

function totalRemaining(
  balances: { courseSlug: string | null; remaining: number }[],
  pack: PackQuotaShape,
): number {
  const forPack = balances.filter((b) => b.remaining > 0);
  if (forPack.length > 0) return forPack.reduce((sum, b) => sum + b.remaining, 0);
  if (pack.courseQuotas.length > 0) {
    return pack.courseQuotas.reduce((sum, q) => sum + q.sessionCount, 0);
  }
  return pack.sessionCount ?? 0;
}

function remainingForCourseSlug(
  balances: { courseSlug: string | null; remaining: number }[],
  pack: PackQuotaShape,
  courseSlug: string,
): number {
  if (pack.courseQuotas.length > 0) {
    const quota = pack.courseQuotas.find((q) => q.courseSlug === courseSlug);
    if (!quota) return 0;
    const balance = balances.find((b) => b.courseSlug === courseSlug);
    if (balance) return Math.max(0, balance.remaining);
    // Pack initialisé (autres quotas déjà débités) mais pas ce cours → 0 restant.
    if (balances.length > 0) return 0;
    return quota.sessionCount;
  }
  return totalRemaining(balances, pack);
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

function isCandidateValidForSessionDate(
  candidate: PackCandidate,
  sessionDateLocal: Date,
): boolean {
  if (!candidate.packStartedAt) return true;

  if (
    !isSessionDateWithinPackPeriod(
      sessionDateLocal,
      candidate.packStartedAt,
      candidate.pack.durationDays,
    )
  ) {
    const expiresAt = packExpiresAtLocal(candidate.packStartedAt, candidate.pack.durationDays);
    if (expiresAt && sessionDateLocal.getTime() > expiresAt.getTime()) {
      return false;
    }
    return false;
  }

  const expiresAt = packExpiresAtLocal(candidate.packStartedAt, candidate.pack.durationDays);
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
        },
      },
    },
  });
  if (!member) return [];

  const packIds = new Set<string>();
  for (const balance of member.packBalances) {
    if (balance.remaining > 0) packIds.add(balance.packId);
  }
  if (packIds.size === 0) return [];

  const latestEnrollmentByPack = new Map<
    string,
    { purchasedAt: Date; packStartedAt: Date | null; packExpiresAt: Date | null }
  >();
  for (const enrollment of member.packEnrollments) {
    if (!latestEnrollmentByPack.has(enrollment.packId)) {
      latestEnrollmentByPack.set(enrollment.packId, {
        purchasedAt: enrollment.purchasedAt,
        packStartedAt: enrollment.packStartedAt,
        packExpiresAt: enrollment.packExpiresAt,
      });
    }
  }

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

    const balances = member.packBalances.filter((b) => b.packId === pack.id);
    const remainingForCourse = remainingForCourseSlug(balances, pack, courseSlug);
    if (remainingForCourse <= 0) continue;

    const enrollment = latestEnrollmentByPack.get(pack.id);
    const period = resolvePackPeriod({
      packId: pack.id,
      memberPackId: member.packId,
      memberPackStartedAt: member.packStartedAt,
      enrollmentStartedAt: enrollment?.packStartedAt ?? null,
      enrollmentExpiresAt: enrollment?.packExpiresAt ?? null,
    });

    candidates.push({
      packId: pack.id,
      packName: pack.name,
      pack,
      purchasedAt: enrollment?.purchasedAt ?? new Date(0),
      packStartedAt: period.packStartedAt,
      packExpiresAt: period.packExpiresAt,
      remainingSessions: totalRemaining(balances, pack),
      remainingForCourse,
      courseCoverageLabel: buildCourseCoverageLabel(pack, courseSlug),
    });
  }

  return candidates.sort((a, b) => b.purchasedAt.getTime() - a.purchasedAt.getTime());
}

function toBookablePackOptionDto(candidate: PackCandidate): BookablePackOptionDto {
  return {
    packId: candidate.packId,
    packName: candidate.packName,
    remainingSessions: candidate.remainingSessions,
    remainingForCourse: candidate.remainingForCourse,
    courseCoverageLabel: candidate.courseCoverageLabel,
    purchasedAt: candidate.purchasedAt.toISOString(),
  };
}

/** Cours réservables selon les séances restantes réelles (quota Mat/Reformer indépendants). */
export async function getMemberBookableCourseSlugs(memberId: string): Promise<string[]> {
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

export async function listBookablePacksForMember(
  memberId: string,
  courseSlug: string,
  sessionDateLocal?: Date | null,
): Promise<BookablePackOptionDto[]> {
  const candidates = await prisma.$transaction((tx) => loadPackCandidates(tx, memberId, courseSlug));
  const filtered = sessionDateLocal
    ? candidates.filter((c) => isCandidateValidForSessionDate(c, sessionDateLocal))
    : candidates;
  return filtered.map(toBookablePackOptionDto);
}

export async function resolvePackForMemberBooking(
  tx: Prisma.TransactionClient,
  input: {
    memberId: string;
    courseSlug: string;
    sessionDateLocal: Date;
    preferredPackId?: string | null;
  },
): Promise<PackCandidate> {
  const candidates = await loadPackCandidates(tx, input.memberId, input.courseSlug);
  const valid = candidates.filter((c) => isCandidateValidForSessionDate(c, input.sessionDateLocal));

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

  throw new Error(PACK_ERRORS.packChoiceRequired);
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
