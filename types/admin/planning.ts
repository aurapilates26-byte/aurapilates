export type PlanningDayOfWeek = "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT" | "SUN";
export type PlanningLevel = "ALL_LEVELS" | "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
export type PlanningBookingWindow = "WEEKLY" | "FIFTEEN_DAYS" | "ONE_MONTH";

export type AdminPlanningItem = {
  id: string;
  courseSlug: string;
  dayOfWeek: PlanningDayOfWeek;
  level: PlanningLevel;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  capacity: number;
  waitlistCapacity: number | null;
  coach: { id: string; firstName: string; lastName: string; imageUrl: string | null } | null;
  createdAt: string;
  updatedAt: string;
};

export type PlanningFilters = {
  search: string;
  dayOfWeek: "ALL" | PlanningDayOfWeek;
};

