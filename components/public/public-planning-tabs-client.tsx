"use client";

import { useMemo, useState } from "react";
import { PlanningDaysScrollRow } from "@/components/dashboard/planning-days-scroll-row";
import { PlanningSessionCard } from "@/components/dashboard/planning-session-card";
import { PlanningDayPill } from "@/components/planning/planning-day-pill";
import { PlanningPeriodActiveBadge } from "@/components/planning/planning-period-active-badge";
import { PlanningPeriodNotice } from "@/components/planning/planning-period-notice";
import { weekdayDateLineForPeriod } from "@/lib/planning-period-day-dates";
import { badgeClasses } from "@/lib/badge-classes";
import { usePlanningPeriodStore } from "@/store/planning-period-store";
import type { PlanningPeriodEnriched } from "@/types/admin/planning";

export type PublicPlanningDay = "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT" | "SUN";

export type PublicPlanningTableRow = {
  id: string;
  courseSlug: string;
  dayOfWeek: PublicPlanningDay;
  startTime: string;
  endTime: string;
  courseTitle: string;
  coachName: string;
  coachImageUrl: string | null;
  level: string | null;
  levelLabel: string | null;
  levelToneClass: string | null;
  capacity: number;
  durationMinutes: number;
  waitlistCapacity: number | null;
};

const ORDERED_DAYS: PublicPlanningDay[] = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

const DAY_LABEL_FR: Record<PublicPlanningDay, string> = {
  MON: "Lundi",
  TUE: "Mardi",
  WED: "Mercredi",
  THU: "Jeudi",
  FRI: "Vendredi",
  SAT: "Samedi",
  SUN: "Dimanche",
};

function todayPlanningDay(): PublicPlanningDay {
  const js = new Date().getDay();
  if (js === 1) return "MON";
  if (js === 2) return "TUE";
  if (js === 3) return "WED";
  if (js === 4) return "THU";
  if (js === 5) return "FRI";
  if (js === 6) return "SAT";
  return "SUN";
}

function pickInitialDay(rows: PublicPlanningTableRow[]): PublicPlanningDay {
  const t = todayPlanningDay();
  if (rows.some((r) => r.dayOfWeek === t)) return t;
  const first = ORDERED_DAYS.find((d) => rows.some((r) => r.dayOfWeek === d));
  return first ?? "MON";
}

type PublicPlanningTabsClientProps = {
  rows: PublicPlanningTableRow[];
  initialPeriodConfig: PlanningPeriodEnriched;
};

export function PublicPlanningTabsClient({ rows, initialPeriodConfig }: PublicPlanningTabsClientProps) {
  const [selectedDay, setSelectedDay] = useState<PublicPlanningDay>(() => pickInitialDay(rows));
  const periodConfig = usePlanningPeriodStore((s) => s.config) ?? initialPeriodConfig;

  const countsByDay = useMemo(() => {
    const m = new Map<PublicPlanningDay, number>();
    for (const d of ORDERED_DAYS) m.set(d, 0);
    for (const r of rows) {
      m.set(r.dayOfWeek, (m.get(r.dayOfWeek) ?? 0) + 1);
    }
    return m;
  }, [rows]);

  const rowsForDay = useMemo(
    () => rows.filter((r) => r.dayOfWeek === selectedDay).sort((a, b) => a.startTime.localeCompare(b.startTime)),
    [rows, selectedDay],
  );

  return (
    <div className="space-y-5">
      <PlanningPeriodActiveBadge initialConfig={initialPeriodConfig} source="public" align="center" />
      <PlanningPeriodNotice config={periodConfig} variant="public" />
      <PlanningDaysScrollRow className="-mx-1" scrollClassName="lg:justify-center" scrollKey={rows.length}>
        <div className="flex w-max flex-nowrap items-center gap-2 pr-1">
          {ORDERED_DAYS.map((day) => {
            const count = countsByDay.get(day) ?? 0;
            const active = selectedDay === day;
            return (
              <PlanningDayPill
                key={day}
                dayLabel={DAY_LABEL_FR[day]}
                dateLabel={weekdayDateLineForPeriod(
                  periodConfig.periodStartYmd,
                  periodConfig.periodEndYmd,
                  day,
                )}
                active={active}
                count={count}
                onClick={() => setSelectedDay(day)}
              />
            );
          })}
        </div>
      </PlanningDaysScrollRow>

      {rowsForDay.length === 0 ? (
        <div className="py-13 text-center text-sm text-brand-dark/60">
          Aucune séance planifiée pour <span className="font-semibold">{DAY_LABEL_FR[selectedDay]}</span>. Choisissez un
          autre jour.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {rowsForDay.map((row) => (
            <PlanningSessionCard
              key={row.id}
              courseLabel={row.courseTitle}
              startTime={row.startTime}
              levelLabel={row.levelLabel}
              levelToneClass={row.levelToneClass}
              coachName={row.coachName === "Coach à confirmer" ? null : row.coachName}
              coachImageUrl={row.coachImageUrl}
              statsBadges={<span className={badgeClasses.availability}>Durée : {row.durationMinutes} min</span>}
            />
          ))}
        </div>
      )}
    </div>
  );
}
