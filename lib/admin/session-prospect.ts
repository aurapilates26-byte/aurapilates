import "server-only";

import type { PackPaymentMethod, Prisma } from "@prisma/client";
import { randomInt } from "crypto";
import { z } from "zod";
import { courseLabel } from "@/lib/course-labels";
import {
  formatYmdLocal,
  parseYmdLocal,
  parseYmdToPrismaDate,
} from "@/lib/calendar-day";
import { getAdminOperationalPlanningSlotsForDate } from "@/lib/admin/planning-operational-slots";
import { SESSION_PROSPECT_OCCUPYING_STATUSES } from "@/lib/admin/session-prospect-stats";
import { computeExpectedPackAmountForCreate, recordDepositOnMemberCreate } from "@/lib/admin/member-deposit";
import {
  computeProspectTrialPaymentAmount,
  resolveProspectTrialPack,
} from "@/lib/admin/prospect-trial-pack";
import {
  syncMemberPackBalancesFromReservations,
  activateSelectedPackOnSessionDate,
} from "@/lib/admin/member-pack-activation";
import {
  precomputePackPayment,
  recordAutoPackPaymentInTransaction,
} from "@/lib/admin/pack-payment";
import { resetMemberPackBalancesForPack } from "@/lib/admin/member-pack-renewal";
import { PACK_PAYMENT_METHODS } from "@/lib/pack-payment-method";
import { prisma } from "@/lib/prisma";
import { startOfLocalToday } from "@/lib/calendar-day";
import { computePersonalDiscountPreview } from "@/lib/member-personal-discount";

export const createSessionProspectSchema = z.object({
  planningId: z.string().trim().cuid(),
  sessionDate: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/),
  firstName: z.string().trim().min(2).max(80),
  lastName: z.string().trim().min(2).max(80),
  phone: z.string().trim().min(6).max(40),
});

export const convertSessionProspectSchema = z
  .object({
    email: z.preprocess(
      (v) => (v == null || v === "" ? undefined : String(v).trim()),
      z.string().email().optional(),
    ),
    firstName: z.string().trim().min(2).max(80),
    lastName: z.string().trim().min(2).max(80),
    phone: z.string().trim().min(6).max(40),
    birthDate: z.preprocess(
      (v) => (v == null || v === "" ? undefined : v),
      z.coerce.date().optional(),
    ),
    packId: z.string().trim().cuid(),
    qrId: z.preprocess(
      (v) => (v == null || v === "" ? undefined : String(v).trim()),
      z.string().trim().min(10).optional(),
    ),
    paymentMode: z.enum(["full", "deposit", "credit"]).default("full"),
    depositAmountDinars: z.number().int().positive().optional(),
    paymentMethod: z.enum(PACK_PAYMENT_METHODS).optional(),
    personalDiscount: z
      .object({
        type: z.enum(["PERCENT", "AMOUNT"]),
        value: z.number().int().positive(),
        reason: z.string().trim().max(160).optional(),
      })
      .optional(),
    note: z.string().trim().max(2000).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.paymentMode === "deposit") {
      if (data.depositAmountDinars == null) {
        ctx.addIssue({ code: "custom", message: "Indiquez le montant de l'acompte.", path: ["depositAmountDinars"] });
      }
      if (!data.paymentMethod) {
        ctx.addIssue({ code: "custom", message: "Indiquez le moyen de paiement.", path: ["paymentMethod"] });
      }
    } else if (data.paymentMode === "full" && !data.paymentMethod) {
      ctx.addIssue({ code: "custom", message: "Indiquez le moyen de paiement.", path: ["paymentMethod"] });
    }
  });

export const recordProspectTrialPaymentSchema = z.object({
  packId: z.string().trim().cuid(),
  paymentMethod: z.enum(PACK_PAYMENT_METHODS),
  personalDiscount: z
    .object({
      type: z.enum(["PERCENT", "AMOUNT"]),
      value: z.number().int().positive(),
      reason: z.string().trim().max(160).optional(),
    })
    .optional(),
});

function buildQrKey() {
  return String(randomInt(0, 10_000)).padStart(4, "0");
}

async function buildUniqueQrKey(tx: Prisma.TransactionClient) {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    const candidate = buildQrKey();
    const existing = await tx.qrCode.findFirst({
      where: { qrKey: candidate },
      select: { id: true },
    });
    if (!existing) return candidate;
  }
  throw new Error("QR_KEY_POOL_EXHAUSTED");
}

