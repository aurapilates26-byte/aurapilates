import "server-only";

import type {
  PackPayment,
  PackPaymentKind,
  PackPaymentMethod,
  PackPaymentSource,
  PersonalDiscountType,
  Prisma,
} from "@prisma/client";
import { promotionInclude, toPromotionRecord } from "@/lib/admin/pack-promotion-scope";
import { createPackEnrollmentAfterPayment } from "@/lib/admin/member-pack-enrollment";
import {
  formatYmdLocal,
  formatYmdPrismaDate,
  parseYmdToPrismaDate,
  prismaDateInclusiveUtcRange,
  startOfLocalToday,
} from "@/lib/calendar-day";
import { prisma } from "@/lib/prisma";
import { resolvePackDisplayPrice, type PackPromotionRecord } from "@/lib/pack-pricing";
import type { PackPaymentDto } from "@/types/admin/pack-payment";

export type PackPaymentAmounts = {
  amountDinars: number;
  listPriceDinars: number | null;
  promotionId: string | null;
};

export type PersonalDiscountInput = {
  type: PersonalDiscountType;
  value: number;
};

export type CreatePackPaymentInput = {
  memberId: string;
  packId: string;
  paidAt?: Date;
  source: PackPaymentSource;
  note?: string | null;
  recordedByUserId?: string | null;
  /** Surcharge manuelle du montant (sinon calcul catalogue + promo active). */
  amountDinars?: number;
  promotionId?: string | null;
  /** Remise personnalisée optionnelle (ex. membre préférentiel). */
  personalDiscount?: PersonalDiscountInput | null;
  paymentKind?: PackPaymentKind;
  /** Total attendu pour la vente (acompte + solde). */
  packSaleTotalDinars?: number | null;
  paymentMethod?: PackPaymentMethod;
};

export type PackPaymentPrecomputed = {
  paidAt: Date;
  resolved: PackPaymentAmounts;
};

type PackPaymentWriter = Pick<typeof prisma, "packPayment">;

function computePersonalDiscountDinars(
  amountBeforePersonalDiscount: number,
  personalDiscount: PersonalDiscountInput | null | undefined,
): number {
  if (!personalDiscount) return 0;
  if (!Number.isInteger(personalDiscount.value) || personalDiscount.value <= 0) return 0;

  if (personalDiscount.type === "PERCENT") {
    return Math.min(amountBeforePersonalDiscount, Math.round((amountBeforePersonalDiscount * personalDiscount.value) / 100));
  }

  return Math.min(amountBeforePersonalDiscount, personalDiscount.value);
}

const packPaymentInclude = {
  member: {
    select: { firstName: true, lastName: true, expectedPackAmountDinars: true },
  },
  pack: { select: { name: true, category: true } },
  promotion: { select: { label: true } },
} satisfies Prisma.PackPaymentInclude;

type PackPaymentRow = PackPayment & {
  member: { firstName: string | null; lastName: string | null; expectedPackAmountDinars: number | null };
  pack: { name: string; category: string | null };
  promotion: { label: string | null } | null;
};

function memberDisplayName(firstName: string | null, lastName: string | null): string {
  return `${firstName ?? ""} ${lastName ?? ""}`.trim() || "Adhérente";
}

export async function loadPackPromotionRecords(): Promise<PackPromotionRecord[]> {
  const rows = await prisma.packPromotion.findMany({
    where: { isActive: true },
    include: promotionInclude,
  });
  return rows.map(toPromotionRecord);
}

/** Toutes les promos (rattrapage historique à la date d'achat). */
async function loadAllPackPromotionRecords(): Promise<PackPromotionRecord[]> {
  const rows = await prisma.packPromotion.findMany({
    include: promotionInclude,
    orderBy: { startsAt: "desc" },
  });
  return rows.map(toPromotionRecord);
}

function memberPaidAtDate(member: { packStartedAt: Date | null; createdAt: Date }): Date {
  if (member.packStartedAt) {
    return new Date(
      member.packStartedAt.getFullYear(),
      member.packStartedAt.getMonth(),
      member.packStartedAt.getDate(),
    );
  }
  return new Date(member.createdAt.getFullYear(), member.createdAt.getMonth(), member.createdAt.getDate());
}

