import "server-only";

import { Prisma } from "@prisma/client";
import {
  countEnrollmentConsumedSessionsInPeriod,
} from "@/lib/admin/member-pack-enrollment";
import { listMemberOwnedPacks } from "@/lib/admin/member-owned-packs";
import { resetMemberPackBalancesForPack } from "@/lib/admin/member-pack-renewal";
import {
  isPackPaymentMethod,
  type PackPaymentMethodValue,
} from "@/lib/pack-payment-method";
import {
  precomputePackPayment,
  resolveFinalPackPaymentAmount,
  type PersonalDiscountInput,
} from "@/lib/admin/pack-payment";
import { prisma } from "@/lib/prisma";
import { normalizePackCategory } from "@/lib/pack-categories";

export function changeMemberPackEnrollmentErrorMessage(code: string): string {
  if (code === "NOT_FOUND") return "Inscription pack introuvable";
  if (code === "PACK_NOT_FOUND") return "Pack introuvable";
  if (code === "PACK_INACTIVE") return "Ce pack n'est plus actif";
  if (code === "CATEGORY_MISMATCH") {
    return "Le nouveau pack doit rester dans la même catégorie";
  }
  if (code === "INVALID_PAYMENT_METHOD") return "Mode de paiement invalide";
  if (code === "NO_CHANGE") return "Aucune modification";
  return "Modification impossible";
}

export type ChangeMemberPackEnrollmentInput = {
  memberId: string;
  enrollmentId: string;
  packId: string;
  paymentMethod?: PackPaymentMethodValue | null;
  personalDiscount?: PersonalDiscountInput & { reason?: string } | null;
};

function resolvePersonalDiscountInput(
  input: ChangeMemberPackEnrollmentInput,
  member: {
    personalDiscountType: PersonalDiscountInput["type"] | null;
    personalDiscountValue: number | null;
  } | null,
): PersonalDiscountInput | null {
  if (input.personalDiscount !== undefined) {
    return input.personalDiscount;
  }
  if (
    member?.personalDiscountType &&
    member.personalDiscountValue != null &&
    member.personalDiscountValue > 0
  ) {
    return {
      type: member.personalDiscountType,
      value: member.personalDiscountValue,
    };
  }
  return null;
}

