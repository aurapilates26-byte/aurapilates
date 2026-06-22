import type { BookingWindow, DayOfWeek, PlanningLevel } from "@prisma/client";

export const DAY_LABEL_FR: Record<DayOfWeek, string> = {
  MON: "Lundi",
  TUE: "Mardi",
  WED: "Mercredi",
  THU: "Jeudi",
  FRI: "Vendredi",
  SAT: "Samedi",
  SUN: "Dimanche",
};

/** Libellés affichés (les clés restent celles de la base : pas de migration). */
export const LEVEL_LABEL_FR: Record<PlanningLevel, string> = {
  ALL_LEVELS: "initiation",
  BEGINNER: "débutant",
  INTERMEDIATE: "débutant +",
  ADVANCED: "intermédiaire",
};

export function planningLevelLabelFr(level: string | null | undefined): string | null {
  if (level == null) return null;
  return (LEVEL_LABEL_FR as Record<string, string | undefined>)[level] ?? level;
}

/** Options du select admin « Niveau » (ordre d’affichage). */
export const PLANNING_LEVEL_FORM_OPTIONS: { value: PlanningLevel; label: string }[] = [
  { value: "ALL_LEVELS", label: LEVEL_LABEL_FR.ALL_LEVELS },
  { value: "BEGINNER", label: LEVEL_LABEL_FR.BEGINNER },
  { value: "INTERMEDIATE", label: LEVEL_LABEL_FR.INTERMEDIATE },
  { value: "ADVANCED", label: LEVEL_LABEL_FR.ADVANCED },
];

/** Libellés pour l'admin / l'espace membre (règles de réservation gérées côté compte connecté). */
export const BOOKING_WINDOW_LABEL_FR: Record<BookingWindow, string> = {
  WEEKLY: "Fenêtre de réservation : 7 jours",
  FIFTEEN_DAYS: "Fenêtre de réservation : 15 jours",
  ONE_MONTH: "Fenêtre de réservation : 30 jours",
};
