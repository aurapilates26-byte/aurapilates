import type { PersonalDiscountType } from "@/types/admin/pack-payment";

export type PersonalDiscountLike = {
  type: PersonalDiscountType;
  value: number;
};

export function computePersonalDiscountPreview(
  listPriceDinars: number | null,
  discount: PersonalDiscountLike | null | undefined,
): { base: number; discount: number; final: number } | null {
  if (listPriceDinars == null || !discount) return null;
  const base = Math.max(0, listPriceDinars);
  let discountDinars = 0;
  if (discount.type === "PERCENT") {
    discountDinars = Math.round((base * discount.value) / 100);
  } else {
    discountDinars = discount.value;
  }
  discountDinars = Math.max(0, Math.min(base, discountDinars));
  return { base, discount: discountDinars, final: Math.max(0, base - discountDinars) };
}

export function computePersonalDiscountPreviewFromForm(
  listPriceDinars: number | null,
  discountType: "NONE" | PersonalDiscountType,
  discountValue: string,
): { base: number; discount: number; final: number } | null {
  if (discountType === "NONE") return null;
  const parsed = Number.parseInt(discountValue, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return computePersonalDiscountPreview(listPriceDinars, { type: discountType, value: parsed });
}
