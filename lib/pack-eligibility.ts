import { courseContent } from "@/lib/text";
import { PACK_CATEGORY_MIXED_REFORMER_MAT } from "@/lib/pack-categories";

export type PackEligibility = {
  mode: "mixed" | "single" | "unknown";
  allowedCourseSlugs: string[]; // planning.courseSlug values allowed for booking
};

const titleToSlug: Map<string, string> = new Map(courseContent.map((c) => [c.title, c.slug] as const));

const titleToSlugAliases: Record<string, string[]> = {
  // Support legacy planning slugs used elsewhere in the codebase.
  "Cours de yoga": ["cours-de-yoga", "yoga"],
  "Cours de dance": ["cours-de-dance", "dance"],
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
  if (input.category === PACK_CATEGORY_MIXED_REFORMER_MAT) return { mode: "mixed", allowedCourseSlugs: [] };

  const direct = titleToSlug.get(input.category) ?? null;
  const aliases = titleToSlugAliases[input.category] ?? [];
  const allowed = [...new Set([...(direct ? [direct] : []), ...aliases])];
  return { mode: allowed.length ? "single" : "unknown", allowedCourseSlugs: allowed };
}

