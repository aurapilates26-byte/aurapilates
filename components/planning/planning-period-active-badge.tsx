"use client";

import { useEffect } from "react";
import { BOOKING_WINDOW_SHORT_FR } from "@/lib/planning-booking-window";
import { DEFAULT_STUDIO_BOOKING_RULES } from "@/lib/studio-booking-rules";
import { planningPeriodStatusLabelFr } from "@/lib/planning-period-status";
import { usePlanningPeriodStore } from "@/store/planning-period-store";
import type { PlanningPeriodEnriched } from "@/types/admin/planning";

type PlanningPeriodActiveBadgeProps = {
  /** Données SSR pour affichage immédiat (site public). */
  initialConfig?: PlanningPeriodEnriched | null;
  /** admin = /api/admin/planning-window ; public = /api/public/planning-period */
  source?: "admin" | "public";
  align?: "start" | "center";
  className?: string;
};

const badgeBase =
  "inline-flex max-w-full flex-wrap items-center gap-x-2 gap-y-1 rounded-full border px-3 py-1.5 text-xs font-medium leading-snug";

export function PlanningPeriodActiveBadge({
  initialConfig,
  source = "admin",
  align = "start",
  className = "",
}: PlanningPeriodActiveBadgeProps) {
  const config = usePlanningPeriodStore((s) => s.config);
  const isLoading = usePlanningPeriodStore((s) => s.isLoading);
  const loaded = usePlanningPeriodStore((s) => s.loaded);
  const hydrate = usePlanningPeriodStore((s) => s.hydrate);
  const fetchConfig = usePlanningPeriodStore((s) => s.fetchConfig);

  useEffect(() => {
    if (initialConfig) {
      hydrate({ published: initialConfig, draft: null, bookingRules: DEFAULT_STUDIO_BOOKING_RULES });
      return;
    }
    void fetchConfig({ source });
  }, [initialConfig, source, hydrate, fetchConfig]);

  const active = config ?? initialConfig;

  const wrapClass = align === "center" ? "flex justify-center px-1" : "";

  if (!active && isLoading) {
    return (
      <div className={wrapClass}>
        <span className={`${badgeBase} border-brand-medium/20 bg-zinc-50/90 text-brand-dark/55 ${className}`}>
          Chargement de la période…
        </span>
      </div>
    );
  }

  if (!active) {
    if (loaded) return null;
    return null;
  }

  const windowLabel = BOOKING_WINDOW_SHORT_FR[active.bookingWindow];
  const status = "status" in active ? active.status : "active";
  const statusLabel = planningPeriodStatusLabelFr(status);
  const badgeTone =
    status === "expired"
      ? "border-red-200/80 bg-red-50/90 text-red-950"
      : status === "upcoming"
        ? "border-amber-200/70 bg-amber-50/80 text-amber-950"
        : "border-brand-medium/25 bg-brand-light/80 text-brand-dark";

  return (
    <div className={wrapClass}>
      <span
        className={`${badgeBase} justify-center ${badgeTone} ${className}`}
        title={`${statusLabel} — ${windowLabel} — ${active.periodLabel}`}
      >
        <span className={status === "active" ? "text-brand-dark/70" : "opacity-80"}>{statusLabel} :</span>
        <span className="font-semibold">{active.periodLabel}</span>
        <span className="hidden text-brand-dark/50 sm:inline" aria-hidden="true">
          ·
        </span>
        <span className="text-brand-dark/65">{windowLabel}</span>
      </span>
    </div>
  );
}
