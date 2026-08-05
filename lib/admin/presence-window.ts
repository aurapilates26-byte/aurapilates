/** Fuseau studio Aura Pilates (Tunisie, UTC+1 sans heure d'été). */
export const STUDIO_TIME_ZONE = "Africa/Tunis";

/** Utilitaires fenêtre de présence : ouverture 15 min avant le début du cours. */

export function minus15Minutes(clock: string): string {
  const [hhRaw, mmRaw] = clock.split(":");
  const hh = Number(hhRaw ?? 0);
  const mm = Number(mmRaw ?? 0);
  const total = hh * 60 + mm - 15;
  const clamped = ((total % (24 * 60)) + 24 * 60) % (24 * 60);
  const outH = Math.floor(clamped / 60);
  const outM = clamped % 60;
  return `${String(outH).padStart(2, "0")}:${String(outM).padStart(2, "0")}`;
}

/** Heure HH:MM et date Y-M-D dans le fuseau studio (pas le TZ du process / PC). */
export function studioNowClock(now: Date = new Date()): { ymd: string; timeHm: string } {
  const ymd = new Intl.DateTimeFormat("en-CA", {
    timeZone: STUDIO_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);

  // hour12: false + hourCycle h23 : évite un affichage 12h (09:xx au lieu de 21:xx) selon le navigateur.
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: STUDIO_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    hourCycle: "h23",
  }).formatToParts(now);

  const hourRaw = parts.find((p) => p.type === "hour")?.value ?? "00";
  const minuteRaw = parts.find((p) => p.type === "minute")?.value ?? "00";
  // Certains runtimes renvoient "24" pour minuit avec h23.
  const hourNum = Number(hourRaw) % 24;
  const minuteNum = Number(minuteRaw);
  const timeHm = `${String(Number.isFinite(hourNum) ? hourNum : 0).padStart(2, "0")}:${String(Number.isFinite(minuteNum) ? minuteNum : 0).padStart(2, "0")}`;
  return { ymd, timeHm };
}

export function localNowTimeString(offsetMinutes: number = 0): string {
  const n = offsetMinutes === 0 ? new Date() : new Date(Date.now() + offsetMinutes * 60_000);
  return studioNowClock(n).timeHm;
}

/** Créneau en cours : de (début − 15 min) jusqu'à la fin du cours. */
export function isPresenceWindowOpen(startTime: string, endTime: string, nowTime: string): boolean {
  const opensAt = minus15Minutes(startTime);
  return opensAt <= nowTime && endTime >= nowTime;
}

/**
 * Marquage autorisé dès (début − 15 min), pendant le cours et après la fin (même jour).
 * Avant cette heure → refusé.
 */
export function isPresenceMarkingAllowed(startTime: string, nowTime: string, leadMinutes = 15): boolean {
  const [h, m] = nowTime.split(":").map(Number);
  const nowMins = (h ?? 0) * 60 + (m ?? 0);
  const [sh, sm] = startTime.split(":").map(Number);
  const startMins = (sh ?? 0) * 60 + (sm ?? 0);
  const opensMins = (startMins - leadMinutes + 24 * 60) % (24 * 60);

  if (opensMins <= startMins) {
    // Cas normal : ouverture et début le même jour calendaire.
    return nowMins >= opensMins;
  }
  // Ouverture la veille (ex. cours 00:10 → ouverture 23:55).
  return nowMins >= opensMins || nowMins <= startMins + 12 * 60;
}

export type PresenceSessionPhase = "upcoming" | "active" | "ended";

/** Phase d'un créneau du jour par rapport à l'heure actuelle. */
export function getPresenceSessionPhase(
  startTime: string,
  endTime: string,
  nowTime: string,
): PresenceSessionPhase {
  if (!isPresenceMarkingAllowed(startTime, nowTime)) return "upcoming";

  const [sh, sm] = startTime.split(":").map(Number);
  const [eh, em] = endTime.split(":").map(Number);
  const [nh, nm] = nowTime.split(":").map(Number);
  const startMins = (sh ?? 0) * 60 + (sm ?? 0);
  const endMins = (eh ?? 0) * 60 + (em ?? 0);
  const nowMins = (nh ?? 0) * 60 + (nm ?? 0);

  const pastEnd =
    endMins >= startMins
      ? nowMins > endMins
      : nowMins > endMins && nowMins < startMins;

  if (pastEnd) return "ended";
  return "active";
}

export function compareClock(a: string, b: string): number {
  return a.localeCompare(b);
}
