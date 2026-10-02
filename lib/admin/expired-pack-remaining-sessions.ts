import "server-only";

import { formatYmdLocal, parseYmdLocal, startOfLocalToday } from "@/lib/calendar-day";
import { listMemberOwnedPacks, type MemberOwnedPackDto } from "@/lib/admin/member-owned-packs";
import { packHasUnconsumedSessions } from "@/lib/member-pack-remaining";
import { findFirstEnrollmentConsumedSessionDate } from "@/lib/admin/member-pack-enrollment";
import { buildMemberSearchWhere } from "@/lib/admin/member-search-filter";
import { addPackDurationToStartDate } from "@/lib/pack-duration";
import { prisma } from "@/lib/prisma";

export type ExpiredPackMemberPackDto = {
  enrollmentId: string;
  packName: string;
  consumedSessions: number;
  remainingSessions: number;
  totalSessions: number | null;
  packExpiresAt: string | null;
  courseQuotaRemaining: { courseLabel: string; remaining: number; total: number }[];
};

export type ExpiredPackMemberDto = {
  memberId: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  packs: ExpiredPackMemberPackDto[];
};

function isPackExpiredByDate(packExpiresAt: string | null): boolean {
  if (!packExpiresAt) return false;
  const expires = new Date(packExpiresAt);
  if (Number.isNaN(expires.getTime())) return false;
  const today = startOfLocalToday();
  const expiresDay = new Date(expires.getFullYear(), expires.getMonth(), expires.getDate());
  return expiresDay.getTime() < today.getTime();
}

function packExpiresDay(packExpiresAt: string | null): Date | null {
  if (!packExpiresAt) return null;
  const expires = new Date(packExpiresAt);
  if (Number.isNaN(expires.getTime())) return null;
  return new Date(expires.getFullYear(), expires.getMonth(), expires.getDate());
}

/** Pack dont la validité est dépassée mais il reste des séances à consommer. */
export function isExpiredPackWithRemainingSessions(pack: MemberOwnedPackDto): boolean {
  if (!packHasUnconsumedSessions(pack)) return false;
  if (pack.prolongedAt) return false;
  if (pack.enrollmentStatus === "EXPIRED") return true;
  if (pack.status === "expired") return true;
  return isPackExpiredByDate(pack.packExpiresAt);
}

/**
 * Prolongation autorisée pour une réservation dont la date dépasse la validité,
 * même si le pack n'est pas encore expiré « aujourd'hui ».
 */
export function canProlongPackForSessionDate(
  pack: MemberOwnedPackDto,
  sessionDateLocal: Date,
): boolean {
  if (!packHasUnconsumedSessions(pack)) return false;
  if (pack.prolongedAt) return false;
  if (isExpiredPackWithRemainingSessions(pack)) return true;
  const expiresDay = packExpiresDay(pack.packExpiresAt);
  if (!expiresDay) return false;
  const sessionDay = new Date(
    sessionDateLocal.getFullYear(),
    sessionDateLocal.getMonth(),
    sessionDateLocal.getDate(),
  );
  return sessionDay.getTime() > expiresDay.getTime();
}

function toResultPack(pack: MemberOwnedPackDto): ExpiredPackMemberPackDto {
  return {
    enrollmentId: pack.enrollmentId,
    packName: pack.packName,
    consumedSessions: pack.consumedSessions,
    remainingSessions: pack.remainingSessions,
    totalSessions: pack.totalSessions,
    packExpiresAt: pack.packExpiresAt,
    courseQuotaRemaining: pack.courseQuotaRemaining.map((q) => ({
      courseLabel: q.courseLabel,
      remaining: q.remaining,
      total: q.total,
    })),
  };
}

export async function searchMembersWithExpiredPackRemainingSessions(
  search: string,
  limit = 30,
): Promise<ExpiredPackMemberDto[]> {
  const query = search.trim();
  if (query.length < 2) return [];

  const members = await prisma.member.findMany({
    where: buildMemberSearchWhere(query),
    select: {
      id: true,
      firstName: true,
      lastName: true,
      phone: true,
    },
    orderBy: { updatedAt: "desc" },
    take: Math.min(limit * 2, 60),
  });

  const results: ExpiredPackMemberDto[] = [];

  for (const member of members) {
    const owned = await listMemberOwnedPacks(member.id);
    const expiredWithBalance = owned.filter(isExpiredPackWithRemainingSessions);
    if (expiredWithBalance.length === 0) continue;

    results.push({
      memberId: member.id,
      firstName: member.firstName,
      lastName: member.lastName,
      phone: member.phone,
      packs: expiredWithBalance.map(toResultPack),
    });

    if (results.length >= limit) break;
  }

  return results;
}

