import "server-only";

import {
  assignConsumedReservationsToEnrollments,
  type ConsumedReservationToAssign,
  type EnrollmentConsumptionTarget,
} from "@/lib/member-pack-consumption-assign";
import {
  classifyPrimaryPackKind,
  emptyMemberPrimaryPackStateCounts,
  isPrimaryPackOperationallyActive,
  isPackDateExpired,
  resolveEffectivePackExpiresAt,
  type MemberPrimaryPackKind,
  type MemberPrimaryPackStateCounts,
} from "@/lib/member-primary-pack-state";
import { prisma } from "@/lib/prisma";

type EnrollmentRow = Omit<EnrollmentConsumptionTarget, "pack"> & {
  memberId: string;
  packExpiresAt: Date | null;
  prolongedAt: Date | null;
  createdAt: Date;
  pack: EnrollmentConsumptionTarget["pack"] & {
    durationDays: string | null;
  };
};

function packTotalSessions(pack: EnrollmentRow["pack"]): number | null {
  if (pack.courseQuotas.length > 0) {
    return pack.courseQuotas.reduce((sum, q) => sum + q.sessionCount, 0);
  }
  return pack.sessionCount;
}

/**
 * Pack principal affiché dans le tableau = plus récente inscription ouverte
 * (même règle que la fiche). Si plusieurs ACTIVE (legacy), on préfère une
 * inscription dont l'expiration effective n'est pas dépassée — évite le badge
 * « Expiré » alors que le renouvellement courant est encore valide (Fatma Msekni).
 */
function pickPrimaryEnrollment(
  memberId: string,
  packId: string,
  enrollmentsByMember: Map<string, EnrollmentRow[]>,
): EnrollmentRow | null {
  const list = (enrollmentsByMember.get(memberId) ?? [])
    .filter(
      (row) =>
        row.packId === packId &&
        (row.status === "ACTIVE" || row.status === "PENDING_START" || row.status === "EXPIRED"),
    )
    .slice()
    .sort(
      (a, b) =>
        b.purchasedAt.getTime() - a.purchasedAt.getTime() ||
        b.createdAt.getTime() - a.createdAt.getTime(),
    );

  const open = list.filter((row) => row.status === "ACTIVE" || row.status === "PENDING_START");
  if (open.length === 0) return list[0] ?? null;

  const stillValid = open.find((row) => {
    const expiresAt = resolveEffectivePackExpiresAt({
      packStartedAt: row.packStartedAt,
      packExpiresAt: row.packExpiresAt,
      prolongedAt: row.prolongedAt,
      durationDays: row.pack.durationDays,
    });
    // Pas encore démarré → candidat valide (En attente).
    if (!row.packStartedAt) return true;
    return !isPackDateExpired(expiresAt);
  });

  return stillValid ?? open[0] ?? null;
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

export async function loadMemberPrimaryPackStates(memberIds?: string[]): Promise<{
  byMemberId: Record<string, MemberPrimaryPackKind>;
  hasAttendedSessionsByMemberId: Record<string, boolean>;
  counts: MemberPrimaryPackStateCounts;
}> {
  const members = await prisma.member.findMany({
    ...(memberIds ? { where: { id: { in: memberIds } } } : {}),
    select: { id: true, packId: true },
  });

  const resolvedMemberIds = members.map((m) => m.id);
  if (resolvedMemberIds.length === 0) {
    return {
      byMemberId: {},
      hasAttendedSessionsByMemberId: {},
      counts: emptyMemberPrimaryPackStateCounts(),
    };
  }

  const enrollments = await prisma.memberPackEnrollment.findMany({
    where: { memberId: { in: resolvedMemberIds } },
    select: {
      id: true,
      memberId: true,
      packId: true,
      status: true,
      packStartedAt: true,
      packExpiresAt: true,
      prolongedAt: true,
      purchasedAt: true,
      closedAt: true,
      additionalSessionsCredit: true,
      createdAt: true,
      pack: {
        select: {
          sessionCount: true,
          category: true,
          durationDays: true,
          courseQuotas: { select: { courseSlug: true, sessionCount: true } },
        },
      },
    },
    orderBy: [{ purchasedAt: "asc" }, { createdAt: "asc" }],
  });

  const balances = await prisma.memberPackBalance.findMany({
    where: { memberId: { in: resolvedMemberIds } },
    select: { memberId: true, packId: true, remaining: true },
  });

  const attendedReservations = await prisma.reservation.findMany({
    where: {
      memberId: { in: resolvedMemberIds },
      status: "ATTENDED",
      attendance: { isNot: null },
    },
    select: {
      memberId: true,
      sessionDate: true,
      debitedPackId: true,
      planning: { select: { courseSlug: true } },
    },
    orderBy: [{ sessionDate: "asc" }, { createdAt: "asc" }],
  });

  const enrollmentsByMember = new Map<string, EnrollmentRow[]>();
  for (const enrollment of enrollments) {
    const list = enrollmentsByMember.get(enrollment.memberId) ?? [];
    list.push(enrollment);
    enrollmentsByMember.set(enrollment.memberId, list);
  }

  const attendedReservationsByMember = new Map<string, ConsumedReservationToAssign[]>();
  for (const reservation of attendedReservations) {
    const list = attendedReservationsByMember.get(reservation.memberId) ?? [];
    list.push({
      sessionDate: reservation.sessionDate,
      courseSlug: reservation.planning.courseSlug,
      debitedPackId: reservation.debitedPackId,
    });
    attendedReservationsByMember.set(reservation.memberId, list);
  }

  const balancesByMemberPack = new Map<string, { remaining: number }[]>();
  for (const balance of balances) {
    const key = `${balance.memberId}:${balance.packId}`;
    const list = balancesByMemberPack.get(key) ?? [];
    list.push(balance);
    balancesByMemberPack.set(key, list);
  }

  const byMemberId: Record<string, MemberPrimaryPackKind> = {};
  const hasAttendedSessionsByMemberId: Record<string, boolean> = {};
  const counts = emptyMemberPrimaryPackStateCounts();
  counts.total = members.length;

  for (const member of members) {
    let kind: MemberPrimaryPackKind = "none";
    let attendedSessions = 0;

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

        const packExpiresAt = resolveEffectivePackExpiresAt({
          packStartedAt: enrollment.packStartedAt,
          packExpiresAt: enrollment.packExpiresAt,
          prolongedAt: enrollment.prolongedAt,
          durationDays: enrollment.pack.durationDays,
        });

        kind = classifyPrimaryPackKind({
          hasPack: true,
          packStartedAt: enrollment.packStartedAt,
          packExpiresAt,
          prolongedAt: enrollment.prolongedAt,
          consumedSessions,
          totalSessions,
          remainingSessions,
        });

        const attendanceAllocation = assignConsumedReservationsToEnrollments(
          enrollmentsByMember.get(member.id) ?? [],
          attendedReservationsByMember.get(member.id) ?? [],
        );
        attendedSessions = attendanceAllocation.get(enrollment.id)?.consumedTotal ?? 0;
      } else {
        kind = "pending";
        attendedSessions = (attendedReservationsByMember.get(member.id) ?? []).some(
          (reservation) => reservation.debitedPackId === member.packId,
        )
          ? 1
          : 0;
      }
    }

    byMemberId[member.id] = kind;
    hasAttendedSessionsByMemberId[member.id] = isPrimaryPackOperationallyActive({
      hasPack: member.packId != null,
      attendedSessions,
    });
    counts[kind] += 1;
  }

  return { byMemberId, hasAttendedSessionsByMemberId, counts };
}
