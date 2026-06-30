import {
  decidePackRenewal,
  getRemainingSessionsForPack,
  listMemberPendingPacks,
  type MemberPackState,
} from "@/lib/admin/member-pack-renewal";
import { sumPackPaymentsForMemberPack } from "@/lib/admin/pack-payment";
import { displayMemberEmail } from "@/lib/member-display-email";
import type { PackPaymentMethodValue } from "@/lib/pack-payment-method";
import { prisma } from "@/lib/prisma";
import { addPackDurationToStartDate } from "@/lib/pack-duration";

export type MemberPendingPackItem = {
  id: string;
  packId: string;
  packName: string;
  durationDays: string | null;
  position: number;
  createdAt: string;
};

export type MemberDetailData = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  email: string | null;
  birthDate: string | null;
  pack: { id: string; name: string; durationDays: string | null } | null;
  packStartedAt: string | null;
  packExpiresAt: string | null;
  packRemainingSessions: number;
  packPaymentMethod: PackPaymentMethodValue | null;
  depositPaymentMethod: PackPaymentMethodValue | null;
  pendingPacks: MemberPendingPackItem[];
  personalDiscount: { type: "PERCENT" | "AMOUNT"; value: number; reason: string | null } | null;
  note: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  qrCode: { qrId: string; qrKey: string | null; status: string; updatedAt: string } | null;
};

export type PackFormItem = {
  id: string;
  name: string;
  category: string | null;
  isActive: boolean;
  sessionCount: number | null;
  priceCents: number | null;
  durationDays: string | null;
  courseQuotas: { courseSlug: string; sessionCount: number }[];
};

function toIso(value: Date | null | undefined): string | null {
  if (!value) return null;
  return value.toISOString();
}

function mapMemberRecord(
  paymentTotals: {
    packPaymentMethod: PackPaymentMethodValue | null;
    depositPaymentMethod: PackPaymentMethodValue | null;
  },
  record: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    phone: string | null;
    birthDate: Date | null;
    packStartedAt: Date | null;
    personalDiscountType: "PERCENT" | "AMOUNT" | null;
    personalDiscountValue: number | null;
    personalDiscountReason: string | null;
    note: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    user: { email: string } | null;
    pack: {
      id: string;
      name: string;
      durationDays: string | null;
      sessionCount: number | null;
      courseQuotas: { courseSlug: string; sessionCount: number }[];
    } | null;
    packId: string | null;
    packBalances: { packId: string; courseSlug: string | null; remaining: number }[];
    assignedQrCodes: { publicId: string; qrKey: string; status: string; updatedAt: Date }[];
  },
  pendingPacks: MemberPendingPackItem[]
): MemberDetailData {
  const qr = record.assignedQrCodes[0] ?? null;
  const packExpiresAt =
    record.packStartedAt && record.pack?.durationDays
      ? addPackDurationToStartDate(record.packStartedAt, record.pack.durationDays)
      : null;

  const packState: MemberPackState = {
    packId: record.packId,
    packStartedAt: record.packStartedAt,
    durationDays: record.pack?.durationDays ?? null,
    sessionCount: record.pack?.sessionCount ?? null,
    courseQuotas: record.pack?.courseQuotas ?? [],
    balances: record.packBalances,
  };

  return {
    id: record.id,
    firstName: record.firstName,
    lastName: record.lastName,
    phone: record.phone,
    email: displayMemberEmail(record.user?.email ?? null),
    birthDate: toIso(record.birthDate),
    pack: record.pack
      ? { id: record.pack.id, name: record.pack.name, durationDays: record.pack.durationDays }
      : null,
    packStartedAt: toIso(record.packStartedAt),
    packExpiresAt: toIso(packExpiresAt),
    packRemainingSessions: getRemainingSessionsForPack(packState),
    packPaymentMethod: paymentTotals.packPaymentMethod,
    depositPaymentMethod: paymentTotals.depositPaymentMethod,
    pendingPacks,
    personalDiscount:
      record.personalDiscountType && record.personalDiscountValue != null
        ? {
            type: record.personalDiscountType,
            value: record.personalDiscountValue,
            reason: record.personalDiscountReason ?? null,
          }
        : null,
    note: record.note?.trim() || null,
    isActive: record.isActive,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
    qrCode: qr
      ? {
          qrId: qr.publicId,
          qrKey: qr.qrKey || null,
          status: qr.status,
          updatedAt: qr.updatedAt.toISOString(),
        }
      : null,
  };
}

