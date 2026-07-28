export type ReservationsListTab = "upcoming" | "history" | "packs";

export const RESERVATION_TAB_LABELS: Record<ReservationsListTab, string> = {
  upcoming: "Prochaines séances",
  history: "Historique",
  packs: "Packs",
};

export const UPCOMING_RESERVATION_STATUS_LABELS: Record<string, string> = {
  BOOKED: "Confirmée",
  WAITLIST: "Liste d'attente",
};

export const HISTORY_RESERVATION_STATUS_LABELS: Record<string, string> = {
  BOOKED: "Confirmée",
  WAITLIST: "Liste d'attente",
  CANCELLED: "Annulée",
  ATTENDED: "Présente",
};

export function formatCourseDateWithWeekday(ymd: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd);
  if (!m) return ymd;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  const weekday = d
    .toLocaleDateString("fr-FR", { weekday: "long" })
    .replace(/^\p{L}/u, (c) => c.toUpperCase());
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${weekday} ${day}/${month}/${year}`;
}

export function formatSessionSlotLine(sessionDateYmd: string, startTime: string, endTime: string) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(sessionDateYmd);
  const dateLabel = m
    ? `${String(Number(m[3])).padStart(2, "0")}/${m[2]}/${m[1]}`
    : sessionDateYmd;
  return `${dateLabel} · ${startTime} – ${endTime}`;
}

export function formatReservationDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" });
}

function reservationLocalYmd(iso: string): string | null {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** true si la réservation a été saisie un autre jour que le cours (ex. présence historique). */
export function isReservationRecordedOnDifferentDay(reservedAtIso: string, sessionDateYmd: string): boolean {
  const reservedYmd = reservationLocalYmd(reservedAtIso);
  return Boolean(reservedYmd && reservedYmd !== sessionDateYmd);
}

export function cancellationRefundLabel(packRefundedAt: string | null | undefined) {
  if (packRefundedAt) return "Annulation : séance rendue au pack";
  return "Annulation tardive : séance non rendue";
}
