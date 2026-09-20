import "server-only";

import { Prisma } from "@prisma/client";
import { allocateConsumedSessionsAcrossMemberEnrollments } from "@/lib/admin/member-pack-enrollment";
import { listMemberOwnedPacks, syncBalancesFromOpenEnrollments } from "@/lib/admin/member-owned-packs";
import { startOfLocalToday } from "@/lib/calendar-day";
import { getEnrollmentPeriodBounds } from "@/lib/member-pack-enrollment-period";
import { creditMemberPackSession } from "@/lib/member-pack-session-ledger";
import { prisma } from "@/lib/prisma";

export function deleteMemberPackEnrollmentErrorMessage(code: string): string {
  if (code === "NOT_FOUND") return "Inscription pack introuvable.";
  if (code === "HAS_CONSUMED_SESSIONS") {
    return "Impossible de supprimer : des séances ont déjà été consommées sur ce pack.";
  }
  return "Suppression du pack impossible.";
}

export type DeleteMemberPackEnrollmentInput = {
  memberId: string;
  enrollmentId: string;
};

/** Paiements caisse liés à la vente (FULL, ou DEPOSIT + BALANCE). */
async function collectSalePaymentIds(
  tx: Prisma.TransactionClient,
  input: {
    memberId: string;
    packPaymentId: string | null;
  },
): Promise<string[]> {
  if (!input.packPaymentId) return [];

  const payment = await tx.packPayment.findUnique({
    where: { id: input.packPaymentId },
    select: {
      id: true,
      packId: true,
      paymentKind: true,
      packSaleTotalDinars: true,
      paidAt: true,
    },
  });
  if (!payment) return [];

  if (payment.packSaleTotalDinars != null && payment.paymentKind !== "FULL") {
    const related = await tx.packPayment.findMany({
      where: {
        memberId: input.memberId,
        packId: payment.packId,
        packSaleTotalDinars: payment.packSaleTotalDinars,
        paymentKind: { in: ["DEPOSIT", "BALANCE"] },
        ...(payment.paymentKind === "DEPOSIT" ? { paidAt: { gte: payment.paidAt } } : {}),
      },
      select: { id: true },
    });
    const ids = new Set(related.map((row) => row.id));
    ids.add(payment.id);
    return [...ids];
  }

  return [payment.id];
}

async function cancelFutureReservationsForPackPeriod(
  tx: Prisma.TransactionClient,
  input: {
    memberId: string;
    packId: string;
    periodStart: Date;
    periodEndExclusive: Date | null;
  },
): Promise<void> {
  const today = startOfLocalToday();
  const gte =
    input.periodStart.getTime() > today.getTime() ? input.periodStart : today;

  const reservations = await tx.reservation.findMany({
    where: {
      memberId: input.memberId,
      debitedPackId: input.packId,
      status: { in: ["BOOKED", "WAITLIST"] },
      sessionDate: {
        gte,
        ...(input.periodEndExclusive ? { lt: input.periodEndExclusive } : {}),
      },
    },
    select: {
      id: true,
      status: true,
      planning: { select: { courseSlug: true } },
      debitedPack: {
        select: {
          id: true,
          sessionCount: true,
          courseQuotas: { select: { courseSlug: true, sessionCount: true } },
        },
      },
    },
  });

  for (const reservation of reservations) {
    const wasBooked = reservation.status === "BOOKED";
    await tx.reservation.update({
      where: { id: reservation.id },
      data: {
        status: "CANCELLED",
        packRefundedAt: wasBooked ? new Date() : null,
      },
    });

    if (wasBooked && reservation.debitedPack) {
      await creditMemberPackSession(tx, {
        memberId: input.memberId,
        pack: reservation.debitedPack,
        courseSlug: reservation.planning.courseSlug,
      });
    }
  }
}

/**
 * Supprime une inscription pack + les encaissements caisse liés (PackPayment).
 * Refuse si des séances ont déjà été consommées **sur cette inscription**
 * (même attribution FIFO que l'affichage « 0 / 5 séances »).
 */
