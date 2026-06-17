import type { PackPaymentMethod, Prisma } from "@prisma/client";
import {
  precomputePackPayment,
  recordAutoPackPaymentInTransaction,
  sumPackPaymentsForMemberPack,
  type PersonalDiscountInput,
} from "@/lib/admin/pack-payment";
import { startOfLocalToday } from "@/lib/calendar-day";
import { prisma } from "@/lib/prisma";

function computeExpectedPackAmount(
  precomputed: NonNullable<Awaited<ReturnType<typeof precomputePackPayment>>>,
  personalDiscount: PersonalDiscountInput | null,
): number {
  let amount = precomputed.resolved.amountDinars;
  if (personalDiscount) {
    if (personalDiscount.type === "PERCENT") {
      amount = Math.max(0, amount - Math.round((amount * personalDiscount.value) / 100));
    } else {
      amount = Math.max(0, amount - personalDiscount.value);
    }
  }
  return amount;
}

export async function completeMemberDepositEnrollment(input: {
  memberId: string;
  qrId?: string;
  paymentMethod: PackPaymentMethod;
  recordedByUserId: string;
}) {
  const member = await prisma.member.findUnique({
    where: { id: input.memberId },
    select: {
      id: true,
      packId: true,
      enrollmentStatus: true,
      expectedPackAmountDinars: true,
      personalDiscountType: true,
      personalDiscountValue: true,
    },
  });

  if (!member) throw new Error("MEMBER_NOT_FOUND");
  if (member.enrollmentStatus !== "DEPOSIT_PENDING") {
    throw new Error("NOT_DEPOSIT_PENDING");
  }
  if (!member.packId || member.expectedPackAmountDinars == null) {
    throw new Error("INVALID_DEPOSIT_STATE");
  }

  const { totalPaid } = await sumPackPaymentsForMemberPack(member.id, member.packId);
  const remaining = member.expectedPackAmountDinars - totalPaid;
  if (remaining > 0) {
    const paymentPrecomputed = await precomputePackPayment(member.packId, startOfLocalToday());
    if (!paymentPrecomputed) throw new Error("PACK_NO_PRICE");

    await prisma.$transaction(async (tx) => {
      await recordAutoPackPaymentInTransaction(tx, {
        memberId: member.id,
        packId: member.packId!,
        recordedByUserId: input.recordedByUserId,
        precomputed: paymentPrecomputed,
        amountDinars: remaining,
        paymentKind: "BALANCE",
        packSaleTotalDinars: member.expectedPackAmountDinars,
        paymentMethod: input.paymentMethod,
        note: "Solde pack — finalisation de l'acompte",
      });

      if (input.qrId) {
        const qrRow = await tx.qrCode.findUnique({
          where: { publicId: input.qrId },
          select: { id: true, assignedMemberId: true },
        });
        if (!qrRow) throw new Error("QR_NOT_FOUND");
        if (qrRow.assignedMemberId && qrRow.assignedMemberId !== member.id) {
          throw new Error("QR_ALREADY_ASSIGNED");
        }
        await tx.qrCode.update({
          where: { id: qrRow.id },
          data: { assignedMemberId: member.id, assignedAt: new Date(), status: "ACTIVE" },
        });
      }

      await tx.member.update({
        where: { id: member.id },
        data: { enrollmentStatus: "ACTIVE" },
      });
    });
  } else {
    await prisma.$transaction(async (tx) => {
      if (input.qrId) {
        const qrRow = await tx.qrCode.findUnique({
          where: { publicId: input.qrId },
          select: { id: true, assignedMemberId: true },
        });
        if (!qrRow) throw new Error("QR_NOT_FOUND");
        if (qrRow.assignedMemberId && qrRow.assignedMemberId !== member.id) {
          throw new Error("QR_ALREADY_ASSIGNED");
        }
        await tx.qrCode.update({
          where: { id: qrRow.id },
          data: { assignedMemberId: member.id, assignedAt: new Date(), status: "ACTIVE" },
        });
      }
      await tx.member.update({
        where: { id: member.id },
        data: { enrollmentStatus: "ACTIVE" },
      });
    });
  }

  return prisma.member.findUnique({
    where: { id: member.id },
    include: {
      user: { select: { email: true } },
      pack: { select: { id: true, name: true, durationDays: true } },
      assignedQrCodes: {
        orderBy: { updatedAt: "desc" },
        take: 1,
        select: { publicId: true, qrKey: true, status: true, updatedAt: true },
      },
    },
  });
}

export function computeExpectedPackAmountForCreate(
  precomputed: NonNullable<Awaited<ReturnType<typeof precomputePackPayment>>>,
  personalDiscount: PersonalDiscountInput | null,
): number {
  return computeExpectedPackAmount(precomputed, personalDiscount);
}

export type CreateMemberDepositPaymentInput = {
  tx: Prisma.TransactionClient;
  memberId: string;
  packId: string;
  depositAmountDinars: number;
  expectedPackAmountDinars: number;
  recordedByUserId: string;
  precomputed: NonNullable<Awaited<ReturnType<typeof precomputePackPayment>>>;
  paymentMethod: PackPaymentMethod;
};

export async function recordDepositOnMemberCreate(input: CreateMemberDepositPaymentInput) {
  if (input.depositAmountDinars <= 0) {
    throw new Error("DEPOSIT_AMOUNT_INVALID");
  }
  if (input.depositAmountDinars >= input.expectedPackAmountDinars) {
    throw new Error("DEPOSIT_AMOUNT_TOO_HIGH");
  }

  await recordAutoPackPaymentInTransaction(input.tx, {
    memberId: input.memberId,
    packId: input.packId,
    recordedByUserId: input.recordedByUserId,
    precomputed: input.precomputed,
    amountDinars: input.depositAmountDinars,
    paymentKind: "DEPOSIT",
    packSaleTotalDinars: input.expectedPackAmountDinars,
    paymentMethod: input.paymentMethod,
    note: "Acompte à l'inscription",
  });
}
