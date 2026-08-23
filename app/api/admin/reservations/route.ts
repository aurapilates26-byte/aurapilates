import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/auth";
import { isStaffRole } from "@/lib/admin/access";
import { courseLabel } from "@/lib/course-labels";
import {
  formatYmdLocal,
  parseYmdLocal,
  parseYmdToPrismaDate,
  prismaDayOfWeekFromLocalDate,
  startOfLocalToday,
} from "@/lib/calendar-day";
import {
  draftPeriodConfigOrNull,
  getAdminPlanningPeriodWindow,
} from "@/lib/admin/planning-period-draft";
import { getAdminOperationalPlanningSlotsForDate } from "@/lib/admin/planning-operational-slots";
import { countOccupyingProspectsByPlanning } from "@/lib/admin/session-prospect-stats";
import { isSessionYmdWithinPlanningPeriod } from "@/lib/planning-period-status";
import { prisma } from "@/lib/prisma";

function errorResponse(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

const querySchema = z.object({
  date: z.string().optional(),
});

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !isStaffRole(session.user.role)) {
    return errorResponse("Forbidden", 403);
  }

  const url = new URL(request.url);
  const parsed = querySchema.safeParse({
    date: url.searchParams.get("date") ?? undefined,
  });
  if (!parsed.success) return errorResponse("Invalid query parameters", 400);

  const dayLocal = parsed.data.date ? parseYmdLocal(parsed.data.date) : startOfLocalToday();
  if (!dayLocal) return errorResponse("Date invalide", 400);

  const dayOfWeek = prismaDayOfWeekFromLocalDate(dayLocal);
  const ymd = formatYmdLocal(dayLocal);
  const dayDb = parseYmdToPrismaDate(ymd);
  if (!dayDb) return errorResponse("Date invalide", 400);

  const [slots, window] = await Promise.all([
    getAdminOperationalPlanningSlotsForDate(ymd),
    getAdminPlanningPeriodWindow(),
  ]);

  const draftPeriod = draftPeriodConfigOrNull(window.draft);
  const inPublished = isSessionYmdWithinPlanningPeriod(ymd, window.published);
  const inDraft = draftPeriod != null && isSessionYmdWithinPlanningPeriod(ymd, draftPeriod);
  const periodScope: "published" | "draft" | "outside" =
    !inPublished && !inDraft ? "outside" : inDraft ? "draft" : "published";

  const planningIds = slots.map((s) => s.id);
  const [reservations, prospectCounts] = await Promise.all([
    planningIds.length
      ? prisma.reservation.findMany({
          where: {
            planningId: { in: planningIds },
            sessionDate: dayDb,
          },
          select: { planningId: true, status: true },
        })
      : Promise.resolve([]),
    countOccupyingProspectsByPlanning(planningIds, dayDb),
  ]);

  const byPlanning = reservations.reduce<Record<string, { booked: number; wait: number; attended: number; cancelled: number }>>(
    (acc, r) => {
      const cur = acc[r.planningId] ?? { booked: 0, wait: 0, attended: 0, cancelled: 0 };
      if (r.status === "BOOKED") cur.booked += 1;
      else if (r.status === "WAITLIST") cur.wait += 1;
      else if (r.status === "ATTENDED") cur.attended += 1;
      else if (r.status === "CANCELLED") cur.cancelled += 1;
      acc[r.planningId] = cur;
      return acc;
    },
    {}
  );

  return Response.json({
    date: ymd,
    dayOfWeek,
    periodScope,
    publishedPeriodLabel: window.published.periodLabel,
    draftPeriodLabel: draftPeriod?.periodLabel ?? null,
    slots: slots.map((s) => {
      const stats = byPlanning[s.id] ?? { booked: 0, wait: 0, attended: 0, cancelled: 0 };
      const prospectCount = prospectCounts[s.id] ?? 0;
      const mainOccupied = stats.booked + stats.attended + prospectCount;
      const spotsRemaining = Math.max(0, s.capacity - mainOccupied);
      const waitSpotsRemaining =
        s.waitlistCapacity == null ? null : Math.max(0, s.waitlistCapacity - stats.wait);

      return {
        planningId: s.id,
        courseSlug: s.courseSlug,
        courseLabel: courseLabel(s.courseSlug),
        startTime: s.startTime,
        endTime: s.endTime,
        level: s.level,
        coachName: s.coach ? `${s.coach.firstName} ${s.coach.lastName}`.trim() : null,
        coachImageUrl: s.coach?.imageUrl ?? null,
        capacity: s.capacity,
        waitlistCapacity: s.waitlistCapacity,
        stats: {
          booked: stats.booked,
          attended: stats.attended,
          waitlist: stats.wait,
          cancelled: stats.cancelled,
          prospects: prospectCount,
          spotsRemaining,
          waitSpotsRemaining,
        },
      };
    }),
  });
}
