import { startOfLocalToday } from "@/lib/calendar-day";
import { packExpiresAtLocal } from "@/lib/member-pack-period";

export type MemberPackRenewalMode = "immediate" | "queued";

export type MemberPackState = {
  packId: string | null;
  packStartedAt: Date | null;
  durationDays: string | null;
  sessionCount: number | null;
  courseQuotas: { courseSlug: string; sessionCount: number }[];
  balances: { packId: string; courseSlug: string | null; remaining: number }[];
};

export type PackRenewalDecision = {
  mode: MemberPackRenewalMode;
  remainingSessions: number;
  isExpired: boolean;
  hasActivePack: boolean;
};

function startOfLocalDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function isMemberPackExpiredByDate(
  packStartedAt: Date | null | undefined,
  durationDays: string | null | undefined,
  today: Date = startOfLocalToday(),
): boolean {
  if (!packStartedAt) return false;
  const expires = packExpiresAtLocal(packStartedAt, durationDays);
  if (!expires) return false;
  return expires.getTime() < startOfLocalDay(today).getTime();
}

/** Séances restantes sur le pack actuellement assigné à l'adhérente. */
export function getRemainingSessionsForPack(state: MemberPackState): number {
  if (!state.packId) return 0;

  const balancesForPack = state.balances.filter((b) => b.packId === state.packId);
  if (balancesForPack.length > 0) {
    return balancesForPack.reduce((sum, b) => sum + Math.max(0, b.remaining), 0);
  }

  if (state.courseQuotas.length > 0) {
    return state.courseQuotas.reduce((sum, q) => sum + q.sessionCount, 0);
  }

  return state.sessionCount ?? 0;
}

/**
 * Détermine si un nouveau pack doit être mis en file d'attente ou activé tout de suite.
 * File d'attente si le pack actuel n'est pas expiré et contient encore des séances.
 */
export function decidePackRenewal(state: MemberPackState, today: Date = startOfLocalToday()): PackRenewalDecision {
  if (!state.packId) {
    return { mode: "immediate", remainingSessions: 0, isExpired: false, hasActivePack: false };
  }

  const isExpired = isMemberPackExpiredByDate(state.packStartedAt, state.durationDays, today);
  const remainingSessions = getRemainingSessionsForPack(state);

  if (isExpired || remainingSessions <= 0) {
    return { mode: "immediate", remainingSessions, isExpired, hasActivePack: true };
  }

  return { mode: "queued", remainingSessions, isExpired: false, hasActivePack: true };
}

/** Capacité totale = quota catalogue × nombre d'achats (inscriptions) du même pack. */
export function packBalanceCapacityUnits(enrollmentCount: number, memberHasPackAssigned: boolean): number {
  if (enrollmentCount > 0) return enrollmentCount;
  return memberHasPackAssigned ? 1 : 0;
}

export function computePackCourseRemaining(capacityPerPurchase: number, units: number, used: number): number {
  return Math.max(0, capacityPerPurchase * units - Math.max(0, used));
}

export function packRenewalMessageFr(decision: PackRenewalDecision, queuedPackName?: string): string {
  if (decision.mode === "immediate") {
    if (!decision.hasActivePack) {
      return "Le pack sera activé dès la première réservation.";
    }
    if (decision.isExpired) {
      return "Le pack actuel est expiré : le nouveau pack remplace l'ancien et démarrera à la première réservation.";
    }
    return "Les séances du pack actuel sont épuisées : le nouveau pack est activé et démarrera à la première réservation.";
  }

  const sessionsWord = decision.remainingSessions === 1 ? "séance" : "séances";
  const packLabel = queuedPackName ? ` « ${queuedPackName} »` : "";
  return `Le pack${packLabel} a été ajouté. L'adhérente dispose maintenant de plusieurs packs utilisables en parallèle (${decision.remainingSessions} ${sessionsWord} restantes sur le pack précédent).`;
}
