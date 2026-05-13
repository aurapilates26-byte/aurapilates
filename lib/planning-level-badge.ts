/** Classes de pastille « niveau » (aligné admin / membre / public). */
export type PlanningLevelSlug = "ALL_LEVELS" | "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

export function planningLevelBadgeClass(level: PlanningLevelSlug | string): string {
  if (level === "ALL_LEVELS") return "border-zinc-200 bg-zinc-50 text-zinc-700";
  if (level === "BEGINNER") return "border-emerald-200 bg-emerald-50 text-emerald-900";
  if (level === "INTERMEDIATE") return "border-amber-200 bg-amber-50 text-amber-900";
  if (level === "ADVANCED") return "border-sky-200 bg-sky-50 text-sky-900";
  return "border-zinc-200 bg-zinc-50 text-zinc-700";
}
