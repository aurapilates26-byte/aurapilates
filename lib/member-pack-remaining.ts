/** Séances encore utilisables : champ restant OU 8/10 (consommé < total). */
export function packHasUnconsumedSessions(pack: {
  remainingSessions: number;
  consumedSessions: number;
  totalSessions: number | null;
}): boolean {
  if (pack.remainingSessions > 0) return true;
  if (pack.totalSessions != null && pack.consumedSessions < pack.totalSessions) return true;
  return false;
}
