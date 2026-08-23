import type { PackDisplayPricing } from "@/lib/pack-pricing";
import type { PersonalDiscountType } from "@/types/admin/pack-payment";
import type { PackPaymentMethodValue } from "@/lib/pack-payment-method";

export type MemberFormPackItem = {
  id: string;
  name: string;
  category: string | null;
  isActive: boolean;
  sessionCount?: number | null;
  durationDays?: string | null;
  priceCents?: number | null;
  pricing?: PackDisplayPricing;
  courseQuotas?: { courseSlug: string; sessionCount: number }[];
};

export type MemberCreateFormInitialValues = {
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  birthDate?: string;
  note?: string;
};

export type MemberCreateFormValues = {
  qrId: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  birthDate: string;
  packCategory: string;
  packId: string;
  isActive: boolean;
  discountType: "NONE" | PersonalDiscountType;
  discountValue: string;
  discountReason: string;
  paymentMode: "full" | "deposit" | "credit";
  depositAmountDinars: string;
  paymentMethod: PackPaymentMethodValue;
  note: string;
};

export type QrLookupStatus = "UNKNOWN" | "UNASSIGNED" | "ASSIGNED" | "NOT_FOUND";
