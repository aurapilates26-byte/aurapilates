import "server-only";

import { Prisma } from "@prisma/client";
import { formatYmdPrismaDate } from "@/lib/calendar-day";
import { isLivePresenceMarkedBy } from "@/lib/ensure-reservation-attendance";
import {
  creditMemberPackSession,
  promoteNextWaitlistReservation,
} from "@/lib/member-pack-session-ledger";
import { reopenSingleSessionPackAfterFullRefund } from "@/lib/admin/member-pack-enrollment";
import { prisma } from "@/lib/prisma";
import {
  isHistoricalMarkedBy,
  unmarkHistoricalPresence,
  type UnmarkHistoricalPresenceResult,
} from "@/lib/admin/unmark-historical-presence";

export function unmarkLivePresenceErrorMessage(code: string): string {
  if (code === "NOT_FOUND") return "Présence introuvable";
  if (code === "NOT_LIVE") return "Cette présence ne peut pas être supprimée ici";
  if (code === "NO_ATTENDANCE") return "Aucune présence enregistrée";
  if (code === "NOT_ATTENDED") return "Réservation non éligible";
  return "Suppression impossible";
}

export type UnmarkLivePresenceResult = UnmarkHistoricalPresenceResult;

async function unmarkLivePresence(reservationId: string): Promise<UnmarkLivePresenceResult> {
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
          packRefundedAt: true,
          attendance: { select: { markedBy: true } },
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

      const { markedBy } = reservation.attendance;
      if (!isLivePresenceMarkedBy(markedBy)) throw new Error("NOT_LIVE");

      const packToCredit =
        reservation.debitedPack ??
        (reservation.member.packId && reservation.member.pack ? reservation.member.pack : null);
      const shouldCreditPack = Boolean(packToCredit) && reservation.packRefundedAt == null;

      await tx.checkIn.deleteMany({ where: { reservationId } });
      await tx.attendance.delete({ where: { reservationId } });

      if (shouldCreditPack && packToCredit) {
        await creditMemberPackSession(tx, {
          memberId: reservation.memberId,
          pack: packToCredit,
          courseSlug: reservation.planning.courseSlug,
        });
      }

      // Suppression = annulation pour le suivi (plus « Confirmée »), avec séance rendue au pack.
      await tx.reservation.update({
        where: { id: reservationId },
        data: {
          status: "CANCELLED",
          packRefundedAt: shouldCreditPack ? new Date() : reservation.packRefundedAt,
        },
      });

      if (shouldCreditPack && packToCredit) {
        await reopenSingleSessionPackAfterFullRefund(tx, {
          memberId: reservation.memberId,
          packId: packToCredit.id,
          sessionCount: packToCredit.sessionCount,
          courseQuotas: packToCredit.courseQuotas,
        });
      }

      await promoteNextWaitlistReservation(tx, {
        planningId: reservation.planningId,
        sessionDate: reservation.sessionDate,
        courseSlug: reservation.planning.courseSlug,
      });

      return {
        planningId: reservation.planningId,
        sessionDateYmd: formatYmdPrismaDate(reservation.sessionDate),
        memberId: reservation.memberId,
        packCredited: shouldCreditPack,
      };
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      maxWait: 5000,
      timeout: 10000,
    },
  );
}

/** Annule une présence du jour (page Présence) ou une saisie historique si c’est le cas. */
export async function unmarkAdminPresence(reservationId: string): Promise<UnmarkLivePresenceResult> {
  const row = await prisma.reservation.findUnique({
    where: { id: reservationId },
    select: {
      id: true,
      status: true,
      attendance: { select: { markedBy: true } },
    },
  });

  if (!row) throw new Error("NOT_FOUND");
  if (row.status !== "ATTENDED") throw new Error("NOT_ATTENDED");
  if (!row.attendance) throw new Error("NO_ATTENDANCE");

  if (isHistoricalMarkedBy(row.attendance.markedBy)) {
    return unmarkHistoricalPresence(reservationId);
  }

  return unmarkLivePresence(reservationId);
}
