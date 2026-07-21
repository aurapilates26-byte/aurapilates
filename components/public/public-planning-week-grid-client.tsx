"use client";

import { useEffect, useMemo, useState } from "react";
import { PlanningPeriodNotice } from "@/components/planning/planning-period-notice";
import { PlanningWeekGrid } from "@/components/planning/planning-week-grid";
import { buildPeriodDaySelectOptions } from "@/lib/planning-period-day-dates";
import { formatYmdLocal, parseYmdLocal, startOfLocalToday } from "@/lib/calendar-day";
import { courseLabel } from "@/lib/course-labels";
import { planningLevelBadgeClass } from "@/lib/planning-level-badge";
import {
  PLANNING_LEVEL_FORM_OPTIONS,
  planningLevelLabelFr,
} from "@/lib/planning-public-labels";
import { DEFAULT_STUDIO_BOOKING_RULES } from "@/lib/studio-booking-rules";
import { usePlanningPeriodStore } from "@/store/planning-period-store";
import type { AdminPlanningItem, PlanningPeriodConfig, PlanningPeriodEnriched } from "@/types/admin/planning";
import type { PublicPlanningDay, PublicPlanningTableRow } from "@/components/public/public-planning-tabs-client";

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
  "sans-cours": "Sans cours",
};

function formatWeekLabel(startYmd: string, endYmd: string): string {
  const start = parseYmdLocal(startYmd);
  const end = parseYmdLocal(endYmd);
  if (!start || !end) return "";
  const startPart = start.toLocaleDateString("fr-FR", { day: "numeric", month: "long" });
  const endPart = end.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  return `Semaine du ${startPart} au ${endPart}`;
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

function coachFromPublicRow(row: PublicPlanningTableRow): AdminPlanningItem["coach"] {
  if (!row.coachName || row.coachName === "Coach à confirmer") return null;
  const parts = row.coachName.trim().split(/\s+/);
  return {
    id: row.id,
    firstName: parts[0] ?? "",
    lastName: parts.slice(1).join(" "),
    imageUrl: row.coachImageUrl,
  };
}

function toGridItems(
  rows: PublicPlanningTableRow[],
  dayColumns: ReturnType<typeof buildPeriodDaySelectOptions>,
): AdminPlanningItem[] {
  const ymdByDay = new Map(dayColumns.map((column) => [column.dayOfWeek, column.sessionYmd]));

  return rows.map((row) => ({
    id: row.id,
    courseSlug: row.courseSlug,
    dayOfWeek: row.dayOfWeek,
    anchorSessionYmd: ymdByDay.get(row.dayOfWeek) ?? null,
    level: (row.level as AdminPlanningItem["level"]) ?? null,
    startTime: row.startTime,
    endTime: row.endTime,
    durationMinutes: row.durationMinutes,
    capacity: row.capacity,
    waitlistCapacity: row.waitlistCapacity,
    coach: coachFromPublicRow(row),
    createdAt: "",
    updatedAt: "",
  }));
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

  const gridItems = useMemo(
    () => toGridItems(filteredRows, dayColumns),
    [dayColumns, filteredRows],
  );

  const courseLabelBySlug = useMemo(() => {
    const map: Record<string, string> = { ...COURSE_FILTER_LABELS };
    for (const row of rows) {
      map[row.courseSlug] = row.courseTitle;
    }
    return map;
  }, [rows]);

  const gridPeriod = useMemo(
    (): PlanningPeriodConfig => ({
      bookingWindow: periodConfig.bookingWindow,
      periodStartYmd: periodConfig.periodStartYmd,
      periodEndYmd: periodConfig.periodEndYmd,
      periodLabel: periodConfig.periodLabel,
    }),
    [periodConfig],
  );

  const todayYmd = formatYmdLocal(startOfLocalToday());
  const hasPublishedSlots = rows.length > 0;

  if (dayColumns.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-brand-dark/60">
        Aucune période de planning active pour le moment.
      </p>
    );
  }

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
        <div className="min-w-[720px] rounded-2xl border border-brand-medium/20 bg-white shadow-sm">
          <PlanningWeekGrid
            period={gridPeriod}
            items={gridItems}
            courseLabelBySlug={courseLabelBySlug}
            renderSessionActions={() => null}
            levelLabelFor={(level) => {
              const raw = planningLevelLabelFr(level ?? undefined);
              return raw ? capitalizeFr(raw) : null;
            }}
            levelToneFor={(level) => planningLevelBadgeClass(level)}
            readOnly
            embedded
            renderEmptyDay={(column) => {
              if (column.dayOfWeek !== "SUN") return null;
              return (
                <div className="flex min-h-[120px] flex-col items-center justify-center rounded-lg border border-dashed border-brand-medium/20 px-2 py-6 text-center">
                  <p className="text-lg text-brand-dark/25" aria-hidden>
                    ♥
                  </p>
                  <p className="mt-1 text-[10px] text-brand-dark/50">Le studio est fermé</p>
                </div>
              );
            }}
          />
        </div>
      </div>

      {!hasPublishedSlots ? (
        <p className="text-center text-sm text-brand-dark/60">
          Le planning détaillé sera affiché dès que les créneaux seront publiés depuis l&apos;administration.
        </p>
      ) : null}
    </div>
  );
}
