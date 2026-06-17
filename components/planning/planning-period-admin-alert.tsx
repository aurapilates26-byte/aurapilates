"use client";

import { Button } from "@/components/ui";
import { adminPeriodAlertMessageFr } from "@/lib/planning-period-status";
import { usePlanningPeriodStore } from "@/store/planning-period-store";

type PlanningPeriodAdminAlertProps = {
  onOpenPeriodForm?: () => void;
  onRenewed?: () => void;
  hideModifyButton?: boolean;
};

export function PlanningPeriodAdminAlert({
  onOpenPeriodForm,
  onRenewed,
  hideModifyButton = false,
}: PlanningPeriodAdminAlertProps) {
  const config = usePlanningPeriodStore((s) => s.config);
  const isSaving = usePlanningPeriodStore((s) => s.isSaving);
  const renewSuggestedPeriod = usePlanningPeriodStore((s) => s.renewSuggestedPeriod);

  if (!config) return null;

  const message = adminPeriodAlertMessageFr(config);
  if (!message) return null;

  const isExpired = config.status === "expired";
  const suggestion = config.suggestedRenewal;

  const handleRenew = async () => {
    if (!suggestion) {
      onOpenPeriodForm?.();
      return;
    }
    await renewSuggestedPeriod();
  };

  return (
    <div
      className={`rounded-xl border px-4 py-3 sm:px-5 ${
        isExpired
          ? "border-red-200/90 bg-red-50/90 text-red-950"
          : "border-amber-200/90 bg-amber-50/80 text-amber-950"
      }`}
      role="status"
    >
      <p className="text-sm leading-relaxed">{message}</p>
      {suggestion ? (
        <p className="mt-2 text-sm font-medium">
          Proposition : <span className="font-semibold">{suggestion.periodLabel}</span>
        </p>
      ) : null}
      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        {suggestion ? (
          <Button
            type="button"
            size="sm"
            className="w-full sm:w-auto"
            disabled={isSaving}
            onClick={() =>
              void handleRenew()
                .then(() => onRenewed?.())
                .catch(() => undefined)
            }
          >
            {isSaving ? "Préparation…" : "Préparer la période suivante (brouillon)"}
          </Button>
        ) : null}
        {onOpenPeriodForm && !hideModifyButton ? (
          <button
            type="button"
            onClick={onOpenPeriodForm}
            className="w-full rounded-full border border-current/25 bg-white/80 px-4 py-2 text-sm font-medium transition hover:bg-white sm:w-auto"
          >
            Modifier la période
          </button>
        ) : null}
      </div>
    </div>
  );
}
