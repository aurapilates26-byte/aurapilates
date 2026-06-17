import { z } from "zod";
import { normalizePlanningLevelForDb } from "@/lib/planning-course-level";

const dayOfWeekSchema = z.enum(["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"]);
const levelSchema = z.enum(["ALL_LEVELS", "BEGINNER", "INTERMEDIATE", "ADVANCED"]);
const courseSlugSchema = z.enum([
  "pilates-reformer",
  "mat-pilates",
  "yoga",
  "dance",
  "coaching-prive",
  "sans-cours",
]);

const ymdSchema = z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/);

const planningPayloadBase = {
  courseSlug: courseSlugSchema,
  coachId: z.string().trim().cuid().optional(),
  dayOfWeek: dayOfWeekSchema,
  anchorSessionYmd: ymdSchema.optional(),
  level: levelSchema.nullable().optional(),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
  durationMinutes: z.number().int().min(10).max(24 * 60),
  capacity: z.number().int().min(1).max(999),
  waitlistCapacity: z.number().int().min(0).max(999).optional(),
};

export const adminPlanningPayloadSchema = z.object(planningPayloadBase);

export type AdminPlanningPayload = z.infer<typeof adminPlanningPayloadSchema>;

export function planningLevelFromPayload(data: AdminPlanningPayload) {
  return normalizePlanningLevelForDb(data.courseSlug, data.level ?? null);
}
