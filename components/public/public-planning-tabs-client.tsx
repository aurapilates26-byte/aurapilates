"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { PlanningSessionCard } from "@/components/dashboard/planning-session-card";
import { badgeClasses } from "@/lib/badge-classes";
import { publicFilterPillClass } from "@/lib/public-filter-pill";
import { planningLevelBadgeClass } from "@/lib/planning-level-badge";

export type PublicPlanningDay = "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT" | "SUN";

export type PublicPlanningTableRow = {
  id: string;
  dayOfWeek: PublicPlanningDay;
  startTime: string;
  endTime: string;
  courseTitle: string;
  coachName: string;
  coachImageUrl: string | null;
  level: string;
  levelLabel: string;
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
};

function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
    </svg>
  );
}

export function PublicPlanningTabsClient({ rows }: PublicPlanningTabsClientProps) {
  const [selectedDay, setSelectedDay] = useState<PublicPlanningDay>(() => pickInitialDay(rows));
  const daysScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollHints = useCallback(() => {
    const el = daysScrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    const epsilon = 8;
    setCanScrollLeft(scrollLeft > epsilon);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - epsilon);
  }, []);

  useLayoutEffect(() => {
    updateScrollHints();
  }, [updateScrollHints, rows]);

  useEffect(() => {
    const el = daysScrollRef.current;
    if (!el) return;
    updateScrollHints();
    el.addEventListener("scroll", updateScrollHints, { passive: true });
    const ro = new ResizeObserver(updateScrollHints);
    ro.observe(el);
    window.addEventListener("resize", updateScrollHints);
    return () => {
      el.removeEventListener("scroll", updateScrollHints);
      ro.disconnect();
      window.removeEventListener("resize", updateScrollHints);
    };
  }, [updateScrollHints]);

  const scrollDays = useCallback((direction: "left" | "right") => {
    const el = daysScrollRef.current;
    if (!el) return;
    const delta = Math.min(Math.floor(el.clientWidth * 0.65), 240);
    el.scrollBy({ left: direction === "left" ? -delta : delta, behavior: "smooth" });
  }, []);

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

  const daysScrollAriaLabel =
    canScrollLeft || canScrollRight
      ? "Jours de la semaine, liste defilante horizontale. Utilisez les fleches ou faites defiler pour voir tous les jours."
      : "Jours de la semaine, defilement horizontal";

  return (
    <div className="space-y-5">
      <div className="-mx-1 pb-2">
        <div className="flex items-center gap-2 px-1">
          {canScrollLeft ? (
            <button
              type="button"
              aria-label="Faire défiler les jours vers la gauche"
              className="flex h-8 w-8 shrink-0 items-center justify-center self-center rounded-full border border-brand-medium/40 bg-white text-brand-dark shadow-md ring-1 ring-black/5 md:h-9 md:w-9"
              onClick={() => scrollDays("left")}
            >
              <ChevronLeftIcon className="h-4 w-4 md:h-5 md:w-5" />
            </button>
          ) : null}
          <div
            ref={daysScrollRef}
            className="planning-days-scroll flex min-h-0 min-w-0 flex-1 items-center justify-start gap-2 overflow-x-auto overflow-y-hidden overscroll-x-contain touch-pan-x lg:justify-center"
            aria-label={daysScrollAriaLabel}
          >
            <div className="flex w-max flex-nowrap items-center gap-2 pr-1">
              {ORDERED_DAYS.map((day) => {
                const count = countsByDay.get(day) ?? 0;
                const active = selectedDay === day;
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => setSelectedDay(day)}
                    className={`${publicFilterPillClass(active)} shrink-0 gap-1.5`}
                  >
                    <span>{DAY_LABEL_FR[day].toUpperCase()}</span>
                    <span
                      className={`tabular-nums ${active ? "text-white/90" : "text-brand-dark/50"}`}
                      aria-label={`${count} séance${count > 1 ? "s" : ""}`}
                    >
                      ({count})
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
          {canScrollRight ? (
            <button
              type="button"
              aria-label="Faire défiler les jours vers la droite"
              className="flex h-8 w-8 shrink-0 items-center justify-center self-center rounded-full border border-brand-medium/40 bg-white text-brand-dark shadow-md ring-1 ring-black/5 md:h-9 md:w-9"
              onClick={() => scrollDays("right")}
            >
              <ChevronRightIcon className="h-4 w-4 md:h-5 md:w-5" />
            </button>
          ) : null}
        </div>
      </div>

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
              levelToneClass={planningLevelBadgeClass(row.level)}
              coachName={row.coachName === "Coach a confirmer" ? null : row.coachName}
              coachImageUrl={row.coachImageUrl}
              statsBadges={<span className={badgeClasses.availability}>Durée: {row.durationMinutes} min</span>}
            />
          ))}
        </div>
      )}
    </div>
  );
}