async function assertProspectCapacity(
  tx: Prisma.TransactionClient,
  input: { planningId: string; sessionDateDb: Date; capacity: number },
) {
  const [reservationCount, prospectCount] = await Promise.all([
    tx.reservation.count({
      where: {
        planningId: input.planningId,
        sessionDate: input.sessionDateDb,
        status: { in: ["BOOKED", "ATTENDED"] },
      },
    }),
    tx.sessionProspect.count({
      where: {
        planningId: input.planningId,
        sessionDate: input.sessionDateDb,
        status: { in: [...SESSION_PROSPECT_OCCUPYING_STATUSES] },
      },
    }),
  ]);

  if (reservationCount + prospectCount >= input.capacity) {
    throw new Error("FULL");
  }
}

export async function createSessionProspect(input: {
  planningId: string;
  sessionDate: string;
  firstName: string;
  lastName: string;
  phone: string;
  createdByUserId?: string;
}) {
  const sessionDateLocal = parseYmdLocal(input.sessionDate);
  const sessionDateDb = parseYmdToPrismaDate(input.sessionDate);
  if (!sessionDateLocal || !sessionDateDb) throw new Error("INVALID_DATE");

  const planning = (
    await getAdminOperationalPlanningSlotsForDate(input.sessionDate)
  ).find((row) => row.id === input.planningId);
  if (!planning) throw new Error("PLANNING_NOT_FOUND");

  return prisma.$transaction(async (tx) => {
    await assertProspectCapacity(tx, {
      planningId: planning.id,
      sessionDateDb,
      capacity: planning.capacity,
    });

    const prospect = await tx.sessionProspect.create({
      data: {
        planningId: planning.id,
        sessionDate: sessionDateDb,
        firstName: input.firstName,
        lastName: input.lastName,
        phone: input.phone,
        courseSlug: planning.courseSlug,
        createdByUserId: input.createdByUserId ?? null,
      },
    });

    return {
      id: prospect.id,
      planningId: prospect.planningId,
      sessionDate: input.sessionDate,
      firstName: prospect.firstName,
      lastName: prospect.lastName,
      phone: prospect.phone,
      courseSlug: prospect.courseSlug,
      courseLabel: courseLabel(prospect.courseSlug),
      status: prospect.status,
    };
  });
}