export async function deleteMemberPackEnrollment(
  input: DeleteMemberPackEnrollmentInput,
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const enrollment = await tx.memberPackEnrollment.findFirst({
      where: { id: input.enrollmentId, memberId: input.memberId },
      select: {
        id: true,
        packId: true,
        packPaymentId: true,
        purchasedAt: true,
        packStartedAt: true,
        closedAt: true,
        status: true,
        additionalSessionsCredit: true,
        pack: {
          select: {
            sessionCount: true,
            category: true,
            courseQuotas: { select: { courseSlug: true, sessionCount: true } },
          },
        },
      },
    });
    if (!enrollment) throw new Error("NOT_FOUND");

    // Toutes les inscriptions de l'adhérente : le FIFO doit voir le pack
    // précédent (ex. AURA START terminé 5/5) pour ne pas compter ses séances
    // sur le renouvellement « En attente » (0/5).
    const allEnrollmentsAsc = await tx.memberPackEnrollment.findMany({
      where: { memberId: input.memberId },
      orderBy: [{ purchasedAt: "asc" }, { createdAt: "asc" }],
      select: {
        id: true,
        packId: true,
        purchasedAt: true,
        packStartedAt: true,
        closedAt: true,
        status: true,
        additionalSessionsCredit: true,
        pack: {
          select: {
            sessionCount: true,
            category: true,
            courseQuotas: { select: { courseSlug: true, sessionCount: true } },
          },
        },
      },
    });

    const consumptionByEnrollment = await allocateConsumedSessionsAcrossMemberEnrollments({
      memberId: input.memberId,
      enrollmentsAsc: allEnrollmentsAsc,
      countingMode: "display",
      db: tx,
    });
    const consumed = consumptionByEnrollment.get(enrollment.id)?.consumedTotal ?? 0;
    if (consumed > 0) throw new Error("HAS_CONSUMED_SESSIONS");

    const { periodStart, periodEndExclusive } = getEnrollmentPeriodBounds(
      enrollment,
      allEnrollmentsAsc,
    );

    await cancelFutureReservationsForPackPeriod(tx, {
      memberId: input.memberId,
      packId: enrollment.packId,
      periodStart: periodStart ?? enrollment.purchasedAt,
      periodEndExclusive,
    });

    const paymentIds = await collectSalePaymentIds(tx, {
      memberId: input.memberId,
      packPaymentId: enrollment.packPaymentId,
    });

    // Détacher puis supprimer l'inscription avant les paiements (évite orphelins).
    await tx.memberPackEnrollment.delete({ where: { id: enrollment.id } });

    if (paymentIds.length > 0) {
      await tx.packPayment.deleteMany({
        where: { id: { in: paymentIds }, memberId: input.memberId },
      });
    }

    const remainingOpenForPack = await tx.memberPackEnrollment.count({
      where: {
        memberId: input.memberId,
        packId: enrollment.packId,
        status: { in: ["ACTIVE", "PENDING_START"] },
      },
    });
    if (remainingOpenForPack === 0) {
      await tx.memberPackBalance.deleteMany({
        where: { memberId: input.memberId, packId: enrollment.packId },
      });
      await tx.memberPendingPack.deleteMany({
        where: { memberId: input.memberId, packId: enrollment.packId },
      });
    }

    const member = await tx.member.findUnique({
      where: { id: input.memberId },
      select: { packId: true },
    });

    if (member?.packId === enrollment.packId) {
      const nextPrimary = await tx.memberPackEnrollment.findFirst({
        where: {
          memberId: input.memberId,
          status: { in: ["ACTIVE", "PENDING_START"] },
        },
        orderBy: [{ purchasedAt: "desc" }, { createdAt: "desc" }],
        select: { packId: true, packStartedAt: true },
      });

      if (nextPrimary) {
        await tx.member.update({
          where: { id: input.memberId },
          data: {
            packId: nextPrimary.packId,
            packStartedAt: nextPrimary.packStartedAt,
          },
        });
      } else {
        await tx.member.update({
          where: { id: input.memberId },
          data: {
            packId: null,
            packStartedAt: null,
            expectedPackAmountDinars: null,
            enrollmentStatus: "ACTIVE",
          },
        });
      }
    }
  });

  await syncBalancesFromOpenEnrollments(input.memberId);
}

export async function deleteMemberPackEnrollmentAndList(input: DeleteMemberPackEnrollmentInput) {
  await deleteMemberPackEnrollment(input);
  return listMemberOwnedPacks(input.memberId);
}
