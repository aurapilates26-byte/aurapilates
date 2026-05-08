import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/auth";

const db = new PrismaClient();

const dayOfWeekSchema = z.enum(["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"]);
const levelSchema = z.enum(["ALL_LEVELS", "BEGINNER", "INTERMEDIATE", "ADVANCED"]);
const courseSlugSchema = z.enum(["pilates-reformer", "mat-pilates", "yoga", "dance"]);

const updatePlanningSchema = z.object({
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

type Params = {
  params: Promise<{ id: string }>;
};

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

export async function PUT(request: Request, { params }: Params) {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;

  const { id } = await params;
  const raw = await request.json().catch(() => null);
  const parsed = updatePlanningSchema.safeParse(raw);
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

  try {
    const updated = await db.planning.update({
      where: { id },
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

    return Response.json({ item: mapPlanning(updated) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    if (message.includes("Record to update not found")) return errorResponse("Planning item not found", 404);
    return errorResponse("Unable to update planning", 400);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;

  const { id } = await params;

  try {
    await db.planning.delete({ where: { id } });
    return Response.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    if (message.includes("Record to delete does not exist")) return errorResponse("Planning item not found", 404);
    return errorResponse("Unable to delete planning", 400);
  }
}

