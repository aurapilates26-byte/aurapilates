import { formatYmdLocal, parseYmdToPrismaDate } from "@/lib/calendar-day";
import { addPackDurationToStartDate } from "@/lib/pack-duration";

/** Date locale (minuit) à partir d'un DateTime packStartedAt stocké en base. */
export function packStartDateLocal(packStartedAt: Date | null | undefined): Date | null {
  if (!packStartedAt) return null;
  return new Date(packStartedAt.getFullYear(), packStartedAt.getMonth(), packStartedAt.getDate());
}

export function packExpiresAtLocal(
  packStartedAt: Date | null | undefined,
  durationDays: string | null | undefined,
): Date | null {
  const start = packStartDateLocal(packStartedAt);
  if (!start || !durationDays) return null;
  return addPackDurationToStartDate(start, durationDays);
}

/** `true` si la date de début est strictement antérieure au jour d'achat. */
export function isPackStartBeforePurchase(
  packStartedAt: Date | null | undefined,
  purchasedAt: Date,
): boolean {
  if (!packStartedAt) return false;
  return formatYmdLocal(packStartedAt) < formatYmdLocal(purchasedAt);
}

/**
 * Ne jamais démarrer un pack avant sa date d'achat
 * (évite d'hériter du packStartedAt global / pack précédent).
 */
export function clampPackStartToPurchasedAt(start: Date, purchasedAt: Date): Date {
  const startYmd = formatYmdLocal(start);
  const purchasedYmd = formatYmdLocal(purchasedAt);
  if (startYmd >= purchasedYmd) return start;
  return parseYmdToPrismaDate(purchasedYmd)!;
}

/** La séance est-elle dans la fenêtre de validité du pack (après démarrage) ? */
export function isSessionDateWithinPackPeriod(
  sessionDateLocal: Date,
  packStartedAt: Date | null | undefined,
  durationDays: string | null | undefined,
): boolean {
  const start = packStartDateLocal(packStartedAt);
  if (!start) return true;
  if (sessionDateLocal.getTime() < start.getTime()) return false;
  const expiresAt = packExpiresAtLocal(packStartedAt, durationDays);
  if (expiresAt && sessionDateLocal.getTime() > expiresAt.getTime()) return false;
  return true;
}
