import "server-only";

import type { BookingWindow, StudioPlanningPeriod } from "@prisma/client";
import { buildPlanningPeriodConfig } from "@/lib/admin/planning-period-config";
import {
  computeStaggeredPublishTimes,
  formatStaggeredPublishLabelFr,
  maybeRunStaggeredDraftPublication,
} from "@/lib/admin/planning-staggered-publish";
import { formatYmdLocal, formatYmdPrismaDate, parseYmdLocal, parseYmdToPrismaDate } from "@/lib/calendar-day";
import { prisma } from "@/lib/prisma";
import { getStudioBookingRules } from "@/lib/studio-booking-rules-server";
import { enrichPlanningPeriodConfig } from "@/lib/planning-period-status";
import type {
  PlanningBookingWindow,
  PlanningPeriodConfig,
  PlanningPeriodDraftSchedule,
  PlanningPeriodEnriched,
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

/** Date/heure locale → instant pour comparaison et stockage. */
export function parseLocalPublishAt(ymd: string, timeHm = "00:00"): Date | null {
  const day = parseYmdLocal(ymd.trim());
  if (!day) return null;
  const parts = timeHm.trim().split(":");
  const h = Number(parts[0] ?? 0);
  const m = Number(parts[1] ?? 0);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return null;
  return new Date(day.getFullYear(), day.getMonth(), day.getDate(), h, m, 0, 0);
}

export function formatPublishAtTimeHm(d: Date): string {
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

export function buildDraftScheduleFromRow(row: StudioPlanningPeriod): PlanningPeriodDraftSchedule | null {
  if (!row.draftPeriodStartDate || !row.draftBookingWindow) return null;

  const bookingWindow = toPlanningBookingWindow(row.draftBookingWindow);
  const config = buildPlanningPeriodConfig(bookingWindow, periodStartFromRow(row.draftPeriodStartDate));
  const enriched = enrichPlanningPeriodConfig(config);

  const publishAt = row.draftPublishAt;
  const publishAtIso = publishAt?.toISOString() ?? null;
  const publishAtYmd = publishAt ? formatYmdLocal(publishAt) : null;
  const publishAtTime = publishAt ? formatPublishAtTimeHm(publishAt) : "13:00";
  const sundayPublishAt = row.draftSundayPublishAt;
  const sundayPublishAtIso = sundayPublishAt?.toISOString() ?? null;
  const sundayPublishAtYmd = sundayPublishAt ? formatYmdLocal(sundayPublishAt) : null;

  const now = Date.now();
  const phase = row.draftPublicationPhase;
  const scheduled =
    phase === "SCHEDULED" && publishAt != null && publishAt.getTime() > now;

  const staggered =
    publishAtYmd && config.periodStartYmd
      ? computeStaggeredPublishTimes(config.periodStartYmd)
      : null;
  const staggeredLabels = staggered ? formatStaggeredPublishLabelFr(staggered) : null;

  let statusLabel = "Brouillon prêt à publier";
  if (phase === "PARTIAL") {
    statusLabel = "Publication partielle (du lundi au samedi visibles)";
  } else if (scheduled) {
    statusLabel = "Brouillon programmé";
  }

  return {
    ...enriched,
    publishAtIso,
    publishAtYmd,
    publishAtTime,
    sundayPublishAtIso,
    sundayPublishAtYmd,
    partialPublishLabel: staggeredLabels?.partial ?? null,
    fullPublishLabel: staggeredLabels?.full ?? null,
    publicationPhase: phase,
    scheduled,
    statusLabel,
  };
}

export async function publishDraftPeriod(row: StudioPlanningPeriod): Promise<void> {
  if (!row.draftPeriodStartDate || !row.draftBookingWindow) return;

  const { archiveCurrentPublishedPeriod } = await import("@/lib/admin/planning-period-archive");
  await archiveCurrentPublishedPeriod();

  const bookingWindow = row.draftBookingWindow;
  const periodStartDate = row.draftPeriodStartDate;
  await prisma.$transaction([
    prisma.studioPlanningPeriod.update({
      where: { id: SINGLETON_ID },
      data: {
        bookingWindow,
        periodStartDate,
        draftPeriodStartDate: null,
        draftBookingWindow: null,
        draftPublishAt: null,
        draftSundayPublishAt: null,
        draftPublicationPhase: null,
      },
    }),
    prisma.planning.updateMany({
      where: { isDraft: true },
      data: { isDraft: false, bookingWindow },
    }),
    prisma.planning.updateMany({
      where: { isDraft: false },
      data: { bookingWindow },
    }),
  ]);
}

/** Bascule auto : samedi 13h (partiel) puis dimanche 13h (complet). */
export async function maybeActivateScheduledDraft(): Promise<boolean> {
  return maybeRunStaggeredDraftPublication();
}

/** Publication échelonnée : samedi 13h = lun–sam, dimanche 13h = dimanche + bascule. */
export function draftPublishAtFromPeriodStart(periodStartYmd: string): Date | null {
  return computeStaggeredPublishTimes(periodStartYmd)?.partialPublishAt ?? null;
}

export function draftSundayPublishAtFromPeriodStart(periodStartYmd: string): Date | null {
  return computeStaggeredPublishTimes(periodStartYmd)?.fullPublishAt ?? null;
}

export async function saveDraftPeriodSchedule(input: {
  bookingWindow: PlanningBookingWindow;
  periodStartYmd: string;
}): Promise<PlanningPeriodDraftSchedule> {
  const start = parseYmdToPrismaDate(input.periodStartYmd.trim());
  if (!start) {
    throw new Error("Date de début du brouillon invalide.");
  }

  const staggered = computeStaggeredPublishTimes(input.periodStartYmd.trim());
  if (!staggered) {
    throw new Error("Date de début du brouillon invalide.");
  }

  const row = await prisma.studioPlanningPeriod.update({
    where: { id: SINGLETON_ID },
    data: {
      draftPeriodStartDate: start,
      draftBookingWindow: input.bookingWindow,
      draftPublishAt: staggered.partialPublishAt,
      draftSundayPublishAt: staggered.fullPublishAt,
      draftPublicationPhase: "SCHEDULED",
    },
  });

  const schedule = buildDraftScheduleFromRow(row);
  if (!schedule) {
    throw new Error("Impossible d'enregistrer le brouillon.");
  }
  return schedule;
}

export async function clearDraftPeriodSchedule(): Promise<void> {
  await prisma.$transaction([
    prisma.studioPlanningPeriod.update({
      where: { id: SINGLETON_ID },
      data: {
        draftPeriodStartDate: null,
        draftBookingWindow: null,
        draftPublishAt: null,
        draftSundayPublishAt: null,
        draftPublicationPhase: null,
      },
    }),
    prisma.planning.deleteMany({ where: { isDraft: true } }),
  ]);
}

export async function prepareDraftFromSuggestion(
  suggestion: PlanningPeriodConfig,
): Promise<PlanningPeriodDraftSchedule> {
  return saveDraftPeriodSchedule({
    bookingWindow: suggestion.bookingWindow,
    periodStartYmd: suggestion.periodStartYmd,
  });
}

export type AdminPlanningPeriodWindow = import("@/types/admin/planning").AdminPlanningPeriodWindow;

export async function getAdminPlanningPeriodWindow(): Promise<AdminPlanningPeriodWindow> {
  const { maybeRollForwardExpiredPublishedPeriod } = await import("@/lib/admin/planning-period-archive");
  await maybeActivateScheduledDraft();
  await maybeRollForwardExpiredPublishedPeriod();

  const row = await prisma.studioPlanningPeriod.findUnique({ where: { id: SINGLETON_ID } });
  if (!row) {
    const { getPlanningPeriodConfigEnriched } = await import("@/lib/admin/planning-period-config");
    const published = await getPlanningPeriodConfigEnriched();
    const bookingRules = await getStudioBookingRules();
    return { published, draft: null, bookingRules };
  }

  const bookingWindow = toPlanningBookingWindow(row.bookingWindow);
  const published = enrichPlanningPeriodConfig(
    buildPlanningPeriodConfig(bookingWindow, periodStartFromRow(row.periodStartDate)),
  );
  const draft = buildDraftScheduleFromRow(row);
  const bookingRules = await getStudioBookingRules();

  return { published, draft, bookingRules };
}

export function draftPeriodConfigOrNull(draft: PlanningPeriodDraftSchedule | null): PlanningPeriodConfig | null {
  if (!draft) return null;
  return {
    bookingWindow: draft.bookingWindow,
    periodStartYmd: draft.periodStartYmd,
    periodEndYmd: draft.periodEndYmd,
    periodLabel: draft.periodLabel,
  };
}
