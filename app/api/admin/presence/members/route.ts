import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

function errorResponse(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

const querySchema = z.object({
  q: z.string().trim().min(2),
});

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return errorResponse("Forbidden", 403);
  }

  const url = new URL(request.url);
  const parsed = querySchema.safeParse({ q: url.searchParams.get("q") ?? "" });
  if (!parsed.success) return errorResponse("Invalid query parameters", 400);

  const q = parsed.data.q;
  const tokens = q
    .split(/\s+/)
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 4);

  const orParts =
    tokens.length > 0
      ? tokens.flatMap((t) => [
          { firstName: { contains: t, mode: "insensitive" as const } },
          { lastName: { contains: t, mode: "insensitive" as const } },
          { phone: { contains: t, mode: "insensitive" as const } },
        ])
      : [
          { firstName: { contains: q, mode: "insensitive" as const } },
          { lastName: { contains: q, mode: "insensitive" as const } },
          { phone: { contains: q, mode: "insensitive" as const } },
        ];

  const items = await prisma.member.findMany({
    where: {
      isActive: true,
      OR: orParts,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      phone: true,
    },
    orderBy: [{ updatedAt: "desc" }],
    take: 8,
  });

  return Response.json({
    q,
    items: items.map((m) => ({
      id: m.id,
      name: `${m.firstName ?? ""} ${m.lastName ?? ""}`.trim() || "—",
      phone: m.phone ?? null,
    })),
  });
}

