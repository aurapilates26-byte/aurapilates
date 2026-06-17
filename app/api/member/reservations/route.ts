import { courseLabel } from "@/lib/course-labels";
import {
  createMemberReservation,
  reservationErrorMessage,
} from "@/lib/create-member-reservation";
import {
  formatYmdLocal,
  formatYmdPrismaDate,
  isSessionSlotEndedLocal,
  prismaDateGteFromLocal,
  startOfLocalToday,
} from "@/lib/calendar-day";
import { broadcastMemberBookingRefresh } from "@/lib/member-booking-stream";
import { getMemberPackSummary } from "@/lib/member/member-pack-summary";
import { prisma } from "@/lib/prisma";
import { requireMemberSession } from "@/lib/require-member";
import { z } from "zod";

const createSchema = z.object({
  planningId: z.string().trim().cuid(),
  sessionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

function errorResponse(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

export async function GET() {
  const guard = await requireMemberSession();
  if ("error" in guard) return guard.error;

  const { member } = guard;
  const fromDay = startOfLocalToday();
  const fromYmd = formatYmdLocal(fromDay);
  const sessionGte = prismaDateGteFromLocal(fromDay);

  const itemsRaw = await prisma.reservation.findMany({
    where: {
      memberId: member.id,
      sessionDate: { gte: sessionGte },
      status: { in: ["BOOKED", "WAITLIST"] },
    },
    orderBy: [{ sessionDate: "asc" }, { createdAt: "asc" }],
    include: {
      planning: {
        include: {
          coach: { select: { firstName: true, lastName: true, imageUrl: true } },
        },
      },
    },
  });

  const items = itemsRaw.filter((r) => {
    const ymd = formatYmdPrismaDate(new Date(r.sessionDate));
    return ymd >= fromYmd && !isSessionSlotEndedLocal(ymd, r.planning.endTime);
  });

  const mapReservationRow = (r: (typeof itemsRaw)[number]) => ({
    id: r.id,
    status: r.status,
    sessionDate: formatYmdPrismaDate(new Date(r.sessionDate)),
    reservedAt: r.createdAt.toISOString(),
    packRefundedAt: r.packRefundedAt ? r.packRefundedAt.toISOString() : null,
    planning: {
      id: r.planning.id,
      courseSlug: r.planning.courseSlug,
      courseLabel: courseLabel(r.planning.courseSlug),
      startTime: r.planning.startTime,
      endTime: r.planning.endTime,
      level: r.planning.level,
      coachName: r.planning.coach
        ? `${r.planning.coach.firstName} ${r.planning.coach.lastName}`.trim()
        : null,
      coachImageUrl: r.planning.coach?.imageUrl ?? null,
    },
  });

  /**
   * Historique : annulations, présences, jours passés, et réservations encore BOOKED/WAITLIST
   * dont le créneau (fin du cours) est déjà passé aujourd'hui.
   */
  const historyRaw = await prisma.reservation.findMany({
    where: {
      memberId: member.id,
      NOT: {
        AND: [{ sessionDate: { gte: sessionGte } }, { status: { in: ["BOOKED", "WAITLIST"] } }],
      },
    },
    orderBy: [{ sessionDate: "desc" }, { createdAt: "desc" }],
    take: 80,
    include: {
      planning: {
        include: {
          coach: { select: { firstName: true, lastName: true, imageUrl: true } },
        },
      },
    },
  });

  const fromEndedSlotStillActive = itemsRaw
    .filter((r) => {
      const ymd = formatYmdPrismaDate(new Date(r.sessionDate));
      return ymd >= fromYmd && isSessionSlotEndedLocal(ymd, r.planning.endTime);
    })
    .map(mapReservationRow);

  const historyById = new Map<string, ReturnType<typeof mapReservationRow>>();
  for (const row of fromEndedSlotStillActive) {
    historyById.set(row.id, row);
  }
  for (const r of historyRaw) {
    const row = mapReservationRow(r);
    historyById.set(row.id, row);
  }

  const history = [...historyById.values()]
    .sort((a, b) => {
      const d = b.sessionDate.localeCompare(a.sessionDate);
      if (d !== 0) return d;
      return b.reservedAt.localeCompare(a.reservedAt);
    })
    .slice(0, 50);

  const packSummary = await getMemberPackSummary(member.id);

  return Response.json({
    items: items.map(mapReservationRow),
    history,
    packSummary,
  });
}

export async function POST(request: Request) {
  const guard = await requireMemberSession();
  if ("error" in guard) return guard.error;

  const { member } = guard;
  const raw = await request.json().catch(() => null);
  const parsed = createSchema.safeParse(raw);
  if (!parsed.success) {
    return errorResponse("Données invalides", 400);
  }

  const { planningId, sessionDate: sessionDateStr } = parsed.data;

  try {
    const result = await createMemberReservation({
      memberId: member.id,
      planningId,
      sessionDate: sessionDateStr,
      source: "MEMBER",
    });

    broadcastMemberBookingRefresh();
    const packSummary = await getMemberPackSummary(member.id);
    return Response.json({ item: result, packSummary });
  } catch (e) {
    const code = e instanceof Error ? e.message : "";
    return errorResponse(reservationErrorMessage(code), code === "PLANNING_NOT_FOUND" ? 404 : 409);
  }
}
