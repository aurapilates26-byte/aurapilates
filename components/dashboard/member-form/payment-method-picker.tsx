"use client";

import {
  PACK_PAYMENT_METHODS,
  PACK_PAYMENT_METHOD_LABELS,
  type PackPaymentMethodValue,
} from "@/lib/pack-payment-method";

export function PaymentMethodPicker({
  value,
  onChange,
  label = "Moyen de paiement *",
}: {
  value: PackPaymentMethodValue;
  onChange: (method: PackPaymentMethodValue) => void;
  label?: string;
}) {
  return (
    <div>
      <p className="text-sm font-semibold text-brand-dark">{label}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {PACK_PAYMENT_METHODS.map((method) => (
          <button
            key={method}
            type="button"
            onClick={() => onChange(method)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
              value === method
                ? "bg-brand-dark text-white"
                : "border border-brand-medium/30 bg-white text-brand-dark"
            }`}
          >
            {PACK_PAYMENT_METHOD_LABELS[method]}
          </button>
        ))}
      </div>
    </div>
  );
}
