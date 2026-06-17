import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/auth";
import { isStaffRole } from "@/lib/admin/access";
import {
  historicalPresenceErrorMessage,
  listHistoricalPresenceRoster,
  markHistoricalPresence,
} from "@/lib/admin/mark-historical-presence";
import type { PlanningPeriodConfig } from "@/types/admin/planning";

function errorResponse(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

const getSchema = z.object({
  planningId: z.string().trim().cuid(),
  sessionDateYmd: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

const postSchema = z.object({
  memberId: z.string().trim().cuid(),
  planningId: z.string().trim().cuid(),
  sessionDateYmd: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  periodConfig: z.object({
    bookingWindow: z.enum(["WEEKLY", "FIFTEEN_DAYS", "ONE_MONTH"]),
    periodStartYmd: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    periodEndYmd: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    periodLabel: z.string().min(1),
  }),
});

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !isStaffRole(session.user.role)) {
    return errorResponse("Accès refusé", 403);
  }

  const url = new URL(request.url);
  const parsed = getSchema.safeParse({
    planningId: url.searchParams.get("planningId") ?? "",
    sessionDateYmd: url.searchParams.get("sessionDateYmd") ?? "",
  });
  if (!parsed.success) return errorResponse("Paramètres invalides", 400);

  const items = await listHistoricalPresenceRoster(parsed.data.planningId, parsed.data.sessionDateYmd);
  return Response.json({ items });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !isStaffRole(session.user.role)) {
    return errorResponse("Accès refusé", 403);
  }

  const raw = await request.json().catch(() => null);
  const parsed = postSchema.safeParse(raw);
  if (!parsed.success) return errorResponse("Données invalides", 400);

  try {
    const result = await markHistoricalPresence({
      memberId: parsed.data.memberId,
      planningId: parsed.data.planningId,
      sessionDateYmd: parsed.data.sessionDateYmd,
      periodConfig: parsed.data.periodConfig as PlanningPeriodConfig,
      createdByUserId: session.user.id,
    });
    const items = await listHistoricalPresenceRoster(parsed.data.planningId, parsed.data.sessionDateYmd);
    return Response.json({ ok: true, result, items });
  } catch (e) {
    const code = e instanceof Error ? e.message : "UNKNOWN";
    return errorResponse(historicalPresenceErrorMessage(code), 409);
  }
}