export async function convertSessionProspectToMember(input: {
  prospectId: string;
  adminUserId: string;
  body: z.infer<typeof convertSessionProspectSchema>;
}) {
  const prospect = await prisma.sessionProspect.findUnique({
    where: { id: input.prospectId },
    include: { planning: { select: { id: true, courseSlug: true } } },
  });
  if (!prospect) throw new Error("PROSPECT_NOT_FOUND");
  if (prospect.status !== "ACTIVE") throw new Error("PROSPECT_NOT_ACTIVE");

  const sessionDateYmd = formatYmdLocal(prospect.sessionDate);
  const sessionDateLocal = parseYmdLocal(sessionDateYmd);
  const sessionDateDb = parseYmdToPrismaDate(sessionDateYmd);
  if (!sessionDateLocal || !sessionDateDb) throw new Error("INVALID_DATE");

  if (input.body.email) {
    const existingUser = await prisma.user.findUnique({
      where: { email: input.body.email },
      select: { id: true },
    });
    if (existingUser) throw new Error("EMAIL_ALREADY_USED");
  }

  const selectedPack = await prisma.pack.findUnique({
    where: { id: input.body.packId },
    select: {
      id: true,
      isActive: true,
      durationDays: true,
      sessionCount: true,
      courseQuotas: { select: { courseSlug: true, sessionCount: true } },
    },
  });
  if (!selectedPack) throw new Error("PACK_NOT_FOUND");
  if (!selectedPack.isActive) throw new Error("PACK_INACTIVE");

  let qr: { id: string; publicId: string; assignedMemberId: string | null } | null = null;
  if (input.body.qrId) {
    const qrRow = await prisma.qrCode.findUnique({
      where: { publicId: input.body.qrId },
      select: { id: true, publicId: true, assignedMemberId: true },
    });
    if (!qrRow) throw new Error("QR_NOT_FOUND");
    if (qrRow.assignedMemberId) throw new Error("QR_ALREADY_ASSIGNED");
    qr = qrRow;
  }

  const paymentPrecomputed = await precomputePackPayment(input.body.packId, startOfLocalToday());
  if (!paymentPrecomputed) throw new Error("PACK_NO_PRICE");

  const personalDiscountInput = input.body.personalDiscount
    ? { type: input.body.personalDiscount.type, value: input.body.personalDiscount.value }
    : null;
  const expectedPackAmountDinars = computeExpectedPackAmountForCreate(
    paymentPrecomputed,
    personalDiscountInput,
  );

  const isDepositMode = input.body.paymentMode === "deposit";
  const isCreditMode = input.body.paymentMode === "credit";
  const hasOpenBalance = isDepositMode || isCreditMode;

  if (isDepositMode && input.body.depositAmountDinars == null) {
    throw new Error("DEPOSIT_REQUIRED");
  }
  if (isDepositMode && input.body.depositAmountDinars! >= expectedPackAmountDinars) {
    throw new Error("DEPOSIT_TOO_HIGH");
  }

  const result = await prisma.$transaction(async (tx) => {
    const freshProspect = await tx.sessionProspect.findUnique({
      where: { id: input.prospectId },
      select: { id: true, status: true, planningId: true, sessionDate: true },
    });
    if (!freshProspect || freshProspect.status !== "ACTIVE") {
      throw new Error("PROSPECT_NOT_ACTIVE");
    }

    let userId: string | null = null;
    if (input.body.email) {
      const user = await tx.user.create({
        data: {
          email: input.body.email,
          role: "MEMBRE",
          name: `${input.body.firstName} ${input.body.lastName}`.trim(),
        },
      });
      userId = user.id;
    }

    const member = await tx.member.create({
      data: {
        userId,
        firstName: input.body.firstName,
        lastName: input.body.lastName,
        phone: input.body.phone,
        birthDate: input.body.birthDate ?? null,
        packId: input.body.packId,
        packStartedAt: null,
        personalDiscountType: input.body.personalDiscount?.type ?? null,
        personalDiscountValue: input.body.personalDiscount?.value ?? null,
        personalDiscountReason: input.body.personalDiscount?.reason?.trim() || null,
        enrollmentStatus: isDepositMode ? "DEPOSIT_PENDING" : "ACTIVE",
        expectedPackAmountDinars: hasOpenBalance ? expectedPackAmountDinars : null,
        isActive: true,
        note: input.body.note?.trim() || `Convertie depuis prospect · séance ${sessionDateYmd}`,
      },
    });

    await resetMemberPackBalancesForPack(tx, { memberId: member.id, packId: input.body.packId });

    if (isDepositMode) {
      await recordDepositOnMemberCreate({
        tx,
        memberId: member.id,
        packId: input.body.packId,
        depositAmountDinars: input.body.depositAmountDinars!,
        expectedPackAmountDinars,
        recordedByUserId: input.adminUserId,
        precomputed: paymentPrecomputed,
        paymentMethod: input.body.paymentMethod!,
      });
    } else if (!isCreditMode) {
      await recordAutoPackPaymentInTransaction(tx, {
        memberId: member.id,
        packId: input.body.packId,
        recordedByUserId: input.adminUserId,
        precomputed: paymentPrecomputed,
        personalDiscount: personalDiscountInput,
        note: `Conversion prospect · séance ${sessionDateYmd}`,
        paymentKind: "FULL",
        paymentMethod: input.body.paymentMethod!,
      });
    }

    await activateSelectedPackOnSessionDate(tx, {
      memberId: member.id,
      packId: input.body.packId,
      memberPackId: input.body.packId,
      memberPackStartedAt: null,
      durationDays: selectedPack.durationDays,
      sessionDateDb,
      sessionDateLocal,
    });

    const reservation = await tx.reservation.create({
      data: {
        memberId: member.id,
        planningId: prospect.planningId,
        sessionDate: sessionDateDb,
        status: "ATTENDED",
        source: "ADMIN",
        createdByUserId: input.adminUserId,
        debitedPackId: input.body.packId,
      },
    });

    await syncMemberPackBalancesFromReservations(tx, member.id, selectedPack, sessionDateDb);

    await tx.sessionProspect.update({
      where: { id: input.prospectId },
      data: {
        status: "CONVERTED",
        convertedMemberId: member.id,
      },
    });

    if (qr) {
      await tx.qrCode.update({
        where: { id: qr.id },
        data: {
          assignedMemberId: member.id,
          assignedAt: new Date(),
          status: "ACTIVE",
        },
      });
    }

    return {
      memberId: member.id,
      reservationId: reservation.id,
      firstName: member.firstName,
      lastName: member.lastName,
    };
  });

  return result;
}

