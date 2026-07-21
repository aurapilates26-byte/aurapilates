"use client";

import { useEffect, useMemo, useState } from "react";
import { PlanningPeriodNotice } from "@/components/planning/planning-period-notice";
import { buildPeriodDaySelectOptions } from "@/lib/planning-period-day-dates";
import { formatYmdLocal, parseYmdLocal, startOfLocalToday } from "@/lib/calendar-day";
import { courseLabel } from "@/lib/course-labels";
import {
  DAY_LABEL_FR,
  PLANNING_LEVEL_FORM_OPTIONS,
  planningLevelLabelFr,
} from "@/lib/planning-public-labels";
import { DEFAULT_STUDIO_BOOKING_RULES } from "@/lib/studio-booking-rules";
import { usePlanningPeriodStore } from "@/store/planning-period-store";
import type { PlanningPeriodEnriched } from "@/types/admin/planning";
import type { PublicPlanningDay, PublicPlanningTableRow } from "@/components/public/public-planning-tabs-client";
import styles from "@/components/public/public-planning-week-grid.module.css";

const DEFAULT_COURSE_FILTERS = [
  { value: "ALL", label: "Tous les cours" },
  { value: "pilates-reformer", label: "Reformer" },
  { value: "mat-pilates", label: "Mat Pilates" },
  { value: "cours-de-yoga", label: "Yoga" },
] as const;

function capitalizeFr(label: string): string {
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function filterBadgeClass(active: boolean): string {
  return `rounded-full px-4 py-1.5 text-sm font-medium transition ${
    active
      ? "bg-brand-dark text-white"
      : "border border-brand-dark/20 text-brand-dark hover:bg-brand-light/50"
  }`;
}

const COURSE_FILTER_LABELS: Record<string, string> = {
  "pilates-reformer": "Reformer",
  "mat-pilates": "Mat Pilates",
  "cours-de-yoga": "Yoga",
  "cours-de-dance": "Danse",
  "coaching-prive": "Coaching privé",
};

function formatWeekLabel(startYmd: string, endYmd: string): string {
  const start = parseYmdLocal(startYmd);
  const end = parseYmdLocal(endYmd);
  if (!start || !end) return "";
  const startPart = start.toLocaleDateString("fr-FR", { day: "numeric", month: "long" });
  const endPart = end.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  return `Semaine du ${startPart} au ${endPart}`;
}

function formatDayColumnParts(sessionYmd: string, dayOfWeek: PublicPlanningDay) {
  const date = parseYmdLocal(sessionYmd);
  if (!date) {
    return { weekday: DAY_LABEL_FR[dayOfWeek], dayMonth: "" };
  }
  const weekday = date.toLocaleDateString("fr-FR", { weekday: "long" });
  const dayMonth = date.toLocaleDateString("fr-FR", { day: "numeric", month: "long" });
  return {
    weekday: weekday.charAt(0).toUpperCase() + weekday.slice(1),
    dayMonth,
  };
}

function formatTimeFr(hhmm: string): string {
  const [h, m] = hhmm.split(":");
  if (!h || !m) return hhmm;
  return `${h}h${m}`;
}

function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
    </svg>
  );
}

function PublicGridSessionCard({ row }: { row: PublicPlanningTableRow }) {
  return (
    <article className="rounded-xl border border-brand-medium/20 bg-[#f7f4ef] px-3 py-2.5 shadow-sm">
      <p className="text-sm font-semibold leading-tight text-brand-dark">{row.courseTitle}</p>
      {row.levelLabel ? (
        <p className="mt-0.5 text-xs capitalize text-brand-dark/65">{row.levelLabel}</p>
      ) : null}
      <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-brand-dark/60">
        <span className="inline-flex items-center gap-1">
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
            <circle cx="12" cy="8" r="3" />
            <path d="M6 20c0-3 2.5-5 6-5s6 2 6 5" />
          </svg>
          {row.capacity}
        </span>
        <span className="inline-flex items-center gap-1">
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
            <circle cx="12" cy="12" r="8" />
            <path d="M12 8v4l2 2" />
          </svg>
          {row.durationMinutes} min
        </span>
      </div>
    </article>
  );
}

