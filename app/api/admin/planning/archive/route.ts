import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/auth";
import { isStaffRole } from "@/lib/admin/access";
import {
  listArchivedPlanningPeriodsForAdmin,
  syncKnownPlanningPeriodArchives,
} from "@/lib/admin/planning-period-archive";

function errorResponse(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

const postSchema = z.object({
  action: z.enum(["seed", "repair"]),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || !isStaffRole(session.user.role)) {
    return errorResponse("Accès refusé", 403);
  }

  const items = await listArchivedPlanningPeriodsForAdmin();
  return Response.json({ items });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !isStaffRole(session.user.role)) {
    return errorResponse("Accès refusé", 403);
  }

  const raw = await request.json().catch(() => null);
  const parsed = postSchema.safeParse(raw);
  if (!parsed.success) return errorResponse("Requête invalide", 400);

  const sync = await syncKnownPlanningPeriodArchives();
  const items = await listArchivedPlanningPeriodsForAdmin();
  return Response.json({ ...sync, created: sync.created, items });
}
