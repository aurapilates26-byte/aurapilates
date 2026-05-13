import {
  normalizePackCategory,
  PACK_CATEGORY_MIXED_REFORMER_MAT,
} from "@/lib/pack-categories";

export type PackEligibility = {
  mode: "mixed" | "single" | "unknown";
  allowedCourseSlugs: string[];
};

const SINGLE_CATEGORY_ALLOWED_SLUGS: Record<string, string[]> = {
  "Pilates reformer": ["pilates-reformer"],
  "Mat pilates": ["mat-pilates"],
  Yoga: ["cours-de-yoga", "yoga"],
  Danse: ["cours-de-dance", "dance"],
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
  if (cat === PACK_CATEGORY_MIXED_REFORMER_MAT) return { mode: "mixed", allowedCourseSlugs: [] };

  const allowed = SINGLE_CATEGORY_ALLOWED_SLUGS[cat] ?? [];
  return { mode: allowed.length ? "single" : "unknown", allowedCourseSlugs: allowed };
}
