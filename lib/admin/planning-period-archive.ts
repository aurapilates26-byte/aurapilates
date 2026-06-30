import "server-only";

import type { BookingWindow } from "@prisma/client";
import {
  buildPlanningPeriodConfig,
  planningWindowDays,
} from "@/lib/admin/planning-period-config";
import {
  addLocalDays,
  formatYmdLocal,
  formatYmdPrismaDate,
  parseYmdLocal,
  parseYmdToPrismaDate,
} from "@/lib/calendar-day";
import { localMonthUtcRange } from "@/lib/admin/pack-payment";
import {
  alignedPlanningPeriodsOverlappingRange,
  formatPeriodIntervalFr,
} from "@/lib/planning-booking-window";
import { prisma } from "@/lib/prisma";
import { enrichPlanningPeriodConfig, proposeNextPlanningPeriod } from "@/lib/planning-period-status";
import type {
  PlanningArchivedPeriodItem,
  PlanningBookingWindow,
  PlanningPeriodConfig,
} from "@/types/admin/planning";

const SINGLETON_ID = "singleton";

function toPlanningBookingWindow(w: BookingWindow): PlanningBookingWindow {
  if (w === "FIFTEEN_DAYS" || w === "ONE_MONTH") return w;
  return "WEEKLY";
}

function periodStartFromRow(periodStartDate: Date): Date {
  const ymd = formatYmdPrismaDate(periodStartDate);
  return parseYmdLocal(ymd) ?? new Date();
}

function configFromArchiveRow(row: {
  bookingWindow: BookingWindow;
  periodStartDate: Date;
  periodEndDate: Date;
}): PlanningPeriodConfig {
  const bookingWindow = toPlanningBookingWindow(row.bookingWindow);
  const from = periodStartFromRow(row.periodStartDate);
  const endYmd = formatYmdPrismaDate(row.periodEndDate);
  const to = parseYmdLocal(endYmd) ?? from;
  return {
    bookingWindow,
    periodStartYmd: formatYmdLocal(from),
    periodEndYmd: formatYmdLocal(to),
    periodLabel: formatPeriodIntervalFr(from, to),
  };
}

const MAX_EXPIRED_PERIOD_ROLL_STEPS = 12;

/**
 * Si la période affichée est terminée : l'archive et avance (brouillon ou période suivante).
 * Permet d'afficher les périodes passées dans Historique et une période courante cohérente.
 */
export async function maybeRollForwardExpiredPublishedPeriod(): Promise<boolean> {
  let rolled = false;

  for (let step = 0; step < MAX_EXPIRED_PERIOD_ROLL_STEPS; step += 1) {
    const row = await prisma.studioPlanningPeriod.findUnique({ where: { id: SINGLETON_ID } });
    if (!row) break;

    const bookingWindow = toPlanningBookingWindow(row.bookingWindow);
    const config = buildPlanningPeriodConfig(bookingWindow, periodStartFromRow(row.periodStartDate));
    const enriched = enrichPlanningPeriodConfig(config);
    if (enriched.status !== "expired") break;

    if (row.draftPeriodStartDate && row.draftBookingWindow) {
      // Brouillon : publication échelonnée (samedi / dimanche 13h), pas de bascule anticipée.
      break;
    }

    await archiveCurrentPublishedPeriod();

    const next = proposeNextPlanningPeriod(config);
    const nextStart = parseYmdToPrismaDate(next.periodStartYmd);
    if (!nextStart) break;

    await prisma.studioPlanningPeriod.update({
      where: { id: SINGLETON_ID },
      data: {
        bookingWindow: next.bookingWindow as BookingWindow,
        periodStartDate: nextStart,
      },
    });
    await prisma.planning.updateMany({
      data: { bookingWindow: next.bookingWindow as BookingWindow },
    });
    rolled = true;
  }

  return rolled;
}

/** Archive la période publiée actuelle avant renouvellement (idempotent par date de début). */
export async function archiveCurrentPublishedPeriod(): Promise<void> {
  const row = await prisma.studioPlanningPeriod.findUnique({ where: { id: SINGLETON_ID } });
  if (!row) return;

  const bookingWindow = toPlanningBookingWindow(row.bookingWindow);
  const config = buildPlanningPeriodConfig(bookingWindow, periodStartFromRow(row.periodStartDate));
  const periodEndDate = parseYmdToPrismaDate(config.periodEndYmd);
  if (!periodEndDate) return;

  const existing = await prisma.studioPlanningPeriodArchive.findUnique({
    where: { periodStartDate: row.periodStartDate },
  });
  if (existing) return;

  await prisma.studioPlanningPeriodArchive.create({
    data: {
      bookingWindow: row.bookingWindow,
      periodStartDate: row.periodStartDate,
      periodEndDate,
    },
  });
}

async function readPublishedPeriodConfigWithoutSideEffects(): Promise<PlanningPeriodConfig | null> {
  const row = await prisma.studioPlanningPeriod.findUnique({ where: { id: SINGLETON_ID } });
  if (!row) return null;
  const bookingWindow = toPlanningBookingWindow(row.bookingWindow);
  return buildPlanningPeriodConfig(bookingWindow, periodStartFromRow(row.periodStartDate));
}

