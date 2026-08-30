import "server-only";

import { startOfLocalToday } from "@/lib/calendar-day";
import { listMemberOwnedPacks, type MemberOwnedPackDto } from "@/lib/admin/member-owned-packs";
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

/** Pack dont la validité est dépassée mais il reste des séances à consommer. */
export function isExpiredPackWithRemainingSessions(pack: MemberOwnedPackDto): boolean {
  if (pack.remainingSessions <= 0) return false;
  if (pack.prolongedAt) return false;
  if (pack.enrollmentStatus === "EXPIRED") return true;
  if (pack.status === "expired") return true;
  return isPackExpiredByDate(pack.packExpiresAt);
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
  if (!packDto || !isExpiredPackWithRemainingSessions(packDto)) {
    throw new Error("PACK_NOT_ELIGIBLE");
  }

  const today = startOfLocalToday();
  const packExpiresAt = addPackDurationToStartDate(today, enrollment.pack.durationDays);
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