/**
 * Adhérentes déjà en base avec un pack mais sans ligne pack_payments (créés avant les hooks).
 * Crée une vente AUTO : prix catalogue + remise valable à la date d'inscription.
 */
export async function syncMissingPackPaymentsFromMembers(): Promise<number> {
  const [members, promotions] = await Promise.all([
    prisma.member.findMany({
      where: {
        packId: { not: null },
        enrollmentStatus: "ACTIVE",
        packPayments: { none: {} },
      },
      select: {
        id: true,
        packId: true,
        packStartedAt: true,
        createdAt: true,
      },
    }),
    loadAllPackPromotionRecords(),
  ]);

  if (members.length === 0) return 0;

  const packIds = [...new Set(members.map((m) => m.packId!).filter(Boolean))];
  const packs = await prisma.pack.findMany({
    where: { id: { in: packIds } },
    select: { id: true, priceCents: true },
  });
  const packById = new Map(packs.map((p) => [p.id, p]));

  let created = 0;

  for (const member of members) {
    const packId = member.packId;
    if (!packId) continue;

    const pack = packById.get(packId);
    if (!pack?.priceCents) continue;

    const paidAt = memberPaidAtDate(member);
    const resolved = resolvePackPaymentAmounts(pack, promotions, paidAt);
    if (resolved.amountDinars <= 0) continue;

    await prisma.packPayment.create({
      data: {
        memberId: member.id,
        packId,
        amountDinars: resolved.amountDinars,
        listPriceDinars: resolved.listPriceDinars,
        paidAt,
        source: "AUTO",
        promotionId: resolved.promotionId,
        note: "Rattrapage — vente pack à l'inscription",
        recordedByUserId: null,
      },
    });
    created += 1;
  }

  return created;
}

/** Montants encaissement à partir du catalogue et des promos actives à la date de paiement. */
export function resolvePackPaymentAmounts(
  pack: { id: string; priceCents: number | null },
  promotions: PackPromotionRecord[],
  paidAt: Date = startOfLocalToday(),
): PackPaymentAmounts {
  const listPriceDinars = pack.priceCents;
  if (listPriceDinars == null) {
    return { amountDinars: 0, listPriceDinars: null, promotionId: null };
  }

  const pricing = resolvePackDisplayPrice({
    basePriceDinars: listPriceDinars,
    promotions,
    packId: pack.id,
    at: paidAt,
  });

  return {
    amountDinars: pricing.finalPriceDinars ?? listPriceDinars,
    listPriceDinars,
    promotionId: pricing.promotionLifecycle === "active" ? pricing.promotionId : null,
  };
}