export async function prolongExpiredPackEnrollment(input: {
  memberId: string;
  enrollmentId: string;
  /** Si fourni : autorise la prolongation quand la séance dépasse la validité (pas encore expiré aujourd'hui). */
  forSessionDate?: string | null;
}): Promise<{ packExpiresAt: string | null }> {
  const enrollment = await prisma.memberPackEnrollment.findFirst({
    where: { id: input.enrollmentId, memberId: input.memberId },
    include: {
      pack: {
        select: {
          id: true,
          durationDays: true,
          courseQuotas: { select: { courseSlug: true, sessionCount: true } },
        },
      },
    },
  });
  if (!enrollment) throw new Error("ENROLLMENT_NOT_FOUND");

  const owned = await listMemberOwnedPacks(input.memberId);
  const packDto = owned.find((p) => p.enrollmentId === input.enrollmentId);
  const sessionDateLocal = input.forSessionDate ? parseYmdLocal(input.forSessionDate) : null;
  const eligible =
    packDto != null &&
    (sessionDateLocal
      ? canProlongPackForSessionDate(packDto, sessionDateLocal)
      : isExpiredPackWithRemainingSessions(packDto));
  if (!eligible) {
    throw new Error("PACK_NOT_ELIGIBLE");
  }

  const today = startOfLocalToday();
  const fromToday = addPackDurationToStartDate(today, enrollment.pack.durationDays);
  const packExpiresAt =
    sessionDateLocal && (!fromToday || sessionDateLocal.getTime() > fromToday.getTime())
      ? sessionDateLocal
      : fromToday;
  const prolongedFromExpiresAt = enrollment.packExpiresAt;

  let packStartedAt = enrollment.packStartedAt;
  if (!packStartedAt) {
    packStartedAt = await findFirstEnrollmentConsumedSessionDate({
      memberId: input.memberId,
      packId: enrollment.packId,
      courseQuotas: enrollment.pack.courseQuotas,
      periodStart: enrollment.purchasedAt,
      periodEndExclusive: null,
    });
  }

  await prisma.$transaction(async (tx) => {
    await tx.memberPackEnrollment.update({
      where: { id: enrollment.id },
      data: {
        status: "ACTIVE",
        packStartedAt: packStartedAt ?? undefined,
        packExpiresAt,
        prolongedAt: new Date(),
        prolongedFromExpiresAt,
        closedAt: null,
      },
    });

    const member = await tx.member.findUnique({
      where: { id: input.memberId },
      select: { packId: true, packStartedAt: true },
    });
    if (member?.packId === enrollment.packId) {
      await tx.member.update({
        where: { id: input.memberId },
        data: {
          isActive: true,
          ...(packStartedAt && !member.packStartedAt ? { packStartedAt } : {}),
        },
      });
    }
  });

  return { packExpiresAt: packExpiresAt?.toISOString() ?? null };
}

/** Pack expiré (ou bientôt à la date de séance) avec séances restantes, pour proposer une prolongation à la réservation. */
export async function findProlongOfferForBooking(input: {
  memberId: string;
  courseSlug: string;
  sessionDateLocal: Date;
}): Promise<{
  enrollmentId: string;
  packId: string;
  packName: string;
  packExpiresAt: string | null;
  remainingSessions: number;
  sessionDate: string;
} | null> {
  const owned = await listMemberOwnedPacks(input.memberId);
  const eligible = owned.filter((pack) => {
    if (!canProlongPackForSessionDate(pack, input.sessionDateLocal)) return false;
    if (pack.courseQuotas.length > 0) {
      return pack.courseQuotas.some((q) => q.courseSlug === input.courseSlug);
    }
    return true;
  });
  if (eligible.length === 0) return null;

  const chosen = [...eligible].sort((a, b) => {
    const aTime = new Date(a.purchasedAt).getTime();
    const bTime = new Date(b.purchasedAt).getTime();
    return aTime - bTime;
  })[0]!;

  return {
    enrollmentId: chosen.enrollmentId,
    packId: chosen.packId,
    packName: chosen.packName,
    packExpiresAt: chosen.packExpiresAt,
    remainingSessions: chosen.remainingSessions,
    sessionDate: formatYmdLocal(input.sessionDateLocal),
  };
}

export async function cancelProlongedPackEnrollment(input: {
  memberId: string;
  enrollmentId: string;
}): Promise<{ packExpiresAt: string | null }> {
  const enrollment = await prisma.memberPackEnrollment.findFirst({
    where: { id: input.enrollmentId, memberId: input.memberId },
    include: {
      pack: { select: { durationDays: true } },
    },
  });
  if (!enrollment) throw new Error("ENROLLMENT_NOT_FOUND");
  if (!enrollment.prolongedAt) throw new Error("NOT_PROLONGED");

  const restoredExpires =
    enrollment.prolongedFromExpiresAt ??
    (enrollment.packStartedAt
      ? addPackDurationToStartDate(enrollment.packStartedAt, enrollment.pack.durationDays)
      : null);

  const expiredByDate =
    restoredExpires != null && isPackExpiredByDate(restoredExpires.toISOString());

  await prisma.memberPackEnrollment.update({
    where: { id: enrollment.id },
    data: {
      packExpiresAt: restoredExpires,
      prolongedAt: null,
      prolongedFromExpiresAt: null,
      ...(expiredByDate ? { status: "EXPIRED" } : {}),
    },
  });

  return { packExpiresAt: restoredExpires?.toISOString() ?? null };
}
