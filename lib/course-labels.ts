import { catalogCourses } from "@/lib/course-catalog";

const fromCatalog = Object.fromEntries(catalogCourses.map((c) => [c.slug, c.title]));

/** Slugs planning (admin / API) : mêmes libellés que le catalogue public. */
const PLANNING_SLUG_ALIASES: Record<string, string> = {
  yoga: "Yoga",
  dance: "Danse",
};

export const courseLabelBySlug: Record<string, string> = { ...fromCatalog, ...PLANNING_SLUG_ALIASES };

export function courseLabel(slug: string): string {
  return courseLabelBySlug[slug] ?? slug;
}
