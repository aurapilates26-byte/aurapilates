import type { MemberOwnedPackDto } from "@/lib/admin/member-owned-packs";
import { startOfLocalToday } from "@/lib/calendar-day";

export type PackWhatsAppStatusLabel =
  | "En cours"
  | "Prolongé"
  | "En attente"
  | "Terminé"
  | "Expiré";

function isPackCalendarExpired(pack: MemberOwnedPackDto): boolean {
  if (!pack.packExpiresAt) return false;
  const expiresAt = new Date(pack.packExpiresAt);
  if (Number.isNaN(expiresAt.getTime())) return false;
  const expiresDay = new Date(expiresAt.getFullYear(), expiresAt.getMonth(), expiresAt.getDate());
  const today = startOfLocalToday();
  return expiresDay.getTime() < today.getTime();
}

/** Statut pack aligné sur la fiche adhérente (En cours / Terminé / Expiré / En attente). */
export function resolvePackWhatsAppStatus(pack: MemberOwnedPackDto): PackWhatsAppStatusLabel {
  const hasRemaining =
    pack.remainingSessions > 0 ||
    (pack.totalSessions != null && pack.consumedSessions < pack.totalSessions);

  if (pack.totalSessions != null && pack.remainingSessions <= 0) return "Terminé";
  if (pack.consumedSessions > 0 && pack.remainingSessions <= 0) return "Terminé";

  if (hasRemaining && pack.packStartedAt && isPackCalendarExpired(pack)) {
    return pack.prolongedAt ? "Prolongé" : "Expiré";
  }

  if (hasRemaining && pack.prolongedAt) return "Prolongé";
  if (hasRemaining && !pack.packStartedAt) return "En attente";
  if (hasRemaining) return "En cours";

  if (pack.status === "expired" || isPackCalendarExpired(pack)) return "Expiré";
  return "Terminé";
}

/** Date longue FR : « 14 septembre 2026 ». */
export function formatWhatsAppDateLong(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** Date courte FR : « 21/09/2026 ». */
export function formatWhatsAppDateShort(ymd: string | null | undefined): string {
  if (!ymd) return "—";
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd);
  if (m) return `${m[3]}/${m[2]}/${m[1]}`;
  const date = new Date(ymd);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("fr-FR");
}

/** « 10:00 » → « 10h00 ». */
export function formatWhatsAppClock(hhmm: string): string {
  const [hRaw, mRaw] = hhmm.split(":");
  const h = (hRaw ?? "00").padStart(2, "0");
  const m = (mRaw ?? "00").padStart(2, "0");
  return `${h}h${m}`;
}

/** « Lundi 21 septembre 2026 ». */
export function formatWhatsAppWeekdayLong(ymd: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd);
  if (!m) return ymd;
  const date = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  const raw = date.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return raw ? `${raw.charAt(0).toUpperCase()}${raw.slice(1)}` : ymd;
}
