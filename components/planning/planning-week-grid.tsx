"use client";

import type { ReactNode } from "react";
import { PlanningGridSessionCard } from "@/components/planning/planning-grid-session-card";
import { buildPeriodDaySelectOptions, type PeriodDaySelectOption } from "@/lib/planning-period-day-dates";
import { formatPlanningColumnHeader } from "@/lib/planning-period-range-label";
import { formatYmdLocal, startOfLocalToday } from "@/lib/calendar-day";
import type { AdminPlanningItem, PlanningPeriodConfig } from "@/types/admin/planning";
import styles from "@/components/planning/planning-week-grid.module.css";

type PlanningWeekGridProps = {
  period: PlanningPeriodConfig;
  items: AdminPlanningItem[];
  courseLabelBySlug: Record<string, string>;
  renderSessionActions: (item: AdminPlanningItem) => ReactNode;
  levelLabelFor: (level: AdminPlanningItem["level"]) => string | null;
  levelToneFor: (level: AdminPlanningItem["level"]) => string | null;
  readOnly?: boolean;
  /** Page publique : hauteur naturelle, sans scroll interne. */
  embedded?: boolean;
  renderEmptyDay?: (column: PeriodDaySelectOption) => ReactNode | null;
};

export function PlanningWeekGrid({
  period,
  items,
  courseLabelBySlug,
  renderSessionActions,
  levelLabelFor,
  levelToneFor,
  readOnly = false,
  embedded = false,
  renderEmptyDay,
}: PlanningWeekGridProps) {
  const todayYmd = formatYmdLocal(startOfLocalToday());
  const dayColumns = buildPeriodDaySelectOptions(period.periodStartYmd, period.periodEndYmd);

  const itemsByDate = items.reduce<Map<string, AdminPlanningItem[]>>((map, item) => {
    const key = item.anchorSessionYmd ?? "";
    if (!key) return map;
    const list = map.get(key) ?? [];
    list.push(item);
    map.set(key, list);
    return map;
  }, new Map());

  if (dayColumns.length === 0) {
    return (
      <div className="px-5 py-10 text-center text-sm text-brand-dark/60">
        Aucun jour dans cette période.
      </div>
    );
  }

  const columnCount = Math.min(Math.max(dayColumns.length, 1), 7);

  return (
    <div className={embedded ? `${styles.planningWeekEmbedded} max-h-[min(70vh,720px)]` : "flex h-full min-h-0 flex-col"}>
      <div
        className={`${styles.planningWeekHeader} ${styles.planningDayColumns} gap-1 sm:gap-1.5`}
        data-cols={columnCount}
        aria-label="Jours de la semaine"
      >
        {dayColumns.map((column) => {
          const isToday = column.sessionYmd === todayYmd;
          return (
            <div
              key={`header-${column.sessionYmd}`}
              id={embedded ? `planning-col-${column.sessionYmd}` : undefined}
              className={`rounded-lg border px-1 py-1.5 text-center text-[10px] font-semibold leading-tight shadow-sm sm:text-[11px] ${
                isToday
                  ? "border-brand-dark/35 bg-brand-dark/5 text-brand-dark"
                  : "border-brand-medium/20 bg-brand-light/50 text-brand-dark/80"
              }`}
            >
              {formatPlanningColumnHeader(column.dayOfWeek, column.sessionYmd)}
            </div>
          );
        })}
      </div>

      <div className={embedded ? styles.planningWeekEmbeddedScroll : styles.planningWeekScrollViewport}>
        <div
          className={`${styles.planningDayColumns} gap-1 sm:gap-1.5 ${styles.planningWeekBody}`}
          data-cols={columnCount}
        >
          {dayColumns.map((column) => {
            const columnItems = (itemsByDate.get(column.sessionYmd) ?? []).sort((a, b) =>
              a.startTime.localeCompare(b.startTime),
            );

            const emptyContent = renderEmptyDay?.(column);

            return (
              <div key={column.sessionYmd} className="flex min-w-0 flex-col gap-1.5">
                {columnItems.length === 0 ? (
                  emptyContent ?? (
                    <div className="rounded-lg border border-dashed border-brand-medium/20 px-1 py-4 text-center text-[10px] leading-tight text-brand-dark/45">
                      Aucune séance
                    </div>
                  )
                ) : (
                  columnItems.map((item) => (
                    <PlanningGridSessionCard
                      key={item.id}
                      courseSlug={item.courseSlug}
                      courseLabel={courseLabelBySlug[item.courseSlug] ?? item.courseSlug}
                      startTime={item.startTime}
                      endTime={item.endTime}
                      levelLabel={levelLabelFor(item.level)}
                      levelToneClass={levelToneFor(item.level)}
                      coachName={item.coach ? `${item.coach.firstName} ${item.coach.lastName}` : null}
                      durationMinutes={item.durationMinutes}
                      capacity={item.capacity}
                      waitlistCapacity={item.waitlistCapacity}
                      actions={readOnly ? undefined : renderSessionActions(item)}
                    />
                  ))
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