export async function changeMemberPackEnrollment(input: ChangeMemberPackEnrollmentInput) {
  return prisma.$transaction(
    async (tx) => {
      const enrollment = await tx.memberPackEnrollment.findFirst({
        where: { id: input.enrollmentId, memberId: input.memberId },
        select: {
          id: true,
          packId: true,
          packPaymentId: true,
          packStartedAt: true,
          status: true,
          purchasedAt: true,
          closedAt: true,
          pack: {
            select: {
              sessionCount: true,
              courseQuotas: { select: { courseSlug: true, sessionCount: true } },
              category: true,
            },
          },
        },
      });
      if (!enrollment) throw new Error("NOT_FOUND");

      const siblingEnrollments = await tx.memberPackEnrollment.findMany({
        where: { memberId: input.memberId, packId: enrollment.packId },
        orderBy: [{ purchasedAt: "asc" }, { createdAt: "asc" }],
        select: {
          id: true,
          purchasedAt: true,
          packStartedAt: true,
          closedAt: true,
          status: true,
        },
      });
      const idx = siblingEnrollments.findIndex((e) => e.id === enrollment.id);
      const next = idx >= 0 ? siblingEnrollments[idx + 1] : null;
      const periodStart = enrollment.purchasedAt;
      const periodEndExclusive = next
        ? (next.packStartedAt ?? next.purchasedAt)
        : enrollment.closedAt;

      const consumed = await countEnrollmentConsumedSessionsInPeriod({
        memberId: input.memberId,
        packId: enrollment.packId,
        courseQuotas: enrollment.pack.courseQuotas,
        sessionCount: enrollment.pack.sessionCount,
        category: enrollment.pack.category,
        periodStart,
        periodEndExclusive,
      });
      const hasUsage = consumed > 0 || enrollment.packStartedAt != null;

      const newPack = await tx.pack.findUnique({
        where: { id: input.packId },
        select: {
          id: true,
          name: true,
          isActive: true,
          category: true,
          sessionCount: true,
          courseQuotas: { select: { courseSlug: true, sessionCount: true } },
        },
      });
      if (!newPack) throw new Error("PACK_NOT_FOUND");
      if (!newPack.isActive && newPack.id !== enrollment.packId) throw new Error("PACK_INACTIVE");

      const enrollmentCategory = normalizePackCategory(enrollment.pack.category ?? "");
      const newPackCategory = normalizePackCategory(newPack.category ?? "");
      if (enrollmentCategory !== newPackCategory) throw new Error("CATEGORY_MISMATCH");

      const paymentMethod =
        input.paymentMethod === undefined
          ? undefined
          : input.paymentMethod === null
            ? null
            : isPackPaymentMethod(input.paymentMethod)
              ? input.paymentMethod
              : (() => {
                  throw new Error("INVALID_PAYMENT_METHOD");
                })();

      const packChanged = enrollment.packId !== newPack.id;
      const discountTouched = input.personalDiscount !== undefined;
      const willTouchPayment =
        Boolean(enrollment.packPaymentId) &&
        (paymentMethod !== undefined || discountTouched || packChanged);
      if (!packChanged && !willTouchPayment) throw new Error("NO_CHANGE");

      const memberRow = await tx.member.findUnique({
        where: { id: input.memberId },
        select: {
          packId: true,
          personalDiscountType: true,
          personalDiscountValue: true,
        },
      });
      const personalDiscount = resolvePersonalDiscountInput(input, memberRow);

      if (discountTouched) {
        await tx.member.update({
          where: { id: input.memberId },
          data: input.personalDiscount
            ? {
                personalDiscountType: input.personalDiscount.type,
                personalDiscountValue: input.personalDiscount.value,
                personalDiscountReason: input.personalDiscount.reason?.trim() || null,
              }
            : {
                personalDiscountType: null,
                personalDiscountValue: null,
                personalDiscountReason: null,
              },
        });
      }

      const oldPackId = enrollment.packId;

      if (packChanged) {
        await tx.memberPackEnrollment.update({
          where: { id: enrollment.id },
          data: hasUsage
            ? { packId: newPack.id }
            : {
                packId: newPack.id,
                packStartedAt: null,
                packExpiresAt: null,
                status: "PENDING_START",
                closedAt: null,
              },
        });

        if (enrollment.packPaymentId) {
          const existingPayment = await tx.packPayment.findUnique({
            where: { id: enrollment.packPaymentId },
            select: {
              id: true,
              paymentKind: true,
              paidAt: true,
              note: true,
            },
          });

          const paymentUpdate: {
            packId: string;
            paymentMethod?: PackPaymentMethodValue | null;
            amountDinars?: number;
            listPriceDinars?: number | null;
            promotionId?: string | null;
            personalDiscountType?: PersonalDiscountInput["type"] | null;
            personalDiscountValue?: number | null;
            personalDiscountDinars?: number;
            packSaleTotalDinars?: number | null;
            note?: string | null;
          } = {
            packId: newPack.id,
            ...(paymentMethod !== undefined ? { paymentMethod } : {}),
          };

          if (existingPayment?.paymentKind === "FULL") {
            const precomputed = await precomputePackPayment(newPack.id, existingPayment.paidAt);
            if (precomputed) {
              const { amountDinars, personalDiscountDinars } = resolveFinalPackPaymentAmount(
                precomputed.resolved.amountDinars,
                personalDiscount,
              );
              paymentUpdate.amountDinars = amountDinars;
              paymentUpdate.listPriceDinars = precomputed.resolved.listPriceDinars;
              paymentUpdate.promotionId = precomputed.resolved.promotionId;
              paymentUpdate.personalDiscountType = personalDiscount?.type ?? null;
              paymentUpdate.personalDiscountValue = personalDiscount?.value ?? null;
              paymentUpdate.personalDiscountDinars = personalDiscountDinars;
              paymentUpdate.packSaleTotalDinars = null;
            }
          } else if (existingPayment?.paymentKind === "DEPOSIT" || existingPayment?.paymentKind === "BALANCE") {
            const precomputed = await precomputePackPayment(newPack.id, existingPayment.paidAt);
            if (precomputed?.resolved.listPriceDinars != null) {
              const { amountDinars } = resolveFinalPackPaymentAmount(
                precomputed.resolved.amountDinars,
                personalDiscount,
              );
              paymentUpdate.packSaleTotalDinars = amountDinars;
            }
          }

          const adjustmentNote = `Pack modifié : ${newPack.name}`;
          paymentUpdate.note = existingPayment?.note
            ? `${existingPayment.note} · ${adjustmentNote}`
            : adjustmentNote;

          await tx.packPayment.update({
            where: { id: enrollment.packPaymentId },
            data: paymentUpdate,
          });
        }

        const member = await tx.member.findUnique({
          where: { id: input.memberId },
          select: { packId: true, packStartedAt: true },
        });
        if (member?.packId === oldPackId || member?.packId === newPack.id) {
          await tx.member.update({
            where: { id: input.memberId },
            data: hasUsage
              ? { packId: newPack.id }
              : { packId: newPack.id, packStartedAt: null },
          });
        }

        if (hasUsage) {
          const sessionDateFilter =
            periodStart != null
              ? {
                  gte: periodStart,
                  ...(periodEndExclusive ? { lt: periodEndExclusive } : {}),
                }
              : undefined;

          await tx.reservation.updateMany({
            where: {
              memberId: input.memberId,
              debitedPackId: oldPackId,
              ...(sessionDateFilter ? { sessionDate: sessionDateFilter } : {}),
            },
            data: { debitedPackId: newPack.id },
          });

          await tx.memberPackBalance.updateMany({
            where: { memberId: input.memberId, packId: oldPackId },
            data: { packId: newPack.id },
          });
        } else {
          const otherOpenSameOldPack = await tx.memberPackEnrollment.count({
            where: {
              memberId: input.memberId,
              packId: oldPackId,
              id: { not: enrollment.id },
              status: { in: ["PENDING_START", "ACTIVE"] },
            },
          });
          if (otherOpenSameOldPack === 0) {
            await tx.memberPackBalance.deleteMany({
              where: { memberId: input.memberId, packId: oldPackId },
            });
          }

          await resetMemberPackBalancesForPack(tx, {
            memberId: input.memberId,
            packId: newPack.id,
          });
        }
      } else if (willTouchPayment && enrollment.packPaymentId) {
        const existingPayment = await tx.packPayment.findUnique({
          where: { id: enrollment.packPaymentId },
          select: {
            id: true,
            paymentKind: true,
            paidAt: true,
            note: true,
          },
        });

        const paymentUpdate: {
          paymentMethod?: PackPaymentMethodValue | null;
          amountDinars?: number;
          listPriceDinars?: number | null;
          promotionId?: string | null;
          personalDiscountType?: PersonalDiscountInput["type"] | null;
          personalDiscountValue?: number | null;
          personalDiscountDinars?: number;
          packSaleTotalDinars?: number | null;
        } = {
          ...(paymentMethod !== undefined ? { paymentMethod } : {}),
        };

        if (discountTouched && existingPayment?.paymentKind === "FULL") {
          const precomputed = await precomputePackPayment(newPack.id, existingPayment.paidAt);
          if (precomputed) {
            const { amountDinars, personalDiscountDinars } = resolveFinalPackPaymentAmount(
              precomputed.resolved.amountDinars,
              personalDiscount,
            );
            paymentUpdate.amountDinars = amountDinars;
            paymentUpdate.listPriceDinars = precomputed.resolved.listPriceDinars;
            paymentUpdate.promotionId = precomputed.resolved.promotionId;
            paymentUpdate.personalDiscountType = personalDiscount?.type ?? null;
            paymentUpdate.personalDiscountValue = personalDiscount?.value ?? null;
            paymentUpdate.personalDiscountDinars = personalDiscountDinars;
            paymentUpdate.packSaleTotalDinars = null;
          }
        }

        await tx.packPayment.update({
          where: { id: enrollment.packPaymentId },
          data: paymentUpdate,
        });
      }

      return { enrollmentId: enrollment.id, packId: newPack.id };
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      maxWait: 5000,
      timeout: 10000,
    },
  );
}

export async function changeMemberPackEnrollmentAndList(input: ChangeMemberPackEnrollmentInput) {
  await changeMemberPackEnrollment(input);
  const items = await listMemberOwnedPacks(input.memberId);
  return items;
}
