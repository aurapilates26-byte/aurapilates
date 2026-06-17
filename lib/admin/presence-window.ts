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

export function localNowTimeString(offsetMinutes: number = 0): string {
  const n = new Date();
  if (offsetMinutes === 0) {
    return `${String(n.getHours()).padStart(2, "0")}:${String(n.getMinutes()).padStart(2, "0")}`;
  }
  const d = new Date(n.getTime() + offsetMinutes * 60_000);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

/** Présence ouverte : de (début − 15 min) jusqu'à la fin du cours. */
export function isPresenceWindowOpen(startTime: string, endTime: string, nowTime: string): boolean {
  const opensAt = minus15Minutes(startTime);
  return opensAt <= nowTime && endTime >= nowTime;
}

export function compareClock(a: string, b: string): number {
  return a.localeCompare(b);
}
