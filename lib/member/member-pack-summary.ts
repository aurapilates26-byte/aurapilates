import { courseLabel } from "@/lib/course-labels";
import {
  formatYmdLocal,
  formatYmdPrismaDate,
  isSessionSlotEndedLocal,
  prismaDateGteFromLocal,
  startOfLocalToday,
} from "@/lib/calendar-day";
import { packExpiresAtLocal } from "@/lib/member-pack-period";
import { prisma } from "@/lib/prisma";

export type MemberPackSummary = {
  remainingSessions: number | null;
  totalSessions: number | null;
  /** Réservations confirmées à venir (débitent une séance). */
  reservedConfirmed: number;
  /** Inscriptions en liste d'attente à venir (sans débit). */
  reservedWaitlist: number;
  /** Libellé détaillé pack mixte ex. « Reformer 3/5 · Mat 2/5 » */
  mixedRemainingLine: string | null;
  subscriptionStatusLine: string | null;
};

function quotaLabel(slug: string): string {
  if (slug === "pilates-reformer") return "Reformer";
  if (slug === "mat-pilates") return "Mat";
  return courseLabel(slug);
}

/** Solde pack + compteurs réservations — source unique API membre / dashboard. */
export async function getMemberPackSummary(memberId: string): Promise<MemberPackSummary> {
  const member = await prisma.member.findUnique({
    where: { id: memberId },
    select: {
      packId: true,
      packStartedAt: true,
      pack: {
        select: {
          id: true,
          sessionCount: true,
          durationDays: true,
          courseQuotas: { select: { courseSlug: true, sessionCount: true } },
        },
      },
      packBalances: { select: { packId: true, courseSlug: true, remaining: true } },
    },
  });

  if (!member?.packId || !member.pack) {
    return {
      remainingSessions: null,
      totalSessions: null,
      reservedConfirmed: 0,
      reservedWaitlist: 0,
      mixedRemainingLine: null,
      subscriptionStatusLine: null,
    };
  }

  const isMixed = member.pack.courseQuotas.length > 0;
  const totalSessions = isMixed
    ? member.pack.courseQuotas.reduce((sum, q) => sum + q.sessionCount, 0)
    : member.pack.sessionCount;

  const balancesForPack = member.packBalances.filter((b) => b.packId === member.packId);
  const simpleBalance = balancesForPack.find((b) => b.courseSlug == null) ?? null;

  const remainingSessions =
    totalSessions == null
      ? null
      : balancesForPack.length > 0
        ? balancesForPack.reduce((sum, b) => sum + Math.max(0, b.remaining), 0)
        : simpleBalance
          ? Math.max(0, simpleBalance.remaining)
          : totalSessions;

  const today = startOfLocalToday();
  const fromYmd = formatYmdLocal(today);
  const sessionGte = prismaDateGteFromLocal(today);

  const upcomingRaw = await prisma.reservation.findMany({
    where: {
      memberId,
      sessionDate: { gte: sessionGte },
      status: { in: ["BOOKED", "WAITLIST"] },
    },
    select: { status: true, sessionDate: true, planning: { select: { endTime: true } } },
  });

  const upcoming = upcomingRaw.filter((r) => {
    const ymd = formatYmdPrismaDate(new Date(r.sessionDate));
    return ymd >= fromYmd && !isSessionSlotEndedLocal(ymd, r.planning.endTime);
  });

  const reservedConfirmed = upcoming.filter((r) => r.status === "BOOKED").length;
  const reservedWaitlist = upcoming.filter((r) => r.status === "WAITLIST").length;

  let mixedRemainingLine: string | null = null;
  if (isMixed) {
    mixedRemainingLine = member.pack.courseQuotas
      .map((q) => {
        const bal = balancesForPack.find((b) => b.courseSlug === q.courseSlug)?.remaining ?? q.sessionCount;
        return `${quotaLabel(q.courseSlug)} ${Math.max(0, bal)}/${q.sessionCount}`;
      })
      .join(" · ");
  }

  const expiresAt =
    member.packStartedAt && member.pack.durationDays
      ? packExpiresAtLocal(member.packStartedAt, member.pack.durationDays)
      : null;
  const packPeriodActive =
    member.packStartedAt && expiresAt ? expiresAt.getTime() >= today.getTime() : true;

  const subscriptionStatusLine =
    totalSessions == null
      ? null
      : isMixed && mixedRemainingLine
        ? mixedRemainingLine
        : `Reste ${remainingSessions ?? 0}/${totalSessions}${packPeriodActive ? "" : " · pack expiré"}`;

  return {
    remainingSessions,
    totalSessions,
    reservedConfirmed,
    reservedWaitlist,
    mixedRemainingLine,
    subscriptionStatusLine,
  };
}