function periodOverlapsRange(
  periodStartYmd: string,
  periodEndYmd: string,
  rangeFrom: Date,
  rangeTo: Date,
): boolean {
  const start = parseYmdLocal(periodStartYmd);
  const end = parseYmdLocal(periodEndYmd);
  if (!start || !end) return false;
  const fromDay = new Date(rangeFrom.getFullYear(), rangeFrom.getMonth(), rangeFrom.getDate());
  const toDay = new Date(rangeTo.getFullYear(), rangeTo.getMonth(), rangeTo.getDate());
  return start <= toDay && end >= fromDay;
}

function configFromAlignedSlice(
  bookingWindow: PlanningBookingWindow,
  from: Date,
  to: Date,
): PlanningPeriodConfig {
  return {
    bookingWindow,
    periodStartYmd: formatYmdLocal(from),
    periodEndYmd: formatYmdLocal(to),
    periodLabel: formatPeriodIntervalFr(from, to),
  };
}

/**
 * Périodes planning (archivées + publiée actuelle) recoupant un mois caisse.
 * Si aucun historique : reconstruction alignée sur la fenêtre (7 / 15 / 30 j).
 */
export async function getPlanningPeriodSegmentsForYearMonth(
  yearMonth: string,
): Promise<PlanningPeriodConfig[]> {
  const monthRange = localMonthUtcRange(yearMonth);
  if (!monthRange) return [];

  const monthStart = new Date(monthRange.from.getFullYear(), monthRange.from.getMonth(), monthRange.from.getDate());
  const monthEnd = new Date(monthRange.to.getFullYear(), monthRange.to.getMonth(), monthRange.to.getDate());

  const archives = await prisma.studioPlanningPeriodArchive.findMany({
    orderBy: { periodStartDate: "asc" },
  });

  const current = await readPublishedPeriodConfigWithoutSideEffects();

  const byStart = new Map<string, PlanningPeriodConfig>();

  for (const row of archives) {
    const config = configFromArchiveRow(row);
    if (periodOverlapsRange(config.periodStartYmd, config.periodEndYmd, monthStart, monthEnd)) {
      byStart.set(config.periodStartYmd, config);
    }
  }

  if (
    current &&
    periodOverlapsRange(current.periodStartYmd, current.periodEndYmd, monthStart, monthEnd)
  ) {
    byStart.set(current.periodStartYmd, current);
  }

  if (byStart.size > 0) {
    return [...byStart.values()].sort((a, b) => a.periodStartYmd.localeCompare(b.periodStartYmd));
  }

  const anchorConfig = current ?? (archives.length > 0 ? configFromArchiveRow(archives[archives.length - 1]!) : null);
  if (!anchorConfig) return [];

  const anchorStart = parseYmdLocal(anchorConfig.periodStartYmd);
  if (!anchorStart) return [];

  const windowDays = planningWindowDays(anchorConfig.bookingWindow);
  const slices = alignedPlanningPeriodsOverlappingRange(anchorStart, windowDays, monthStart, monthEnd);

  return slices.map((slice) => configFromAlignedSlice(anchorConfig.bookingWindow, slice.from, slice.to));
}

export function countDistinctCalendarDaysInRanges(ranges: { from: Date; to: Date }[]): number {
  const days = new Set<string>();
  for (const range of ranges) {
    let cur = new Date(range.from.getFullYear(), range.from.getMonth(), range.from.getDate());
    const end = new Date(range.to.getFullYear(), range.to.getMonth(), range.to.getDate());
    while (cur <= end) {
      days.add(formatYmdLocal(cur));
      cur = addLocalDays(cur, 1);
    }
  }
  return days.size;
}

/** Config d'une période archivée par date de début (Y-M-D). */
export async function getArchivedPlanningPeriodConfig(
  periodStartYmd: string,
): Promise<PlanningPeriodConfig | null> {
  const start = parseYmdToPrismaDate(periodStartYmd);
  if (!start) return null;
  const row = await prisma.studioPlanningPeriodArchive.findUnique({
    where: { periodStartDate: start },
  });
  if (!row) return null;
  return configFromArchiveRow(row);
}

/** Périodes connues à importer (saisie initiale studio). */
export const KNOWN_PLANNING_PERIOD_SEEDS: { periodStartYmd: string; bookingWindow: PlanningBookingWindow }[] = [
  { periodStartYmd: "2026-05-18", bookingWindow: "WEEKLY" },
  { periodStartYmd: "2026-05-25", bookingWindow: "WEEKLY" },
  { periodStartYmd: "2026-06-01", bookingWindow: "WEEKLY" },
  { periodStartYmd: "2026-06-08", bookingWindow: "WEEKLY" },
];

/** Anciennes périodes erronées (ex. alignement calendrier incorrect). */
const OBSOLETE_ARCHIVE_PERIOD_STARTS = ["2026-05-01", "2026-05-11"];

