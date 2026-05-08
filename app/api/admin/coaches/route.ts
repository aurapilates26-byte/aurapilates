import { Prisma, PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/auth";

const db = new PrismaClient();

const optionalEmailSchema = z.preprocess(
  (value) => {
    if (value === "" || value === null || value === undefined) return undefined;
    return value;
  },
  z.string().trim().email().optional()
);

function isValidImageUrl(value: string) {
  if (value.startsWith("/coach/")) return true;
  if (value.startsWith("data:image/")) return true;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

const optionalImageSchema = z.preprocess(
  (value) => {
    if (value === "" || value === null || value === undefined) return undefined;
    return value;
  },
  z
    .string()
    .trim()
    .refine((value) => isValidImageUrl(value), "Image invalide: utilisez une image depuis l'appareil ou une URL valide.")
    .optional()
);

const createCoachSchema = z.object({
  imageUrl: optionalImageSchema,
  firstName: z.string().trim().min(2).max(80),
  lastName: z.string().trim().min(2).max(80),
  description: z.string().trim().max(3000).optional(),
  email: optionalEmailSchema,
  phone: z.string().trim().min(6).max(40).optional(),
  isActive: z.boolean().optional(),
});

const listCoachesQuerySchema = z.object({
  search: z.string().trim().optional(),
  status: z.enum(["ALL", "ACTIVE", "INACTIVE"]).default("ALL"),
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

export async function GET(request: Request) {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;

  const url = new URL(request.url);
  const parsed = listCoachesQuerySchema.safeParse({
    search: url.searchParams.get("search") ?? undefined,
    status: url.searchParams.get("status") ?? "ALL",
  });
  if (!parsed.success) return errorResponse("Invalid query parameters", 400);

  const { search, status } = parsed.data;

  const where: Prisma.CoachWhereInput = {
    ...(status === "ACTIVE" ? { isActive: true } : {}),
    ...(status === "INACTIVE" ? { isActive: false } : {}),
    ...(search
      ? {
          OR: [
            { firstName: { contains: search, mode: Prisma.QueryMode.insensitive } },
            { lastName: { contains: search, mode: Prisma.QueryMode.insensitive } },
            { email: { contains: search, mode: Prisma.QueryMode.insensitive } },
            { phone: { contains: search, mode: Prisma.QueryMode.insensitive } },
            { description: { contains: search, mode: Prisma.QueryMode.insensitive } },
          ],
        }
      : {}),
  };

  const items = await db.coach.findMany({
    where,
    orderBy: [{ isActive: "desc" }, { createdAt: "desc" }],
  });

  return Response.json({ items });
}

export async function POST(request: Request) {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;

  const raw = await request.json().catch(() => null);
  const parsed = createCoachSchema.safeParse(raw);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const field = issue?.path?.[0];
    const message = field ? `${String(field)}: ${issue.message}` : issue?.message ?? "Invalid request payload";
    return errorResponse(message, 400);
  }

  const data = parsed.data;
  try {
    const item = await db.coach.create({
      data: {
        imageUrl: data.imageUrl ?? null,
        firstName: data.firstName,
        lastName: data.lastName,
        description: data.description ?? null,
        email: data.email ?? null,
        phone: data.phone ?? null,
        isActive: data.isActive ?? true,
      },
    });
    return Response.json({ item }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    if (message.includes("Unique constraint")) {
      return errorResponse("Email already used", 409);
    }
    return errorResponse("Unable to create coach", 400);
  }
}
