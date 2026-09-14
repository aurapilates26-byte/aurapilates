import {
  formatYmdLocal,
  formatYmdPrismaDate,
  parseYmdLocal,
  parseYmdToPrismaDate,
  startOfLocalToday,
} from "@/lib/calendar-day";
import { addPackDurationToStartDate } from "@/lib/pack-duration";

export type MemberPrimaryPackKind =
  | "consuming"
  | "prolonged"
  | "pending"
  | "finished"
  | "expired"
  | "none";

export type MemberPackStateFilter = "ALL" | MemberPrimaryPackKind;

export type MemberPrimaryPackStateCounts = {
  total: number;
  consuming: number;
  prolonged: number;
  pending: number;
  expired: number;
  finished: number;
  none: number;
};

export const MEMBER_PRIMARY_PACK_KIND_LABELS: Record<MemberPrimaryPackKind, string> = {
  consuming: "En cours",
  prolonged: "Prolongé",
  pending: "En attente",
  expired: "Expiré",
  finished: "Terminé",
  none: "Sans pack",
};

export function emptyMemberPrimaryPackStateCounts(): MemberPrimaryPackStateCounts {
  return {
    total: 0,
    consuming: 0,
    prolonged: 0,
    pending: 0,
    expired: 0,
    finished: 0,
    none: 0,
  };
}

/** Jour calendaire d'une date pack (@db.Date Prisma ou Date locale). */
function packCalendarYmd(d: Date): string {
  const isPrismaDateUtcMidnight =
    d.getUTCHours() === 0 &&
    d.getUTCMinutes() === 0 &&
    d.getUTCSeconds() === 0 &&
    d.getUTCMilliseconds() === 0;
  return isPrismaDateUtcMidnight ? formatYmdPrismaDate(d) : formatYmdLocal(d);
}

/**
 * Compare la date d'expiration au jour studio, sans biais de fuseau
 * (évite Expiré à tort sur le VPS).
 */
export function isPackDateExpired(packExpiresAt: Date | string | null): boolean {
  if (!packExpiresAt) return false;
  const expires = packExpiresAt instanceof Date ? packExpiresAt : new Date(packExpiresAt);
  if (Number.isNaN(expires.getTime())) return false;
  const expiresYmd =
    packExpiresAt instanceof Date ? packCalendarYmd(expires) : formatYmdLocal(expires);
  const todayYmd = formatYmdLocal(startOfLocalToday());
  return expiresYmd < todayYmd;
}

/**
 * Expiration effective pour le badge liste — même règle que la fiche :
 * start + durée, sauf prolongation admin (date stockée).
 */
export function resolveEffectivePackExpiresAt(input: {
  packStartedAt: Date | null;
  packExpiresAt: Date | null;
  prolongedAt: Date | null;
  durationDays: string | null;
}): Date | null {
  if (input.prolongedAt != null) return input.packExpiresAt;
  if (input.packStartedAt && input.durationDays) {
    const startYmd = packCalendarYmd(input.packStartedAt);
    const startLocal = parseYmdLocal(startYmd);
    if (startLocal) {
      const endLocal = addPackDurationToStartDate(startLocal, input.durationDays);
      if (endLocal) {
        return parseYmdToPrismaDate(formatYmdLocal(endLocal)) ?? endLocal;
      }
    }
    return addPackDurationToStartDate(input.packStartedAt, input.durationDays) ?? input.packExpiresAt;
  }
  return input.packExpiresAt;
}

/** Aligné sur le badge pack de la fiche adhérente (pack principal). */
export function classifyPrimaryPackKind(input: {
  hasPack: boolean;
  packStartedAt: Date | null;
  packExpiresAt: Date | null;
  prolongedAt: Date | null;
  consumedSessions: number;
  totalSessions: number | null;
  remainingSessions: number;
}): MemberPrimaryPackKind {
  if (!input.hasPack) return "none";

  const hasRemaining =
    input.remainingSessions > 0 ||
    (input.totalSessions != null && input.consumedSessions < input.totalSessions);

  if (input.totalSessions != null && input.remainingSessions <= 0) return "finished";
  if (input.consumedSessions > 0 && input.remainingSessions <= 0) return "finished";

  if (hasRemaining && input.packStartedAt && isPackDateExpired(input.packExpiresAt)) {
    return "expired";
  }
  if (hasRemaining && input.prolongedAt) return "prolonged";
  if (hasRemaining && !input.packStartedAt) return "pending";
  if (hasRemaining) return "consuming";

  if (isPackDateExpired(input.packExpiresAt)) return "expired";
  return "finished";
}

export function memberPrimaryPackBadgeClass(kind: MemberPrimaryPackKind): string {
  if (kind === "consuming") return "border-emerald-200 bg-emerald-50 text-emerald-900";
  if (kind === "prolonged") return "border-amber-200 bg-amber-50 text-amber-900";
  if (kind === "pending") return "border-amber-200 bg-amber-50 text-amber-900";
  if (kind === "expired") return "border-red-200 bg-red-50 text-red-800";
  if (kind === "finished") return "border-zinc-200 bg-zinc-100 text-zinc-700";
  return "border-zinc-200 bg-zinc-50 text-zinc-600";
}
