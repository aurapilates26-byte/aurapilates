import {
  packPaymentMethodLabel,
  type PackPaymentMethodValue,
} from "@/lib/pack-payment-method";

const PAYMENT_METHOD_BADGE_CLASS: Record<PackPaymentMethodValue, string> = {
  CASH: "inline-flex rounded-full border border-emerald-300/80 bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-950",
  CHECK: "inline-flex rounded-full border border-violet-300/80 bg-violet-100 px-2.5 py-0.5 text-[11px] font-bold text-violet-950",
  TPE: "inline-flex rounded-full border border-sky-300/80 bg-sky-100 px-2.5 py-0.5 text-[11px] font-bold text-sky-950",
};

type PaymentMethodBadgeProps = {
  method: PackPaymentMethodValue | string | null | undefined;
  fallback?: string;
};

export function PaymentMethodBadge({ method, fallback = "—" }: PaymentMethodBadgeProps) {
  if (method !== "CASH" && method !== "CHECK" && method !== "TPE") {
    return <span className="text-xs text-brand-dark/35">{fallback}</span>;
  }

  return (
    <span className={PAYMENT_METHOD_BADGE_CLASS[method]}>{packPaymentMethodLabel(method)}</span>
  );
}
