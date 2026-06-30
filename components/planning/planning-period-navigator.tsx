"use client";

import type { ReactNode } from "react";
import type { PlanningGridNavSlot } from "@/types/admin/planning";
import { formatPlanningPeriodRangeCompactFr } from "@/lib/planning-period-range-label";

type PlanningPeriodNavigatorProps = {
  slot: PlanningGridNavSlot | null;
  canGoPrevious: boolean;
  canGoNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
  center?: ReactNode;
};

function scopeBadgeLabel(slot: PlanningGridNavSlot): string | null {
  if (slot.kind === "published") return "Période en cours";
  if (slot.kind === "draft") return "Prochaine période · brouillon";
  return "Historique";
}

export function PlanningPeriodNavigator({
  slot,
  canGoPrevious,
  canGoNext,
  onPrevious,
  onNext,
  center,
}: PlanningPeriodNavigatorProps) {
  const badge = slot ? scopeBadgeLabel(slot) : null;
  const rangeLabel = slot
    ? formatPlanningPeriodRangeCompactFr(slot.period.periodStartYmd, slot.period.periodEndYmd)
    : "—";

  return (
    <div className="flex min-w-0 items-center gap-2 sm:gap-3">
      <div className="min-w-0 shrink-0 sm:max-w-[11rem] md:max-w-[13rem]">
        {badge ? (
          <p className="truncate text-[10px] font-medium uppercase tracking-wide text-brand-dark/55 sm:text-xs">
            {badge}
          </p>
        ) : null}
        <p className="truncate text-sm font-semibold capitalize text-brand-dark sm:text-base md:text-lg">
          {rangeLabel}
        </p>
      </div>

      {center ? (
        <div className="flex min-w-0 flex-1 items-center justify-center px-1 sm:px-2">{center}</div>
      ) : null}

      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
        <button
          type="button"
          onClick={onPrevious}
          disabled={!canGoPrevious}
          aria-label="Période précédente"
          title="Période précédente"
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-brand-medium/30 bg-white text-brand-dark transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40 sm:h-10 sm:w-10"
        >
          ←
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!canGoNext}
          aria-label="Période suivante"
          title="Période suivante"
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-brand-medium/30 bg-white text-brand-dark transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40 sm:h-10 sm:w-10"
        >
          →
        </button>
      </div>
    </div>
  );
}
