import "server-only";

import type { DayOfWeek, DraftPublicationPhase, StudioPlanningPeriod } from "@prisma/client";
import { buildPlanningPeriodConfig } from "@/lib/admin/planning-period-config";
import {
  addLocalDays,
  formatYmdLocal,
  formatYmdPrismaDate,
  parseYmdLocal,
  prismaDayOfWeekFromLocalDate,
  startOfLocalToday,
} from "@/lib/calendar-day";
import { prisma } from "@/lib/prisma";
import type { PlanningBookingWindow, PlanningPeriodConfig } from "@/types/admin/planning";
import { isSessionYmdWithinPlanningPeriod } from "@/lib/planning-period-status";

const SINGLETON_ID = "singleton";

/** Heure locale studio : publication chaque samedi / dimanche. */
export const STUDIO_PLANNING_PUBLISH_HOUR = 13;
export const STUDIO_PLANNING_PUBLISH_MINUTE = 0;

const WEEKDAY_MON_TO_SAT: DayOfWeek[] = ["MON", "TUE", "WED", "THU", "FRI", "SAT"];

export type StaggeredPublishTimes = {
  partialPublishAt: Date;
  fullPublishAt: Date;
  partialPublishYmd: string;
  fullPublishYmd: string;
};

export type StaggeredPublicationContext = {
  mode: "normal" | "partial";
  published: PlanningPeriodConfig;
  draft: PlanningPeriodConfig | null;
  /** Dimanche de la période affichée encore réservable pendant la phase partielle. */
  partialLegacySundayYmd: string | null;
};

function toPlanningBookingWindow(w: string): PlanningBookingWindow {
  if (w === "FIFTEEN_DAYS" || w === "ONE_MONTH") return w;
  return "WEEKLY";
}

function periodStartFromRow(periodStartDate: Date): Date {
  const ymd = formatYmdPrismaDate(periodStartDate);
  return parseYmdLocal(ymd) ?? new Date();
}

function localPublishAt(ymd: string, hour = STUDIO_PLANNING_PUBLISH_HOUR): Date | null {
  const day = parseYmdLocal(ymd.trim());
  if (!day) return null;
  return new Date(
    day.getFullYear(),
    day.getMonth(),
    day.getDate(),
    hour,
    STUDIO_PLANNING_PUBLISH_MINUTE,
    0,
    0,
  );
}

/**
 * Samedi 13h (J-2) : lun–sam du brouillon.
 * Dimanche 13h (J-1) : dimanche du brouillon + bascule complète.
 */
export function computeStaggeredPublishTimes(periodStartYmd: string): StaggeredPublishTimes | null {
  const periodStart = parseYmdLocal(periodStartYmd.trim());
  if (!periodStart) return null;

  const partialDay = addLocalDays(periodStart, -2);
  const fullDay = addLocalDays(periodStart, -1);
  const partialPublishYmd = formatYmdLocal(partialDay);
  const fullPublishYmd = formatYmdLocal(fullDay);

  const partialPublishAt = localPublishAt(partialPublishYmd);
  const fullPublishAt = localPublishAt(fullPublishYmd);
  if (!partialPublishAt || !fullPublishAt) return null;

  return { partialPublishAt, fullPublishAt, partialPublishYmd, fullPublishYmd };
}

export function formatStaggeredPublishLabelFr(times: StaggeredPublishTimes): {
  partial: string;
  full: string;
} {
  const fmt = (ymd: string) => {
    const p = ymd.split("-");
    return p.length === 3 ? `${p[2]}/${p[1]}/${p[0]}` : ymd;
  };
  return {
    partial: `${fmt(times.partialPublishYmd)} à ${String(STUDIO_PLANNING_PUBLISH_HOUR).padStart(2, "0")}:00`,
    full: `${fmt(times.fullPublishYmd)} à ${String(STUDIO_PLANNING_PUBLISH_HOUR).padStart(2, "0")}:00`,
  };
}

