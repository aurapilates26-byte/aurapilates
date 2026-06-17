import { formatYmdPrismaDate } from "@/lib/calendar-day";

export function mapAdminPlanningItem(record: {
  id: string;
  courseSlug: string;
  dayOfWeek: string;
  anchorSessionYmd: Date | null;
  level: string | null;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  capacity: number;
  waitlistCapacity: number | null;
  createdAt: Date;
  updatedAt: Date;
  coach: { id: string; firstName: string; lastName: string; imageUrl: string | null } | null;
}) {
  return {
    id: record.id,
    courseSlug: record.courseSlug,
    dayOfWeek: record.dayOfWeek,
    anchorSessionYmd: record.anchorSessionYmd ? formatYmdPrismaDate(record.anchorSessionYmd) : null,
    level: record.level,
    startTime: record.startTime,
    endTime: record.endTime,
    durationMinutes: record.durationMinutes,
    capacity: record.capacity,
    waitlistCapacity: record.waitlistCapacity,
    coach: record.coach,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}
