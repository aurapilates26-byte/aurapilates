export type PackQuotaShape = {
  sessionCount: number | null;
  courseQuotas: { courseSlug: string; sessionCount: number }[];
};

type BalanceRow = { courseSlug: string | null; remaining: number };

/**
 * Solde persisté. Un enregistrement à 0 est un pack terminé — ne jamais
 * retomber sur le catalogue (sinon 12/12 réapparaît en 0/12 à la réservation).
 * Aucune ligne : pack pas encore synchronisé → taille catalogue.
 */
export function totalRemainingFromBalances(balances: BalanceRow[], pack: PackQuotaShape): number {
  if (balances.length > 0) {
    return balances.reduce((sum, b) => sum + Math.max(0, b.remaining), 0);
  }
  if (pack.courseQuotas.length > 0) {
    return pack.courseQuotas.reduce((sum, q) => sum + q.sessionCount, 0);
  }
  return pack.sessionCount ?? 0;
}

export function remainingForCourseFromBalances(
  balances: BalanceRow[],
  pack: PackQuotaShape,
  courseSlug: string,
): number {
  if (pack.courseQuotas.length > 0) {
    const quota = pack.courseQuotas.find((q) => q.courseSlug === courseSlug);
    if (!quota) return 0;
    const balance = balances.find((b) => b.courseSlug === courseSlug);
    if (balance) return Math.max(0, balance.remaining);
    if (balances.length > 0) return 0;
    return quota.sessionCount;
  }
  return totalRemainingFromBalances(balances, pack);
}
