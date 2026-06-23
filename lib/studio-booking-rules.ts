/** Délai avant le cours au-delà duquel une annulation membre rend la séance (si règle activée). */
export const MEMBER_LATE_CANCELLATION_HOURS = 6;

export const DEFAULT_MEMBER_RESERVATION_OPEN_TIME = "08:00";
export const DEFAULT_MEMBER_RESERVATION_CLOSE_TIME = "22:00";

export type StudioBookingRules = {
  lateCancellationRuleEnabled: boolean;
  lateCancellationHours: number;
  memberReservationOpenTime: string;
  memberReservationCloseTime: string;
};

export const DEFAULT_STUDIO_BOOKING_RULES: StudioBookingRules = {
  lateCancellationRuleEnabled: true,
  lateCancellationHours: MEMBER_LATE_CANCELLATION_HOURS,
  memberReservationOpenTime: DEFAULT_MEMBER_RESERVATION_OPEN_TIME,
  memberReservationCloseTime: DEFAULT_MEMBER_RESERVATION_CLOSE_TIME,
};

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

export function normalizeReservationClockHHMM(clock: string): string | null {
  const trimmed = clock.trim();
  const match = /^(\d{1,2}):(\d{2})$/.exec(trimmed);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes) || hours > 23 || minutes > 59) return null;
  return `${pad2(hours)}:${pad2(minutes)}`;
}

export function localClockHHMMFromDate(date: Date): string {
  return `${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

/** True si l'heure locale actuelle est dans [ouverture, fermeture] (bornes incluses). */
export function isMemberReservationDeskOpen(
  rules: Pick<StudioBookingRules, "memberReservationOpenTime" | "memberReservationCloseTime">,
  now: Date = new Date(),
): boolean {
  const open = normalizeReservationClockHHMM(rules.memberReservationOpenTime);
  const close = normalizeReservationClockHHMM(rules.memberReservationCloseTime);
  if (!open || !close) return true;
  const nowClock = localClockHHMMFromDate(now);
  if (open <= close) {
    return nowClock >= open && nowClock <= close;
  }
  return nowClock >= open || nowClock <= close;
}

export function memberReservationHoursLabelFr(
  rules: Pick<StudioBookingRules, "memberReservationOpenTime" | "memberReservationCloseTime">,
): string {
  const open = normalizeReservationClockHHMM(rules.memberReservationOpenTime) ?? rules.memberReservationOpenTime;
  const close = normalizeReservationClockHHMM(rules.memberReservationCloseTime) ?? rules.memberReservationCloseTime;
  return `${open} – ${close}`;
}

export function memberReservationHoursNoticeFr(rules: StudioBookingRules): string {
  return `Les réservations en ligne sont ouvertes chaque jour de ${memberReservationHoursLabelFr(rules)}.`;
}

export function memberReservationDeskClosedNoticeFr(rules: StudioBookingRules): string {
  return `Les réservations en ligne sont fermées pour le moment. Horaires : ${memberReservationHoursLabelFr(rules)}.`;
}

export function validateMemberReservationHours(openTime: string, closeTime: string): string | null {
  const open = normalizeReservationClockHHMM(openTime);
  const close = normalizeReservationClockHHMM(closeTime);
  if (!open || !close) return "Horaires invalides (format HH:MM).";
  if (open === close) return "L'heure d'ouverture et de fermeture doivent être différentes.";
  return null;
}

/** Membre : remboursement pack à l'annulation d'une réservation confirmée ? */
export function isMemberCancellationRefundable(params: {
  asAdmin: boolean;
  wasWaitlist: boolean;
  lateCancellationRuleEnabled: boolean;
  classStart: Date;
  now: Date;
}): boolean {
  if (params.wasWaitlist) return false;
  if (params.asAdmin) return true;
  if (!params.lateCancellationRuleEnabled) return true;
  return (
    params.classStart.getTime() - params.now.getTime() >=
    MEMBER_LATE_CANCELLATION_HOURS * 60 * 60 * 1000
  );
}

export function memberLateCancellationNoticeFr(rules: StudioBookingRules): string {
  if (rules.lateCancellationRuleEnabled) {
    return `Annulation possible jusqu'à ${rules.lateCancellationHours} heures avant le cours ; passé ce délai, la séance est débitée du pack.`;
  }
  return "Toute annulation rend la séance au pack, quelle que soit l'heure.";
}

export function memberLateCancellationConfirmNoticeFr(rules: StudioBookingRules): string {
  if (rules.lateCancellationRuleEnabled) {
    return `Les annulations sont acceptées jusqu'à ${rules.lateCancellationHours} heures avant le cours ; passé ce délai, la séance est débitée du pack.`;
  }
  return "Toute annulation rend la séance au pack, quelle que soit l'heure.";
}

export function memberCancellationRefundToastLine(
  refundable: boolean,
  waitlistCancellation: boolean,
  rules: StudioBookingRules,
): string | null {
  if (waitlistCancellation) {
    return "Retrait de la liste d'attente : aucune séance n'était débitée.";
  }
  if (refundable) return "La séance a été rendue au pack.";
  if (rules.lateCancellationRuleEnabled) {
    return "Annulation tardive : la séance n'a pas été rendue au pack.";
  }
  return null;
}
