"use client";

import type { ReactNode } from "react";
import { planningSessionGridPillLayout } from "@/lib/badge-classes";
import { planningCourseCardToneClass } from "@/lib/planning-course-card-tone";

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

      <p className="mt-0.5 truncate text-[10px] leading-tight text-brand-dark/75" title={coachName ?? undefined}>
        {coachName ?? "—"}
      </p>

      <p className="mt-0.5 text-[10px] font-medium leading-tight text-brand-dark/85">
        <span className="tabular-nums">{startTime}</span>
        <span className="text-brand-dark/50"> – </span>
        <span className="tabular-nums">{endTime}</span>
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
