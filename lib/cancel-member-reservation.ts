import { broadcastMemberBookingRefresh } from "@/lib/member-booking-stream";
import { formatYmdPrismaDate, parseYmdLocal } from "@/lib/calendar-day";
import { promoteNextWaitlistReservation } from "@/lib/member-pack-session-ledger";
import { isMemberCancellationRefundable } from "@/lib/studio-booking-rules";
import { getStudioBookingRules } from "@/lib/studio-booking-rules-server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export type CancelMemberReservationResult =
  | {
      ok: true;
      /** Séance rendue au pack (réservation confirmée annulée à temps). */
      refundable: boolean;
      /** Retrait liste d'attente : aucune séance n'était débitée. */
      waitlistCancellation?: boolean;
      alreadyCancelled?: boolean;
    }
  | { ok: false; code: "NOT_FOUND" | "CONFLICT" | "ATTENDED" };

export async function cancelMemberReservation(params: {
  reservationId: string;
  memberId: string;
  /** Studio admin: annulation autorisée et crédit pack rendu si applicable. */
  asAdmin?: boolean;
}): Promise<CancelMemberReservationResult> {
  const { reservationId, memberId, asAdmin = false } = params;

  const reservation = await prisma.reservation.findFirst({
    where: { id: reservationId, memberId },
    include: {
      planning: { select: { startTime: true, courseSlug: true } },
    },
  });

  if (!reservation) {
    return { ok: false, code: "NOT_FOUND" };
  }

  if (reservation.status === "CANCELLED") {
    return {
      ok: true,
      refundable: Boolean(reservation.packRefundedAt),
      waitlistCancellation: false,
      alreadyCancelled: true,
    };
  }

  if (reservation.status === "ATTENDED") {
    return { ok: false, code: "ATTENDED" };
  }

  if (reservation.status !== "BOOKED" && reservation.status !== "WAITLIST") {
    return { ok: false, code: "CONFLICT" };
  }

  const wasBooked = reservation.status === "BOOKED";
  const wasWaitlist = reservation.status === "WAITLIST";

  const bookingRules = await getStudioBookingRules();

  let refundable = false;
  if (wasWaitlist) {
    refundable = false;
  } else {
    const now = new Date();
    const ymd = formatYmdPrismaDate(new Date(reservation.sessionDate));
    const day = parseYmdLocal(ymd);
    if (!day) return { ok: false, code: "CONFLICT" };
    const [hh, mm] = reservation.planning.startTime.split(":").map((p) => Number(p));
    const classStart = new Date(
      day.getFullYear(),
      day.getMonth(),
      day.getDate(),
      Number.isFinite(hh) ? hh : 0,
      Number.isFinite(mm) ? mm : 0,
      0,
      0,
    );
    refundable = isMemberCancellationRefundable({
      asAdmin,
      wasWaitlist,
      lateCancellationRuleEnabled: bookingRules.lateCancellationRuleEnabled,
      classStart,
      now,
    });
  }

  const result = await prisma.$transaction(
    async (tx) => {
      const claim = await tx.reservation.updateMany({
        where: {
          id: reservation.id,
          memberId,
          status: { in: ["BOOKED", "WAITLIST"] },
        },
        data: {
          status: "CANCELLED",
          packRefundedAt: wasWaitlist ? null : refundable ? new Date() : null,
        },
      });

      if (claim.count === 0) {
        const current = await tx.reservation.findUnique({
          where: { id: reservation.id },
          select: { status: true, packRefundedAt: true },
        });
        if (!current) return { ok: false as const, notFound: true as const };
        if (current.status === "CANCELLED") {
          return {
            ok: true as const,
            refundable: Boolean(current.packRefundedAt),
            waitlistCancellation: false,
            alreadyCancelled: true as const,
          };
        }
        return { ok: false as const, conflict: true as const };
      }

      if (wasBooked) {
        await promoteNextWaitlistReservation(tx, {
          planningId: reservation.planningId,
          sessionDate: reservation.sessionDate,
          courseSlug: reservation.planning.courseSlug,
        });
      }

      return {
        ok: true as const,
        refundable: wasBooked && refundable,
        waitlistCancellation: wasWaitlist,
      };
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      maxWait: 5000,
      timeout: 10000,
    },
  );

  if (!result.ok && result.notFound) {
    return { ok: false, code: "NOT_FOUND" };
  }
  if (!result.ok) {
    return { ok: false, code: "CONFLICT" };
  }

  broadcastMemberBookingRefresh();
  return {
    ok: true,
    refundable: result.refundable,
    waitlistCancellation: result.waitlistCancellation,
    alreadyCancelled: result.alreadyCancelled,
  };
}

export function cancelMemberReservationErrorMessage(code: string): string {
  switch (code) {
    case "NOT_FOUND":
      return "Réservation introuvable.";
    case "ATTENDED":
      return "Impossible d'annuler une séance déjà validée en présence.";
    case "CONFLICT":
      return "Annulation impossible.";
    default:
      return "Annulation impossible.";
  }
}
