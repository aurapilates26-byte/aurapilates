"use client";

import { planningLevelDisplay } from "@/lib/planning-level-display";
import { formatPlanningDayShortFr } from "@/lib/planning-period-day-dates";
import type { AdminPlanningItem } from "@/types/admin/planning";

type PlanningYesterdayPresenceStripProps = {
  yesterdayYmd: string;
  items: AdminPlanningItem[];
  loading: boolean;
  courseLabelBySlug: Record<string, string>;
  onOpenPresence: (item: AdminPlanningItem) => void;
};

export function PlanningYesterdayPresenceStrip({
  yesterdayYmd,
  items,
  loading,
  courseLabelBySlug,
  onOpenPresence,
}: PlanningYesterdayPresenceStripProps) {
  return (
    <div className="shrink-0 border-b border-brand-medium/20 bg-brand-light/25 px-4 py-3 sm:px-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-brand-dark">
          Présences d&apos;hier — {formatPlanningDayShortFr(yesterdayYmd)}
        </p>
        <p className="text-xs text-brand-dark/55">Saisie depuis la période en cours</p>
      </div>

      {loading ? (
        <p className="mt-2 text-xs text-brand-dark/55">Chargement des séances d&apos;hier…</p>
      ) : items.length === 0 ? (
        <p className="mt-2 text-xs text-brand-dark/55">Aucune séance enregistrée pour hier.</p>
      ) : (
        <div className="mt-3 flex flex-wrap gap-2">
          {items.map((item) => {
            const levelDisplay = planningLevelDisplay(item.level);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onOpenPresence(item)}
                className="inline-flex max-w-full items-center gap-2 rounded-xl border border-brand-medium/25 bg-white px-3 py-2 text-left text-xs shadow-sm transition hover:border-brand-medium/40 hover:bg-brand-light/30"
              >
                <span className="font-semibold text-brand-dark">
                  {courseLabelBySlug[item.courseSlug] ?? item.courseSlug}
                </span>
                <span className="text-brand-dark/60">{item.startTime}</span>
                {levelDisplay ? (
                  <span className={`rounded-full px-2 py-0.5 text-[10px] ${levelDisplay.toneClass}`}>
                    {levelDisplay.label}
                  </span>
                ) : null}
                <span className="ml-1 font-semibold text-brand-dark/70">Présences</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
