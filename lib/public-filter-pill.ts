/**
 * Pilules filtres (catégories tarifs, jours planning public) — même taille typo / padding sur tous les breakpoints.
 */
export function publicFilterPillClass(active: boolean): string {
  return `inline-flex items-center justify-center rounded-full border px-3 py-1 text-center text-xs font-semibold transition sm:text-sm ${
    active
      ? "border-brand-dark/30 bg-brand-dark text-white"
      : "border-brand-medium/35 bg-white text-brand-dark/80 shadow-sm hover:bg-zinc-50"
  }`;
}
