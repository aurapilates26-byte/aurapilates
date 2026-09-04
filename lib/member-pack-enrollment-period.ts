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
 * - Fin : date d'achat du renouvellement suivant du même pack catalogue.
 * - Début : renouvellement / PENDING_START → date d'achat.
 *   Premier pack catalogue : pas de borne basse, même si `packStartedAt` est renseigné.
 *   Sinon les présences legacy (`debitedPackId` null) avant la 1ʳᵉ réservation sortent du compteur.
 */
export function getEnrollmentPeriodBounds(
  enrollment: EnrollmentPeriodRow,
  enrollmentsAsc: EnrollmentPeriodRow[],
): { periodStart: Date | null; periodEndExclusive: Date | null } {
  const index = enrollmentsAsc.findIndex((row) => row.id === enrollment.id);
  const purchased = toPrismaDateLocal(enrollment.purchasedAt);

  let periodEndExclusive: Date | null = null;
  for (let i = index + 1; i < enrollmentsAsc.length; i++) {
    const next = enrollmentsAsc[i]!;
    if (next.packId === enrollment.packId) {
      periodEndExclusive = toPrismaDateLocal(next.purchasedAt);
      break;
    }
  }
  if (periodEndExclusive == null && enrollment.closedAt) {
    periodEndExclusive = toPrismaDateLocal(enrollment.closedAt);
  }

  let hasPreviousSamePack = false;
  for (let i = index - 1; i >= 0; i--) {
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