export async function recordSessionProspectTrialPayment(input: {
  prospectId: string;
  packId: string;
  paymentMethod: PackPaymentMethod;
  personalDiscount?: { type: "PERCENT" | "AMOUNT"; value: number; reason?: string };
}) {
  const prospect = await prisma.sessionProspect.findUnique({
    where: { id: input.prospectId },
  });
  if (!prospect) throw new Error("PROSPECT_NOT_FOUND");
  if (prospect.status === "CONVERTED") throw new Error("PROSPECT_ALREADY_CONVERTED");
  if (prospect.trialPaidAt) throw new Error("TRIAL_ALREADY_PAID");

  const trialPack = await resolveProspectTrialPack(prospect.courseSlug);
  if (trialPack.id !== input.packId) throw new Error("TRIAL_PACK_MISMATCH");

  const personalDiscountInput = input.personalDiscount
    ? { type: input.personalDiscount.type, value: input.personalDiscount.value }
    : null;
  const { amountDinars, listPriceDinars } = await computeProspectTrialPaymentAmount({
    packId: input.packId,
    personalDiscount: personalDiscountInput,
  });
  const discountPreview = personalDiscountInput
    ? computePersonalDiscountPreview(listPriceDinars, personalDiscountInput)
    : null;

  const updated = await prisma.sessionProspect.update({
    where: { id: input.prospectId },
    data: {
      status: "PAID_TRIAL",
      trialPackId: input.packId,
      trialListPriceDinars: listPriceDinars,
      trialPersonalDiscountType: input.personalDiscount?.type ?? null,
      trialPersonalDiscountValue: input.personalDiscount?.value ?? null,
      trialPersonalDiscountReason: input.personalDiscount?.reason?.trim() || null,
      trialPersonalDiscountDinars: discountPreview?.discount ?? 0,
      trialPaymentDinars: amountDinars,
      trialPaymentMethod: input.paymentMethod,
      trialPaidAt: new Date(),
    },
    include: {
      trialPack: { select: { id: true, name: true, category: true } },
    },
  });

  return {
    id: updated.id,
    firstName: updated.firstName,
    lastName: updated.lastName,
    phone: updated.phone,
    courseSlug: updated.courseSlug,
    courseLabel: courseLabel(updated.courseSlug),
    sessionDateYmd: formatYmdLocal(updated.sessionDate),
    packId: updated.trialPackId,
    packName: updated.trialPack?.name ?? null,
    listPriceDinars: updated.trialListPriceDinars,
    personalDiscountType: updated.trialPersonalDiscountType,
    personalDiscountValue: updated.trialPersonalDiscountValue,
    personalDiscountDinars: updated.trialPersonalDiscountDinars,
    amountDinars: updated.trialPaymentDinars!,
    paymentMethod: updated.trialPaymentMethod!,
    paidAtYmd: formatYmdLocal(updated.trialPaidAt!),
  };
}

export async function listProspectPaymentsForMonth(yearMonth: string): Promise<
  import("@/types/admin/prospect-payment").ProspectPaymentDto[]
> {
  const [y, m] = yearMonth.split("-").map(Number);
  const from = new Date(y, (m ?? 1) - 1, 1);
  const to = new Date(y, m ?? 1, 0, 23, 59, 59, 999);

  const rows = await prisma.sessionProspect.findMany({
    where: {
      status: "PAID_TRIAL",
      trialPaidAt: { gte: from, lte: to },
      trialPaymentDinars: { not: null },
      trialPaymentMethod: { not: null },
    },
    include: {
      trialPack: { select: { id: true, name: true, category: true } },
    },
    orderBy: [{ trialPaidAt: "desc" }],
  });

  return rows.map((r) => ({
    id: r.id,
    firstName: r.firstName,
    lastName: r.lastName,
    phone: r.phone,
    courseSlug: r.courseSlug,
    courseLabel: courseLabel(r.courseSlug),
    sessionDateYmd: formatYmdLocal(r.sessionDate),
    packId: r.trialPackId,
    packName: r.trialPack?.name ?? null,
    listPriceDinars: r.trialListPriceDinars,
    personalDiscountType: r.trialPersonalDiscountType,
    personalDiscountValue: r.trialPersonalDiscountValue,
    personalDiscountDinars: r.trialPersonalDiscountDinars,
    amountDinars: r.trialPaymentDinars!,
    paymentMethod: r.trialPaymentMethod!,
    paidAtYmd: formatYmdLocal(r.trialPaidAt!),
  }));
}

export async function sumProspectPaymentsForMonth(yearMonth: string): Promise<number> {
  const items = await listProspectPaymentsForMonth(yearMonth);
  return items.reduce((sum, p) => sum + p.amountDinars, 0);
}
