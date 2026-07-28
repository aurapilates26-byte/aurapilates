import type { MemberEnrollmentStatus } from "@prisma/client";

/** Statut de paiement affiché / filtré dans la liste adhérentes. */
export type MemberPaymentStatus = "PAID" | "ADVANCE" | "CREDIT";

export const MEMBER_PAYMENT_STATUS_LABELS: Record<MemberPaymentStatus, string> = {
  PAID: "Payé",
  ADVANCE: "Avance",
  CREDIT: "Crédit",
};

/**
 * - Avance : acompte versé (`DEPOSIT_PENDING`) avec reste à payer.
 * - Crédit : aucun paiement encore (`ACTIVE`) — totalité du montant reste due.
 * - Payé : aucun reste.
 */
export function deriveMemberPaymentStatus(input: {
  enrollmentStatus: MemberEnrollmentStatus | "ACTIVE" | "DEPOSIT_PENDING";
  expectedPackAmountDinars: number | null;
  remainingDinars: number | null;
}): MemberPaymentStatus {
  const remaining =
    input.remainingDinars ??
    (input.expectedPackAmountDinars != null ? input.expectedPackAmountDinars : 0);

  if (remaining <= 0) return "PAID";
  if (input.enrollmentStatus === "DEPOSIT_PENDING") return "ADVANCE";
  return "CREDIT";
}
