import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const CHECKIN_METHOD = "STAFF_ROSTER" as const;

export const LIVE_PRESENCE_MARKED_BY = {
  BOOKED: "STAFF_KEY:BOOKED",
  WAITLIST: "STAFF_KEY:WAITLIST",
  LEGACY: "STAFF_KEY",
} as const;

export function isLivePresenceMarkedBy(markedBy: string): boolean {
  return markedBy === "STAFF_KEY" || markedBy.startsWith("STAFF_KEY:");
}

function markedByForPreviousStatus(previousStatus?: "BOOKED" | "WAITLIST"): string {
  if (previousStatus === "WAITLIST") return LIVE_PRESENCE_MARKED_BY.WAITLIST;
  if (previousStatus === "BOOKED") return LIVE_PRESENCE_MARKED_BY.BOOKED;
  return LIVE_PRESENCE_MARKED_BY.LEGACY;
}

/** Crée Attendance (et CheckIn si QR) pour une réservation déjà ATTENDED. */
export async function ensureReservationAttendanceRecord(
  tx: Prisma.TransactionClient,
  reservationId: string,
  options?: { previousStatus?: "BOOKED" | "WAITLIST" },
): Promise<"ok" | "not_found" | "not_attended" | "already"> {
  const current = await tx.reservation.findUnique({
    where: { id: reservationId },
    select: {
      id: true,
      status: true,
      memberId: true,
      planningId: true,
      sessionDate: true,
      attendance: { select: { reservationId: true } },
    },
  });

  if (!current) return "not_found";
  if (current.status !== "ATTENDED") return "not_attended";
  if (current.attendance) return "already";

  const qr = await tx.qrCode.findFirst({
    where: { assignedMemberId: current.memberId },
    orderBy: { updatedAt: "desc" },
    select: { id: true },
  });

  if (qr) {
    await tx.checkIn.upsert({
      where: { reservationId },
      update: {},
      create: {
        memberId: current.memberId,
        qrCodeId: qr.id,
        method: CHECKIN_METHOD,
        reservationId,
      },
    });
  }

  await tx.attendance.upsert({
    where: { reservationId },
    update: {},
    create: {
      reservationId,
      memberId: current.memberId,
      planningId: current.planningId,
      sessionDate: current.sessionDate,
      markedBy: markedByForPreviousStatus(options?.previousStatus),
    },
  });

  return "ok";
}

export async function repairAttendedReservationsWithoutAttendance(
  reservationIds: string[],
): Promise<void> {
  if (reservationIds.length === 0) return;

  await prisma.$transaction(async (tx) => {
    for (const id of reservationIds) {
      await ensureReservationAttendanceRecord(tx, id);
    }
  });
}
