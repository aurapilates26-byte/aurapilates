import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/auth";
import { isStaffRole } from "@/lib/admin/access";
import { isValidPackCategory, normalizePackCategory } from "@/lib/pack-categories";
import { normalizeDurationForApi } from "@/lib/pack-duration";

const db = new PrismaClient();

const updatePackSchema = z.object({
  category: z.string().trim().max(80).optional(),
  courseQuotas: z
    .object({
      "pilates-reformer": z.number().int().positive().optional(),
      "mat-pilates": z.number().int().positive().optional(),
    })
    .optional(),
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().max(2000).optional(),
  sessionCount: z.number().int().positive().optional(),
  priceCents: z.number().int().nonnegative().optional(),
  durationDays: z.string().trim().max(50).nullable().optional(),
  isActive: z.boolean().optional(),
});

type Params = {
  params: Promise<{ id: string }>;
};

function errorResponse(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

function parseDescriptionPoints(description?: string): string[] {
  if (!description) return [];
  const lines = description
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  return [...new Set(lines)];
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
  const raw = await request.json().catch(() => null);
  const parsed = updatePackSchema.safeParse(raw);
  if (!parsed.success) return errorResponse("Invalid request payload", 400);

  const data = parsed.data;
  const categoryRaw = data.category?.trim();
  const categoryForDb = categoryRaw ? normalizePackCategory(categoryRaw) : null;
  if (categoryRaw && !isValidPackCategory(categoryRaw)) {
    return errorResponse("Catégorie invalide", 400);
  }
  const features = parseDescriptionPoints(data.description);
  const dur = normalizeDurationForApi(data.durationDays ?? null);
  if (!dur.ok) return errorResponse(dur.error, 400);

  try {
    const updated = await db.$transaction(async (tx) => {
      await tx.pack.update({
        where: { id },
        data: {
          category: categoryForDb,
          name: data.name,
          description: data.description ?? null,
          sessionCount: data.sessionCount ?? null,
          priceCents: data.priceCents ?? null,
          durationDays: dur.value,
          isActive: data.isActive ?? true,
        },
      });

      if (data.courseQuotas) {
        await tx.packCourseQuota.deleteMany({ where: { packId: id } });
        const rows = [
          ...(data.courseQuotas["pilates-reformer"]
            ? [{ packId: id, courseSlug: "pilates-reformer", sessionCount: data.courseQuotas["pilates-reformer"] }]
            : []),
          ...(data.courseQuotas["mat-pilates"]
            ? [{ packId: id, courseSlug: "mat-pilates", sessionCount: data.courseQuotas["mat-pilates"] }]
            : []),
        ];
        if (rows.length > 0) {
          await tx.packCourseQuota.createMany({ data: rows });
        }
      }

      await tx.packFeature.deleteMany({
        where: { packId: id },
      });

      if (features.length > 0) {
        await tx.packFeature.createMany({
          data: features.map((label, index) => ({
            packId: id,
            label,
            sortOrder: index,
          })),
        });
      }

      return tx.pack.findUnique({
        where: { id },
        select: {
          id: true,
          category: true,
          name: true,
          description: true,
          sessionCount: true,
          priceCents: true,
          durationDays: true,
          isActive: true,
          features: {
            orderBy: { sortOrder: "asc" },
            select: { label: true },
          },
          courseQuotas: { select: { courseSlug: true, sessionCount: true } },
          _count: { select: { members: true } },
        },
      });
    });

    if (!updated) return errorResponse("Pack not found", 404);

    return Response.json({
      item: {
        ...updated,
        features: updated.features.map((feature) => feature.label),
        courseQuotas: updated.courseQuotas,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    if (message.includes("Record to update not found")) {
      return errorResponse("Pack not found", 404);
    }
    if (message.includes("Unique constraint")) {
      return errorResponse("Pack name already exists", 409);
    }
    return errorResponse("Unable to update pack", 400);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;

  const { id } = await params;

  const pack = await db.pack.findUnique({
    where: { id },
    select: {
      id: true,
      _count: { select: { members: true } },
    },
  });

  if (!pack) return errorResponse("Pack not found", 404);
  if (pack._count.members > 0) {
    return errorResponse("Impossible de supprimer un pack déjà assigné à des adhérentes", 409);
  }

  await db.pack.delete({
    where: { id },
  });

  return Response.json({ ok: true });
}
