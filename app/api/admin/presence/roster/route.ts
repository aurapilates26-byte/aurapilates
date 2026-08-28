import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { isStaffRole } from "@/lib/admin/access";
import { courseLabel } from "@/lib/course-labels";
import {
  formatYmdLocal,
  formatYmdPrismaDate,
  parseYmdToPrismaDate,
  startOfLocalToday,
} from "@/lib/calendar-day";
import { getAdminOperationalPlanningSlotsForDate, type OperationalPlanningSlot } from "@/lib/admin/planning-operational-slots";
import { localNowTimeString, minus15Minutes } from "@/lib/admin/presence-window";
import { SESSION_PROSPECT_ROSTER_STATUSES } from "@/lib/admin/session-prospect-stats";
import { repairAttendedReservationsWithoutAttendance } from "@/lib/ensure-reservation-attendance";
import { effectivePlanningCapacity } from "@/lib/planning-session-slot";
import { prisma } from "@/lib/prisma";

function errorResponse(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

type ReservationWithPlanning = {
  planningId: string;
  sessionDate: Date;
  planning: {
    id: string;
    courseSlug: string;
    startTime: string;
    endTime: string;
    level: string | null;
    capacity: number;
    waitlistCapacity: number | null;
    coach: { firstName: string; lastName: string; imageUrl: string | null } | null;
  };
};

function buildUpcomingClassPayload(reservation: ReservationWithPlanning, todayYmd: string) {
  const sessionYmd = formatYmdPrismaDate(new Date(reservation.sessionDate));
  const opensAt = minus15Minutes(reservation.planning.startTime);
  const coachName = reservation.planning.coach
    ? `${reservation.planning.coach.firstName} ${reservation.planning.coach.lastName}`.trim()
    : null;

  return {
    planningId: reservation.planningId,
    courseSlug: reservation.planning.courseSlug,
    courseLabel: courseLabel(reservation.planning.courseSlug),
    sessionDate: sessionYmd,
    dayLabel: formatDayLabelFr(sessionYmd, todayYmd),
    opensAt,
    startTime: reservation.planning.startTime,
    endTime: reservation.planning.endTime,
    level: reservation.planning.level,
    capacity: reservation.planning.capacity,
    waitlistCapacity: reservation.planning.waitlistCapacity,
    coachName,
    coachImageUrl: reservation.planning.coach?.imageUrl ?? null,
  };
}

function formatDayLabelFr(targetYmd: string, todayYmd: string) {
  if (targetYmd === todayYmd) return "aujourd'hui";
  const [y, m, d] = targetYmd.split("-").map(Number);
  const target = new Date(y, (m ?? 1) - 1, d ?? 1);
  const [ty, tm, td] = todayYmd.split("-").map(Number);
  const t = new Date(ty, (tm ?? 1) - 1, td ?? 1);
  const tmr = new Date(t.getFullYear(), t.getMonth(), t.getDate() + 1);
  const tmrYmd = formatYmdLocal(tmr);
  if (targetYmd === tmrYmd) return "demain";

  const rawWeekday = target.toLocaleDateString("fr-FR", { weekday: "long" });
  const weekday = rawWeekday ? `${rawWeekday.slice(0, 1).toUpperCase()}${rawWeekday.slice(1)}` : rawWeekday;
  const dateFr = target.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
  return `${weekday} ${dateFr}`;
}

type ClassRosterPayload = {
  planningId: string;
  courseSlug: string;
  courseLabel: string;
  startTime: string;
  endTime: string;
  level: string | null;
  capacity: number;
  waitlistCapacity: number | null;
  coachName: string | null;
  coachImageUrl: string | null;
  scannedReservationId: string | null;
  scannedReservationStatus: string | null;
  reservations: {
    id: string;
    status: string;
    member: {
      id: string;
      firstName: string | null;
      lastName: string | null;
      email: string | null;
      phone: string | null;
      qrPublicId: string | null;
    };
  }[];
  prospects: {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    courseSlug: string;
    courseLabel: string;
    status: string;
    convertedMemberId: string | null;
  }[];
};

async function loadTodayClassRosters(
  operationalSlots: OperationalPlanningSlot[],
  sessionDateDb: Date,
  memberLookupId: string | null,
  includeQrOnMembers: boolean,
): Promise<ClassRosterPayload[]> {
  const planningIds = operationalSlots.map((s) => s.id);
  if (planningIds.length === 0) return [];

  const plannings = await prisma.planning.findMany({
    where: { id: { in: planningIds } },
    include: {
      coach: { select: { firstName: true, lastName: true, imageUrl: true } },
      reservations: {
        where: {
          sessionDate: sessionDateDb,
          status: { in: ["BOOKED", "WAITLIST", "ATTENDED"] },
        },
        orderBy: { createdAt: "asc" },
        include: {
          member: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phone: true,
              user: { select: { email: true } },
              ...(includeQrOnMembers
                ? { assignedQrCodes: { take: 1, orderBy: { updatedAt: "desc" as const }, select: { publicId: true } } }
                : {}),
            },
          },
          attendance: { select: { markedAt: true } },
        },
      },
    },
    orderBy: { startTime: "asc" },
  });

  const repairIds = plannings.flatMap((p) =>
    p.reservations.filter((r) => r.status === "ATTENDED" && !r.attendance).map((r) => r.id),
  );
  if (repairIds.length > 0) {
    await repairAttendedReservationsWithoutAttendance(repairIds);
    const refreshed = await prisma.planning.findMany({
      where: { id: { in: planningIds } },
      include: {
        coach: { select: { firstName: true, lastName: true, imageUrl: true } },
        reservations: {
          where: {
            sessionDate: sessionDateDb,
            status: { in: ["BOOKED", "WAITLIST", "ATTENDED"] },
          },
          orderBy: { createdAt: "asc" },
          include: {
            member: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                phone: true,
                user: { select: { email: true } },
                ...(includeQrOnMembers
                  ? { assignedQrCodes: { take: 1, orderBy: { updatedAt: "desc" as const }, select: { publicId: true } } }
                  : {}),
              },
            },
            attendance: { select: { markedAt: true } },
          },
        },
      },
      orderBy: { startTime: "asc" },
    });
    for (const refreshedPlanning of refreshed) {
      const idx = plannings.findIndex((p) => p.id === refreshedPlanning.id);
      if (idx >= 0) plannings[idx] = refreshedPlanning;
    }
  }

  const planningById = new Map(plannings.map((planning) => [planning.id, planning]));

  const prospectRows = await prisma.sessionProspect.findMany({
    where: {
      planningId: { in: planningIds },
      sessionDate: sessionDateDb,
      status: { in: [...SESSION_PROSPECT_ROSTER_STATUSES] },
    },
    orderBy: [{ createdAt: "asc" }],
    select: {
      id: true,
      planningId: true,
      firstName: true,
      lastName: true,
      phone: true,
      courseSlug: true,
      status: true,
      convertedMemberId: true,
    },
  });

  const prospectsByPlanningId = new Map<string, typeof prospectRows>();
  for (const row of prospectRows) {
    const list = prospectsByPlanningId.get(row.planningId) ?? [];
    list.push(row);
    prospectsByPlanningId.set(row.planningId, list);
  }

  return operationalSlots.flatMap((slot) => {
    const planning = planningById.get(slot.id);
    if (!planning) return [];

    const scannedReservation = memberLookupId
      ? planning.reservations.find((r) => r.member.id === memberLookupId)
      : null;

    return [
      {
        planningId: planning.id,
        courseSlug: planning.courseSlug,
        courseLabel: courseLabel(planning.courseSlug),
        startTime: planning.startTime,
        endTime: planning.endTime,
        level: planning.level,
        capacity: effectivePlanningCapacity(planning.courseSlug, planning.capacity),
        waitlistCapacity: planning.waitlistCapacity,
        coachName: planning.coach ? `${planning.coach.firstName} ${planning.coach.lastName}`.trim() : null,
        coachImageUrl: planning.coach?.imageUrl ?? null,
        scannedReservationId: scannedReservation?.id ?? null,
        scannedReservationStatus: scannedReservation?.status ?? null,
        reservations: planning.reservations.map((r) => ({
          id: r.id,
          status: r.status,
          member: {
            id: r.member.id,
            firstName: r.member.firstName,
            lastName: r.member.lastName,
            email: r.member.user?.email ?? null,
            phone: r.member.phone ?? null,
            qrPublicId:
              includeQrOnMembers && "assignedQrCodes" in r.member
                ? (r.member.assignedQrCodes as { publicId: string }[])[0]?.publicId ?? null
                : null,
          },
        })),
        prospects: (prospectsByPlanningId.get(planning.id) ?? []).map((p) => ({
          id: p.id,
          firstName: p.firstName,
          lastName: p.lastName,
          phone: p.phone,
          courseSlug: p.courseSlug,
          courseLabel: courseLabel(p.courseSlug),
          status: p.status,
          convertedMemberId: p.convertedMemberId,
        })),
      },
    ];
  });
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !isStaffRole(session.user.role)) {
    return errorResponse("Forbidden", 403);
  }

  const url = new URL(request.url);
  const qrPublicId = url.searchParams.get("qrPublicId")?.trim() ?? "";
  const memberId = url.searchParams.get("memberId")?.trim() ?? "";

  const qr = qrPublicId
    ? await prisma.qrCode.findUnique({
        where: { publicId: qrPublicId },
        select: {
          publicId: true,
          assignedMemberId: true,
          assignedMember: {
            select: { id: true, firstName: true, lastName: true, phone: true },
          },
        },
      })
    : null;

  if (qrPublicId && (!qr?.assignedMemberId || !qr.assignedMember)) {
    return errorResponse("QR non affecté à un membre", 404);
  }

  const member =
    !qrPublicId && memberId
      ? await prisma.member.findUnique({
          where: { id: memberId },
          select: { id: true, firstName: true, lastName: true, phone: true },
        })
      : null;

  if (!qrPublicId && memberId && !member) {
    return errorResponse("Membre introuvable", 404);
  }

  const sessionDate = startOfLocalToday();
  const sessionDateYmd = formatYmdLocal(sessionDate);
  const sessionDateDb = parseYmdToPrismaDate(sessionDateYmd);
  if (!sessionDateDb) return errorResponse("Date invalide", 400);
  const nowTime = localNowTimeString();

  const operationalToday = await getAdminOperationalPlanningSlotsForDate(sessionDateYmd);
  const memberLookupId = qr?.assignedMemberId ?? member?.id ?? null;
  const includeQrOnMembers = Boolean(memberLookupId);

  const classes = await loadTodayClassRosters(
    operationalToday,
    sessionDateDb,
    memberLookupId,
    includeQrOnMembers,
  );

  const scannedMember = qr?.assignedMember ?? member ?? null;

  const memberIdForNext = memberLookupId;
  const nextReservedAfterNow =
    memberIdForNext
      ? await prisma.reservation.findFirst({
          where: {
            memberId: memberIdForNext,
            status: { in: ["BOOKED", "WAITLIST"] },
            OR: [
              { sessionDate: { gt: sessionDateDb } },
              { sessionDate: sessionDateDb, planning: { startTime: { gt: nowTime } } },
            ],
          },
          orderBy: [{ sessionDate: "asc" }, { planning: { startTime: "asc" } }, { createdAt: "asc" }],
          include: {
            planning: { include: { coach: { select: { firstName: true, lastName: true, imageUrl: true } } } },
          },
        })
      : null;

  const nextUpcomingClass =
    nextReservedAfterNow != null
      ? buildUpcomingClassPayload(nextReservedAfterNow, sessionDateYmd)
      : null;

  const nextReservedFutureDay =
    memberLookupId && classes.every((c) => !c.scannedReservationId)
      ? await prisma.reservation.findFirst({
          where: {
            memberId: memberLookupId,
            status: { in: ["BOOKED", "WAITLIST"] },
            sessionDate: { gt: sessionDateDb },
          },
          orderBy: [{ sessionDate: "asc" }, { planning: { startTime: "asc" } }, { createdAt: "asc" }],
          include: {
            planning: { include: { coach: { select: { firstName: true, lastName: true, imageUrl: true } } } },
          },
        })
      : null;

  const upcomingClass =
    nextReservedFutureDay != null ? buildUpcomingClassPayload(nextReservedFutureDay, sessionDateYmd) : null;

  let message: string | null = null;
  if (classes.length === 0) {
    message = "Aucun cours prévu aujourd'hui.";
  } else if (memberLookupId && classes.every((c) => !c.scannedReservationId) && !upcomingClass) {
    message = "Ce membre n'est inscrit à aucun cours aujourd'hui ni à venir.";
  } else if (memberLookupId && classes.every((c) => !c.scannedReservationId) && upcomingClass) {
    message = `Ce membre n'est pas inscrite aux cours d'aujourd'hui. Prochain cours réservé ci-dessous.`;
  }

  return Response.json({
    scannedMember,
    sessionDate: sessionDateYmd,
    nowTime,
    message,
    classes,
    upcomingClass,
    nextUpcomingClass:
      upcomingClass && nextUpcomingClass?.planningId === upcomingClass.planningId ? null : nextUpcomingClass,
  });
}
