import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { isStaffRole } from "@/lib/admin/access";
import { validatePlanningAnchorForActivePeriod } from "@/lib/admin/planning-anchor-validation";
import {
  findOverlappingPlanningSlot,
  PLANNING_SLOT_OVERLAP_ERROR,
} from "@/lib/admin/planning-slot-duplicate";
import { mapAdminPlanningItem } from "@/lib/admin/planning-map";
import { adminPlanningPayloadSchema, planningLevelFromPayload } from "@/lib/admin/planning-payload-schema";
import {
  syncPublishedDeleteToDraft,
  syncPublishedUpdateToDraft,
} from "@/lib/admin/planning-draft-sync";
import { effectivePlanningCapacity } from "@/lib/planning-session-slot";

const db = new PrismaClient();

type Params = {
  params: Promise<{ id: string }>;
};

function errorResponse(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { error: errorResponse("Unauthorized", 401) };
  if (!isStaffRole(session.user.role)) return { error: errorResponse("Forbidden", 403) };
  return { session };
}

export async function PUT(request: Request, { params }: Params) {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;

  const { id } = await params;
  const existing = await db.planning.findUnique({
    where: { id },
  });
  if (!existing) return errorResponse("Planning item not found", 404);

  const raw = await request.json().catch(() => null);
  const parsed = adminPlanningPayloadSchema.safeParse(raw);
  if (!parsed.success) return errorResponse("Invalid request payload", 400);

  const data = parsed.data;
  const url = new URL(request.url);
  const scopeParam = url.searchParams.get("scope");
  const periodStartYmd = url.searchParams.get("periodStartYmd") ?? undefined;
  const scope =
    scopeParam === "archive"
      ? "archive"
      : existing.isDraft
        ? "draft"
        : "published";

  if (scope === "archive" && !periodStartYmd) {
    return errorResponse("Période historique requise", 400);
  }

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
    excludeId: id,
  });
  if (duplicate) {
    return errorResponse(PLANNING_SLOT_OVERLAP_ERROR, 409);
  }

  try {
    const updated = await db.planning.update({
      where: { id },
      data: {
        courseSlug: data.courseSlug,
        coachId: data.coachId ?? null,
        dayOfWeek: data.dayOfWeek,
        anchorSessionYmd: anchorCheck.anchorDate,
        level: planningLevelFromPayload(data),
        startTime: data.startTime,
        endTime: data.endTime,
        durationMinutes: data.durationMinutes,
        capacity: effectivePlanningCapacity(data.courseSlug, data.capacity),
        waitlistCapacity: data.waitlistCapacity ?? null,
      },
      include: {
        coach: { select: { id: true, firstName: true, lastName: true, imageUrl: true } },
      },
    });

    if (!existing.isDraft && scope === "published") {
      await syncPublishedUpdateToDraft(updated);
    }

    return Response.json({ item: mapAdminPlanningItem(updated) });
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

  const existing = await db.planning.findUnique({ where: { id } });
  if (!existing) return errorResponse("Créneau introuvable", 404);

  try {
    await db.planning.delete({ where: { id } });
    if (!existing.isDraft) {
      await syncPublishedDeleteToDraft(id);
    }
    return Response.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    if (message.includes("Record to delete does not exist")) return errorResponse("Créneau introuvable", 404);
    return errorResponse("Impossible de supprimer ce créneau", 400);
  }
}
