import { formatYmdLocal, formatYmdPrismaDate, parseYmdLocal, startOfLocalToday } from "@/lib/calendar-day";
import { formatPeriodIntervalFr } from "@/lib/planning-booking-window";
import { proposeNextPlanningPeriod } from "@/lib/planning-period-status";
import type {
  PlanningArchivedPeriodItem,
  PlanningPeriodConfig,
} from "@/types/admin/planning";

export function periodContainsYmd(period: PlanningPeriodConfig, ymd: string): boolean {
  return ymd >= period.periodStartYmd && ymd <= period.periodEndYmd;
}

export type CalendarCurrentPeriod = {
  period: PlanningPeriodConfig;
  source: "published" | "archive";
  archiveStartYmd?: string;
};

/** Période calendaire contenant la date du jour (indépendante de la bascule anticipée). */
export function resolveCalendarCurrentPeriod(
  todayYmd: string,
  published: PlanningPeriodConfig | null,
  archives: PlanningArchivedPeriodItem[],
): CalendarCurrentPeriod | null {
  if (published && periodContainsYmd(published, todayYmd)) {
    return { period: published, source: "published" };
  }

  const fromArchive = archives.find((arch) => periodContainsYmd(arch, todayYmd));
  if (fromArchive) {
    return {
      period: {
        bookingWindow: fromArchive.bookingWindow,
        periodStartYmd: fromArchive.periodStartYmd,
        periodEndYmd: fromArchive.periodEndYmd,
        periodLabel: fromArchive.periodLabel,
      },
      source: "archive",
      archiveStartYmd: fromArchive.periodStartYmd,
    };
  }

  const latestEnded = [...archives]
    .filter((arch) => arch.periodEndYmd <= todayYmd)
    .sort((a, b) => b.periodEndYmd.localeCompare(a.periodEndYmd))[0];
  if (latestEnded) {
    return {
      period: {
        bookingWindow: latestEnded.bookingWindow,
        periodStartYmd: latestEnded.periodStartYmd,
        periodEndYmd: latestEnded.periodEndYmd,
        periodLabel: latestEnded.periodLabel,
      },
      source: "archive",
      archiveStartYmd: latestEnded.periodStartYmd,
    };
  }

  return published ? { period: published, source: "published" } : null;
}

/** Prochaine période = immédiatement après la période calendaire en cours. */
export function resolveNextPlanningPeriod(
  calendarCurrent: CalendarCurrentPeriod | null,
): PlanningPeriodConfig | null {
  if (!calendarCurrent) return null;
  return proposeNextPlanningPeriod(calendarCurrent.period);
}

export function todayYmdLocal(): string {
  return formatYmdLocal(startOfLocalToday());
}

/** Archives brutes pour résolution calendrier (sans effets de bord). */
export function mapArchiveRowsForCalendar(
  rows: Array<{
    id: string;
    archivedAt: Date;
    bookingWindow: string;
    periodStartDate: Date;
    periodEndDate: Date;
    periodLabel?: string;
  }>,
): PlanningArchivedPeriodItem[] {
  return rows.map((row) => {
    const periodStartYmd = formatYmdPrismaDate(row.periodStartDate);
    const periodEndYmd = formatYmdPrismaDate(row.periodEndDate);
    const from = parseYmdLocal(periodStartYmd);
    const to = parseYmdLocal(periodEndYmd);
    return {
      id: row.id,
      archivedAt: row.archivedAt.toISOString(),
      bookingWindow: row.bookingWindow as PlanningArchivedPeriodItem["bookingWindow"],
      periodStartYmd,
      periodEndYmd,
      periodLabel: from && to ? formatPeriodIntervalFr(from, to) : `${periodStartYmd} – ${periodEndYmd}`,
    };
  });
}
