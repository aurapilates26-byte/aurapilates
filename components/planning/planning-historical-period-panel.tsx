"use client";

import { PlanningDaysScrollRow } from "@/components/dashboard/planning-days-scroll-row";
import { PlanningSessionCard } from "@/components/dashboard/planning-session-card";
import { Button, SelectMenu } from "@/components/ui";
import { badgeClasses } from "@/lib/badge-classes";
import { planningLevelDisplay } from "@/lib/planning-level-display";
import { PlanningDayPill } from "@/components/planning/planning-day-pill";
import {
  formatPlanningDayShortFr,
  weekdayDateLineForPeriod,
  weekdaysPresentInPeriod,
} from "@/lib/planning-period-day-dates";
import type {
  AdminPlanningItem,
  PlanningArchivedPeriodItem,
  PlanningDayOfWeek,
  PlanningPeriodConfig,
} from "@/types/admin/planning";

const dayLabels: Record<PlanningDayOfWeek, string> = {
  MON: "Lundi",
  TUE: "Mardi",
  WED: "Mercredi",
  THU: "Jeudi",
  FRI: "Vendredi",
  SAT: "Samedi",
  SUN: "Dimanche",
};

const orderedDays: PlanningDayOfWeek[] = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

const courseLabelBySlug: Record<string, string> = {
  "pilates-reformer": "Pilates reformer",
  "mat-pilates": "Mat pilates",
  yoga: "Yoga",
  dance: "Danse",
  "coaching-prive": "Coaching privé",
  "sans-cours": "Sans cours",
};

export type PlanningHistoricalPeriodPanelProps = {
  archivedPeriods: PlanningArchivedPeriodItem[];
  selectedArchiveStartYmd: string;
  onSelectedArchiveStartYmdChange: (ymd: string) => void;
  archivesLoading: boolean;
  seedingArchives: boolean;
  onSeedArchives: () => void;
  selectedArchivePeriod: PlanningPeriodConfig | null;
  selectedDay: PlanningDayOfWeek;
  onSelectedDayChange: (day: PlanningDayOfWeek) => void;
  items: AdminPlanningItem[];
  isLoading: boolean;
  error: string | null;
  onEditSession: (item: AdminPlanningItem) => void;
  onDeleteSession: (item: AdminPlanningItem) => void;
  onOpenPresence: (item: AdminPlanningItem) => void;
};

