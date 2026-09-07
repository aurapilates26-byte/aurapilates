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
  saveDraftPeriodSchedule,
} from "@/lib/admin/planning-period-draft";
import { findOverlappingPlanningSlot } from "@/lib/admin/planning-slot-duplicate";
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
import {
  proposeNextPlanningPeriod,
  proposePreviousPlanningPeriod,
} from "@/lib/planning-period-status";
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

function occurrenceKey(slot: Pick<Planning, "courseSlug" | "startTime" | "anchorSessionYmd">): string {
  const ymd = slot.anchorSessionYmd ? formatYmdPrismaDate(slot.anchorSessionYmd) : "null";
  return `${ymd}|${slot.courseSlug}|${slot.startTime}`;
}

/** Garde un seul créneau par date + cours + heure (évite de propager des doublons). */
function dedupeSlotsByOccurrence(slots: Planning[]): Planning[] {
  const byKey = new Map<string, Planning>();
  for (const slot of slots) {
    const key = occurrenceKey(slot);
    const existing = byKey.get(key);
    if (!existing || slot.createdAt < existing.createdAt) {
      byKey.set(key, slot);
    }
  }
  return [...byKey.values()];
}

/** Crée le miroir brouillon s'il manque, sans modifier les créneaux publiés. */
async function createDraftMirrorIfMissing(source: Planning, draftAnchor: Date): Promise<void> {
  const existingDraft = await prisma.planning.findFirst({
    where: { draftSourceId: source.id, isDraft: true },
    select: { id: true },
  });
  if (existingDraft) return;

  const overlapDraft = await findOverlappingPlanningSlot(prisma, {
    anchorSessionYmd: draftAnchor,
    courseSlug: source.courseSlug,
    startTime: source.startTime,
    isDraft: true,
  });
  if (overlapDraft) return;

  // Ne jamais créer un miroir sur une date déjà publiée (sinon no-op à la bascule lundi).
  const overlapPublished = await findOverlappingPlanningSlot(prisma, {
    anchorSessionYmd: draftAnchor,
    courseSlug: source.courseSlug,
    startTime: source.startTime,
    isDraft: false,
  });
  if (overlapPublished) return;

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
async function createPublishedCloneIfMissing(
  source: Planning,
  targetAnchorDate: Date,
): Promise<boolean> {
  const overlap = await findOverlappingPlanningSlot(prisma, {
    anchorSessionYmd: targetAnchorDate,
    courseSlug: source.courseSlug,
    startTime: source.startTime,
    isDraft: false,
  });
  if (overlap) return false;

  const dayOfWeek = prismaDayOfWeekFromLocalDate(
    parseYmdLocal(formatYmdPrismaDate(targetAnchorDate)) ?? targetAnchorDate,
  );

  await prisma.planning.create({
    data: {
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
    },
  });
  return true;
}

/**
 * Si la période publiée est vide, la peuple depuis la période précédente
 * (après un roll-forward sans brouillon, ou une publication vide).
 */
export async function ensureEmptyPublishedPeriodSeeded(
  publishedPeriod?: PlanningPeriodConfig,
): Promise<number> {
  const published = publishedPeriod ?? (await readPublishedConfig());
  const existing = await sourceSlotsInPeriod(published);
  if (existing.length > 0) return 0;

  const previous = proposePreviousPlanningPeriod(published);
  if (!previous) return 0;

  const sourceSlots = dedupeSlotsByOccurrence(await sourceSlotsInPeriod(previous));
  if (sourceSlots.length === 0) return 0;

  let created = 0;
  for (const slot of sourceSlots) {
    const anchorYmd = slot.anchorSessionYmd ? formatYmdPrismaDate(slot.anchorSessionYmd) : null;
    if (!anchorYmd) continue;
    const shifted = shiftAnchorToDraftPeriod(
      anchorYmd,
      previous.periodStartYmd,
      published.periodStartYmd,
    );
    const targetAnchor = parseYmdToPrismaDate(shifted);
    if (!targetAnchor) continue;
    if (await createPublishedCloneIfMissing(slot, targetAnchor)) {
      created += 1;
    }
  }
  return created;
}

/** Clone les créneaux publiés d'une période vers une autre (roll-forward sans brouillon). */
export async function clonePublishedSlotsBetweenPeriods(
  sourcePeriod: PlanningPeriodConfig,
  targetPeriod: PlanningPeriodConfig,
): Promise<number> {
  if (sourcePeriod.periodStartYmd === targetPeriod.periodStartYmd) return 0;

  const sourceSlots = dedupeSlotsByOccurrence(await sourceSlotsInPeriod(sourcePeriod));
  if (sourceSlots.length === 0) return 0;

  let created = 0;
  for (const slot of sourceSlots) {
    const anchorYmd = slot.anchorSessionYmd ? formatYmdPrismaDate(slot.anchorSessionYmd) : null;
    if (!anchorYmd) continue;
    const shifted = shiftAnchorToDraftPeriod(
      anchorYmd,
      sourcePeriod.periodStartYmd,
      targetPeriod.periodStartYmd,
    );
    const targetAnchor = parseYmdToPrismaDate(shifted);
    if (!targetAnchor) continue;
    if (await createPublishedCloneIfMissing(slot, targetAnchor)) {
      created += 1;
    }
  }
  return created;
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
  published: PlanningPeriodConfig;
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

  // Brouillon = toujours la période APRÈS le singleton publié (jamais les dates publiées).
  // Utiliser calendarCurrent ici créait des miroirs sur la période en cours → doublons à la publication.
  const expectedNext = proposeNextPlanningPeriod(published);
  let draft = await readDraftConfig();

  if (!draft || draft.periodStartYmd !== expectedNext.periodStartYmd) {
    if (draft && draft.periodStartYmd !== expectedNext.periodStartYmd) {
      const bookedDraftCount = await prisma.reservation.count({
        where: {
          planning: { isDraft: true },
          status: { in: ["BOOKED", "WAITLIST"] },
        },
      });
      if (bookedDraftCount > 0) {
        // Catch-up lundi : ne jamais wipe un brouillon qui a déjà des réservations.
        return { published, calendarCurrent, expectedNext: draft, draft };
      }
      const emptyDraftIds = await prisma.planning.findMany({
        where: {
          isDraft: true,
          reservations: { none: {} },
        },
        select: { id: true },
      });
      if (emptyDraftIds.length > 0) {
        await prisma.planning.deleteMany({
          where: { id: { in: emptyDraftIds.map((d) => d.id) } },
        });
      }
      await clearAllDraftMirrorSuppressions();
    }
    await saveDraftPeriodSchedule({
      bookingWindow: expectedNext.bookingWindow,
      periodStartYmd: expectedNext.periodStartYmd,
    });
    draft = expectedNext;
  }

  return { published, calendarCurrent, expectedNext, draft };
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
  const { published, draft } = await getCalendarContext();

  await ensureEmptyPublishedPeriodSeeded(published);

  // Miroir depuis la période publiée (en cours) → brouillon suivant uniquement.
  const sourceSlots = dedupeSlotsByOccurrence(await sourceSlotsInPeriod(published));
  if (sourceSlots.length === 0) return;

  const sourceIds = sourceSlots.map((slot) => slot.id);
  const eligibleSources = sourceSlots.filter((slot) => !slot.draftMirrorSuppressedAt);

  if (eligibleSources.length === 0) return;

  const existingMirrors = await prisma.planning.findMany({
    where: {
      isDraft: true,
      draftSourceId: { in: sourceIds },
    },
    select: { draftSourceId: true },
  });
  const mirroredSourceIds = new Set(existingMirrors.map((row) => row.draftSourceId));

  if (eligibleSources.every((slot) => mirroredSourceIds.has(slot.id))) return;

  for (const slot of eligibleSources) {
    if (mirroredSourceIds.has(slot.id)) continue;
    const draftAnchor = draftAnchorDateForSourceSlot(slot, published, draft);
    if (!draftAnchor) continue;
    const draftYmd = formatYmdPrismaDate(draftAnchor);
    // Jamais de miroir sur les dates de la période publiée.
    if (periodContainsYmd(published, draftYmd)) continue;
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

export async function syncPublishedCreateToDraft(publishedSlot: Planning): Promise<void> {
  if (publishedSlot.draftMirrorSuppressedAt) return;
  const { published, draft } = await getCalendarContext();
  if (!slotBelongsToPeriod(publishedSlot, published)) return;
  const draftAnchor = draftAnchorDateForSourceSlot(publishedSlot, published, draft);
  if (!draftAnchor) return;
  if (periodContainsYmd(published, formatYmdPrismaDate(draftAnchor))) return;

  await createDraftMirrorIfMissing(publishedSlot, draftAnchor);
}

export async function syncPublishedUpdateToDraft(publishedSlot: Planning): Promise<void> {
  if (publishedSlot.draftMirrorSuppressedAt) return;
  const { published, draft } = await getCalendarContext();
  if (!slotBelongsToPeriod(publishedSlot, published)) return;
  const draftAnchor = draftAnchorDateForSourceSlot(publishedSlot, published, draft);
  if (!draftAnchor) return;
  if (periodContainsYmd(published, formatYmdPrismaDate(draftAnchor))) return;

  await clearStalePublishedMirrorLink(publishedSlot.id);

  const existingDraft = await prisma.planning.findFirst({
    where: { draftSourceId: publishedSlot.id, isDraft: true },
    select: { id: true },
  });

  if (existingDraft) {
    await prisma.planning.update({
      where: { id: existingDraft.id },
      data: mirrorUpdateDataFromSource(publishedSlot, draftAnchor),
    });
    return;
  }

  await createDraftMirrorIfMissing(publishedSlot, draftAnchor);
}

export async function syncPublishedDeleteToDraft(publishedId: string): Promise<void> {
  await prisma.planning.deleteMany({
    where: { isDraft: true, draftSourceId: publishedId },
  });
}
