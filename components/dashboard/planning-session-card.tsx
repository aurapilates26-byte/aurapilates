"use client";

import type { ReactNode } from "react";
import { planningSessionPillLayout } from "@/lib/badge-classes";
import { publicPanelSurfaceClass } from "@/lib/public-panel-surface";

type PlanningLevelPillProps = {
  levelLabel: string;
  levelToneClass: string;
  /** À true : préfixe « Niveau: » devant le libellé. Par défaut : étoile + libellé seul. */
  showNiveauPrefix?: boolean;
};

export function PlanningLevelPill({
  levelLabel,
  levelToneClass,
  showNiveauPrefix = false,
}: PlanningLevelPillProps) {
  return (
    <span
      className={`${planningSessionPillLayout} ${levelToneClass}`}
      aria-label={showNiveauPrefix ? undefined : `Niveau ${levelLabel}`}
    >
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0 fill-current" aria-hidden="true">
        <path d="M12 3l2.47 5 5.53.8-4 3.9.95 5.5L12 15.9 7.05 18.2 8 12.7 4 8.8 9.53 8z" />
      </svg>
      {showNiveauPrefix ? <>Niveau: {levelLabel}</> : levelLabel}
    </span>
  );
}

type PlanningSessionCardProps = {
  courseLabel: string;
  startTime: string;
  levelLabel: string;
  levelToneClass: string;
  coachName: string | null;
  coachImageUrl?: string | null;
  topRightActions?: ReactNode;
  statsBadges?: ReactNode;
  /**
   * `admin` : niveau sous le titre, pastilles stats seules en bas (planning admin).
   * `public` : mise en page d’origine du site public (inchangée).
   */
  variant?: "public" | "admin";
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
  variant = "public",
}: PlanningSessionCardProps) {
  const coachLine = (
    <div
      className={`inline-flex min-w-0 max-w-full flex-wrap items-center gap-1.5 text-xs text-brand-dark/70 sm:text-sm ${
        variant === "admin" ? "mt-2" : "mt-1"
      }`}
    >
      {coachImageUrl ? (
        <span className="h-7 w-7 shrink-0 overflow-hidden rounded-full border border-brand-medium/20 bg-white">
          <img src={coachImageUrl} alt="" className="h-full w-full object-cover" />
        </span>
      ) : null}
      <span className={variant === "admin" ? "min-w-0 break-words" : undefined}>
        {variant === "admin" ? (
          <>Coach : {coachName ?? "—"}</>
        ) : (
          <>Coach: {coachName ?? "—"}</>
        )}
      </span>
    </div>
  );

  if (variant === "admin") {
    return (
      <article
        className={`min-w-0 rounded-2xl border border-brand-medium/20 p-3 shadow-sm sm:p-4 ${publicPanelSurfaceClass}`}
      >
        <div className="min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="break-words text-sm font-semibold text-brand-dark sm:text-base">
                {courseLabel}
                <span className="font-semibold text-brand-dark/70">{` · ${startTime}`}</span>
              </p>
              <div className="mt-1.5">
                <PlanningLevelPill levelLabel={levelLabel} levelToneClass={levelToneClass} />
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">{topRightActions}</div>
          </div>
          {coachLine}
          {statsBadges ? (
            <div className="mt-2 flex w-full min-w-0 flex-wrap content-start items-center gap-2">
              {statsBadges}
            </div>
          ) : null}
        </div>
      </article>
    );
  }

  return (
    <article className={`rounded-2xl border border-brand-medium/20 p-3 shadow-sm sm:p-4 ${publicPanelSurfaceClass}`}>
      <div className="min-w-0">
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm font-semibold text-brand-dark sm:text-base">
            {courseLabel}
            <span className="font-semibold text-brand-dark/70">{` · ${startTime}`}</span>
          </p>
          <div className="flex shrink-0 items-center gap-2">{topRightActions}</div>
        </div>
        {coachLine}
        <div className="mt-2 flex flex-wrap items-center gap-2 md:flex-nowrap">
          <PlanningLevelPill levelLabel={levelLabel} levelToneClass={levelToneClass} />
          {statsBadges}
        </div>
      </div>
    </article>
  );
}
