"use client";

import type { ReactNode } from "react";

type PlanningSessionCardProps = {
  courseLabel: string;
  startTime: string;
  levelLabel: string;
  levelToneClass: string;
  coachName: string | null;
  coachImageUrl?: string | null;
  topRightActions?: ReactNode;
  statsBadges?: ReactNode;
};

export function PlanningSessionCard({
  courseLabel,
  startTime,
  levelLabel,
  levelToneClass,
  coachName,
  coachImageUrl,
  topRightActions,
  statsBadges,
}: PlanningSessionCardProps) {
  return (
    <article className="rounded-2xl border border-brand-medium/20 bg-white p-3 shadow-sm transition hover:bg-zinc-50/40 sm:p-4">
      <div className="min-w-0">
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm font-semibold text-brand-dark sm:text-base">
            {courseLabel}
            <span className="font-semibold text-brand-dark/70">{` · ${startTime}`}</span>
          </p>
          <div className="flex shrink-0 items-center gap-2">{topRightActions}</div>
        </div>
        <div className="mt-1 inline-flex items-center gap-1.5 text-xs text-brand-dark/70 sm:text-sm">
          <span className="h-7 w-7 overflow-hidden rounded-full border border-brand-medium/20 bg-white">
            {coachImageUrl ? (
              <img src={coachImageUrl} alt="Coach" className="h-full w-full object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-[10px] font-semibold text-brand-dark/50">—</span>
            )}
          </span>
          <span>Coach: {coachName ?? "—"}</span>
        </div>
        <div className="mt-1 text-xs text-brand-dark/70 sm:text-sm">
          <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold sm:text-xs ${levelToneClass}`}>
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current" aria-hidden="true">
              <path d="M12 3l2.47 5 5.53.8-4 3.9.95 5.5L12 15.9 7.05 18.2 8 12.7 4 8.8 9.53 8z" />
            </svg>
            Niveau: {levelLabel}
          </span>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2 md:flex-nowrap">{statsBadges}</div>
      </div>
    </article>
  );
}
