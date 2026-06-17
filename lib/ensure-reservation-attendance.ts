import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const CHECKIN_METHOD = "STAFF_ROSTER" as const;
const ATTENDANCE_MARKED_BY = "STAFF_KEY" as const;

/** Crée Attendance (et CheckIn si QR) pour une réservation déjà ATTENDED. */
export async function ensureReservationAttendanceRecord(
  tx: Prisma.TransactionClient,
  reservationId: string,
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
      markedBy: ATTENDANCE_MARKED_BY,
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
