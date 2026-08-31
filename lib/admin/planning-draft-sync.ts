import "server-only";

import { Prisma, type Planning } from "@prisma/client";
import {
  mapArchiveRowsForCalendar,
  periodContainsYmd,
  resolveCalendarCurrentPeriod,
  todayYmdLocal,
  type CalendarCurrentPeriod,
} from "@/lib/admin/planning-admin-calendar-period";
import { buildPlanningPeriodConfig } from "@/lib/admin/planning-period-config";
import {
  draftPeriodConfigOrNull,
  saveDraftPeriodSchedule,
} from "@/lib/admin/planning-period-draft";
import {
  addLocalDays,
  formatYmdLocal,
  formatYmdPrismaDate,
  parseYmdLocal,
  parseYmdToPrismaDate,
  prismaDayOfWeekFromLocalDate,
} from "@/lib/calendar-day";
import {
  clearAllDraftMirrorSuppressions,
} from "@/lib/admin/planning-draft-mirror-suppression";
import { prisma } from "@/lib/prisma";
import { proposeNextPlanningPeriod } from "@/lib/planning-period-status";
import type { PlanningPeriodConfig } from "@/types/admin/planning";

const SINGLETON_ID = "singleton";

function shiftAnchorToDraftPeriod(
  sourceAnchorYmd: string,
  sourceStartYmd: string,
  draftStartYmd: string,
): string {
  const sourceStart = parseYmdLocal(sourceStartYmd);
  const sourceAnchor = parseYmdLocal(sourceAnchorYmd);
  const draftStart = parseYmdLocal(draftStartYmd);
  if (!sourceStart || !sourceAnchor || !draftStart) return sourceAnchorYmd;

  const offsetDays = Math.round(
    (sourceAnchor.getTime() - sourceStart.getTime()) / (24 * 60 * 60 * 1000),
  );
  return formatYmdLocal(addLocalDays(draftStart, offsetDays));
}

function draftAnchorDateForSourceSlot(
  slot: Pick<Planning, "anchorSessionYmd" | "dayOfWeek">,
  sourcePeriod: PlanningPeriodConfig,
  draftPeriod: PlanningPeriodConfig,
): Date | null {
  const anchorYmd = slot.anchorSessionYmd ? formatYmdPrismaDate(slot.anchorSessionYmd) : null;
  if (!anchorYmd) return null;

  const shifted = shiftAnchorToDraftPeriod(
    anchorYmd,
    sourcePeriod.periodStartYmd,
    draftPeriod.periodStartYmd,
  );
  return parseYmdToPrismaDate(shifted);
}

function mirrorDataFromSource(
  source: Planning,
  draftAnchorDate: Date,
): Prisma.PlanningCreateInput {
  const dayOfWeek = prismaDayOfWeekFromLocalDate(
    parseYmdLocal(formatYmdPrismaDate(draftAnchorDate)) ?? draftAnchorDate,
  );

  return {
    courseSlug: source.courseSlug,
    coach: source.coachId ? { connect: { id: source.coachId } } : undefined,
    dayOfWeek,
    anchorSessionYmd: draftAnchorDate,
    isDraft: true,
    draftSource: { connect: { id: source.id } },
    level: source.level,
    bookingWindow: source.bookingWindow,
    startTime: source.startTime,
    endTime: source.endTime,
    durationMinutes: source.durationMinutes,
    capacity: source.capacity,
    waitlistCapacity: source.waitlistCapacity,
  };
}

function isDraftSourceIdConflict(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002" &&
    Array.isArray(error.meta?.target) &&
    error.meta.target.includes("draftSourceId")
  );
}

/** Retire un lien draftSourceId orphelin sur un créneau publié (ne touche pas aux données du cours). */
async function clearStalePublishedMirrorLink(sourceId: string): Promise<void> {
  await prisma.planning.updateMany({
    where: { draftSourceId: sourceId, isDraft: false },
    data: { draftSourceId: null },
  });
}

/** Crée le miroir brouillon s'il manque, sans modifier les créneaux publiés. */
async function createDraftMirrorIfMissing(source: Planning, draftAnchor: Date): Promise<void> {
  const existingDraft = await prisma.planning.findFirst({
    where: { draftSourceId: source.id, isDraft: true },
    select: { id: true },
  });
  if (existingDraft) return;

  await clearStalePublishedMirrorLink(source.id);

  try {
    await prisma.planning.create({
      data: mirrorDataFromSource(source, draftAnchor),
    });
  } catch (error) {
    if (isDraftSourceIdConflict(error)) return;
    throw error;
  }
}