function anchorYmdFromSlot(anchorSessionYmd: Date | string | null | undefined): string | null {
  if (!anchorSessionYmd) return null;
  if (typeof anchorSessionYmd === "string") {
    const trimmed = anchorSessionYmd.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
    return formatYmdPrismaDate(new Date(anchorSessionYmd));
  }
  return formatYmdPrismaDate(anchorSessionYmd);
}

export async function readStaggeredPublicationContext(): Promise<StaggeredPublicationContext | null> {
  const row = await prisma.studioPlanningPeriod.findUnique({ where: { id: SINGLETON_ID } });
  if (!row) return null;

  const published = buildPlanningPeriodConfig(
    toPlanningBookingWindow(row.bookingWindow),
    periodStartFromRow(row.periodStartDate),
  );

  if (row.draftPublicationPhase !== "PARTIAL" || !row.draftPeriodStartDate || !row.draftBookingWindow) {
    return { mode: "normal", published, draft: null, partialLegacySundayYmd: null };
  }

  const draft = buildPlanningPeriodConfig(
    toPlanningBookingWindow(row.draftBookingWindow),
    periodStartFromRow(row.draftPeriodStartDate),
  );

  return {
    mode: "partial",
    published,
    draft,
    partialLegacySundayYmd: published.periodEndYmd,
  };
}

/** Créneau visible adhérente / site pendant la transition samedi–dimanche. */
export function isPlanningOccurrenceVisibleToPublic(
  ctx: StaggeredPublicationContext,
  slot: {
    isDraft: boolean;
    dayOfWeek: DayOfWeek;
    anchorSessionYmd: Date | string | null;
  },
  sessionYmd: string,
): boolean {
  if (ctx.mode === "normal") {
    if (slot.isDraft) return false;
    return isSessionYmdWithinPlanningPeriod(sessionYmd, ctx.published);
  }

  const anchorYmd = anchorYmdFromSlot(slot.anchorSessionYmd);
  const sessionDay = parseYmdLocal(sessionYmd);
  if (!sessionDay) return false;

  if (slot.isDraft) {
    if (!ctx.draft) return false;
    if (!isSessionYmdWithinPlanningPeriod(sessionYmd, ctx.draft)) return false;
    if (!anchorYmd || anchorYmd !== sessionYmd) return false;
    return WEEKDAY_MON_TO_SAT.includes(prismaDayOfWeekFromLocalDate(sessionDay));
  }

  if (!ctx.partialLegacySundayYmd) return false;
  if (sessionYmd !== ctx.partialLegacySundayYmd) return false;
  if (anchorYmd) return anchorYmd === ctx.partialLegacySundayYmd;
  return slot.dayOfWeek === "SUN";
}

/** Au moins une occurrence du créneau est visible dans la fenêtre [from, to]. */
export function planningSlotHasPublicOccurrenceInRange(
  ctx: StaggeredPublicationContext,
  slot: {
    isDraft: boolean;
    dayOfWeek: DayOfWeek;
    anchorSessionYmd: Date | string | null;
  },
  from: Date,
  to: Date,
): boolean {
  const anchorYmd = anchorYmdFromSlot(slot.anchorSessionYmd);
  if (anchorYmd) {
    const day = parseYmdLocal(anchorYmd);
    if (!day) return false;
    const fromDay = new Date(from.getFullYear(), from.getMonth(), from.getDate());
    const toDay = new Date(to.getFullYear(), to.getMonth(), to.getDate());
    if (day < fromDay || day > toDay) return false;
    return isPlanningOccurrenceVisibleToPublic(ctx, slot, anchorYmd);
  }

  for (let d = new Date(from); d <= to; d = addLocalDays(d, 1)) {
    if (prismaDayOfWeekFromLocalDate(d) !== slot.dayOfWeek) continue;
    const ymd = formatYmdLocal(d);
    if (isPlanningOccurrenceVisibleToPublic(ctx, slot, ymd)) return true;
  }
  return false;
}

