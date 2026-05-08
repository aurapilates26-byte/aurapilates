import { broadcastMemberBookingRefresh } from "@/lib/member-booking-stream";
import { prisma } from "@/lib/prisma";
import { requireMemberSession } from "@/lib/require-member";
import { formatYmdPrismaDate, parseYmdLocal } from "@/lib/calendar-day";
import { Prisma } from "@prisma/client";

type Params = {
  params: Promise<{ id: string }>;
};

function errorResponse(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

export async function DELETE(_request: Request, { params }: Params) {
  const guard = await requireMemberSession();
  if ("error" in guard) return guard.error;

  const { member } = guard;
  const { id } = await params;

  const reservation = await prisma.reservation.findFirst({
    where: { id, memberId: member.id },
    include: { planning: { select: { startTime: true, courseSlug: true } } },
  });

  if (!reservation) {
    return errorResponse("Reservation introuvable", 404);
  }

  if (reservation.status === "CANCELLED") {
    return Response.json({ ok: true });
  }

  if (reservation.status === "ATTENDED") {
    return errorResponse("Impossible d'annuler une seance deja validee en presence", 409);
  }

  if (reservation.status !== "BOOKED" && reservation.status !== "WAITLIST") {
    return errorResponse("Annulation impossible", 409);
  }

  const now = new Date();
  const ymd = formatYmdPrismaDate(new Date(reservation.sessionDate));
  const day = parseYmdLocal(ymd);
  if (!day) return errorResponse("Annulation impossible", 409);
  const [hh, mm] = reservation.planning.startTime.split(":").map((p) => Number(p));
  const classStart = new Date(day.getFullYear(), day.getMonth(), day.getDate(), Number.isFinite(hh) ? hh : 0, Number.isFinite(mm) ? mm : 0, 0, 0);
  const diffMs = classStart.getTime() - now.getTime();
  const refundable = diffMs >= 6 * 60 * 60 * 1000;

  const wasBooked = reservation.status === "BOOKED";

  const result = await prisma.$transaction(async (tx) => {
    const claim = await tx.reservation.updateMany({
      where: {
        id: reservation.id,
        memberId: member.id,
        status: { in: ["BOOKED", "WAITLIST"] },
      },
      data: { status: "CANCELLED", packRefundedAt: refundable ? new Date() : null },
    });

    if (claim.count === 0) {
      const current = await tx.reservation.findUnique({
        where: { id: reservation.id },
        select: { status: true, packRefundedAt: true },
      });
      if (!current) return { ok: false as const, notFound: true as const };
      if (current.status === "CANCELLED") {
        return { ok: true as const, refundable: Boolean(current.packRefundedAt), alreadyCancelled: true as const };
      }
      return { ok: false as const, conflict: true as const };
    }

    const memberRow = await tx.member.findUnique({
      where: { id: member.id },
      select: { packId: true, pack: { select: { id: true, courseQuotas: { select: { courseSlug: true } } } } },
    });

    if (refundable && reservation.packRefundedAt == null && memberRow?.packId && memberRow.pack) {
      const isMixed = memberRow.pack.courseQuotas.length > 0;
      const targetCourseSlug = isMixed ? reservation.planning.courseSlug : null;
      await tx.memberPackBalance.updateMany({
        where: { memberId: member.id, packId: memberRow.pack.id, courseSlug: targetCourseSlug },
        data: { remaining: { increment: 1 } },
      });
    }

    if (wasBooked) {
      const nextWait = await tx.reservation.findFirst({
        where: {
          planningId: reservation.planningId,
          sessionDate: reservation.sessionDate,
          status: "WAITLIST",
        },
        orderBy: { createdAt: "asc" },
      });
      if (nextWait) {
        await tx.reservation.update({
          where: { id: nextWait.id },
          data: { status: "BOOKED" },
        });
      }
    }
    return { ok: true as const, refundable };
  }, {
    isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    maxWait: 5000,
    timeout: 10000,
  });

  if (!result.ok && result.notFound) {
    return errorResponse("Reservation introuvable", 404);
  }
  if (!result.ok) {
    return errorResponse("Annulation impossible", 409);
  }

  broadcastMemberBookingRefresh();
  return Response.json({ ok: true, refundable: result.refundable });
}
