import { getCoachSpaceData } from "@/lib/coach-space-server";
import { normalizeYearMonthParam } from "@/lib/admin/caisse-summary";
import { requireCoachSession } from "@/lib/require-coach";

export async function GET(request: Request) {
  const guard = await requireCoachSession();
  if ("error" in guard) return guard.error;

  const url = new URL(request.url);
  const yearMonth = normalizeYearMonthParam(url.searchParams.get("yearMonth"));
  const data = await getCoachSpaceData(guard.coach.id, yearMonth);
  if (!data) {
    return Response.json({ error: "Espace coach indisponible" }, { status: 404 });
  }

  return Response.json({ item: data });
}
