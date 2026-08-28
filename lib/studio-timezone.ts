/** Fuseau du studio (Tunisie). Surchargeable via STUDIO_TIMEZONE en production. */
export const STUDIO_TIMEZONE = process.env.STUDIO_TIMEZONE ?? "Africa/Tunis";

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

export type StudioWallClock = {
  year: number;
  month: number;
  day: number;
  hours: number;
  minutes: number;
};

/** Date/heure « murale » du studio pour un instant UTC. */
export function studioWallClock(date: Date = new Date()): StudioWallClock {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: STUDIO_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  const parts = formatter.formatToParts(date);
  const read = (type: Intl.DateTimeFormatPartTypes): number =>
    Number(parts.find((p) => p.type === type)?.value ?? 0);
  return {
    year: read("year"),
    month: read("month"),
    day: read("day"),
    hours: read("hour"),
    minutes: read("minute"),
  };
}

export function studioClockHHMM(date: Date = new Date()): string {
  const { hours, minutes } = studioWallClock(date);
  return `${pad2(hours)}:${pad2(minutes)}`;
}

/** Jour calendaire du studio au format YYYY-MM-DD. */
export function studioYmd(date: Date = new Date()): string {
  const { year, month, day } = studioWallClock(date);
  return `${year}-${pad2(month)}-${pad2(day)}`;
}

/** Minuit calendaire du jour studio (Date JS locale, usage interne). */
export function startOfStudioCalendarDay(date: Date = new Date()): Date {
  const { year, month, day } = studioWallClock(date);
  return new Date(year, month - 1, day);
}
