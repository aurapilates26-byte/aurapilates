type CourseTone = {
  surface: string;
  statIdle: string;
  statActive: string;
};

const COURSE_TONES: Record<string, CourseTone> = {
  "pilates-reformer": {
    surface: "border-amber-200/90 bg-amber-50/90",
    statIdle: "border-amber-200/80 bg-amber-50/40 hover:bg-amber-50/70",
    statActive: "border-amber-300 bg-amber-50 ring-2 ring-amber-200",
  },
  "mat-pilates": {
    surface: "border-stone-200/90 bg-stone-50/90",
    statIdle: "border-stone-200/80 bg-stone-50/40 hover:bg-stone-50/70",
    statActive: "border-stone-300 bg-stone-50 ring-2 ring-stone-200",
  },
  yoga: {
    surface: "border-sky-200/90 bg-sky-50/90",
    statIdle: "border-sky-200/80 bg-sky-50/40 hover:bg-sky-50/70",
    statActive: "border-sky-300 bg-sky-50 ring-2 ring-sky-200",
  },
  dance: {
    surface: "border-pink-200/90 bg-pink-50/90",
    statIdle: "border-pink-200/80 bg-pink-50/40 hover:bg-pink-50/70",
    statActive: "border-pink-300 bg-pink-50 ring-2 ring-pink-200",
  },
  "coaching-prive": {
    surface: "border-orange-200/90 bg-orange-50/90",
    statIdle: "border-orange-200/80 bg-orange-50/40 hover:bg-orange-50/70",
    statActive: "border-orange-300 bg-orange-50 ring-2 ring-orange-200",
  },
  "sans-cours": {
    surface: "border-zinc-200/90 bg-zinc-100/90",
    statIdle: "border-zinc-200 bg-zinc-50/80 hover:bg-zinc-100/80",
    statActive: "border-zinc-300 bg-zinc-100 ring-2 ring-zinc-200",
  },
};

const DEFAULT_TONE: CourseTone = {
  surface: "border-brand-medium/25 bg-brand-light/40",
  statIdle: "border-brand-medium/20 bg-white hover:bg-zinc-50",
  statActive: "border-brand-dark/40 bg-brand-dark/5 ring-2 ring-brand-dark/15",
};

function courseTone(courseSlug: string): CourseTone {
  return COURSE_TONES[courseSlug] ?? DEFAULT_TONE;
}

/** Fond de carte planning selon le type de cours (grille admin). */
export function planningCourseCardToneClass(courseSlug: string): string {
  return courseTone(courseSlug).surface;
}

export function planningCourseStatCardIdleClass(courseSlug: string): string {
  return courseTone(courseSlug).statIdle;
}

export function planningCourseStatCardActiveClass(courseSlug: string): string {
  return courseTone(courseSlug).statActive;
}