export async function getMemberDetailById(id: string): Promise<MemberDetailData | null> {
  const [item, pendingRows] = await Promise.all([
    prisma.member.findUnique({
      where: { id },
      include: {
        user: { select: { email: true } },
        pack: {
          select: {
            id: true,
            name: true,
            durationDays: true,
            sessionCount: true,
            courseQuotas: { select: { courseSlug: true, sessionCount: true } },
          },
        },
        packBalances: { select: { packId: true, courseSlug: true, remaining: true } },
        assignedQrCodes: {
          orderBy: { updatedAt: "desc" },
          take: 1,
          select: { publicId: true, qrKey: true, status: true, updatedAt: true },
        },
      },
    }),
    listMemberPendingPacks(id),
  ]);

  if (!item) return null;

  const paymentTotals = item.packId
    ? await sumPackPaymentsForMemberPack(item.id, item.packId)
    : { packPaymentMethod: null, depositPaymentMethod: null, totalPaid: 0, depositPaid: 0 };

  const pendingPacks: MemberPendingPackItem[] = pendingRows.map((p) => ({
    id: p.id,
    packId: p.packId,
    packName: p.pack.name,
    durationDays: p.pack.durationDays,
    position: p.position,
    createdAt: p.createdAt.toISOString(),
  }));

  return mapMemberRecord(
    {
      packPaymentMethod: paymentTotals.packPaymentMethod,
      depositPaymentMethod: paymentTotals.depositPaymentMethod,
    },
    item,
    pendingPacks,
  );
}

/** Aperçu du comportement de renouvellement pour un pack donné. */
export async function getPackRenewalPreview(memberId: string, newPackId: string) {
  const member = await prisma.member.findUnique({
    where: { id: memberId },
    select: {
      packId: true,
      packStartedAt: true,
      pack: {
        select: {
          durationDays: true,
          sessionCount: true,
          courseQuotas: { select: { courseSlug: true, sessionCount: true } },
        },
      },
      packBalances: { select: { packId: true, courseSlug: true, remaining: true } },
    },
  });
  if (!member) return null;

  const newPack = await prisma.pack.findUnique({
    where: { id: newPackId },
    select: { id: true, name: true, isActive: true },
  });
  if (!newPack) return null;

  const state: MemberPackState = {
    packId: member.packId,
    packStartedAt: member.packStartedAt,
    durationDays: member.pack?.durationDays ?? null,
    sessionCount: member.pack?.sessionCount ?? null,
    courseQuotas: member.pack?.courseQuotas ?? [],
    balances: member.packBalances,
  };

  const decision = decidePackRenewal(state);

  return {
    newPackName: newPack.name,
    mode: decision.mode,
    remainingSessions: decision.remainingSessions,
    isExpired: decision.isExpired,
  };
}

export async function getAdminPacksForForm(): Promise<PackFormItem[]> {
  const items = await prisma.pack.findMany({
    orderBy: [{ isActive: "desc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      category: true,
      isActive: true,
      sessionCount: true,
      priceCents: true,
      durationDays: true,
      courseQuotas: { select: { courseSlug: true, sessionCount: true } },
    },
  });

  return items.map((p) => ({
    id: p.id,
    name: p.name,
    category: p.category,
    isActive: p.isActive,
    sessionCount: p.sessionCount,
    priceCents: p.priceCents,
    durationDays: p.durationDays,
    courseQuotas: p.courseQuotas,
  }));
}
