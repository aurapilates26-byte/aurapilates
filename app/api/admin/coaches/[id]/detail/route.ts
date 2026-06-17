import { getCoachDetailById } from "@/lib/admin/coach-detail-server";
import { errorResponse, requireSuperAdmin } from "@/lib/admin/pack-promotion-auth";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const guard = await requireSuperAdmin();
  if ("error" in guard) return guard.error;

  const { id } = await params;
  const item = await getCoachDetailById(id);
  if (!item) {
    return errorResponse("Coach introuvable", 404);
  }

  return Response.json({ item });
}
