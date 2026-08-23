/** Fond de carte planning selon le type de cours (grille admin). */
export function planningCourseCardToneClass(courseSlug: string): string {
  switch (courseSlug) {
    case "pilates-reformer":
      return "border-amber-200/90 bg-amber-50/90";
    case "mat-pilates":
      return "border-stone-200/90 bg-stone-50/90";
    case "yoga":
      return "border-sky-200/90 bg-sky-50/90";
    case "dance":
      return "border-pink-200/90 bg-pink-50/90";
    case "coaching-prive":
      return "border-orange-200/90 bg-orange-50/90";
    case "sans-cours":
      return "border-zinc-200/90 bg-zinc-100/90";
    default:
      return "border-brand-medium/25 bg-brand-light/40";
  }
}