function mirrorUpdateDataFromSource(
  source: Planning,
  draftAnchorDate: Date,
): Prisma.PlanningUpdateInput {
  const dayOfWeek = prismaDayOfWeekFromLocalDate(
    parseYmdLocal(formatYmdPrismaDate(draftAnchorDate)) ?? draftAnchorDate,
  );

  return {
    courseSlug: source.courseSlug,
    coach: source.coachId
      ? { connect: { id: source.coachId } }
      : { disconnect: true },
    dayOfWeek,
    anchorSessionYmd: draftAnchorDate,
    level: source.level,
    bookingWindow: source.bookingWindow,
    startTime: source.startTime,
    endTime: source.endTime,
    durationMinutes: source.durationMinutes,
    capacity: source.capacity,
    waitlistCapacity: source.waitlistCapacity,
  };
}

/** Copie publiée (sans lien draftSource) — pour peupler une période en cours vide. */
function publishedCloneFromSource(
  source: Planning,
  targetAnchorDate: Date,
): Prisma.PlanningCreateInput {
  const dayOfWeek = prismaDayOfWeekFromLocalDate(
    parseYmdLocal(formatYmdPrismaDate(targetAnchorDate)) ?? targetAnchorDate,
  );

  return {
    courseSlug: source.courseSlug,
    coach: source.coachId ? { connect: { id: source.coachId } } : undefined,
    dayOfWeek,
    anchorSessionYmd: targetAnchorDate,
    isDraft: false,
    level: source.level,
    bookingWindow: source.bookingWindow,
    startTime: source.startTime,
    endTime: source.endTime,
    durationMinutes: source.durationMinutes,
    capacity: source.capacity,
    waitlistCapacity: source.waitlistCapacity,
  };
}

function periodStartFromRow(periodStartDate: Date): Date {
  const ymd = formatYmdPrismaDate(periodStartDate);
  return parseYmdLocal(ymd) ?? new Date();
}

async function readPublishedConfig(): Promise<PlanningPeriodConfig> {
  const row = await prisma.studioPlanningPeriod.findUnique({ where: { id: SINGLETON_ID } });
  if (!row) {
    const { getPlanningPeriodConfig } = await import("@/lib/admin/planning-period-config");
    return getPlanningPeriodConfig();
  }
  const bookingWindow =
    row.bookingWindow === "FIFTEEN_DAYS" || row.bookingWindow === "ONE_MONTH"
      ? row.bookingWindow
      : "WEEKLY";
  return buildPlanningPeriodConfig(bookingWindow, periodStartFromRow(row.periodStartDate));
}

async function readArchivesForCalendar() {
  const rows = await prisma.studioPlanningPeriodArchive.findMany({
    orderBy: { periodStartDate: "asc" },
  });
  return mapArchiveRowsForCalendar(rows);
}

async function readDraftConfig(): Promise<PlanningPeriodConfig | null> {
  const row = await prisma.studioPlanningPeriod.findUnique({ where: { id: SINGLETON_ID } });
  if (!row?.draftPeriodStartDate || !row.draftBookingWindow) return null;
  const bookingWindow =
    row.draftBookingWindow === "FIFTEEN_DAYS" || row.draftBookingWindow === "ONE_MONTH"
      ? row.draftBookingWindow
      : "WEEKLY";
  return buildPlanningPeriodConfig(bookingWindow, periodStartFromRow(row.draftPeriodStartDate));
}

async function getCalendarContext(): Promise<{
  calendarCurrent: CalendarCurrentPeriod;
  expectedNext: PlanningPeriodConfig;
  draft: PlanningPeriodConfig;
}> {
  const published = await readPublishedConfig();
  const archives = await readArchivesForCalendar();
  const todayYmd = todayYmdLocal();
  const calendarCurrent = resolveCalendarCurrentPeriod(todayYmd, published, archives);

  if (!calendarCurrent) {
    throw new Error("Impossible de déterminer la période en cours.");
  }

  const expectedNext = proposeNextPlanningPeriod(calendarCurrent.period);
  let draft = await readDraftConfig();

  if (!draft || draft.periodStartYmd !== expectedNext.periodStartYmd) {
    if (draft && draft.periodStartYmd !== expectedNext.periodStartYmd) {
      await prisma.planning.deleteMany({ where: { isDraft: true } });
      await clearAllDraftMirrorSuppressions();
    }
    await saveDraftPeriodSchedule({
      bookingWindow: expectedNext.bookingWindow,
      periodStartYmd: expectedNext.periodStartYmd,
    });
    draft = expectedNext;
  }

  return { calendarCurrent, expectedNext, draft };
}

