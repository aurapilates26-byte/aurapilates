import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/auth";
import { isValidPackCategory } from "@/lib/pack-categories";

const db = new PrismaClient();

const createPackSchema = z.object({
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
  durationDays: z.number().int().positive().optional(),
  isActive: z.boolean().optional(),
});

function parseDescriptionPoints(description?: string): string[] {
  if (!description) return [];
  const lines = description
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  return [...new Set(lines)];
}

function errorResponse(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { error: errorResponse("Unauthorized", 401) };
  if (session.user.role !== "ADMIN") return { error: errorResponse("Forbidden", 403) };
  return { session };
}

export async function GET() {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;

  const items = await db.pack.findMany({
    orderBy: [{ isActive: "desc" }, { name: "asc" }],
    select: {
      id: true,
      category: true,
      name: true,
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

  return Response.json({
    items: items.map((item) => ({
      ...item,
      features: item.features.map((feature) => feature.label),
      courseQuotas: item.courseQuotas,
    })),
  });
}

export async function POST(request: Request) {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;

  const raw = await request.json().catch(() => null);
  const parsed = createPackSchema.safeParse(raw);
  if (!parsed.success) return errorResponse("Invalid request payload", 400);

  const data = parsed.data;
  if (data.category && !isValidPackCategory(data.category)) {
    return errorResponse("Categorie invalide", 400);
  }
  const features = parseDescriptionPoints(data.description);
  let created:
    | {
        id: string;
        category: string | null;
        name: string;
        description: string | null;
        sessionCount: number | null;
        priceCents: number | null;
        durationDays: number | null;
        isActive: boolean;
        features: { label: string }[];
        courseQuotas: { courseSlug: string; sessionCount: number }[];
      }
    | null = null;
  try {
    created = await db.pack.create({
      data: {
        category: data.category ?? null,
        name: data.name,
        description: data.description ?? null,
        sessionCount: data.sessionCount ?? null,
        priceCents: data.priceCents ?? null,
        durationDays: data.durationDays ?? null,
        isActive: data.isActive ?? true,
        features: {
          create: features.map((label, index) => ({
            label,
            sortOrder: index,
          })),
        },
        courseQuotas: data.courseQuotas
          ? {
              create: [
                ...(data.courseQuotas["pilates-reformer"]
                  ? [{ courseSlug: "pilates-reformer", sessionCount: data.courseQuotas["pilates-reformer"] }]
                  : []),
                ...(data.courseQuotas["mat-pilates"]
                  ? [{ courseSlug: "mat-pilates", sessionCount: data.courseQuotas["mat-pilates"] }]
                  : []),
              ],
            }
          : undefined,
      },
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
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return errorResponse("Un pack avec ce nom existe deja", 409);
    }
    return errorResponse("Creation du pack impossible", 400);
  }

  return Response.json(
    {
      item: {
        ...created!,
        features: created.features.map((feature) => feature.label),
        courseQuotas: created.courseQuotas,
      },
    },
    { status: 201 }
  );
}

