/**
 * Badges harmonisés Aura (couleurs brand : globals.css + tailwind.config).
 * Réutiliser ici pour places / liste d’attente / statuts similaires.
 */
export const badgeClasses = {
  /** Places, capacité, disponibilité principale */
  availability:
    "inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-900 sm:px-3 sm:py-1 sm:text-xs lg:text-sm",
  /** Liste d’attente, file d’attente */
  waitlist:
    "inline-flex items-center rounded-full border border-orange-200 bg-orange-50 px-2.5 py-0.5 text-[11px] font-semibold text-orange-900 sm:px-3 sm:py-1 sm:text-xs lg:text-sm",
  /** Statut d’inscription (membre) */
  reservationStatus:
    "inline-flex shrink-0 items-center rounded-full border border-brand-medium/25 bg-white px-2.5 py-0.5 text-[11px] font-semibold text-brand-dark/80 sm:px-3 sm:py-1 sm:text-xs lg:text-sm",
  /** Pack / éligibilité */
  packIncompatible:
    "inline-flex items-center rounded-full border border-orange-200 bg-orange-50 px-2.5 py-0.5 text-[11px] font-semibold text-orange-900 sm:px-3 sm:py-1 sm:text-xs lg:text-sm",
} as const;
