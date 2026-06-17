/** Classes de pastille « niveau » (aligné admin / membre / public). */
export type PlanningLevelSlug = "ALL_LEVELS" | "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

/** Couleurs distinctes des pastilles stats (amber/orange) pour que chaque niveau soit visible. */
export function planningLevelBadgeClass(level: PlanningLevelSlug | string | null | undefined): string {
  if (level == null) return "border-zinc-200 bg-zinc-50 text-zinc-700";
  if (level === "ALL_LEVELS") return "border-violet-200 bg-violet-50 text-violet-900";
  if (level === "BEGINNER") return "border-emerald-200 bg-emerald-50 text-emerald-900";
  if (level === "INTERMEDIATE") return "border-rose-200 bg-rose-50 text-rose-900";
  if (level === "ADVANCED") return "border-sky-200 bg-sky-50 text-sky-900";
  return "border-zinc-200 bg-zinc-50 text-zinc-700";
}
