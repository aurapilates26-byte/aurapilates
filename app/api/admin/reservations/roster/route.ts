import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/auth";
import { courseLabel } from "@/lib/course-labels";
import { formatYmdLocal, parseYmdLocal, parseYmdToPrismaDate, startOfLocalToday } from "@/lib/calendar-day";
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
  if (!session?.user || session.user.role !== "ADMIN") {
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

  const planning = await prisma.planning.findUnique({
    where: { id: parsed.data.planningId },
    include: { coach: { select: { firstName: true, lastName: true } } },
  });
  if (!planning) return errorResponse("Creneau introuvable", 404);

  const reservations = await prisma.reservation.findMany({
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
  });
}

