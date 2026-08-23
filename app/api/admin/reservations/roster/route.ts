import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/auth";
import { isStaffRole } from "@/lib/admin/access";
import { courseLabel } from "@/lib/course-labels";
import { formatYmdLocal, parseYmdLocal, parseYmdToPrismaDate, startOfLocalToday } from "@/lib/calendar-day";
import { getAdminOperationalPlanningSlotsForDate } from "@/lib/admin/planning-operational-slots";
import { repairAttendedReservationsWithoutAttendance } from "@/lib/ensure-reservation-attendance";
import { SESSION_PROSPECT_OCCUPYING_STATUSES } from "@/lib/admin/session-prospect-stats";
import { prisma } from "@/lib/prisma";

function errorResponse(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

const querySchema = z.object({
  planningId: z.string().trim().cuid(),
  date: z.string().optional(),
});

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !isStaffRole(session.user.role)) {
    return errorResponse("Forbidden", 403);
  }

  const url = new URL(request.url);
  const parsed = querySchema.safeParse({
    planningId: url.searchParams.get("planningId") ?? "",
    date: url.searchParams.get("date") ?? undefined,
  });
  if (!parsed.success) return errorResponse("Invalid query parameters", 400);

  const dayLocal = parsed.data.date ? parseYmdLocal(parsed.data.date) : startOfLocalToday();
  if (!dayLocal) return errorResponse("Date invalide", 400);
  const ymd = formatYmdLocal(dayLocal);
  const dayDb = parseYmdToPrismaDate(ymd);
  if (!dayDb) return errorResponse("Date invalide", 400);

  const planning = (
    await getAdminOperationalPlanningSlotsForDate(ymd)
  ).find((row) => row.id === parsed.data.planningId);
  if (!planning) return errorResponse("Créneau introuvable pour cette période", 404);

  const loadReservations = () =>
    prisma.reservation.findMany({
      where: { planningId: planning.id, sessionDate: dayDb },
      orderBy: [{ createdAt: "asc" }],
      include: {
        member: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            user: { select: { email: true } },
            assignedQrCodes: { take: 1, orderBy: { updatedAt: "desc" }, select: { publicId: true } },
          },
        },
        attendance: { select: { markedAt: true, markedBy: true } },
      },
    });

  let reservations = await loadReservations();
  const repairIds = reservations
    .filter((r) => r.status === "ATTENDED" && !r.attendance)
    .map((r) => r.id);
  if (repairIds.length > 0) {
    await repairAttendedReservationsWithoutAttendance(repairIds);
    reservations = await loadReservations();
  }

  const prospects = await prisma.sessionProspect.findMany({
    where: {
      planningId: planning.id,
      sessionDate: dayDb,
      status: { in: [...SESSION_PROSPECT_OCCUPYING_STATUSES, "CONVERTED"] },
    },
    orderBy: [{ createdAt: "asc" }],
    select: {
      id: true,
      firstName: true,
      lastName: true,
      phone: true,
      courseSlug: true,
      status: true,
      trialPaidAt: true,
      trialPaymentDinars: true,
      convertedMemberId: true,
      createdAt: true,
    },
  });

  return Response.json({
    date: ymd,
    slot: {
      planningId: planning.id,
      courseSlug: planning.courseSlug,
      courseLabel: courseLabel(planning.courseSlug),
      startTime: planning.startTime,
      endTime: planning.endTime,
      level: planning.level,
      coachName: planning.coach ? `${planning.coach.firstName} ${planning.coach.lastName}`.trim() : null,
      capacity: planning.capacity,
      waitlistCapacity: planning.waitlistCapacity,
    },
    reservations: reservations.map((r) => ({
      id: r.id,
      status: r.status,
      packRefundedAt: r.packRefundedAt ? r.packRefundedAt.toISOString() : null,
      member: {
        id: r.member.id,
        firstName: r.member.firstName,
        lastName: r.member.lastName,
        email: r.member.user?.email ?? null,
        phone: r.member.phone ?? null,
        qrPublicId: r.member.assignedQrCodes[0]?.publicId ?? null,
      },
      attendance: r.attendance
        ? { markedAt: r.attendance.markedAt.toISOString(), markedBy: r.attendance.markedBy }
        : null,
    })),
    prospects: prospects.map((p) => ({
      id: p.id,
      firstName: p.firstName,
      lastName: p.lastName,
      phone: p.phone,
      courseSlug: p.courseSlug,
      courseLabel: courseLabel(p.courseSlug),
      status: p.status,
      trialPaidAt: p.trialPaidAt ? p.trialPaidAt.toISOString() : null,
      trialPaymentDinars: p.trialPaymentDinars,
      convertedMemberId: p.convertedMemberId,
      createdAt: p.createdAt.toISOString(),
    })),
  });
}

