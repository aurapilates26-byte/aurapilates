import { z } from "zod";
import { listBookablePacksForMember } from "@/lib/admin/member-pack-selection";
import { parseYmdLocal } from "@/lib/calendar-day";
import { requireMemberSession } from "@/lib/require-member";

function errorResponse(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

const querySchema = z.object({
  courseSlug: z.string().trim().min(1),
  sessionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export async function GET(request: Request) {
  const guard = await requireMemberSession();
  if ("error" in guard) return guard.error;

  const url = new URL(request.url);
  const parsed = querySchema.safeParse({
    courseSlug: url.searchParams.get("courseSlug") ?? "",
    sessionDate: url.searchParams.get("sessionDate") ?? undefined,
  });
  if (!parsed.success) return errorResponse("Paramètres invalides", 400);

  const sessionDateLocal = parsed.data.sessionDate ? parseYmdLocal(parsed.data.sessionDate) : null;
  const result = await listBookablePacksForMember(
    guard.member.id,
    parsed.data.courseSlug,
    sessionDateLocal,
  );

  return Response.json({
    items: result.items,
    ...(result.emptyMessage ? { emptyMessage: result.emptyMessage } : {}),
  });
}
