import { startOfLocalToday } from "@/lib/calendar-day";

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

function isPackDateExpired(packExpiresAt: Date | string | null): boolean {
  if (!packExpiresAt) return false;
  const expires = packExpiresAt instanceof Date ? packExpiresAt : new Date(packExpiresAt);
  if (Number.isNaN(expires.getTime())) return false;
  const today = startOfLocalToday();
  const expiresDay = new Date(expires.getFullYear(), expires.getMonth(), expires.getDate());
  return expiresDay.getTime() < today.getTime();
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
