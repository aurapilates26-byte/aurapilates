import type { MemberCreateFormValues } from "@/components/dashboard/member-form/types";
import type { QrLookupStatus } from "@/components/dashboard/member-form/types";
import { validatePersonalDiscountForm } from "@/lib/personal-discount-form";

export function validateMemberCreateForm(input: {
  values: MemberCreateFormValues;
  qrStatus: QrLookupStatus;
  selectedPackListPriceDinars: number | null;
  createDiscountPreview: { final: number } | null;
}): string | null {
  const { values, qrStatus, selectedPackListPriceDinars, createDiscountPreview } = input;
  const trimmedQr = values.qrId.trim();

  if (!values.firstName.trim() || values.firstName.trim().length < 2) {
    return "Le prénom est obligatoire (2 caractères minimum).";
  }
  if (!values.lastName.trim() || values.lastName.trim().length < 2) {
    return "Le nom est obligatoire (2 caractères minimum).";
  }
  if (!values.phone.trim() || values.phone.trim().length < 6) {
    return "Le téléphone est obligatoire.";
  }
  if (!values.packCategory.trim()) {
    return "Veuillez choisir une catégorie de pack.";
  }
  if (!values.packId) {
    return "Veuillez choisir un pack.";
  }

  if (values.discountType !== "NONE") {
    const discountError = validatePersonalDiscountForm({
      discountType: values.discountType,
      discountValue: values.discountValue,
      listPriceDinars: selectedPackListPriceDinars,
    });
    if (discountError) return discountError;
  }

  if (values.paymentMode === "deposit") {
    const deposit = Number.parseInt(values.depositAmountDinars, 10);
    if (!Number.isFinite(deposit) || deposit <= 0) {
      return "Indiquez un montant d'acompte valide.";
    }
    const expectedTotal = createDiscountPreview?.final ?? selectedPackListPriceDinars ?? null;
    if (expectedTotal != null && deposit >= expectedTotal) {
      return "L'acompte doit être inférieur au montant total du pack.";
    }
  }

  if (trimmedQr && qrStatus === "ASSIGNED") {
    return "Ce QR code est déjà assigné à une adhérente.";
  }

  return null;
}

export function buildMemberCreateRequestBody(values: MemberCreateFormValues): Record<string, unknown> {
  const trimmedQr = values.qrId.trim();
  const body: Record<string, unknown> = {
    qrId: trimmedQr || undefined,
    email: values.email.trim() || undefined,
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    phone: values.phone.trim(),
    birthDate: values.birthDate || undefined,
    packId: values.packId,
    isActive: values.isActive,
    paymentMode: values.paymentMode,
  };

  if (values.paymentMode !== "credit") {
    body.paymentMethod = values.paymentMethod;
  }

  if (values.discountType !== "NONE") {
    body.personalDiscount = {
      type: values.discountType,
      value: Number.parseInt(values.discountValue, 10),
      reason: values.discountReason.trim() || undefined,
    };
  }

  if (values.paymentMode === "deposit") {
    body.depositAmountDinars = Number.parseInt(values.depositAmountDinars, 10);
  }

  const trimmedNote = values.note.trim();
  if (trimmedNote) {
    body.note = trimmedNote;
  }

  return body;
}
