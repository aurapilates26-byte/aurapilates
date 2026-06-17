import { z } from "zod";
import { CAISSE_HISTORY_FETCH_DAYS, clampHistoryDays, fetchCaisseHistoryForLastDays } from "@/lib/admin/caisse-history";
import { errorResponse, requireSuperAdmin } from "@/lib/admin/pack-promotion-auth";

const querySchema = z.object({
  days: z.coerce.number().int().min(1).max(366).optional(),
});

export async function GET(request: Request) {
  const guard = await requireSuperAdmin();
  if ("error" in guard) return guard.error;

  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse({ days: searchParams.get("days") ?? undefined });
  if (!parsed.success) {
    return errorResponse("Paramètre days invalide (1 à 366).", 400);
  }

  const days =
    parsed.data.days !== undefined
      ? clampHistoryDays(parsed.data.days)
      : CAISSE_HISTORY_FETCH_DAYS;
  const history = await fetchCaisseHistoryForLastDays(days);
  return Response.json(history);
}
