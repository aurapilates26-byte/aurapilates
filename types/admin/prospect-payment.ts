import type { PackPaymentMethod } from "@prisma/client";
import type { PersonalDiscountType } from "@/types/admin/pack-payment";

export type ProspectPaymentDto = {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  courseSlug: string;
  courseLabel: string;
  sessionDateYmd: string;
  packId: string | null;
  packName: string | null;
  listPriceDinars: number | null;
  personalDiscountType: PersonalDiscountType | null;
  personalDiscountValue: number | null;
  personalDiscountDinars: number;
  amountDinars: number;
  paymentMethod: PackPaymentMethod;
  paidAtYmd: string;
};
