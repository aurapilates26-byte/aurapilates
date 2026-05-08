export const courseLabelBySlug: Record<string, string> = {
  "pilates-reformer": "Pilates reformer",
  "mat-pilates": "Mat pilates",
  yoga: "Yoga",
  dance: "Dance",
};

export function courseLabel(slug: string): string {
  return courseLabelBySlug[slug] ?? slug;
}
