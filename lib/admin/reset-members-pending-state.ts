import type { PrismaClient } from "@prisma/client";
import { resetMemberPackBalancesForPack } from "@/lib/admin/member-pack-renewal";

export type ResetMembersPendingOptions = {
  /** Ne pas écrire en base — affiche seulement le résumé. */
  dryRun?: boolean;
  /** Limiter à certains ids (sinon toutes les adhérentes avec pack). */
  memberIds?: string[];
  /** Supprimer les paiements AUTO liés au pack (dates héritées du backup). */
  clearAutoPackPayments?: boolean;
};

export type ResetMembersPendingResult = {
  membersTargeted: number;
  reservationsDeleted: number;
  attendancesDeleted: number;
  checkInsDeleted: number;
  autoPaymentsDeleted: number;
};

/**
 * Remet les adhérentes en attente (pack non démarré) pour reconstituer l'historique
 * via « Présences » dans le planning passé.
 *
 * - isActive → false, packStartedAt → null
 * - Supprime réservations / présences / check-ins importés
 * - Réinitialise les soldes pack au quota complet
 */
export async function resetMembersToPendingForHistoricalPresence(
  db: PrismaClient,
  options: ResetMembersPendingOptions = {},
): Promise<ResetMembersPendingResult> {
  const { dryRun = false, memberIds, clearAutoPackPayments = true } = options;

  const members = await db.member.findMany({
    where: {
      packId: { not: null },
      ...(memberIds?.length ? { id: { in: memberIds } } : {}),
    },
    select: { id: true, packId: true, firstName: true, lastName: true },
  });

  if (dryRun) {
    const [reservations, attendances, checkIns, autoPayments] = await Promise.all([
      db.reservation.count({ where: { memberId: { in: members.map((m) => m.id) } } }),
      db.attendance.count({ where: { memberId: { in: members.map((m) => m.id) } } }),
      db.checkIn.count({ where: { memberId: { in: members.map((m) => m.id) } } }),
      clearAutoPackPayments
        ? db.packPayment.count({
            where: { memberId: { in: members.map((m) => m.id) }, source: "AUTO" },
          })
        : Promise.resolve(0),
    ]);
    return {
      membersTargeted: members.length,
      reservationsDeleted: reservations,
      attendancesDeleted: attendances,
      checkInsDeleted: checkIns,
      autoPaymentsDeleted: autoPayments,
    };
  }

  let reservationsDeleted = 0;
  let attendancesDeleted = 0;
  let checkInsDeleted = 0;
  let autoPaymentsDeleted = 0;

  for (const member of members) {
    await db.$transaction(async (tx) => {
      const [checkInDel, attendanceDel, reservationDel] = await Promise.all([
        tx.checkIn.deleteMany({ where: { memberId: member.id } }),
        tx.attendance.deleteMany({ where: { memberId: member.id } }),
        tx.reservation.deleteMany({ where: { memberId: member.id } }),
      ]);
      checkInsDeleted += checkInDel.count;
      attendancesDeleted += attendanceDel.count;
      reservationsDeleted += reservationDel.count;

      if (clearAutoPackPayments) {
        const payDel = await tx.packPayment.deleteMany({
          where: { memberId: member.id, source: "AUTO" },
        });
        autoPaymentsDeleted += payDel.count;
      }

      await tx.member.update({
        where: { id: member.id },
        data: { isActive: false, packStartedAt: null },
      });

      if (member.packId) {
        await resetMemberPackBalancesForPack(tx, { memberId: member.id, packId: member.packId });
      }
    });
  }

  return {
    membersTargeted: members.length,
    reservationsDeleted,
    attendancesDeleted,
    checkInsDeleted,
    autoPaymentsDeleted,
  };
}
