"use client";

import type { ReservationsListTab } from "@/lib/reservation-display";
import { RESERVATION_TAB_LABELS } from "@/lib/reservation-display";

const tabBtnBase =
  "flex-1 rounded-lg px-3 py-2 text-center text-xs font-semibold transition sm:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-medium/40";
const tabBtnActive = "border border-brand-medium/25 bg-white text-brand-dark shadow-sm";
const tabBtnIdle = "text-brand-dark/70 hover:bg-white/60 hover:text-brand-dark";

type ReservationSegmentedTabsProps = {
  value: ReservationsListTab;
  onChange: (tab: ReservationsListTab) => void;
  ariaLabel?: string;
  className?: string;
};

export function ReservationSegmentedTabs({
  value,
  onChange,
  ariaLabel = "Affichage des réservations",
  className = "",
}: ReservationSegmentedTabsProps) {
  return (
    <div
      className={`flex rounded-xl border border-brand-medium/20 bg-zinc-50/80 p-1 ${className}`.trim()}
      role="tablist"
      aria-label={ariaLabel}
    >
      {(["upcoming", "history"] as const).map((tab) => {
        const isSelected = value === tab;
        const className = `${tabBtnBase} ${isSelected ? tabBtnActive : tabBtnIdle}`;
        const label = RESERVATION_TAB_LABELS[tab];

        if (isSelected) {
          return (
            <button
              key={tab}
              type="button"
              role="tab"
              className={className}
              onClick={() => onChange(tab)}
              aria-selected="true"
            >
              {label}
            </button>
          );
        }

        return (
          <button
            key={tab}
            type="button"
            role="tab"
            className={className}
            onClick={() => onChange(tab)}
            aria-selected="false"
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
