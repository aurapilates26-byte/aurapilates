import { getServerSession } from "next-auth";
import { Prisma, ReservationStatus } from "@prisma/client";
import { z } from "zod";
import { authOptions } from "@/auth";
import {
  formatYmdLocal,
  formatYmdPrismaDate,
  parseYmdToPrismaDate,
  startOfLocalToday,
} from "@/lib/calendar-day";
import { broadcastMemberBookingRefresh } from "@/lib/member-booking-stream";
import { prisma } from "@/lib/prisma";

const RESERVATION_ELIGIBLE_STATUSES: ReservationStatus[] = [
  ReservationStatus.BOOKED,
  ReservationStatus.WAITLIST,
];

const CHECKIN_METHOD = "STAFF_ROSTER" as const;
const ATTENDANCE_MARKED_BY = "STAFF_KEY" as const;

const ERRORS = {
  FORBIDDEN: "Accès refusé",
  PAYLOAD_INVALID: "Données invalides",
  RESERVATION_NOT_FOUND: "Réservation introuvable",
  RESERVATION_CANCELLED: "Réservation annulée",
  RESERVATION_NOT_ELIGIBLE: "Statut non éligible",
  NO_QR_ASSIGNED: "Aucun QR code assigné à ce membre",
  TOO_EARLY: "Présence disponible 15 minutes avant le début du cours",
} as const;

const bodySchema = z.object({
  reservationId: z.string().trim().cuid(),
});

function errorResponse(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

type Outcome = "ok" | "already" | "not_found" | "cancelled" | "conflict" | "no_qr" | "too_early";

function responseForOutcome(outcome: Outcome): Response | null {
  if (outcome === "not_found") return errorResponse(ERRORS.RESERVATION_NOT_FOUND, 404);
  if (outcome === "cancelled") return errorResponse(ERRORS.RESERVATION_CANCELLED, 409);
  if (outcome === "no_qr") return errorResponse(ERRORS.NO_QR_ASSIGNED, 409);
  if (outcome === "too_early") return errorResponse(ERRORS.TOO_EARLY, 409);
  if (outcome === "already") return Response.json({ ok: true, alreadyMarked: true });
  if (outcome === "conflict") return errorResponse(ERRORS.RESERVATION_NOT_ELIGIBLE, 409);
  return null;
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
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
    /**
     * Claim atomique: un seul passage concurrent "gagne".
     * - Le gagnant obtient count=1 et continue.
     * - Les autres obtiennent count=0 et on sort rapidement, sans requêtes inutiles.
     */
    const claim = await tx.reservation.updateMany({
      where: {
        id: reservationId,
        sessionDate: todayDb,
        status: { in: RESERVATION_ELIGIBLE_STATUSES },
        planning: {
          // Ouverture présence 15 minutes avant le début du cours.
          startTime: { lte: nowPlus15 },
          endTime: { gte: nowTime },
        },
      },
      data: { status: ReservationStatus.ATTENDED },
    });

    if (claim.count === 0) {
      const current = await tx.reservation.findUnique({
        where: { id: reservationId },
        select: { status: true, sessionDate: true, planning: { select: { startTime: true, endTime: true } } },
      });
      if (!current) return "not_found" as const;
      if (current.status === "ATTENDED") return "already" as const;
      if (current.status === "CANCELLED") return "cancelled" as const;

      // Fenêtre non ouverte: même si la réservation est éligible, on est trop tôt (< début - 15min).
      if (
        (current.status === "BOOKED" || current.status === "WAITLIST") &&
        formatYmdPrismaDate(new Date(current.sessionDate)) === todayYmd &&
        current.planning &&
        current.planning.startTime > nowPlus15
      ) {
        return "too_early" as const;
      }
      return "conflict" as const;
    }

    const reservation = await tx.reservation.findUnique({
      where: { id: reservationId },
      select: {
        memberId: true,
        planningId: true,
        sessionDate: true,
      },
    });
    if (!reservation) return "not_found" as const;

    const qr = await tx.qrCode.findFirst({
      where: { assignedMemberId: reservation.memberId },
      orderBy: { updatedAt: "desc" },
      select: { id: true },
    });
    if (!qr) return "no_qr" as const;

      // Idempotent: si un CheckIn existe déjà pour cette réservation, on ne recrée rien.
      await tx.checkIn.upsert({
        where: { reservationId },
        update: {},
        create: {
          memberId: reservation.memberId,
          qrCodeId: qr.id,
          method: CHECKIN_METHOD,
          reservationId,
        },
      });

      await tx.attendance.upsert({
        where: { reservationId },
        update: {},
        create: {
          reservationId,
          memberId: reservation.memberId,
          planningId: reservation.planningId,
          sessionDate: reservation.sessionDate,
          markedBy: ATTENDANCE_MARKED_BY,
        },
      });

      return "ok" as const;
    });
  } catch (error) {
    // DB non migrée: la colonne reservationId (CheckIn) est absente.
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