type PublicPlanningWeekGridClientProps = {
  rows: PublicPlanningTableRow[];
  initialPeriodConfig: PlanningPeriodEnriched;
};

export function PublicPlanningWeekGridClient({ rows, initialPeriodConfig }: PublicPlanningWeekGridClientProps) {
  const hydrate = usePlanningPeriodStore((s) => s.hydrate);
  const periodConfig = usePlanningPeriodStore((s) => s.config) ?? initialPeriodConfig;
  const [courseFilter, setCourseFilter] = useState<string>("ALL");
  const [levelFilter, setLevelFilter] = useState<string>("ALL");

  useEffect(() => {
    hydrate({ published: initialPeriodConfig, draft: null, bookingRules: DEFAULT_STUDIO_BOOKING_RULES });
  }, [hydrate, initialPeriodConfig]);

  const dayColumns = useMemo(
    () => buildPeriodDaySelectOptions(periodConfig.periodStartYmd, periodConfig.periodEndYmd),
    [periodConfig.periodEndYmd, periodConfig.periodStartYmd],
  );

  const courseFilters = useMemo(() => {
    if (rows.length === 0) {
      return [...DEFAULT_COURSE_FILTERS];
    }
    const slugs = [...new Set(rows.map((r) => r.courseSlug))];
    return [
      { value: "ALL", label: "Tous les cours" },
      ...slugs.map((slug) => ({
        value: slug,
        label: COURSE_FILTER_LABELS[slug] ?? courseLabel(slug),
      })),
    ];
  }, [rows]);

  const levelFilters = useMemo(() => {
    const levels = [...new Set(rows.map((r) => r.level).filter(Boolean))] as string[];
    if (levels.length === 0) {
      return [
        { value: "ALL", label: "Tous les niveaux" },
        ...PLANNING_LEVEL_FORM_OPTIONS.map((option) => ({
          value: option.value,
          label: capitalizeFr(option.label),
        })),
      ];
    }
    return [
      { value: "ALL", label: "Tous les niveaux" },
      ...levels.map((level) => {
        const row = rows.find((r) => r.level === level);
        const raw = row?.levelLabel ?? planningLevelLabelFr(level) ?? level;
        return { value: level, label: capitalizeFr(raw) };
      }),
    ];
  }, [rows]);

  const filteredRows = useMemo(
    () =>
      rows.filter((row) => {
        if (courseFilter !== "ALL" && row.courseSlug !== courseFilter) return false;
        if (levelFilter !== "ALL" && row.level !== levelFilter) return false;
        return true;
      }),
    [courseFilter, levelFilter, rows],
  );

  const timeSlots = useMemo(() => {
    const times = [...new Set(filteredRows.map((r) => r.startTime))];
    return times.sort((a, b) => a.localeCompare(b));
  }, [filteredRows]);

  const displayTimeSlots = timeSlots.length > 0 ? timeSlots : ["__empty__"];

  const sessionsByDayTime = useMemo(() => {
    const map = new Map<string, PublicPlanningTableRow[]>();
    for (const row of filteredRows) {
      const key = `${row.dayOfWeek}-${row.startTime}`;
      const list = map.get(key) ?? [];
      list.push(row);
      map.set(key, list);
    }
    return map;
  }, [filteredRows]);

  const closedDays = useMemo(() => {
    const closed = new Set<PublicPlanningDay>();
    for (const column of dayColumns) {
      const day = column.dayOfWeek as PublicPlanningDay;
      const hasSessions = filteredRows.some((row) => row.dayOfWeek === day);
      if (!hasSessions) closed.add(day);
    }
    return closed;
  }, [dayColumns, filteredRows]);

  const todayYmd = formatYmdLocal(startOfLocalToday());
  const hasPublishedSlots = rows.length > 0;

  if (dayColumns.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-brand-dark/60">
        Aucune période de planning active pour le moment.
      </p>
    );
  }

  const columnCount = Math.min(Math.max(dayColumns.length, 1), 7);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-brand-medium/25 bg-[#faf7f2] px-3 py-2 text-sm text-brand-dark sm:gap-3 sm:px-4">
          <button
            type="button"
            aria-label="Semaine précédente"
            className="flex h-7 w-7 items-center justify-center rounded-full text-brand-dark/50"
            disabled
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </button>
          <span className="text-xs font-medium sm:text-sm">
            {formatWeekLabel(periodConfig.periodStartYmd, periodConfig.periodEndYmd)}
          </span>
          <button
            type="button"
            aria-label="Semaine suivante"
            className="flex h-7 w-7 items-center justify-center rounded-full text-brand-dark/50"
            disabled
          >
            <ChevronRightIcon className="h-4 w-4" />
          </button>
        </div>
        <button
          type="button"
          className="inline-flex w-fit items-center justify-center rounded-full border border-brand-dark/25 px-4 py-1.5 text-sm font-medium text-brand-dark transition hover:bg-brand-light/60"
          onClick={() => {
            document.getElementById(`planning-col-${todayYmd}`)?.scrollIntoView({
              behavior: "smooth",
              inline: "center",
              block: "nearest",
            });
          }}
        >
          Aujourd&apos;hui
        </button>
      </div>

      <div className="flex flex-col items-center gap-4">
        <div className="flex flex-wrap justify-center gap-2">
          {courseFilters.map((filter) => (
            <button
              key={`course-${filter.value}`}
              type="button"
              onClick={() => setCourseFilter(filter.value)}
              className={filterBadgeClass(courseFilter === filter.value)}
            >
              {filter.label}
            </button>
          ))}
          {levelFilters.map((filter) => (
            <button
              key={`level-${filter.value}`}
              type="button"
              onClick={() => setLevelFilter(filter.value)}
              className={filterBadgeClass(levelFilter === filter.value)}
            >
              {filter.label}
            </button>
          ))}
        </div>
        <PlanningPeriodNotice config={periodConfig} variant="public" className="w-full max-w-3xl" />
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[960px]">
          <div
            className={`${styles.dayColumns} ${styles.headerRow}`}
            data-cols={columnCount}
            aria-label="Jours de la semaine"
          >
            <div />
            {dayColumns.map((column) => {
              const parts = formatDayColumnParts(column.sessionYmd, column.dayOfWeek as PublicPlanningDay);
              return (
                <div
                  key={column.sessionYmd}
                  id={`planning-col-${column.sessionYmd}`}
                  className={`text-center ${
                    column.sessionYmd === todayYmd ? "text-brand-dark" : "text-brand-dark/80"
                  }`}
                >
                  <p className="text-xs font-semibold sm:text-sm">{parts.weekday}</p>
                  <p className="mt-0.5 text-[11px] font-normal text-brand-dark/55 sm:text-xs">{parts.dayMonth}</p>
                </div>
              );
            })}
          </div>

          <div className={`${styles.dayColumns} ${styles.bodyRow}`} data-cols={columnCount}>
            <div className={styles.timeAxis}>
              {displayTimeSlots.map((time) => (
                <div key={time} className={styles.timeLabel}>
                  {time === "__empty__" ? null : formatTimeFr(time)}
                </div>
              ))}
            </div>
            {dayColumns.map((column) => {
              const day = column.dayOfWeek as PublicPlanningDay;

              if (closedDays.has(day)) {
                return (
                  <div key={column.sessionYmd} className={styles.closedDay}>
                    <div>
                      {day === "SUN" ? (
                        <>
                          <p className="text-lg text-brand-dark/25" aria-hidden>
                            ♥
                          </p>
                          <p className="mt-1 text-xs text-brand-dark/50">Le studio est fermé</p>
                        </>
                      ) : (
                        <p className="text-xs text-brand-dark/50">
                          {hasPublishedSlots ? "Aucune séance" : "Créneaux à venir"}
                        </p>
                      )}
                    </div>
                  </div>
                );
              }

              return (
                <div key={column.sessionYmd} className={styles.dayColumn}>
                  {displayTimeSlots.map((time) => {
                    if (time === "__empty__") {
                      return <div key={time} className={styles.slot} />;
                    }

                    const cellSessions = sessionsByDayTime.get(`${day}-${time}`) ?? [];

                    return (
                      <div key={time} className={styles.slot}>
                        {cellSessions.map((session) => (
                          <PublicGridSessionCard key={session.id} row={session} />
                        ))}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {!hasPublishedSlots ? (
            <p className={styles.emptyNotice}>
              Le planning détaillé sera affiché dès que les créneaux seront publiés depuis l&apos;administration.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