export type SyncPlanningPeriodArchivesResult = {
  created: number;
  updated: number;
  removed: number;
};

/** Supprime les périodes obsolètes et aligne l'historique sur les périodes connues. */
export async function syncKnownPlanningPeriodArchives(): Promise<SyncPlanningPeriodArchivesResult> {
  let removed = 0;
  for (const wrongYmd of OBSOLETE_ARCHIVE_PERIOD_STARTS) {
    const start = parseYmdToPrismaDate(wrongYmd);
    if (!start) continue;
    const result = await prisma.studioPlanningPeriodArchive.deleteMany({
      where: { periodStartDate: start },
    });
    removed += result.count;
  }

  let created = 0;
  let updated = 0;

  for (const seed of KNOWN_PLANNING_PERIOD_SEEDS) {
    const start = parseYmdToPrismaDate(seed.periodStartYmd);
    if (!start) continue;
    const config = buildPlanningPeriodConfig(seed.bookingWindow, periodStartFromRow(start));
    const periodEndDate = parseYmdToPrismaDate(config.periodEndYmd);
    if (!periodEndDate) continue;

    const existing = await prisma.studioPlanningPeriodArchive.findUnique({
      where: { periodStartDate: start },
    });

    if (existing) {
      const endYmd = formatYmdPrismaDate(existing.periodEndDate);
      const bookingWindow = seed.bookingWindow as BookingWindow;
      if (endYmd !== config.periodEndYmd || existing.bookingWindow !== bookingWindow) {
        await prisma.studioPlanningPeriodArchive.update({
          where: { periodStartDate: start },
          data: {
            bookingWindow,
            periodEndDate,
          },
        });
        updated += 1;
      }
    } else {
      await prisma.studioPlanningPeriodArchive.create({
        data: {
          bookingWindow: seed.bookingWindow,
          periodStartDate: start,
          periodEndDate,
        },
      });
      created += 1;
    }
  }

  return { created, updated, removed };
}

export async function seedKnownPlanningPeriodArchives(): Promise<number> {
  const result = await syncKnownPlanningPeriodArchives();
  return result.created;
}

async function planningPeriodArchivesNeedSync(): Promise<boolean> {
  const obsoleteStarts = OBSOLETE_ARCHIVE_PERIOD_STARTS.map(parseYmdToPrismaDate).filter(
    (d): d is Date => d !== null,
  );
  if (obsoleteStarts.length > 0) {
    const obsoleteCount = await prisma.studioPlanningPeriodArchive.count({
      where: { periodStartDate: { in: obsoleteStarts } },
    });
    if (obsoleteCount > 0) return true;
  }

  for (const seed of KNOWN_PLANNING_PERIOD_SEEDS) {
    const start = parseYmdToPrismaDate(seed.periodStartYmd);
    if (!start) continue;
    const existing = await prisma.studioPlanningPeriodArchive.findUnique({
      where: { periodStartDate: start },
    });
    if (!existing) return true;
    const config = buildPlanningPeriodConfig(seed.bookingWindow, periodStartFromRow(start));
    const endYmd = formatYmdPrismaDate(existing.periodEndDate);
    if (endYmd !== config.periodEndYmd || existing.bookingWindow !== seed.bookingWindow) {
      return true;
    }
  }

  return false;
}

/** Périodes passées consultables (archives), hors période affichée et brouillon actifs. */
export async function listArchivedPlanningPeriodsForAdmin(): Promise<PlanningArchivedPeriodItem[]> {
  const { maybeActivateScheduledDraft } = await import("@/lib/admin/planning-period-draft");
  await maybeActivateScheduledDraft();
  await maybeRollForwardExpiredPublishedPeriod();

  const [archives, periodRow] = await Promise.all([
    prisma.studioPlanningPeriodArchive.findMany({ orderBy: { periodStartDate: "desc" } }),
    prisma.studioPlanningPeriod.findUnique({ where: { id: SINGLETON_ID } }),
  ]);

  const activeStarts = new Set<string>();
  if (periodRow) {
    activeStarts.add(formatYmdPrismaDate(periodRow.periodStartDate));
  }
  if (periodRow?.draftPeriodStartDate) {
    activeStarts.add(formatYmdPrismaDate(periodRow.draftPeriodStartDate));
  }

  const todayYmd = formatYmdLocal(new Date());

  return archives
    .map((row) => {
      const config = configFromArchiveRow(row);
      return {
        id: row.id,
        archivedAt: row.archivedAt.toISOString(),
        ...config,
      };
    })
    .filter((p) => !activeStarts.has(p.periodStartYmd))
    .filter((p) => p.periodEndYmd <= todayYmd);
}

export function prorateMonthlySalaryDinars(
  monthlySalaryDinars: number,
  coveredDays: number,
  monthDays: number,
): number {
  if (monthlySalaryDinars <= 0 || monthDays <= 0) return 0;
  if (coveredDays >= monthDays) return monthlySalaryDinars;
  return Math.round((monthlySalaryDinars * coveredDays) / monthDays);
}
