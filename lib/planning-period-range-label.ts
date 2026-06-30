import { parseYmdLocal } from "@/lib/calendar-day";

/** Ex. « 22 juin – 28 juin » */
export function formatPlanningPeriodRangeCompactFr(startYmd: string, endYmd: string): string {
  const start = parseYmdLocal(startYmd);
  const end = parseYmdLocal(endYmd);
  if (!start || !end) return "";

  const fmt = (d: Date) =>
    d.toLocaleDateString("fr-FR", { day: "numeric", month: "long" });

  return `${fmt(start)} – ${fmt(end)}`;
}

const DAY_SHORT_FR: Record<string, string> = {
  MON: "Lun",
  TUE: "Mar",
  WED: "Mer",
  THU: "Jeu",
  FRI: "Ven",
  SAT: "Sam",
  SUN: "Dim",
};

export function formatPlanningColumnHeader(dayOfWeek: string, sessionYmd: string): string {
  const day = DAY_SHORT_FR[dayOfWeek] ?? dayOfWeek;
  const d = parseYmdLocal(sessionYmd);
  const dayNum = d ? d.getDate() : sessionYmd.slice(-2);
  return `${day} ${dayNum}`;
}
