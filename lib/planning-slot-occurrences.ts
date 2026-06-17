import type { DayOfWeek } from "@prisma/client";
import {
  eachOccurrenceInRange,
  formatYmdLocal,
  formatYmdPrismaDate,
  parseYmdLocal,
  prismaDayOfWeekFromLocalDate,
} from "@/lib/calendar-day";

export type PlanningSlotOccurrenceInput = {
  dayOfWeek: DayOfWeek;
  anchorSessionYmd?: Date | string | null;
};

function anchorYmdFromSlot(slot: PlanningSlotOccurrenceInput): string | null {
  if (!slot.anchorSessionYmd) return null;
  if (typeof slot.anchorSessionYmd === "string") {
    const trimmed = slot.anchorSessionYmd.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
    return formatYmdPrismaDate(new Date(slot.anchorSessionYmd));
  }
  return formatYmdPrismaDate(slot.anchorSessionYmd);
}

/**
 * Dates réelles d'un créneau dans [from, to] :
 * - avec ancre → uniquement ce jour si dans la plage ;
 * - sans ancre → toutes les occurrences du jour de semaine (comportement historique).
 */
export function planningSlotOccurrenceDates(
  slot: PlanningSlotOccurrenceInput,
  from: Date,
  to: Date,
): Date[] {
  const anchorYmd = anchorYmdFromSlot(slot);
  if (anchorYmd) {
    const day = parseYmdLocal(anchorYmd);
    if (!day) return [];
    const fromDay = new Date(from.getFullYear(), from.getMonth(), from.getDate());
    const toDay = new Date(to.getFullYear(), to.getMonth(), to.getDate());
    if (day < fromDay || day > toDay) return [];
    if (prismaDayOfWeekFromLocalDate(day) !== slot.dayOfWeek) return [];
    return [day];
  }
  return eachOccurrenceInRange(from, to, slot.dayOfWeek);
}

export function planningSlotOccurrenceYmds(
  slot: PlanningSlotOccurrenceInput,
  from: Date,
  to: Date,
): string[] {
  return planningSlotOccurrenceDates(slot, from, to).map((d) => formatYmdLocal(d));
}

