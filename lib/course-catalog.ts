export const COURSE_CATEGORIES = ["Pilates", "Yoga", "Danse"] as const;

export type CourseCategory = (typeof COURSE_CATEGORIES)[number];

export type CatalogCourse = {
  slug: string;
  title: string;
  category: CourseCategory;
};

export const catalogCourses: CatalogCourse[] = [
  { slug: "pilates-reformer", title: "Pilates reformer", category: "Pilates" },
  { slug: "mat-pilates", title: "Mat pilates", category: "Pilates" },
  { slug: "cours-de-yoga", title: "Yoga", category: "Yoga" },
  { slug: "cours-de-dance", title: "Danse", category: "Danse" },
];

const slugToCourse = new Map(catalogCourses.map((c) => [c.slug, c]));

export function getCatalogCourse(slug: string): CatalogCourse | undefined {
  return slugToCourse.get(slug);
}

export function courseCategoryForSlug(slug: string): CourseCategory | null {
  return getCatalogCourse(slug)?.category ?? null;
}

export function coursesInCategory(category: CourseCategory): CatalogCourse[] {
  return catalogCourses.filter((c) => c.category === category);
}
