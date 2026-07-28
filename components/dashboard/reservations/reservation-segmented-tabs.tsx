"use client";

import type { ReservationsListTab } from "@/lib/reservation-display";
import { RESERVATION_TAB_LABELS } from "@/lib/reservation-display";
import type { ReservationHistoryCourseCount } from "@/lib/reservation-history-counts";
import { formatHistoryCourseBreakdown } from "@/lib/reservation-history-counts";

const tabBtnBase =
  "flex-1 rounded-lg px-2 py-2 text-center text-[11px] font-semibold transition sm:px-3 sm:text-xs md:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-medium/40";
const tabBtnActive = "border border-brand-medium/25 bg-white text-brand-dark shadow-sm";
const tabBtnIdle = "text-brand-dark/70 hover:bg-white/60 hover:text-brand-dark";

const DEFAULT_TAB_ORDER: readonly ReservationsListTab[] = ["upcoming", "history", "packs"];

type ReservationSegmentedTabsProps = {
  value: ReservationsListTab;
  onChange: (tab: ReservationsListTab) => void;
  ariaLabel?: string;
  className?: string;
  /** Onglets affichés (défaut : prochaines / historique / packs). */
  tabs?: readonly ReservationsListTab[];
  /** Nombre de séances / packs par onglet (affiché à côté du libellé). */
  counts?: Partial<Record<ReservationsListTab, number>>;
  /** Détail par cours pour l'onglet Historique (pack Reformer + Mat, etc.). */
  historyCourseBreakdown?: ReservationHistoryCourseCount[];
};

function TabCountBadge({ count, selected }: { count: number; selected: boolean }) {
  return (
    <span
      className={`ml-1.5 inline-flex min-w-[1.25rem] items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums ${
        selected ? "bg-brand-dark/10 text-brand-dark" : "bg-brand-dark/5 text-brand-dark/65"
      }`}
    >
      {count}
    </span>
  );
}

function TabLabelContent({
  tab,
  label,
  count,
  isSelected,
  historyCourseBreakdown,
}: {
  tab: ReservationsListTab;
  label: string;
  count: number | undefined;
  isSelected: boolean;
  historyCourseBreakdown?: ReservationHistoryCourseCount[];
}) {
  const countBadge = typeof count === "number" ? <TabCountBadge count={count} selected={isSelected} /> : null;
  const showBreakdown =
    tab === "history" && historyCourseBreakdown != null && historyCourseBreakdown.length >= 2;

  if (showBreakdown) {
    const breakdownText = formatHistoryCourseBreakdown(historyCourseBreakdown);
    return (
      <span className="flex flex-col items-center gap-0.5">
        <span className="inline-flex items-center justify-center">
          {label}
          {countBadge}
        </span>
        <span
          className={`text-[10px] font-medium leading-tight tabular-nums ${
            isSelected ? "text-brand-dark/75" : "text-brand-dark/55"
          }`}
        >
          {breakdownText}
        </span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center justify-center">
      {label}
      {countBadge}
    </span>
  );
}

export function ReservationSegmentedTabs({
  value,
  onChange,
  ariaLabel = "Affichage des réservations",
  className = "",
  tabs = DEFAULT_TAB_ORDER,
  counts,
  historyCourseBreakdown,
}: ReservationSegmentedTabsProps) {
  return (
    <div
      className={`flex rounded-xl border border-brand-medium/20 bg-zinc-50/80 p-1 ${className}`.trim()}
      role="tablist"
      aria-label={ariaLabel}
    >
      {tabs.map((tab) => {
        const isSelected = value === tab;
        const label = RESERVATION_TAB_LABELS[tab];
        const count = counts?.[tab];
        const breakdown = tab === "history" ? historyCourseBreakdown : undefined;
        const breakdownSuffix =
          breakdown && breakdown.length >= 2 ? ` — ${formatHistoryCourseBreakdown(breakdown)}` : "";
        const unit = tab === "packs" ? "pack" : "séance";
        const tabAriaLabel =
          typeof count === "number"
            ? `${label}, ${count} ${unit}${count > 1 ? "s" : ""}${breakdownSuffix}`
            : label;

        const labelContent = (
          <TabLabelContent
            tab={tab}
            label={label}
            count={count}
            isSelected={isSelected}
            historyCourseBreakdown={breakdown}
          />
        );

        if (isSelected) {
          return (
            <button
              key={tab}
              type="button"
              role="tab"
              className={`${tabBtnBase} ${tabBtnActive}`}
              onClick={() => onChange(tab)}
              aria-selected="true"
              aria-label={tabAriaLabel}
            >
              {labelContent}
            </button>
          );
        }

        return (
          <button
            key={tab}
            type="button"
            role="tab"
            className={`${tabBtnBase} ${tabBtnIdle}`}
            onClick={() => onChange(tab)}
            aria-selected="false"
            aria-label={tabAriaLabel}
          >
            {labelContent}
          </button>
        );
      })}
    </div>
  );
}
