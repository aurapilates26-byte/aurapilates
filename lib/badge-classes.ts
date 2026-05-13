/**
 * Badges harmonisés Aura (couleurs brand : globals.css + tailwind.config).
 * Réutiliser ici pour places / liste d’attente / statuts similaires.
 */

/** Même silhouette que « Niveau » et « Durée » sur les cartes planning (hauteur / padding / typo). */
export const planningSessionPillLayout =
  "inline-flex min-h-7 shrink-0 items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold leading-none sm:text-xs";

export const badgeClasses = {
  /** Places, capacité, durée (cartes planning) */
  availability: `${planningSessionPillLayout} border-amber-200 bg-amber-50 text-amber-900`,
  /** Liste d’attente, file d’attente */
  waitlist: `${planningSessionPillLayout} border-orange-200 bg-orange-50 text-orange-900`,
  /** Statut d’inscription (membre) */
  reservationStatus: `${planningSessionPillLayout} border-brand-medium/25 bg-white text-brand-dark/80`,
  /** Pack / éligibilité */
  packIncompatible: `${planningSessionPillLayout} border-orange-200 bg-orange-50 text-orange-900`,
} as const;
