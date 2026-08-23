import { computePersonalDiscountPreview, type PersonalDiscountLike } from "@/lib/member-personal-discount";

export type PackChangePriceSummary = {
  currentPaidDinars: number;
  currentPackName: string;
  newPackName: string;
  newListPriceDinars: number;
  newAmountBeforePersonalDinars: number;
  newFinalPriceDinars: number;
  personalDiscountDinars: number;
  differenceDinars: number;
};

export function buildPackChangePriceSummary(input: {
  currentPaidDinars: number;
  currentPackName: string;
  newPackName: string;
  newListPriceDinars: number | null;
  newAmountBeforePersonalDinars: number;
  personalDiscount: PersonalDiscountLike | null | undefined;
}): PackChangePriceSummary | null {
  if (input.newListPriceDinars == null) return null;

  const preview = computePersonalDiscountPreview(
    input.newAmountBeforePersonalDinars,
    input.personalDiscount,
  );
  const newFinalPriceDinars = preview?.final ?? input.newAmountBeforePersonalDinars;
  const personalDiscountDinars = preview?.discount ?? 0;

  return {
    currentPaidDinars: input.currentPaidDinars,
    currentPackName: input.currentPackName,
    newPackName: input.newPackName,
    newListPriceDinars: input.newListPriceDinars,
    newAmountBeforePersonalDinars: input.newAmountBeforePersonalDinars,
    newFinalPriceDinars,
    personalDiscountDinars,
    differenceDinars: newFinalPriceDinars - input.currentPaidDinars,
  };
}

export function formatPackChangeDifferenceLabel(differenceDinars: number): {
  label: string;
  detail: string;
  tone: "neutral" | "supplement" | "refund";
} {
  if (differenceDinars === 0) {
    return {
      label: "Aucun écart",
      detail: "Les deux montants sont identiques.",
      tone: "neutral",
    };
  }
  if (differenceDinars > 0) {
    return {
      label: `+${differenceDinars} DT`,
      detail: "Supplément à encaisser pour le nouveau pack.",
      tone: "supplement",
    };
  }
  return {
    label: `${differenceDinars} DT`,
    detail: "Montant à rembourser à l'adhérente.",
    tone: "refund",
  };
}
