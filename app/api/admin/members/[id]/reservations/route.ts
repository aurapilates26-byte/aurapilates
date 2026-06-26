import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/auth";
import { isStaffRole } from "@/lib/admin/access";
import { serializeAdminMemberReservation } from "@/lib/admin/member-reservations-list";
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
import { prisma } from "@/lib/prisma";

function errorResponse(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return errorResponse("Unauthorized", 401);
  if (!isStaffRole(session.user.role)) return errorResponse("Forbidden", 403);
  return null;
}

const createSchema = z.object({
  planningId: z.string().trim().cuid(),
  sessionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  packId: z.string().trim().cuid().optional(),
});

const reservationInclude = {
  planning: {
    include: {
      coach: { select: { firstName: true, lastName: true, imageUrl: true } },
    },
  },
  createdByUser: { select: { name: true, email: true, role: true } },
} as const;

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const guard = await requireAdmin();
  if (guard) return guard;

  const { id: memberId } = await params;

  const member = await prisma.member.findUnique({
    where: { id: memberId },
    select: { id: true },
  });
  if (!member) return errorResponse("Adhérente introuvable", 404);

  const fromDay = startOfLocalToday();
  const fromYmd = formatYmdLocal(fromDay);
  const sessionGte = prismaDateGteFromLocal(fromDay);

  const itemsRaw = await prisma.reservation.findMany({
    where: {
      memberId,
      sessionDate: { gte: sessionGte },
      status: { in: ["BOOKED", "WAITLIST"] },
    },
    orderBy: [{ sessionDate: "asc" }, { createdAt: "asc" }],
    include: reservationInclude,
  });

  const items = itemsRaw
    .filter((r) => {
      const ymd = formatYmdPrismaDate(new Date(r.sessionDate));
      return ymd >= fromYmd && !isSessionSlotEndedLocal(ymd, r.planning.endTime);
    })
    .map(serializeAdminMemberReservation);

  const historyRaw = await prisma.reservation.findMany({
    where: {
      memberId,
      NOT: {
        AND: [{ sessionDate: { gte: sessionGte } }, { status: { in: ["BOOKED", "WAITLIST"] } }],
      },
    },
    orderBy: [{ sessionDate: "desc" }, { createdAt: "desc" }],
    take: 80,
    include: reservationInclude,
  });

  const fromEndedSlotStillActive = itemsRaw
    .filter((r) => {
      const ymd = formatYmdPrismaDate(new Date(r.sessionDate));
      return ymd >= fromYmd && isSessionSlotEndedLocal(ymd, r.planning.endTime);
    })
    .map(serializeAdminMemberReservation);

  const historyById = new Map<string, ReturnType<typeof serializeAdminMemberReservation>>();
  for (const row of fromEndedSlotStillActive) {
    historyById.set(row.id, row);
  }
  for (const r of historyRaw) {
    historyById.set(r.id, serializeAdminMemberReservation(r));
  }

  const history = [...historyById.values()]
    .sort((a, b) => {
      const d = b.sessionDate.localeCompare(a.sessionDate);
      if (d !== 0) return d;
      return b.reservedAt.localeCompare(a.reservedAt);
    })
    .slice(0, 50);

  return Response.json({ items, history });
}

export async function POST(request: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return errorResponse("Unauthorized", 401);
  if (!isStaffRole(session.user.role)) return errorResponse("Forbidden", 403);

  const { id: memberId } = await params;
  const rawBody = await request.json().catch(() => null);
  const parsed = createSchema.safeParse(rawBody);
  if (!parsed.success) return errorResponse("Paramètres invalides", 400);

  const member = await prisma.member.findUnique({
    where: { id: memberId },
    select: { id: true },
  });
  if (!member) return errorResponse("Adhérente introuvable", 404);

  try {
    const result = await createMemberReservation({
      memberId,
      planningId: parsed.data.planningId,
      sessionDate: parsed.data.sessionDate,
      packId: parsed.data.packId,
      source: "ADMIN",
      createdByUserId: session.user.id,
    });
    broadcastMemberBookingRefresh();
    return Response.json({ item: result });
  } catch (e) {
    const code = e instanceof Error ? e.message : "";
    return errorResponse(
      reservationErrorMessage(code),
      code === "PLANNING_NOT_FOUND" || code === "MEMBER_NOT_FOUND" ? 404 : 409
    );
  }
}
