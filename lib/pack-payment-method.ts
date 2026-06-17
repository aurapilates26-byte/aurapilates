export const PACK_PAYMENT_METHODS = ["CASH", "CHECK", "TPE"] as const;

export type PackPaymentMethodValue = (typeof PACK_PAYMENT_METHODS)[number];

export const PACK_PAYMENT_METHOD_LABELS: Record<PackPaymentMethodValue, string> = {
  CASH: "Espèces",
  CHECK: "Chèque",
  TPE: "TPE",
};

export function packPaymentMethodLabel(method: PackPaymentMethodValue | string | null | undefined): string {
  if (method === "CASH" || method === "CHECK" || method === "TPE") {
    return PACK_PAYMENT_METHOD_LABELS[method];
  }
  return "—";
}

export function isPackPaymentMethod(value: string): value is PackPaymentMethodValue {
  return PACK_PAYMENT_METHODS.includes(value as PackPaymentMethodValue);
}
