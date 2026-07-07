import { getServerSession } from "next-auth";
import { Prisma, ReservationStatus } from "@prisma/client";
import { z } from "zod";
import { authOptions } from "@/auth";
import { isStaffRole } from "@/lib/admin/access";
import {
  formatYmdLocal,
  formatYmdPrismaDate,
  parseYmdLocal,
  parseYmdToPrismaDate,
  startOfLocalToday,
} from "@/lib/calendar-day";
import { ensureReservationAttendanceRecord } from "@/lib/ensure-reservation-attendance";
import { broadcastMemberBookingRefresh } from "@/lib/member-booking-stream";
import { isPresenceMarkingAllowed } from "@/lib/admin/presence-window";
import { PACK_ERRORS } from "@/lib/create-member-reservation";
import {
  debitSelectedPackSession,
  preparePackForAdminPresenceDebit,
} from "@/lib/admin/member-pack-selection";
import { prisma } from "@/lib/prisma";

const RESERVATION_ELIGIBLE_STATUSES: ReservationStatus[] = [
  ReservationStatus.BOOKED,
  ReservationStatus.WAITLIST,
];

const ERRORS = {
  FORBIDDEN: "Accès refusé",
  PAYLOAD_INVALID: "Données invalides",
  RESERVATION_NOT_FOUND: "Réservation introuvable",
  RESERVATION_CANCELLED: "Réservation annulée",
  RESERVATION_NOT_ELIGIBLE: "Statut non éligible",
  TOO_EARLY: "Présence disponible 15 minutes avant le début du cours",
  NO_SESSIONS_LEFT: "Plus de séances disponibles sur le pack",
  NO_PACK: "Aucun pack associé",
} as const;

const bodySchema = z.object({
  reservationId: z.string().trim().cuid(),
});

function errorResponse(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

type Outcome = "ok" | "already" | "not_found" | "cancelled" | "conflict" | "too_early";

function responseForOutcome(outcome: Outcome): Response | null {
  if (outcome === "not_found") return errorResponse(ERRORS.RESERVATION_NOT_FOUND, 404);
  if (outcome === "cancelled") return errorResponse(ERRORS.RESERVATION_CANCELLED, 409);
  if (outcome === "too_early") return errorResponse(ERRORS.TOO_EARLY, 409);
  if (outcome === "already") return Response.json({ ok: true, alreadyMarked: true });
  if (outcome === "conflict") return errorResponse(ERRORS.RESERVATION_NOT_ELIGIBLE, 409);
  return null;
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !isStaffRole(session.user.role)) {
    return errorResponse(ERRORS.FORBIDDEN, 403);
  }

  const raw = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) {
    return errorResponse(ERRORS.PAYLOAD_INVALID, 400);
  }

  const { reservationId } = parsed.data;
  const todayYmd = formatYmdLocal(startOfLocalToday());
  const todayDb = parseYmdToPrismaDate(todayYmd);
  if (!todayDb) return errorResponse(ERRORS.PAYLOAD_INVALID, 400);
  const now = new Date();
  const nowTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  const plus15 = new Date(now.getTime() + 15 * 60_000);
  const nowPlus15 = `${String(plus15.getHours()).padStart(2, "0")}:${String(plus15.getMinutes()).padStart(2, "0")}`;

  let outcome: Outcome;
  try {
    outcome = await prisma.$transaction(async (tx) => {
      const current = await tx.reservation.findUnique({
        where: { id: reservationId },
        select: {
          id: true,
          status: true,
          memberId: true,
          planningId: true,
          sessionDate: true,
          debitedPackId: true,
          planning: { select: { startTime: true, endTime: true, courseSlug: true } },
          member: {
            select: {
              packId: true,
              packStartedAt: true,
            },
          },
          attendance: { select: { reservationId: true } },
        },
      });

      if (!current) return "not_found" as const;
      if (current.status === "CANCELLED") return "cancelled" as const;

      const sessionYmd = formatYmdPrismaDate(new Date(current.sessionDate));
      const canMarkToday =
        sessionYmd === todayYmd &&
        isPresenceMarkingAllowed(current.planning.startTime, nowTime);

      if (current.status === "ATTENDED") {
        const repaired = await ensureReservationAttendanceRecord(tx, reservationId);
        if (repaired === "already") return "already" as const;
        if (repaired === "ok") return "ok" as const;
        return "conflict" as const;
      } else {
        if (!RESERVATION_ELIGIBLE_STATUSES.includes(current.status)) {
          return "conflict" as const;
        }
        if (!canMarkToday) {
          if (sessionYmd === todayYmd && current.planning.startTime > nowPlus15) {
            return "too_early" as const;
          }
          return "conflict" as const;
        }

        if (current.status === ReservationStatus.WAITLIST) {
          const sessionYmdForPack = formatYmdPrismaDate(new Date(current.sessionDate));
          const sessionDateLocal = parseYmdLocal(sessionYmdForPack);
          if (!sessionDateLocal) throw new Error(PACK_ERRORS.noPack);
          const selected = await preparePackForAdminPresenceDebit(tx, {
            memberId: current.memberId,
            memberPackId: current.member.packId,
            memberPackStartedAt: current.member.packStartedAt,
            courseSlug: current.planning.courseSlug,
            sessionDateDb: todayDb,
            sessionDateLocal,
            preferredPackId: current.debitedPackId,
          });
          await debitSelectedPackSession(tx, {
            memberId: current.memberId,
            pack: selected.pack,
            courseSlug: current.planning.courseSlug,
          });
          await tx.reservation.update({
            where: { id: reservationId },
            data: { debitedPackId: selected.pack.id },
          });
        }

        const claim = await tx.reservation.updateMany({
          where: {
            id: reservationId,
            sessionDate: todayDb,
            status: { in: RESERVATION_ELIGIBLE_STATUSES },
            planning: {
              startTime: { lte: nowPlus15 },
            },
          },
          data: { status: ReservationStatus.ATTENDED },
        });

        if (claim.count === 0) return "conflict" as const;
      }

      await ensureReservationAttendanceRecord(tx, reservationId);
      return "ok" as const;
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === PACK_ERRORS.noSessionsLeft) {
        return errorResponse(ERRORS.NO_SESSIONS_LEFT, 409);
      }
      if (error.message === PACK_ERRORS.noPack) {
        return errorResponse(ERRORS.NO_PACK, 409);
      }
      if (error.message === PACK_ERRORS.packExpired) {
        return errorResponse("Pack expiré à cette date", 409);
      }
      if (error.message === PACK_ERRORS.packInactive) {
        return errorResponse("Pack inactif", 409);
      }
      if (error.message === PACK_ERRORS.notAllowedCourse || error.message === PACK_ERRORS.packCategoryMismatch) {
        return errorResponse("Ce pack ne permet pas ce cours", 409);
      }
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2022") {
      return errorResponse(
        "Base de données non synchronisée : appliquez la migration Prisma (reservationId sur checkins).",
        500,
      );
    }
    throw error;
  }

  const early = responseForOutcome(outcome);
  if (early) return early;

  broadcastMemberBookingRefresh();
  return Response.json({ ok: true });
}
