import "server-only";

import type { BookingWindow } from "@prisma/client";
import {
  formatYmdLocal,
  formatYmdPrismaDate,
  parseYmdLocal,
  parseYmdToPrismaDate,
  startOfLocalToday,
} from "@/lib/calendar-day";
import {
  BOOKING_WINDOW_DAYS,
  bookingWindowDateRange,
  formatPeriodIntervalFr,
} from "@/lib/planning-booking-window";
import { prisma } from "@/lib/prisma";
import { enrichPlanningPeriodConfig } from "@/lib/planning-period-status";
import type { PlanningBookingWindow, PlanningPeriodConfig, PlanningPeriodEnriched } from "@/types/admin/planning";

const SINGLETON_ID = "singleton";

function toPlanningBookingWindow(w: BookingWindow): PlanningBookingWindow {
  if (w === "FIFTEEN_DAYS" || w === "ONE_MONTH") return w;
  return "WEEKLY";
}

function periodStartFromRow(periodStartDate: Date): Date {
  const ymd = formatYmdPrismaDate(periodStartDate);
  return parseYmdLocal(ymd) ?? startOfLocalToday();
}

export function buildPlanningPeriodConfig(
  bookingWindow: PlanningBookingWindow,
  periodStart: Date,
): PlanningPeriodConfig {
  const { from, to } = bookingWindowDateRange(bookingWindow, periodStart);
  return {
    bookingWindow,
    periodStartYmd: formatYmdLocal(from),
    periodEndYmd: formatYmdLocal(to),
    periodLabel: formatPeriodIntervalFr(from, to),
  };
}

async function ensureDefaultRow() {
  const today = startOfLocalToday();
  return prisma.studioPlanningPeriod.upsert({
    where: { id: SINGLETON_ID },
    create: {
      id: SINGLETON_ID,
      bookingWindow: "WEEKLY",
      periodStartDate: today,
    },
    update: {},
  });
}

/** Config actuelle (crée la ligne par défaut si absente). */
export async function getPlanningPeriodConfig(): Promise<PlanningPeriodConfig> {
  const { maybeActivateScheduledDraft } = await import("@/lib/admin/planning-period-draft");
  const { maybeRollForwardExpiredPublishedPeriod } = await import("@/lib/admin/planning-period-archive");
  await maybeActivateScheduledDraft();
  await maybeRollForwardExpiredPublishedPeriod();

  const row = await prisma.studioPlanningPeriod.findUnique({
    where: { id: SINGLETON_ID },
  });

  if (!row) {
    const created = await ensureDefaultRow();
    const bookingWindow = toPlanningBookingWindow(created.bookingWindow);
    return buildPlanningPeriodConfig(bookingWindow, periodStartFromRow(created.periodStartDate));
  }

  const bookingWindow = toPlanningBookingWindow(row.bookingWindow);
  return buildPlanningPeriodConfig(bookingWindow, periodStartFromRow(row.periodStartDate));
}

/** Config + statut période (expirée, active, à venir) et proposition de renouvellement. */
export async function getPlanningPeriodConfigEnriched(): Promise<PlanningPeriodEnriched> {
  const config = await getPlanningPeriodConfig();
  return enrichPlanningPeriodConfig(config);
}

export async function savePlanningPeriodConfig(input: {
  bookingWindow: PlanningBookingWindow;
  periodStartYmd: string;
}): Promise<PlanningPeriodConfig> {
  const start = parseYmdToPrismaDate(input.periodStartYmd.trim());
  if (!start) {
    throw new Error("Date de début invalide");
  }

  const existing = await prisma.studioPlanningPeriod.findUnique({ where: { id: SINGLETON_ID } });
  const willChangePeriod =
    !existing ||
    existing.bookingWindow !== input.bookingWindow ||
    formatYmdPrismaDate(existing.periodStartDate) !== input.periodStartYmd.trim();

  if (willChangePeriod) {
    const { archiveCurrentPublishedPeriod } = await import("@/lib/admin/planning-period-archive");
    await archiveCurrentPublishedPeriod();
  }

  const row = await prisma.studioPlanningPeriod.upsert({
    where: { id: SINGLETON_ID },
    create: {
      id: SINGLETON_ID,
      bookingWindow: input.bookingWindow,
      periodStartDate: start,
    },
    update: {
      bookingWindow: input.bookingWindow,
      periodStartDate: start,
    },
  });

  await prisma.planning.updateMany({
    data: { bookingWindow: input.bookingWindow },
  });

  const bookingWindow = toPlanningBookingWindow(row.bookingWindow);
  return buildPlanningPeriodConfig(bookingWindow, periodStartFromRow(row.periodStartDate));
}

export function planningWindowDays(bookingWindow: PlanningBookingWindow): number {
  return BOOKING_WINDOW_DAYS[bookingWindow];
}
