import { planningLevelBadgeClass } from "@/lib/planning-level-badge";
import { planningLevelLabelFr } from "@/lib/planning-public-labels";

export type PlanningLevelDisplay = {
  label: string;
  toneClass: string;
};

/** Libellé + pastille pour un niveau planning (null = pas d'affichage). */
export function planningLevelDisplay(
  level: string | null | undefined,
): PlanningLevelDisplay | null {
  if (level == null || level === "") return null;
  const label = planningLevelLabelFr(level);
  if (!label) return null;
  return { label, toneClass: planningLevelBadgeClass(level) };
}
