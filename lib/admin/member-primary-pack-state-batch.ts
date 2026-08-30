import "server-only";

import {
  classifyPrimaryPackKind,
  emptyMemberPrimaryPackStateCounts,
  type MemberPrimaryPackKind,
  type MemberPrimaryPackStateCounts,
} from "@/lib/member-primary-pack-state";
import { prisma } from "@/lib/prisma";

type EnrollmentRow = {
  memberId: string;
  packId: string;
  status: string;
  packStartedAt: Date | null;
  packExpiresAt: Date | null;
  prolongedAt: Date | null;
  pack: {
    sessionCount: number | null;
    courseQuotas: { sessionCount: number }[];
  };
};

function packTotalSessions(pack: EnrollmentRow["pack"]): number | null {
  if (pack.courseQuotas.length > 0) {
    return pack.courseQuotas.reduce((sum, q) => sum + q.sessionCount, 0);
  }
  return pack.sessionCount;
}

function pickPrimaryEnrollment(
  memberId: string,
  packId: string,
  enrollmentsByMember: Map<string, EnrollmentRow[]>,
): EnrollmentRow | null {
  const list = (enrollmentsByMember.get(memberId) ?? []).filter((row) => row.packId === packId);
  const open = list.find((row) => row.status === "ACTIVE" || row.status === "PENDING_START");
  return open ?? list[0] ?? null;
}

function remainingSessionsForPack(
  memberId: string,
  packId: string,
  totalSessions: number | null,
  balancesByMemberPack: Map<string, { remaining: number }[]>,
): number {
  const rows = balancesByMemberPack.get(`${memberId}:${packId}`) ?? [];
  if (rows.length === 0) return totalSessions ?? 0;
  return rows.reduce((sum, row) => sum + row.remaining, 0);
}

export async function loadMemberPrimaryPackStates(): Promise<{
  byMemberId: Record<string, MemberPrimaryPackKind>;
  counts: MemberPrimaryPackStateCounts;
}> {
  const members = await prisma.member.findMany({
    select: { id: true, packId: true },
  });

  const memberIds = members.map((m) => m.id);
  if (memberIds.length === 0) {
    return { byMemberId: {}, counts: emptyMemberPrimaryPackStateCounts() };
  }

  const enrollments = await prisma.memberPackEnrollment.findMany({
    where: {
      memberId: { in: memberIds },
      status: { in: ["PENDING_START", "ACTIVE", "EXPIRED"] },
    },
    select: {
      memberId: true,
      packId: true,
      status: true,
      packStartedAt: true,
      packExpiresAt: true,
      prolongedAt: true,
      purchasedAt: true,
      createdAt: true,
      pack: {
        select: {
          sessionCount: true,
          courseQuotas: { select: { sessionCount: true } },
        },
      },
    },
    orderBy: [{ purchasedAt: "desc" }, { createdAt: "desc" }],
  });

  const balances = await prisma.memberPackBalance.findMany({
    where: { memberId: { in: memberIds } },
    select: { memberId: true, packId: true, remaining: true },
  });

  const enrollmentsByMember = new Map<string, EnrollmentRow[]>();
  for (const enrollment of enrollments) {
    const list = enrollmentsByMember.get(enrollment.memberId) ?? [];
    list.push(enrollment);
    enrollmentsByMember.set(enrollment.memberId, list);
  }

  const balancesByMemberPack = new Map<string, { remaining: number }[]>();
  for (const balance of balances) {
    const key = `${balance.memberId}:${balance.packId}`;
    const list = balancesByMemberPack.get(key) ?? [];
    list.push(balance);
    balancesByMemberPack.set(key, list);
  }

  const byMemberId: Record<string, MemberPrimaryPackKind> = {};
  const counts = emptyMemberPrimaryPackStateCounts();
  counts.total = members.length;

  for (const member of members) {
    let kind: MemberPrimaryPackKind = "none";

    if (member.packId) {
      const enrollment = pickPrimaryEnrollment(member.id, member.packId, enrollmentsByMember);
      if (enrollment) {
        const totalSessions = packTotalSessions(enrollment.pack);
        const remainingSessions = remainingSessionsForPack(
          member.id,
          member.packId,
          totalSessions,
          balancesByMemberPack,
        );
        const consumedSessions =
          totalSessions != null ? Math.max(0, totalSessions - remainingSessions) : 0;

        kind = classifyPrimaryPackKind({
          hasPack: true,
          packStartedAt: enrollment.packStartedAt,
          packExpiresAt: enrollment.packExpiresAt,
          prolongedAt: enrollment.prolongedAt,
          consumedSessions,
          totalSessions,
          remainingSessions,
        });
      } else {
        kind = "pending";
      }
    }

    byMemberId[member.id] = kind;
    counts[kind] += 1;
  }

  return { byMemberId, counts };
}
