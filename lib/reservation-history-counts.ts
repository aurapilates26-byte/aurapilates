import { courseLabel } from "@/lib/course-labels";

export type ReservationHistoryCourseCount = {
  courseSlug: string;
  courseLabel: string;
  shortLabel: string;
  count: number;
};

export type ReservationHistoryCounts = {
  total: number;
  byCourse: ReservationHistoryCourseCount[];
};

const COURSE_TAB_SHORT_LABELS: Record<string, string> = {
  "pilates-reformer": "Reformer",
  "mat-pilates": "Mat",
};

function shortCourseTabLabel(slug: string, fullLabel: string): string {
  return COURSE_TAB_SHORT_LABELS[slug] ?? fullLabel;
}

function sortCourseSlugs(slugs: string[], preferredOrder?: string[]): string[] {
  const order = preferredOrder?.length ? preferredOrder : ["pilates-reformer", "mat-pilates"];
  return [...slugs].sort((a, b) => {
    const ia = order.indexOf(a);
    const ib = order.indexOf(b);
    if (ia !== -1 && ib !== -1) return ia - ib;
    if (ia !== -1) return -1;
    if (ib !== -1) return 1;
    return courseLabel(a).localeCompare(courseLabel(b), "fr");
  });
}

type HistoryReservationRow = {
  status: string;
  planning: { courseSlug?: string; courseLabel: string };
};

/** Aligné sur le débit pack : seule la présence consomme une séance. */
function isConsumedHistoryStatus(status: string): boolean {
  return status === "ATTENDED";
}

/**
 * Compte l'historique consommé (présences) total et par type de cours.
 * Confirmée / Annulée restent visibles dans la liste, mais hors compteurs Reformer/Mat.
 */
export function buildReservationHistoryCounts(
  history: HistoryReservationRow[],
  courseQuotaSlugs?: string[],
): ReservationHistoryCounts {
  const consumed = history.filter((row) => isConsumedHistoryStatus(row.status));

  const countsBySlug = new Map<string, number>();
  for (const row of consumed) {
    const slug = row.planning.courseSlug ?? row.planning.courseLabel;
    countsBySlug.set(slug, (countsBySlug.get(slug) ?? 0) + 1);
  }

  const quotaSlugs = courseQuotaSlugs?.filter(Boolean) ?? [];
  const slugsFromHistory = [...countsBySlug.keys()];
  const slugsToShow =
    quotaSlugs.length >= 2
      ? sortCourseSlugs(quotaSlugs, quotaSlugs)
      : slugsFromHistory.length >= 2
        ? sortCourseSlugs(slugsFromHistory)
        : [];

  if (slugsToShow.length < 2) {
    return { total: consumed.length, byCourse: [] };
  }

  const byCourse = slugsToShow.map((slug) => {
    const fullLabel = courseLabel(slug);
    return {
      courseSlug: slug,
      courseLabel: fullLabel,
      shortLabel: shortCourseTabLabel(slug, fullLabel),
      count: countsBySlug.get(slug) ?? 0,
    };
  });

  return { total: consumed.length, byCourse };
}

export function formatHistoryCourseBreakdown(byCourse: ReservationHistoryCourseCount[]): string {
  return byCourse.map((row) => `${row.shortLabel} ${row.count}`).join(" · ");
}
