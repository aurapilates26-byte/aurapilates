import {
  normalizePackCategory,
  PACK_CATEGORY_MIXED_REFORMER_MAT,
} from "@/lib/pack-categories";

export type PackEligibility = {
  mode: "mixed" | "single" | "unknown";
  allowedCourseSlugs: string[];
};

/** Cours autorisés pour un pack « Reformer + Mat » (planning : reformer + mat uniquement). */
export const REFORMER_MAT_ALLOWED_COURSE_SLUGS = ["pilates-reformer", "mat-pilates"] as const;

const SINGLE_CATEGORY_ALLOWED_SLUGS: Record<string, string[]> = {
  "Pilates reformer": ["pilates-reformer"],
  "Mat pilates": ["mat-pilates"],
  Yoga: ["cours-de-yoga", "yoga"],
  Danse: ["cours-de-dance", "dance"],
  "Coaching privé": ["coaching-prive"],
};

export function getEligibilityForPack(input: {
  category: string | null;
  courseQuotas: { courseSlug: string }[];
}): PackEligibility {
  if (input.courseQuotas.length > 0) {
    return {
      mode: "mixed",
      allowedCourseSlugs: [...new Set(input.courseQuotas.map((q) => q.courseSlug))],
    };
  }

  if (!input.category) return { mode: "unknown", allowedCourseSlugs: [] };
  const cat = normalizePackCategory(input.category);
  if (cat === PACK_CATEGORY_MIXED_REFORMER_MAT) {
    return {
      mode: "mixed",
      allowedCourseSlugs: [...REFORMER_MAT_ALLOWED_COURSE_SLUGS],
    };
  }

  const allowed = SINGLE_CATEGORY_ALLOWED_SLUGS[cat] ?? [];
  return { mode: allowed.length ? "single" : "unknown", allowedCourseSlugs: allowed };
}

/** `true` si le pack n'impose aucune restriction de cours (ex. coaching privé non mappé). */
export function isCourseAllowedForPack(
  eligibility: Pick<PackEligibility, "allowedCourseSlugs" | "mode">,
  courseSlug: string,
): boolean {
  if (eligibility.allowedCourseSlugs.length === 0) return true;
  return eligibility.allowedCourseSlugs.includes(courseSlug);
}