export function PlanningHistoricalPeriodPanel({
  archivedPeriods,
  selectedArchiveStartYmd,
  onSelectedArchiveStartYmdChange,
  archivesLoading,
  seedingArchives,
  onSeedArchives,
  selectedArchivePeriod,
  selectedDay,
  onSelectedDayChange,
  items,
  isLoading,
  error,
  onEditSession,
  onDeleteSession,
  onOpenPresence,
}: PlanningHistoricalPeriodPanelProps) {
  const daysForTabs = selectedArchivePeriod
    ? weekdaysPresentInPeriod(selectedArchivePeriod.periodStartYmd, selectedArchivePeriod.periodEndYmd)
    : orderedDays;

  const visibleItems = items;

  const visibleItemsByDay = visibleItems
    .filter((item) => item.dayOfWeek === selectedDay)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const sessionCountByDay = visibleItems.reduce<Record<PlanningDayOfWeek, number>>(
    (counts, item) => {
      counts[item.dayOfWeek] += 1;
      return counts;
    },
    { MON: 0, TUE: 0, WED: 0, THU: 0, FRI: 0, SAT: 0, SUN: 0 },
  );

  if (archivesLoading) {
    return <p className="text-sm text-brand-dark/60">Chargement de l&apos;historique…</p>;
  }

  if (archivedPeriods.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-4">
        <p className="text-center text-sm text-brand-dark/65">
          Aucune période passée enregistrée. Importez les périodes connues pour reconstituer le planning.
        </p>
        <Button type="button" onClick={onSeedArchives} disabled={seedingArchives}>
          {seedingArchives ? "Import…" : "Importer les périodes"}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-brand-dark/65">
        Reconstituez le planning des périodes passées. Chaque séance est liée à sa date exacte, puis utilisez «
        Présences » pour saisir les participants.
      </p>

      <SelectMenu
        label="Période passée"
        value={selectedArchiveStartYmd}
        options={archivedPeriods.map((p) => ({
          value: p.periodStartYmd,
          label: p.periodLabel,
        }))}
        onChange={onSelectedArchiveStartYmdChange}
      />

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : null}

      {selectedArchivePeriod ? (
        <div className="overflow-hidden rounded-2xl border border-brand-medium/20 bg-white">
          <div className="border-b border-brand-medium/20 px-4 py-4 sm:px-5">
            <PlanningDaysScrollRow className="-mx-4 sm:-mx-5" scrollClassName="lg:justify-center" scrollKey={items.length}>
              <div className="flex w-max flex-nowrap items-center gap-2 pr-1">
                {daysForTabs.map((day) => (
                  <PlanningDayPill
                    key={day}
                    dayLabel={dayLabels[day]}
                    dateLabel={weekdayDateLineForPeriod(
                      selectedArchivePeriod.periodStartYmd,
                      selectedArchivePeriod.periodEndYmd,
                      day,
                    )}
                    active={selectedDay === day}
                    count={sessionCountByDay[day]}
                    onClick={() => onSelectedDayChange(day)}
                  />
                ))}
              </div>
            </PlanningDaysScrollRow>
          </div>

          {isLoading && items.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-brand-dark/60 sm:px-5">Chargement…</div>
          ) : visibleItemsByDay.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-brand-dark/60 sm:px-5">
              Aucune séance pour {dayLabels[selectedDay].toLowerCase()}.
              <span className="mt-2 block">
                Utilisez « Ajouter une séance » pour créer les créneaux de cette période passée.
              </span>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 p-4 sm:p-5 md:grid-cols-2">
              {visibleItemsByDay.map((item) => {
                const levelDisplay = planningLevelDisplay(item.level);
                return (
                <PlanningSessionCard
                  key={item.id}
                  variant="admin"
                  courseLabel={courseLabelBySlug[item.courseSlug] ?? item.courseSlug}
                  startTime={item.startTime}
                  levelLabel={levelDisplay?.label}
                  levelToneClass={levelDisplay?.toneClass}
                  coachName={item.coach ? `${item.coach.firstName} ${item.coach.lastName}` : null}
                  coachImageUrl={item.coach?.imageUrl ?? null}
                  topRightActions={
                    <>
                      <button
                        type="button"
                        onClick={() => onOpenPresence(item)}
                        className="inline-flex h-8 items-center justify-center rounded-lg border border-brand-medium/30 bg-brand-light/40 px-2.5 text-xs font-semibold text-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-medium/30"
                      >
                        Présences
                      </button>
                      <button
                        type="button"
                        onClick={() => onEditSession(item)}
                        aria-label="Modifier la séance"
                        title="Modifier"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-brand-medium/30 bg-brand-light/40 text-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-medium/30"
                      >
                        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
                          <path d="M4 17.25V20h2.75l8.12-8.12-2.75-2.75L4 17.25zm12.71-9.04a1 1 0 000-1.41l-1.5-1.5a1 1 0 00-1.41 0l-1.17 1.17 2.75 2.75 1.33-1.01z" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteSession(item)}
                        aria-label="Supprimer la séance"
                        title="Supprimer"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-200"
                      >
                        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
                          <path d="M9 3h6l1 2h4v2H4V5h4l1-2zm1 6h2v9h-2V9zm4 0h2v9h-2V9zM7 9h2v9H7V9z" />
                        </svg>
                      </button>
                    </>
                  }
                  statsBadges={
                    <>
                      {item.anchorSessionYmd ? (
                        <span className={badgeClasses.availability}>
                          {dayLabels[item.dayOfWeek]} {formatPlanningDayShortFr(item.anchorSessionYmd)}
                        </span>
                      ) : null}
                      <span className={badgeClasses.availability}>Durée : {item.durationMinutes} min</span>
                      <span className={badgeClasses.availability}>Places: {item.capacity}</span>
                      <span className={badgeClasses.waitlist}>Attente: {item.waitlistCapacity ?? "—"}</span>
                    </>
                  }
                />
                );
              })}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
