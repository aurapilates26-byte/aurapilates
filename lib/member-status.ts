import { packExpiresAtLocal } from "@/lib/member-pack-period";

/** Statut opérationnel d'une fiche adhérente (indépendant du seul booléen `isActive` en base). */
export type MemberOperationalStatus = "active" | "pending" | "expired" | "no_pack";

export type MemberStatusInput = {
  isActive: boolean;
  packId: string | null;
  packStartedAt: Date | null;
  pack: { durationDays: string | null } | null;
};

export type MemberStatusCounts = {
  total: number;
  active: number;
  pending: number;
  expired: number;
  noPack: number;
};

function startOfLocalDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function isPackExpired(
  packStartedAt: Date | null | undefined,
  durationDays: string | null | undefined,
  today: Date,
): boolean {
  if (!packStartedAt) return false;
  const expires = packExpiresAtLocal(packStartedAt, durationDays);
  if (!expires) return false;
  return expires.getTime() < startOfLocalDay(today).getTime();
}

/**
 * Classifie une adhérente pour le tableau de bord et les listes.
 * - active : pack démarré (1ʳᵉ réservation), flag actif, période non expirée
 * - pending : pack assigné mais pas encore actif (pas de réservation / renouvellement en attente)
 * - expired : pack démarré mais date de fin dépassée
 * - no_pack : fiche sans pack
 */
export function classifyMemberStatus(member: MemberStatusInput, today: Date = new Date()): MemberOperationalStatus {
  if (!member.packId) return "no_pack";

  const started = member.packStartedAt != null;
  if (started && isPackExpired(member.packStartedAt, member.pack?.durationDays, today)) {
    return "expired";
  }

  if (member.isActive && started) return "active";

  return "pending";
}

export function isMemberOperationallyActive(member: MemberStatusInput, today: Date = new Date()): boolean {
  return classifyMemberStatus(member, today) === "active";
}

export function aggregateMemberStatusCounts(
  members: MemberStatusInput[],
  today: Date = new Date(),
): MemberStatusCounts {
  const counts: MemberStatusCounts = {
    total: members.length,
    active: 0,
    pending: 0,
    expired: 0,
    noPack: 0,
  };

  for (const m of members) {
    const status = classifyMemberStatus(m, today);
    if (status === "active") counts.active += 1;
    else if (status === "pending") counts.pending += 1;
    else if (status === "expired") counts.expired += 1;
    else counts.noPack += 1;
  }

  return counts;
}

export function memberOperationalStatusLabelFr(status: MemberOperationalStatus): string {
  switch (status) {
    case "active":
      return "Active";
    case "pending":
      return "En attente";
    case "expired":
      return "Pack expiré";
    case "no_pack":
      return "Sans pack";
  }
}
