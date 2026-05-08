import { courseLabel } from "@/lib/course-labels";
import {
  addLocalDays,
  eachOccurrenceInRange,
  formatYmdLocal,
  formatYmdPrismaDate,
  isYmdInInclusiveWindow,
  prismaDateInclusiveUtcRange,
  startOfLocalToday,
} from "@/lib/calendar-day";
import { prisma } from "@/lib/prisma";
import { requireMemberSession } from "@/lib/require-member";
import { getEligibilityForPack } from "@/lib/pack-eligibility";

const bookingWindowDays = {
  WEEKLY: 7,
  FIFTEEN_DAYS: 15,
  ONE_MONTH: 30,
} as const;

function compareTime(a: string, b: string) {
  return a.localeCompare(b);
}

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function localNowTimeString() {
  const n = new Date();
  return `${pad2(n.getHours())}:${pad2(n.getMinutes())}`;
}

export async function GET(request: Request) {
  const guard = await requireMemberSession();
  if ("error" in guard) return guard.error;
  const { member } = guard;

  const fromDay = startOfLocalToday();
  const windowFromYmd = formatYmdLocal(fromDay);
  const todayYmd = formatYmdLocal(fromDay);
  const nowTime = localNowTimeString();

  const plannings = await prisma.planning.findMany({
    include: {
      coach: { select: { firstName: true, lastName: true, imageUrl: true } },
    },
    orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
  });

  if (plannings.length === 0) {
    return Response.json({ occurrences: [] as const });
  }

  const memberPack = await prisma.member.findUnique({
    where: { id: member.id },
    select: {
      pack: {
        select: {
          category: true,
          courseQuotas: { select: { courseSlug: true } },
        },
      },
    },
  });
  const eligibility = memberPack?.pack
    ? getEligibilityForPack({ category: memberPack.pack.category ?? null, courseQuotas: memberPack.pack.courseQuotas })
    : { mode: "unknown" as const, allowedCourseSlugs: [] as string[] };

  const globalBookingWindow = plannings[0]?.bookingWindow ?? "WEEKLY";
  const windowDays = bookingWindowDays[globalBookingWindow];
  const maxToDay = addLocalDays(fromDay, windowDays - 1);
  const windowToYmd = formatYmdLocal(maxToDay);
  const sessionBounds = prismaDateInclusiveUtcRange(fromDay, maxToDay);

  const planningIds = plannings.map((p) => p.id);

  const reservationsRaw = await prisma.reservation.findMany({
    where: {
      planningId: { in: planningIds },
      sessionDate: { gte: sessionBounds.gte, lte: sessionBounds.lte },
      status: { in: ["BOOKED", "WAITLIST", "ATTENDED"] },
    },
    select: {
      id: true,
      planningId: true,
      sessionDate: true,
      status: true,
      memberId: true,
    },
  });

  /** Sécurise le périmètre : exclusion des dérives de borne côté Prisma/timestamps. */
  const reservations = reservationsRaw.filter((r) => {
    const k = formatYmdPrismaDate(new Date(r.sessionDate));
    return isYmdInInclusiveWindow(k, windowFromYmd, windowToYmd);
  });

  type OccRow = {
    planningId: string;
    sessionDate: string;
    courseSlug: string;
    courseLabel: string;
    startTime: string;
    endTime: string;
    level: string;
    coachName: string | null;
    coachImageUrl: string | null;
    capacity: number;
    waitlistCapacity: number | null;
    mainOccupied: number;
    waitlistCount: number;
    spotsRemaining: number;
    waitSpotsRemaining: number | null;
    myReservation: { id: string; status: string } | null;
  };

  const occurrences: OccRow[] = [];

  function ymdKeysForDbDate(sessionDate: Date): Set<string> {
    const x = new Date(sessionDate);
    return new Set([formatYmdPrismaDate(x), formatYmdLocal(x)]);
  }

  for (const p of plannings) {
    const dates = eachOccurrenceInRange(fromDay, maxToDay, p.dayOfWeek);
    for (const d of dates) {
      const sessionKey = formatYmdLocal(d);
      // Si le créneau du jour est déjà terminé, on saute pour afficher la prochaine occurrence future.
      if (sessionKey === todayYmd && compareTime(p.endTime, nowTime) <= 0) {
        continue;
      }
      const rows = reservations.filter(
        (r) => r.planningId === p.id && ymdKeysForDbDate(new Date(r.sessionDate)).has(sessionKey),
      );
      const mainOccupied = rows.filter((r) => r.status === "BOOKED" || r.status === "ATTENDED").length;
      const waitlistCount = rows.filter((r) => r.status === "WAITLIST").length;
      const mine = rows.find((r) => r.memberId === member.id) ?? null;

      const spotsRemaining = Math.max(0, p.capacity - mainOccupied);
      const waitSpotsRemaining =
        p.waitlistCapacity == null ? null : Math.max(0, p.waitlistCapacity - waitlistCount);

      occurrences.push({
        planningId: p.id,
        sessionDate: sessionKey,
        courseSlug: p.courseSlug,
        courseLabel: courseLabel(p.courseSlug),
        startTime: p.startTime,
        endTime: p.endTime,
        level: p.level,
        coachName: p.coach ? `${p.coach.firstName} ${p.coach.lastName}`.trim() : null,
        coachImageUrl: p.coach?.imageUrl ?? null,
        capacity: p.capacity,
        waitlistCapacity: p.waitlistCapacity,
        mainOccupied,
        waitlistCount,
        spotsRemaining,
        waitSpotsRemaining,
        myReservation: mine ? { id: mine.id, status: mine.status } : null,
      });
    }
  }

  occurrences.sort((a, b) => {
    const dc = a.sessionDate.localeCompare(b.sessionDate);
    if (dc !== 0) return dc;
    return compareTime(a.startTime, b.startTime);
  });

  return Response.json({
    occurrences,
    range: {
      from: windowFromYmd,
      to: windowToYmd,
    },
    bookingWindow: globalBookingWindow,
    eligibility,
  });
}
