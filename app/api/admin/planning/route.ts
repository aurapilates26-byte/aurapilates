import { Prisma, PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/auth";

const db = new PrismaClient();

const dayOfWeekSchema = z.enum(["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"]);
const levelSchema = z.enum(["ALL_LEVELS", "BEGINNER", "INTERMEDIATE", "ADVANCED"]);
const courseSlugSchema = z.enum(["pilates-reformer", "mat-pilates", "yoga", "dance"]);

const listPlanningQuerySchema = z.object({
  search: z.string().trim().optional(),
  dayOfWeek: z.enum(["ALL", "MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"]).default("ALL"),
});

const createPlanningSchema = z.object({
  courseSlug: courseSlugSchema,
  coachId: z.string().trim().cuid().optional(),
  dayOfWeek: dayOfWeekSchema,
  level: levelSchema,
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
  durationMinutes: z.number().int().min(10).max(24 * 60),
  capacity: z.number().int().min(1).max(999),
  waitlistCapacity: z.number().int().min(0).max(999).optional(),
});

function errorResponse(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { error: errorResponse("Unauthorized", 401) };
  if (session.user.role !== "ADMIN") return { error: errorResponse("Forbidden", 403) };
  return { session };
}

function mapPlanning(record: {
  id: string;
  courseSlug: string;
  dayOfWeek: string;
  level: string;
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
    level: record.level,
    startTime: record.startTime,
    endTime: record.endTime,
    durationMinutes: record.durationMinutes,
    capacity: record.capacity,
    waitlistCapacity: record.waitlistCapacity,
    coach: record.coach,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

export async function GET(request: Request) {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;

  const url = new URL(request.url);
  const parsed = listPlanningQuerySchema.safeParse({
    search: url.searchParams.get("search") ?? undefined,
    dayOfWeek: url.searchParams.get("dayOfWeek") ?? "ALL",
  });
  if (!parsed.success) return errorResponse("Invalid query parameters", 400);

  const { search, dayOfWeek } = parsed.data;

  const where: Prisma.PlanningWhereInput = {
    ...(dayOfWeek !== "ALL" ? { dayOfWeek } : {}),
    ...(search
      ? {
          OR: [
            { courseSlug: { contains: search, mode: Prisma.QueryMode.insensitive } },
            { coach: { firstName: { contains: search, mode: Prisma.QueryMode.insensitive } } },
            { coach: { lastName: { contains: search, mode: Prisma.QueryMode.insensitive } } },
          ],
        }
      : {}),
  };

  const items = await db.planning.findMany({
    where,
    orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    include: {
      coach: { select: { id: true, firstName: true, lastName: true, imageUrl: true } },
    },
  });

  return Response.json({ items: items.map(mapPlanning) });
}

export async function POST(request: Request) {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;

  const raw = await request.json().catch(() => null);
  const parsed = createPlanningSchema.safeParse(raw);
  if (!parsed.success) return errorResponse("Invalid request payload", 400);

  const data = parsed.data;

  if (data.coachId) {
    const coach = await db.coach.findUnique({
      where: { id: data.coachId },
      select: { id: true, isActive: true },
    });
    if (!coach) return errorResponse("Coach not found", 404);
    if (!coach.isActive) return errorResponse("Selected coach is inactive", 409);
  }

  const created = await db.planning.create({
    data: {
      courseSlug: data.courseSlug,
      coachId: data.coachId ?? null,
      dayOfWeek: data.dayOfWeek,
      level: data.level,
      startTime: data.startTime,
      endTime: data.endTime,
      durationMinutes: data.durationMinutes,
      capacity: data.capacity,
      waitlistCapacity: data.waitlistCapacity ?? null,
    },
    include: {
      coach: { select: { id: true, firstName: true, lastName: true, imageUrl: true } },
    },
  });

  return Response.json({ item: mapPlanning(created) }, { status: 201 });
}

