import { z } from "zod";
import { fetchCaisseMonthSnapshot } from "@/lib/admin/caisse-summary";
import { errorResponse, requireSuperAdmin } from "@/lib/admin/pack-promotion-auth";

const querySchema = z.object({
  yearMonth: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}$/)
    .optional(),
});

export async function GET(request: Request) {
  const guard = await requireSuperAdmin();
  if ("error" in guard) return guard.error;

  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse({ yearMonth: searchParams.get("yearMonth") ?? undefined });
  if (!parsed.success) {
    return errorResponse("Paramètre yearMonth invalide (format AAAA-MM).", 400);
  }

  const snapshot = await fetchCaisseMonthSnapshot(parsed.data.yearMonth ?? "");
  return Response.json(snapshot);
}
