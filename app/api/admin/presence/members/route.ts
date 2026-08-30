import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/auth";
import { isStaffRole } from "@/lib/admin/access";
import { buildMemberSearchWhere } from "@/lib/admin/member-search-filter";
import { prisma } from "@/lib/prisma";

function errorResponse(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

const querySchema = z.object({
  q: z.string().trim().min(2),
  /** Inclure les adhérentes inactives (saisie historique). */
  historical: z.enum(["1", "true"]).optional(),
});

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !isStaffRole(session.user.role)) {
    return errorResponse("Forbidden", 403);
  }

  const url = new URL(request.url);
  const parsed = querySchema.safeParse({
    q: url.searchParams.get("q") ?? "",
    historical: url.searchParams.get("historical") ?? undefined,
  });
  if (!parsed.success) return errorResponse("Invalid query parameters", 400);

  const q = parsed.data.q;
  const includeInactive = parsed.data.historical === "1" || parsed.data.historical === "true";

  const items = await prisma.member.findMany({
    where: {
      ...(includeInactive ? {} : { isActive: true }),
      ...buildMemberSearchWhere(q),
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