export async function activatePartialDraftPublication(row: StudioPlanningPeriod): Promise<void> {
  if (!row.draftPeriodStartDate || !row.draftBookingWindow) return;

  await prisma.studioPlanningPeriod.update({
    where: { id: SINGLETON_ID },
    data: { draftPublicationPhase: "PARTIAL" satisfies DraftPublicationPhase },
  });
}

/**
 * Samedi 13h → phase partielle (lun–sam brouillon + dimanche période actuelle).
 * Dimanche 13h → publication complète.
 * Sans brouillon : ne fait rien.
 */
export async function maybeRunStaggeredDraftPublication(now: Date = new Date()): Promise<boolean> {
  const row = await prisma.studioPlanningPeriod.findUnique({ where: { id: SINGLETON_ID } });
  if (!row?.draftPeriodStartDate || !row.draftBookingWindow) {
    return false;
  }

  const published = buildPlanningPeriodConfig(
    toPlanningBookingWindow(row.bookingWindow),
    periodStartFromRow(row.periodStartDate),
  );
  const todayYmd = formatYmdLocal(startOfLocalToday());

  const partialAt = row.draftPublishAt?.getTime();
  const nowMs = now.getTime();

  // Bascule complète uniquement après le dernier jour de la période affichée (pas le dimanche 13h).
  if (todayYmd > published.periodEndYmd) {
    const { publishDraftPeriod } = await import("@/lib/admin/planning-period-draft");
    await publishDraftPeriod(row);
    return true;
  }

  if (
    partialAt != null &&
    nowMs >= partialAt &&
    row.draftPublicationPhase !== "PARTIAL"
  ) {
    await activatePartialDraftPublication(row);
    return true;
  }

  return false;
}

export function staggeredPublishTimesForDraftStart(periodStartYmd: string): StaggeredPublishTimes | null {
  return computeStaggeredPublishTimes(periodStartYmd);
}

export function memberBookingWindowFromContext(
  ctx: StaggeredPublicationContext,
): { fromYmd: string; toYmd: string } {
  if (ctx.mode === "partial" && ctx.draft) {
    const draftLastSat = lastSaturdayYmdInPeriod(ctx.draft);
    const fromCandidates = [ctx.partialLegacySundayYmd, ctx.draft.periodStartYmd].filter(
      (v): v is string => Boolean(v),
    );
    const toCandidates = [draftLastSat, ctx.partialLegacySundayYmd].filter((v): v is string => Boolean(v));
    return {
      fromYmd: fromCandidates.sort()[0]!,
      toYmd: toCandidates.sort().at(-1)!,
    };
  }

  return { fromYmd: ctx.published.periodStartYmd, toYmd: ctx.published.periodEndYmd };
}

function lastSaturdayYmdInPeriod(config: PlanningPeriodConfig): string {
  const end = parseYmdLocal(config.periodEndYmd);
  const start = parseYmdLocal(config.periodStartYmd);
  if (!end || !start) return config.periodEndYmd;
  let d = end;
  while (d >= start) {
    if (prismaDayOfWeekFromLocalDate(d) === "SAT") return formatYmdLocal(d);
    d = addLocalDays(d, -1);
  }
  return config.periodEndYmd;
}

export async function assertMemberCanBookOccurrence(params: {
  planning: { isDraft: boolean; dayOfWeek: DayOfWeek; anchorSessionYmd: Date | null };
  sessionYmd: string;
}): Promise<void> {
  const ctx = await readStaggeredPublicationContext();
  if (!ctx) throw new Error("OUTSIDE_PLANNING_PERIOD");

  if (!isPlanningOccurrenceVisibleToPublic(ctx, params.planning, params.sessionYmd)) {
    throw new Error("OUTSIDE_PLANNING_PERIOD");
  }
}
