import "server-only";

import { Prisma } from "@prisma/client";
import { formatYmdPrismaDate } from "@/lib/calendar-day";
import { creditMemberPackSession } from "@/lib/member-pack-session-ledger";
import { prisma } from "@/lib/prisma";

export const HISTORICAL_PRESENCE_MARKED_BY = {
  NEW: "ADMIN_HISTORICAL:NEW",
  BOOKED: "ADMIN_HISTORICAL:BOOKED",
  WAITLIST: "ADMIN_HISTORICAL:WAITLIST",
  CANCELLED: "ADMIN_HISTORICAL:CANCELLED",
  CANCELLED_REFUNDED: "ADMIN_HISTORICAL:CANCELLED_REFUNDED",
  ATTENDED_REPAIR: "ADMIN_HISTORICAL:ATTENDED_REPAIR",
} as const;

type RevertKind = keyof typeof HISTORICAL_PRESENCE_MARKED_BY | "LEGACY_NEW" | "LEGACY_BOOKED";

function isHistoricalMarkedBy(markedBy: string): boolean {
  return markedBy === "ADMIN_HISTORICAL" || markedBy.startsWith("ADMIN_HISTORICAL:");
}

function resolveRevertKind(
  markedBy: string,
  reservationCreatedAt: Date,
  attendanceMarkedAt: Date,
): RevertKind {
  if (markedBy === HISTORICAL_PRESENCE_MARKED_BY.NEW) return "NEW";
  if (markedBy === HISTORICAL_PRESENCE_MARKED_BY.BOOKED) return "BOOKED";
  if (markedBy === HISTORICAL_PRESENCE_MARKED_BY.WAITLIST) return "WAITLIST";
  if (markedBy === HISTORICAL_PRESENCE_MARKED_BY.CANCELLED) return "CANCELLED";
  if (markedBy === HISTORICAL_PRESENCE_MARKED_BY.CANCELLED_REFUNDED) return "CANCELLED_REFUNDED";
  if (markedBy === HISTORICAL_PRESENCE_MARKED_BY.ATTENDED_REPAIR) return "ATTENDED_REPAIR";

  if (markedBy === "ADMIN_HISTORICAL") {
    const delta = Math.abs(reservationCreatedAt.getTime() - attendanceMarkedAt.getTime());
    return delta <= 5000 ? "LEGACY_NEW" : "LEGACY_BOOKED";
  }

  throw new Error("NOT_HISTORICAL");
}

function shouldCreditPack(kind: RevertKind): boolean {
  // Toute présence qui a débité le pack doit le recrediter au retrait.
  return (
    kind === "NEW" ||
    kind === "WAITLIST" ||
    kind === "CANCELLED_REFUNDED" ||
    kind === "CANCELLED" ||
    kind === "BOOKED" ||
    kind === "LEGACY_BOOKED" ||
    kind === "LEGACY_NEW" ||
    kind === "ATTENDED_REPAIR"
  );
}

function shouldDeleteReservation(kind: RevertKind): boolean {
  return kind === "NEW" || kind === "LEGACY_NEW";
}

export function unmarkHistoricalPresenceErrorMessage(code: string): string {
  if (code === "NOT_FOUND") return "Présence introuvable";
  if (code === "NOT_HISTORICAL") return "Cette présence ne peut pas être supprimée ici";
  if (code === "NO_ATTENDANCE") return "Aucune présence enregistrée";
  if (code === "NOT_ATTENDED") return "Réservation non éligible";
  return "Suppression impossible";
}

export type UnmarkHistoricalPresenceResult = {
  planningId: string;
  sessionDateYmd: string;
  memberId: string;
  packCredited: boolean;
};

export async function unmarkHistoricalPresence(reservationId: string): Promise<UnmarkHistoricalPresenceResult> {
  return prisma.$transaction(
    async (tx) => {
      const reservation = await tx.reservation.findUnique({
        where: { id: reservationId },
        select: {
          id: true,
          memberId: true,
          planningId: true,
          sessionDate: true,
          status: true,
          createdAt: true,
          attendance: { select: { markedBy: true, markedAt: true } },
          planning: { select: { courseSlug: true } },
          debitedPack: {
            select: {
              id: true,
              sessionCount: true,
              courseQuotas: { select: { courseSlug: true, sessionCount: true } },
            },
          },
          member: {
            select: {
              packId: true,
              pack: {
                select: {
                  id: true,
                  sessionCount: true,
                  courseQuotas: { select: { courseSlug: true, sessionCount: true } },
                },
              },
            },
          },
        },
      });

      if (!reservation) throw new Error("NOT_FOUND");
      if (reservation.status !== "ATTENDED") throw new Error("NOT_ATTENDED");
      if (!reservation.attendance) throw new Error("NO_ATTENDANCE");

      const { markedBy, markedAt } = reservation.attendance;
      if (!isHistoricalMarkedBy(markedBy)) throw new Error("NOT_HISTORICAL");

      const kind = resolveRevertKind(markedBy, reservation.createdAt, markedAt);
      const packCredited = shouldCreditPack(kind);

      await tx.checkIn.deleteMany({ where: { reservationId } });
      await tx.attendance.delete({ where: { reservationId } });

      const packToCredit = reservation.debitedPack ?? reservation.member.pack;
      if (packCredited && packToCredit) {
        await creditMemberPackSession(tx, {
          memberId: reservation.memberId,
          pack: packToCredit,
          courseSlug: reservation.planning.courseSlug,
        });
      }

      if (shouldDeleteReservation(kind)) {
        await tx.reservation.delete({ where: { id: reservationId } });
      } else if (kind === "BOOKED" || kind === "LEGACY_BOOKED") {
        await tx.reservation.update({ where: { id: reservationId }, data: { status: "BOOKED" } });
      } else if (kind === "WAITLIST") {
        await tx.reservation.update({ where: { id: reservationId }, data: { status: "WAITLIST" } });
      } else if (kind === "CANCELLED") {
        await tx.reservation.update({ where: { id: reservationId }, data: { status: "CANCELLED" } });
      } else if (kind === "CANCELLED_REFUNDED") {
        await tx.reservation.update({
          where: { id: reservationId },
          data: { status: "CANCELLED", packRefundedAt: new Date() },
        });
      }

      return {
        planningId: reservation.planningId,
        sessionDateYmd: formatYmdPrismaDate(reservation.sessionDate),
        memberId: reservation.memberId,
        packCredited,
      };
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      maxWait: 5000,
      timeout: 10000,
    },
  );
}
