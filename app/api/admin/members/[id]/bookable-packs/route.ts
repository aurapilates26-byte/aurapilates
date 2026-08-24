import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/auth";
import { isStaffRole } from "@/lib/admin/access";
import { listBookablePacksForMember } from "@/lib/admin/member-pack-selection";
import { parseYmdLocal } from "@/lib/calendar-day";
import { prisma } from "@/lib/prisma";

function errorResponse(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

const querySchema = z.object({
  courseSlug: z.string().trim().min(1),
  sessionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return errorResponse("Unauthorized", 401);
  if (!isStaffRole(session.user.role)) return errorResponse("Forbidden", 403);

  const { id: memberId } = await params;
  const url = new URL(request.url);
  const parsed = querySchema.safeParse({
    courseSlug: url.searchParams.get("courseSlug") ?? "",
    sessionDate: url.searchParams.get("sessionDate") ?? undefined,
  });
  if (!parsed.success) return errorResponse("Paramètres invalides", 400);

  const member = await prisma.member.findUnique({
    where: { id: memberId },
    select: { id: true },
  });
  if (!member) return errorResponse("Adhérente introuvable", 404);

  const sessionDateLocal = parsed.data.sessionDate ? parseYmdLocal(parsed.data.sessionDate) : null;
  const result = await listBookablePacksForMember(memberId, parsed.data.courseSlug, sessionDateLocal);

  return Response.json({
    items: result.items,
    ...(result.emptyMessage ? { emptyMessage: result.emptyMessage } : {}),
  });
}