async function sourceSlotsInPeriod(period: PlanningPeriodConfig) {
  const periodStart = parseYmdToPrismaDate(period.periodStartYmd);
  const periodEnd = parseYmdToPrismaDate(period.periodEndYmd);
  if (!periodStart || !periodEnd) return [];

  return prisma.planning.findMany({
    where: {
      isDraft: false,
      anchorSessionYmd: { gte: periodStart, lte: periodEnd },
    },
  });
}

/** Garantit la période brouillon (période suivante immédiate) + copies des créneaux en cours. */
let draftMirrorSyncPromise: Promise<void> | null = null;

async function runEnsureDraftPeriodWithMirrors(): Promise<void> {
  const { calendarCurrent, draft } = await getCalendarContext();
  // Uniquement miroir brouillon des créneaux publiés existants — jamais de copie dans la période en cours.
  const sourceSlots = await sourceSlotsInPeriod(calendarCurrent.period);
  if (sourceSlots.length === 0) return;

  const sourceIds = sourceSlots.map((slot) => slot.id);
  const eligibleSourceIds = sourceSlots
    .filter((slot) => !slot.draftMirrorSuppressedAt)
    .map((slot) => slot.id);

  if (eligibleSourceIds.length === 0) return;

  const existingMirrors = await prisma.planning.findMany({
    where: {
      isDraft: true,
      draftSourceId: { in: sourceIds },
    },
    select: { draftSourceId: true },
  });
  const mirroredSourceIds = new Set(existingMirrors.map((row) => row.draftSourceId));

  if (eligibleSourceIds.every((id) => mirroredSourceIds.has(id))) return;

  for (const slot of sourceSlots) {
    if (mirroredSourceIds.has(slot.id)) continue;
    if (slot.draftMirrorSuppressedAt) continue;
    const draftAnchor = draftAnchorDateForSourceSlot(slot, calendarCurrent.period, draft);
    if (!draftAnchor) continue;
    await createDraftMirrorIfMissing(slot, draftAnchor);
  }
}

/** Synchro brouillon sérialisée (évite les doublons si plusieurs requêtes arrivent en parallèle). */
export function ensureDraftPeriodWithMirrors(): Promise<void> {
  if (!draftMirrorSyncPromise) {
    draftMirrorSyncPromise = runEnsureDraftPeriodWithMirrors().finally(() => {
      draftMirrorSyncPromise = null;
    });
  }
  return draftMirrorSyncPromise;
}

function slotBelongsToPeriod(
  slot: Pick<Planning, "anchorSessionYmd">,
  period: PlanningPeriodConfig,
): boolean {
  if (!slot.anchorSessionYmd) return false;
  return periodContainsYmd(period, formatYmdPrismaDate(slot.anchorSessionYmd));
}

export async function syncPublishedCreateToDraft(published: Planning): Promise<void> {
  if (published.draftMirrorSuppressedAt) return;
  const { calendarCurrent, draft } = await getCalendarContext();
  if (!slotBelongsToPeriod(published, calendarCurrent.period)) return;
  const draftAnchor = draftAnchorDateForSourceSlot(published, calendarCurrent.period, draft);
  if (!draftAnchor) return;

  await createDraftMirrorIfMissing(published, draftAnchor);
}

export async function syncPublishedUpdateToDraft(published: Planning): Promise<void> {
  if (published.draftMirrorSuppressedAt) return;
  const { calendarCurrent, draft } = await getCalendarContext();
  if (!slotBelongsToPeriod(published, calendarCurrent.period)) return;
  const draftAnchor = draftAnchorDateForSourceSlot(published, calendarCurrent.period, draft);
  if (!draftAnchor) return;

  await clearStalePublishedMirrorLink(published.id);

  const existingDraft = await prisma.planning.findFirst({
    where: { draftSourceId: published.id, isDraft: true },
    select: { id: true },
  });

  if (existingDraft) {
    await prisma.planning.update({
      where: { id: existingDraft.id },
      data: mirrorUpdateDataFromSource(published, draftAnchor),
    });
    return;
  }

  await createDraftMirrorIfMissing(published, draftAnchor);
}

export async function syncPublishedDeleteToDraft(publishedId: string): Promise<void> {
  await prisma.planning.deleteMany({
    where: { isDraft: true, draftSourceId: publishedId },
  });
}
