/** Délai avant le cours au-delà duquel une annulation membre rend la séance (si règle activée). */
export const MEMBER_LATE_CANCELLATION_HOURS = 6;

export type StudioBookingRules = {
  lateCancellationRuleEnabled: boolean;
  lateCancellationHours: number;
};

export const DEFAULT_STUDIO_BOOKING_RULES: StudioBookingRules = {
  lateCancellationRuleEnabled: true,
  lateCancellationHours: MEMBER_LATE_CANCELLATION_HOURS,
};

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
