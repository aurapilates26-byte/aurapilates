"use client";

import type { ReactNode } from "react";
import { planningSessionGridPillLayout } from "@/lib/badge-classes";
import { planningCourseCardToneClass } from "@/lib/planning-course-card-tone";
import { computePlanningCourseEnd } from "@/lib/planning-session-slot";

type PlanningGridSessionCardProps = {
  courseSlug: string;
  courseLabel: string;
  startTime: string;
  endTime: string;
  levelLabel?: string | null;
  levelToneClass?: string | null;
  coachName: string | null;
  durationMinutes: number;
  capacity: number;
  waitlistCapacity: number | null;
  actions?: ReactNode;
};

export function PlanningGridSessionCard({
  courseSlug,
  courseLabel,
  startTime,
  endTime,
  levelLabel,
  levelToneClass,
  coachName,
  durationMinutes,
  capacity,
  waitlistCapacity,
  actions,
}: PlanningGridSessionCardProps) {
  const surfaceClass = planningCourseCardToneClass(courseSlug);
  const resolvedEndTime = endTime || computePlanningCourseEnd(startTime, durationMinutes) || startTime;

  return (
    <article
      className={`flex min-w-0 flex-col overflow-hidden rounded-xl border p-2 shadow-sm transition-shadow hover:shadow-md ${surfaceClass}`}
    >
      <p
        className="truncate text-[11px] font-bold leading-tight text-brand-dark"
        title={courseLabel}
      >
        {courseLabel}
      </p>

      <p className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold leading-tight text-brand-dark tabular-nums sm:text-xs">
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0 text-brand-dark/55" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
          <circle cx="12" cy="12" r="8" />
          <path d="M12 8v4l2.5 2" />
        </svg>
        <span>
          {startTime}
          <span className="font-normal text-brand-dark/45"> – </span>
          {resolvedEndTime}
        </span>
      </p>

      <p className="mt-0.5 truncate text-[10px] leading-tight text-brand-dark/75" title={coachName ?? undefined}>
        {coachName ?? "—"}
      </p>

      <div className="mt-1.5 flex min-w-0 flex-wrap items-center gap-0.5">
        <span
          className={`${planningSessionGridPillLayout} max-w-full border-amber-300/70 bg-amber-100/80 text-amber-950`}
          title={`${capacity} places`}
        >
          {capacity} pl.
        </span>
        {waitlistCapacity !== null && waitlistCapacity > 0 ? (
          <span
            className={`${planningSessionGridPillLayout} max-w-full border-orange-300/70 bg-orange-100/80 text-orange-950`}
            title={`${waitlistCapacity} en attente`}
          >
            +{waitlistCapacity} att.
          </span>
        ) : null}
        {levelLabel && levelToneClass ? (
          <span className={`${planningSessionGridPillLayout} max-w-full ${levelToneClass}`} title={levelLabel}>
            {levelLabel}
          </span>
        ) : null}
        <span
          className={`${planningSessionGridPillLayout} max-w-full border-brand-medium/25 bg-white/70 text-brand-dark/70`}
          title="Durée du cours"
        >
          {durationMinutes}′
        </span>
      </div>

      {actions ? (
        <div className="mt-1.5 flex items-center justify-end gap-0.5 border-t border-black/5 pt-1.5">
          {actions}
        </div>
      ) : null}
    </article>
  );
}
