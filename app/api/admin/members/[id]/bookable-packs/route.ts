import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/auth";
import { isStaffRole } from "@/lib/admin/access";
import { listBookablePacksForMember } from "@/lib/admin/member-pack-selection";
import { prisma } from "@/lib/prisma";

function errorResponse(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

const querySchema = z.object({
  courseSlug: z.string().trim().min(1),
});

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return errorResponse("Unauthorized", 401);
  if (!isStaffRole(session.user.role)) return errorResponse("Forbidden", 403);

  const { id: memberId } = await params;
  const url = new URL(request.url);
  const parsed = querySchema.safeParse({ courseSlug: url.searchParams.get("courseSlug") ?? "" });
  if (!parsed.success) return errorResponse("Paramètres invalides", 400);

  const member = await prisma.member.findUnique({
    where: { id: memberId },
    select: { id: true },
  });
  if (!member) return errorResponse("Adhérente introuvable", 404);

  const candidates = await listBookablePacksForMember(memberId, parsed.data.courseSlug);
  const packNames = await prisma.pack.findMany({
    where: { id: { in: candidates.map((c) => c.packId) } },
    select: { id: true, name: true },
  });
  const nameById = new Map(packNames.map((p) => [p.id, p.name]));

  return Response.json({
    items: candidates.map((c) => ({
      packId: c.packId,
      packName: nameById.get(c.packId) ?? "Pack",
      remainingSessions: c.remainingSessions,
      isPrimary: c.isPrimary,
    })),
  });
}
