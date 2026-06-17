import type { PackPaymentKind, PackPaymentMethod, PackPaymentSource } from "@prisma/client";

export type PersonalDiscountType = "PERCENT" | "AMOUNT";

export type PackPaymentDto = {
  id: string;
  memberId: string;
  memberName: string;
  packId: string;
  packName: string;
  /** Catégorie catalogue du pack (ex. Pilates reformer). */
  packCategory: string | null;
  amountDinars: number;
  listPriceDinars: number | null;
  packSaleTotalDinars: number | null;
  personalDiscountType: PersonalDiscountType | null;
  personalDiscountValue: number | null;
  personalDiscountDinars: number;
  paidAtYmd: string;
  source: PackPaymentSource;
  paymentKind: PackPaymentKind;
  paymentMethod: PackPaymentMethod | null;
  promotionId: string | null;
  promotionLabel: string | null;
  note: string | null;
  createdAt: string;
};

export type PackPaymentMonthSummary = {
  yearMonth: string;
  totalIncomeDinars: number;
  paymentCount: number;
};
