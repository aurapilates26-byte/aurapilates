type CourseTone = {
  surface: string;
  statIdle: string;
  statActive: string;
};

const COURSE_TONES: Record<string, CourseTone> = {
  "pilates-reformer": {
    surface: "border-brand-medium/25 bg-amber-200/90",
    statIdle: "border-amber-300 bg-amber-100/80 hover:bg-amber-200",
    statActive: "border-amber-400 bg-amber-200 ring-2 ring-amber-300",
  },
  "mat-pilates": {
    surface: "border-brand-medium/25 bg-stone-200/90",
    statIdle: "border-stone-300 bg-stone-100/80 hover:bg-stone-200",
    statActive: "border-stone-400 bg-stone-200 ring-2 ring-stone-300",
  },
  yoga: {
    surface: "border-brand-medium/25 bg-sky-200/90",
    statIdle: "border-sky-300 bg-sky-100/80 hover:bg-sky-200",
    statActive: "border-sky-400 bg-sky-200 ring-2 ring-sky-300",
  },
  dance: {
    surface: "border-brand-medium/25 bg-pink-200/90",
    statIdle: "border-pink-300 bg-pink-100/80 hover:bg-pink-200",
    statActive: "border-pink-400 bg-pink-200 ring-2 ring-pink-300",
  },
  "coaching-prive": {
    surface: "border-brand-medium/25 bg-orange-200/90",
    statIdle: "border-orange-300 bg-orange-100/80 hover:bg-orange-200",
    statActive: "border-orange-400 bg-orange-200 ring-2 ring-orange-300",
  },
  "sans-cours": {
    surface: "border-brand-medium/25 bg-zinc-300/90",
    statIdle: "border-zinc-300 bg-zinc-200/90 hover:bg-zinc-300",
    statActive: "border-zinc-400 bg-zinc-300 ring-2 ring-zinc-300",
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
