import type { Prisma, ReservationStatus } from "@prisma/client";

/**
 * Règles métier — débit / consommation d'une séance pack
 *
 * 1. **Solde réservable (`debited`)** — dès la réservation confirmée (BOOKED) :
 *    le solde `member_pack_balance` est réduit pour bloquer une double réservation.
 *    Annulation avec remboursement → crédit du solde.
 *
 * 2. **Séance consommée (`consumed`)** — affichage fiche pack, historique, « Terminé » :
 *    - présence marquée (ATTENDED)
 *    - OU annulation membre tardive (< 6 h avant le cours, règle activée) : packRefundedAt null
 *
 * 3. **Annulation membre** (> 6 h avant, règle activée) : séance rendue au pack.
 * 4. **Annulation admin** : séance toujours rendue au pack (selon config studio).
 *
 * Une réservation BOOKED future n'est pas « consommée » mais déjà « débitée » du solde.
 */

export type ReservationConsumptionRow = {
  status: ReservationStatus | string;
  packRefundedAt?: Date | string | null;
};

/** Présence réelle ou annulation tardive non remboursée → compteur « séances consommées ». */
export function isPackSessionConsumed(row: ReservationConsumptionRow): boolean {
  if (row.status === "ATTENDED") return true;
  if (row.status === "CANCELLED" && row.packRefundedAt == null) return true;
  return false;
}

/** Réservation confirmée ou consommée qui occupe le solde pack (BOOKED + consommée). */
export function isPackSessionDebited(row: ReservationConsumptionRow): boolean {
  if (row.status === "BOOKED" || row.status === "ATTENDED") return true;
  if (row.status === "CANCELLED" && row.packRefundedAt == null) return true;
  return false;
}

/** Filtre Prisma : séances consommées (affichage). */
export const PACK_SESSION_CONSUMED_WHERE = {
  OR: [
    { status: "ATTENDED" as const },
    { status: "CANCELLED" as const, packRefundedAt: null },
  ],
} satisfies Pick<Prisma.ReservationWhereInput, "OR">;

/** Filtre Prisma : séances qui occupent le solde (réservation + consommation). */
export const PACK_SESSION_DEBITED_WHERE = {
  OR: [
    { status: { in: ["BOOKED", "ATTENDED"] as const } },
    { status: "CANCELLED" as const, packRefundedAt: null },
  ],
} satisfies Pick<Prisma.ReservationWhereInput, "OR">;
