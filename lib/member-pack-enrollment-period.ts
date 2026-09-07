import { formatYmdLocal, parseYmdToPrismaDate } from "@/lib/calendar-day";

export type EnrollmentPeriodRow = {
  id: string;
  packId: string;
  purchasedAt: Date;
  closedAt: Date | null;
  packStartedAt: Date | null;
  status?: string;
};

function toPrismaDateLocal(d: Date): Date {
  return parseYmdToPrismaDate(formatYmdLocal(d))!;
}

/**
 * Bornes de consommation d'une inscription (FIFO par date d'achat).
 * - Fin : uniquement `closedAt` si l'inscription est vraiment fermée (épuisée / expirée).
 *   On ne coupe plus à l'achat du renouvellement suivant : deux packs parallèles du même
 *   catalogue se consomment en FIFO (ancien d'abord, puis le suivant), y compris après
 *   la date d'achat du pack neuf — sinon les séances restantes de l'ancien restent bloquées.
 * - Début : renouvellement / PENDING_START → date d'achat.
 *   Premier pack catalogue : pas de borne basse, même si `packStartedAt` est renseigné.
 *   Sinon les présences legacy (`debitedPackId` null) avant la 1ʳᵉ réservation sortent du compteur.
 */
export function getEnrollmentPeriodBounds(
  enrollment: EnrollmentPeriodRow,
  enrollmentsAsc: EnrollmentPeriodRow[],
): { periodStart: Date | null; periodEndExclusive: Date | null } {
  const purchased = toPrismaDateLocal(enrollment.purchasedAt);

  // Fermeture réelle seulement — pas la date d'achat du pack suivant (packs parallèles).
  const periodEndExclusive =
    enrollment.closedAt &&
    enrollment.status !== "ACTIVE" &&
    enrollment.status !== "PENDING_START"
      ? toPrismaDateLocal(enrollment.closedAt)
      : null;

  let hasPreviousSamePack = false;
  for (let i = enrollmentsAsc.findIndex((row) => row.id === enrollment.id) - 1; i >= 0; i--) {
    if (enrollmentsAsc[i]!.packId === enrollment.packId) {
      hasPreviousSamePack = true;
      break;
    }
  }

  let periodStart: Date | null = null;
  if (hasPreviousSamePack || enrollment.status === "PENDING_START") {
    periodStart = purchased;
  }

  return { periodStart, periodEndExclusive };
}
