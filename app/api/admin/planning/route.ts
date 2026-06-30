import { Prisma, PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/auth";
import { isStaffRole } from "@/lib/admin/access";
import { getArchivedPlanningPeriodConfig } from "@/lib/admin/planning-period-archive";
import { draftPeriodConfigOrNull, getAdminPlanningPeriodWindow } from "@/lib/admin/planning-period-draft";
import { getPlanningPeriodConfig } from "@/lib/admin/planning-period-config";
import { validatePlanningAnchorForActivePeriod } from "@/lib/admin/planning-anchor-validation";
import {
  findOverlappingPlanningSlot,
  PLANNING_SLOT_OVERLAP_ERROR,
} from "@/lib/admin/planning-slot-duplicate";
import { parseYmdToPrismaDate } from "@/lib/calendar-day";
import { mapAdminPlanningItem } from "@/lib/admin/planning-map";
import { adminPlanningPayloadSchema, planningLevelFromPayload } from "@/lib/admin/planning-payload-schema";
import {
  ensureDraftPeriodWithMirrors,
  syncPublishedCreateToDraft,
} from "@/lib/admin/planning-draft-sync";

const db = new PrismaClient();

const listPlanningQuerySchema = z.object({
  search: z.string().trim().optional(),
  dayOfWeek: z.enum(["ALL", "MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"]).default("ALL"),
  scope: z.enum(["published", "draft", "archive"]).default("published"),
  periodStartYmd: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

function errorResponse(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { error: errorResponse("Unauthorized", 401) };
  if (!isStaffRole(session.user.role)) return { error: errorResponse("Forbidden", 403) };
  return { session };
}

export async function GET(request: Request) {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;

  const url = new URL(request.url);
  const parsed = listPlanningQuerySchema.safeParse({
    search: url.searchParams.get("search") ?? undefined,
    dayOfWeek: url.searchParams.get("dayOfWeek") ?? "ALL",
    scope: url.searchParams.get("scope") ?? "published",
    periodStartYmd: url.searchParams.get("periodStartYmd") ?? undefined,
  });
  if (!parsed.success) return errorResponse("Invalid query parameters", 400);

  const { search, dayOfWeek, scope, periodStartYmd } = parsed.data;

  if (scope === "archive") {
    if (!periodStartYmd) return errorResponse("Période historique requise", 400);
    const archive = await getArchivedPlanningPeriodConfig(periodStartYmd);
    if (!archive) return errorResponse("Période historique introuvable", 404);

    const periodStart = parseYmdToPrismaDate(archive.periodStartYmd);
    const periodEnd = parseYmdToPrismaDate(archive.periodEndYmd);
    if (!periodStart || !periodEnd) return errorResponse("Période historique invalide", 400);

    const items = await db.planning.findMany({
      where: {
        isDraft: false,
        anchorSessionYmd: { gte: periodStart, lte: periodEnd },
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
      },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
      include: {
        coach: { select: { id: true, firstName: true, lastName: true, imageUrl: true } },
      },
    });

    return Response.json({ items: items.map(mapAdminPlanningItem) });
  }

  let periodStart: Date | null = null;
  let periodEnd: Date | null = null;

  if (scope === "published") {
    const period = await getPlanningPeriodConfig();
    periodStart = parseYmdToPrismaDate(period.periodStartYmd);
    periodEnd = parseYmdToPrismaDate(period.periodEndYmd);
  } else if (scope === "draft") {
    await ensureDraftPeriodWithMirrors();
    const window = await getAdminPlanningPeriodWindow();
    const draft = draftPeriodConfigOrNull(window.draft);
    if (!draft) {
      return Response.json({ items: [] });
    }
    periodStart = parseYmdToPrismaDate(draft.periodStartYmd);
    periodEnd = parseYmdToPrismaDate(draft.periodEndYmd);
  }

  if (!periodStart || !periodEnd) {
    return errorResponse("Période de planning invalide", 400);
  }

  const where: Prisma.PlanningWhereInput = {
    isDraft: scope === "draft",
    anchorSessionYmd: { gte: periodStart, lte: periodEnd },
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

  return Response.json({ items: items.map(mapAdminPlanningItem) });
}

export async function POST(request: Request) {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;

  const url = new URL(request.url);
  const scopeParam = url.searchParams.get("scope");
  const periodStartYmd = url.searchParams.get("periodStartYmd") ?? undefined;
  const scope =
    scopeParam === "draft" ? "draft" : scopeParam === "archive" ? "archive" : "published";

  if (scope === "archive" && !periodStartYmd) {
    return errorResponse("Période historique requise", 400);
  }

  const raw = await request.json().catch(() => null);
  const parsed = adminPlanningPayloadSchema.safeParse(raw);
  if (!parsed.success) return errorResponse("Invalid request payload", 400);

  const data = parsed.data;

  const anchorCheck = await validatePlanningAnchorForActivePeriod(
    data.anchorSessionYmd,
    data.dayOfWeek,
    scope,
    periodStartYmd,
  );
  if (anchorCheck.error || !anchorCheck.anchorDate) {
    return errorResponse(anchorCheck.error ?? "Date du créneau requise.", 400);
  }

  if (data.coachId) {
    const coach = await db.coach.findUnique({
      where: { id: data.coachId },
      select: { id: true, isActive: true },
    });
    if (!coach) return errorResponse("Coach not found", 404);
    if (!coach.isActive) return errorResponse("Selected coach is inactive", 409);
  }

  const duplicate = await findOverlappingPlanningSlot(db, {
    anchorSessionYmd: anchorCheck.anchorDate,
    courseSlug: data.courseSlug,
    startTime: data.startTime,
    isDraft: scope === "draft",
  });
  if (duplicate) {
    return errorResponse(PLANNING_SLOT_OVERLAP_ERROR, 409);
  }

  const created = await db.planning.create({
    data: {
      courseSlug: data.courseSlug,
      coachId: data.coachId ?? null,
      dayOfWeek: data.dayOfWeek,
      anchorSessionYmd: anchorCheck.anchorDate,
      isDraft: scope === "draft",
      level: planningLevelFromPayload(data),
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

  if (scope === "published") {
    await syncPublishedCreateToDraft(created);
  }

  return Response.json({ item: mapAdminPlanningItem(created) }, { status: 201 });
}

