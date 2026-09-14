import { formatYmdLocal, formatYmdPrismaDate, parseYmdLocal } from "@/lib/calendar-day";
import { addPackDurationToStartDate } from "@/lib/pack-duration";

/**
 * Date locale (minuit) à partir d'un DateTime / @db.Date pack.
 * Les `@db.Date` Prisma arrivent en minuit UTC : on lit le jour calendaire UTC
 * pour éviter un décalage veille/lendemain selon le fuseau du VPS.
 */
export function packStartDateLocal(packStartedAt: Date | null | undefined): Date | null {
  if (!packStartedAt) return null;
  const isPrismaDateUtcMidnight =
    packStartedAt.getUTCHours() === 0 &&
    packStartedAt.getUTCMinutes() === 0 &&
    packStartedAt.getUTCSeconds() === 0 &&
    packStartedAt.getUTCMilliseconds() === 0;
  if (isPrismaDateUtcMidnight) {
    return parseYmdLocal(formatYmdPrismaDate(packStartedAt));
  }
  return new Date(
    packStartedAt.getFullYear(),
    packStartedAt.getMonth(),
    packStartedAt.getDate(),
  );
}

export function packExpiresAtLocal(
  packStartedAt: Date | null | undefined,
  durationDays: string | null | undefined,
): Date | null {
  const start = packStartDateLocal(packStartedAt);
  if (!start || !durationDays) return null;
  return addPackDurationToStartDate(start, durationDays);
}

/** La séance est-elle dans la fenêtre de validité du pack (après démarrage) ? */
export function isSessionDateWithinPackPeriod(
  sessionDateLocal: Date,
  packStartedAt: Date | null | undefined,
  durationDays: string | null | undefined,
  packExpiresAt?: Date | null,
): boolean {
  const start = packStartDateLocal(packStartedAt);
  if (!start) return true;
  if (sessionDateLocal.getTime() < start.getTime()) return false;
  // packExpiresAt fourni = vérité du candidat (FIFO display ou prolongation).
  const expiresAt = packExpiresAt
    ? packStartDateLocal(packExpiresAt)
    : packExpiresAtLocal(packStartedAt, durationDays);
  if (expiresAt && sessionDateLocal.getTime() > expiresAt.getTime()) return false;
  return true;
}

/** Libellé YMD studio pour logs / messages. */
export function packDateYmdLocal(d: Date | null | undefined): string | null {
  const local = packStartDateLocal(d ?? null);
  return local ? formatYmdLocal(local) : null;
}
