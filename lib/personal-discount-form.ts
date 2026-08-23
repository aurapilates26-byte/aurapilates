import { computePersonalDiscountPreviewFromForm } from "@/lib/member-personal-discount";
import type { PersonalDiscountType } from "@/types/admin/pack-payment";

export type PersonalDiscountFormValues = {
  discountType: "NONE" | PersonalDiscountType;
  discountValue: string;
  discountReason: string;
};

export function validatePersonalDiscountForm(input: {
  discountType: "NONE" | PersonalDiscountType;
  discountValue: string;
  listPriceDinars: number | null;
}): string | null {
  if (input.discountType === "NONE") return null;
  const parsedDiscount = Number.parseInt(input.discountValue, 10);
  if (!Number.isFinite(parsedDiscount) || parsedDiscount <= 0) {
    return "La remise personnalisée doit être un entier positif.";
  }
  if (input.discountType === "PERCENT" && parsedDiscount > 100) {
    return "La remise en pourcentage doit être entre 1 et 100.";
  }
  if (
    input.discountType === "AMOUNT" &&
    input.listPriceDinars != null &&
    parsedDiscount > input.listPriceDinars
  ) {
    return "La remise ne peut pas dépasser le montant à encaisser.";
  }
  return null;
}

export function buildPersonalDiscountPayload(values: PersonalDiscountFormValues):
  | { type: PersonalDiscountType; value: number; reason?: string }
  | undefined {
  if (values.discountType === "NONE") return undefined;
  return {
    type: values.discountType,
    value: Number.parseInt(values.discountValue, 10),
    reason: values.discountReason.trim() || undefined,
  };
}

export function computePersonalDiscountPreviewForForm(
  listPriceDinars: number | null,
  discountType: "NONE" | PersonalDiscountType,
  discountValue: string,
) {
  return computePersonalDiscountPreviewFromForm(listPriceDinars, discountType, discountValue);
}