export function serializePackPayment(row: PackPaymentRow): PackPaymentDto {
  const packSaleTotalDinars =
    row.packSaleTotalDinars ??
    (row.paymentKind === "DEPOSIT" || row.paymentKind === "BALANCE"
      ? row.member.expectedPackAmountDinars
      : null);

  return {
    id: row.id,
    memberId: row.memberId,
    memberName: memberDisplayName(row.member.firstName, row.member.lastName),
    packId: row.packId,
    packName: row.pack.name,
    packCategory: row.pack.category,
    amountDinars: row.amountDinars,
    listPriceDinars: row.listPriceDinars,
    packSaleTotalDinars,
    personalDiscountType: row.personalDiscountType,
    personalDiscountValue: row.personalDiscountValue,
    personalDiscountDinars: row.personalDiscountDinars,
    paidAtYmd: formatYmdPrismaDate(row.paidAt),
    source: row.source,
    paymentKind: row.paymentKind,
    paymentMethod: row.paymentMethod,
    promotionId: row.promotionId,
    promotionLabel: row.promotion?.label ?? null,
    note: row.note,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function precomputePackPayment(
  packId: string,
  paidAt: Date = startOfLocalToday(),
): Promise<PackPaymentPrecomputed | null> {
  const pack = await prisma.pack.findUnique({
    where: { id: packId },
    select: { id: true, priceCents: true },
  });
  if (!pack || pack.priceCents == null) return null;

  const promotions = await loadPackPromotionRecords();
  return {
    paidAt,
    resolved: resolvePackPaymentAmounts(pack, promotions, paidAt),
  };
}

function buildPackPaymentCreateData(
  input: CreatePackPaymentInput,
  paidAt: Date,
  resolved: PackPaymentAmounts,
): Prisma.PackPaymentUncheckedCreateInput {
  if (input.amountDinars != null && input.personalDiscount) {
    throw new Error("Montant manuel et remise personnalisée ne peuvent pas être combinés.");
  }

  const amountBeforePersonalDiscount = input.amountDinars ?? resolved.amountDinars;
  if (!Number.isInteger(amountBeforePersonalDiscount) || amountBeforePersonalDiscount < 0) {
    throw new Error("Montant invalide");
  }
  const personalDiscountDinars = computePersonalDiscountDinars(amountBeforePersonalDiscount, input.personalDiscount);
  const amountDinars = Math.max(0, amountBeforePersonalDiscount - personalDiscountDinars);

  return {
    memberId: input.memberId,
    packId: input.packId,
    amountDinars,
    listPriceDinars: resolved.listPriceDinars,
    packSaleTotalDinars: input.packSaleTotalDinars ?? null,
    personalDiscountType: input.personalDiscount?.type ?? null,
    personalDiscountValue: input.personalDiscount?.value ?? null,
    personalDiscountDinars,
    paidAt,
    source: input.source,
    paymentKind: input.paymentKind ?? "FULL",
    paymentMethod: input.paymentMethod,
    promotionId: input.promotionId !== undefined ? input.promotionId : resolved.promotionId,
    note: input.note?.trim() || null,
    recordedByUserId: input.recordedByUserId ?? null,
  };
}

/** Insertion dans une transaction (renew-pack, changement de pack, etc.). */
export async function insertPackPayment(
  db: PackPaymentWriter,
  input: CreatePackPaymentInput,
  precomputed: PackPaymentPrecomputed,
): Promise<string> {
  const data = buildPackPaymentCreateData(input, precomputed.paidAt, precomputed.resolved);
  const row = await db.packPayment.create({ data });
  return row.id;
}

/**
 * Enregistre un encaissement pack (entrée caisse).
 * Utilisé par la caisse manuelle et les hooks renew-pack / attribution.
 */
export async function createPackPayment(input: CreatePackPaymentInput): Promise<PackPaymentDto> {
  const paidAt = input.paidAt ?? startOfLocalToday();

  const pack = await prisma.pack.findUnique({
    where: { id: input.packId },
    select: { id: true, priceCents: true, isActive: true },
  });
  if (!pack) {
    throw new Error("Pack introuvable");
  }

  const member = await prisma.member.findUnique({
    where: { id: input.memberId },
    select: { id: true },
  });
  if (!member) {
    throw new Error("Adhérente introuvable");
  }

  const promotions = await loadPackPromotionRecords();
  const resolved = resolvePackPaymentAmounts(pack, promotions, paidAt);

  const row = await prisma.packPayment.create({
    data: buildPackPaymentCreateData(input, paidAt, resolved),
    include: packPaymentInclude,
  });

  return serializePackPayment(row);
}

/** Hook AUTO : renouvellement ou attribution de pack. */
export async function recordAutoPackPaymentInTransaction(
  tx: Prisma.TransactionClient,
  input: {
    memberId: string;
    packId: string;
    recordedByUserId: string;
    precomputed: PackPaymentPrecomputed;
    personalDiscount?: PersonalDiscountInput | null;
    note?: string | null;
    paymentKind?: PackPaymentKind;
    amountDinars?: number;
    packSaleTotalDinars?: number | null;
    paymentMethod?: PackPaymentMethod;
  },
): Promise<string> {
  const paymentKind: PackPaymentKind = input.paymentKind ?? "FULL";
  const paymentId = await insertPackPayment(
    tx,
    {
      memberId: input.memberId,
      packId: input.packId,
      source: "AUTO",
      recordedByUserId: input.recordedByUserId,
      personalDiscount: input.personalDiscount ?? null,
      note: input.note ?? null,
      paymentKind,
      amountDinars: input.amountDinars,
      packSaleTotalDinars: input.packSaleTotalDinars,
      paymentMethod: input.paymentMethod,
    },
    input.precomputed,
  );

  if (paymentKind !== "BALANCE") {
    await createPackEnrollmentAfterPayment(tx, {
      memberId: input.memberId,
      packId: input.packId,
      packPaymentId: paymentId,
      purchasedAt: input.precomputed.paidAt,
    });
  }

  return paymentId;
}

/** Met à jour le moyen de paiement sur tous les encaissements d'un pack adhérente. */
export async function updateMemberPackPaymentMethodsInTransaction(
  tx: Prisma.TransactionClient,
  memberId: string,
  packId: string,
  paymentMethod: PackPaymentMethod,
): Promise<void> {
  await tx.packPayment.updateMany({
    where: { memberId, packId },
    data: { paymentMethod },
  });
}

/** Montants déjà encaissés pour le pack en cours d'une adhérente. */
export async function sumPackPaymentsForMemberPack(
  memberId: string,
  packId: string,
): Promise<{
  totalPaid: number;
  depositPaid: number;
  depositPaymentMethod: PackPaymentMethod | null;
  packPaymentMethod: PackPaymentMethod | null;
}> {
  const rows = await prisma.packPayment.findMany({
    where: { memberId, packId },
    select: { amountDinars: true, paymentKind: true, paymentMethod: true },
  });
  let totalPaid = 0;
  let depositPaid = 0;
  let depositPaymentMethod: PackPaymentMethod | null = null;
  let fullPaymentMethod: PackPaymentMethod | null = null;
  let balancePaymentMethod: PackPaymentMethod | null = null;
  for (const row of rows) {
    totalPaid += row.amountDinars;
    if (row.paymentKind === "DEPOSIT") {
      depositPaid += row.amountDinars;
      depositPaymentMethod = row.paymentMethod;
    }
    if (row.paymentKind === "FULL") {
      fullPaymentMethod = row.paymentMethod;
    }
    if (row.paymentKind === "BALANCE") {
      balancePaymentMethod = row.paymentMethod;
    }
  }
  return {
    totalPaid,
    depositPaid,
    depositPaymentMethod,
    packPaymentMethod: fullPaymentMethod ?? balancePaymentMethod ?? depositPaymentMethod,
  };
}

export function yearMonthFromDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function parseYearMonth(yearMonth: string): { year: number; monthIndex: number } | null {
  const match = /^(\d{4})-(\d{2})$/.exec(yearMonth.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const monthIndex = Number(match[2]) - 1;
  if (!Number.isFinite(year) || monthIndex < 0 || monthIndex > 11) return null;
  return { year, monthIndex };
}

/** Bornes calendaires locales pour un mois YYYY-MM (inclusif). */
export function localMonthUtcRange(yearMonth: string): { from: Date; to: Date } | null {
  const parsed = parseYearMonth(yearMonth);
  if (!parsed) return null;
  const from = new Date(parsed.year, parsed.monthIndex, 1);
  const to = new Date(parsed.year, parsed.monthIndex + 1, 0);
  return { from, to };
}

export async function sumPackPaymentsForMonth(yearMonth: string): Promise<number> {
  const range = localMonthUtcRange(yearMonth);
  if (!range) return 0;

  const agg = await prisma.packPayment.aggregate({
    where: {
      paidAt: prismaDateInclusiveUtcRange(range.from, range.to),
    },
    _sum: { amountDinars: true },
  });
  return agg._sum.amountDinars ?? 0;
}

export async function listPackPaymentsForMonth(yearMonth: string): Promise<PackPaymentDto[]> {
  const range = localMonthUtcRange(yearMonth);
  if (!range) return [];
  return listPackPaymentsForDateRange(range.from, range.to);
}

export async function listPackPaymentsForDateRange(from: Date, to: Date): Promise<PackPaymentDto[]> {
  const rows = await prisma.packPayment.findMany({
    where: {
      paidAt: prismaDateInclusiveUtcRange(from, to),
    },
    orderBy: [{ paidAt: "desc" }, { createdAt: "desc" }],
    include: packPaymentInclude,
  });

  return rows.map(serializePackPayment);
}

export async function listPackPaymentsForMember(memberId: string): Promise<PackPaymentDto[]> {
  const rows = await prisma.packPayment.findMany({
    where: { memberId },
    orderBy: [{ paidAt: "desc" }, { createdAt: "desc" }],
    include: packPaymentInclude,
  });

  return rows.map(serializePackPayment);
}

/** Pour saisie manuelle avec date YYYY-MM-DD. */
export function parsePaidAtYmd(ymd: string): Date | null {
  return parseYmdToPrismaDate(ymd.trim());
}

export function paidAtYmdToday(): string {
  return formatYmdLocal(startOfLocalToday());
}
