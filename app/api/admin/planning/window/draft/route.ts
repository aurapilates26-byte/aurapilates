import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/auth";
import { isStaffRole } from "@/lib/admin/access";
import {
  clearDraftPeriodSchedule,
  getAdminPlanningPeriodWindow,
  prepareDraftFromSuggestion,
  saveDraftPeriodSchedule,
} from "@/lib/admin/planning-period-draft";
import { getPlanningPeriodConfigEnriched } from "@/lib/admin/planning-period-config";

const bookingWindowSchema = z.enum(["WEEKLY", "FIFTEEN_DAYS", "ONE_MONTH"]);

function errorResponse(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { error: errorResponse("Non autorisé", 401) };
  if (!isStaffRole(session.user.role)) return { error: errorResponse("Accès refusé", 403) };
  return { session };
}

export async function PUT(request: Request) {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;

  const raw = await request.json().catch(() => null);
  const parsed = z
    .object({
      bookingWindow: bookingWindowSchema,
      periodStartYmd: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/),
    })
    .safeParse(raw);

  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return errorResponse(issue?.message ?? "Données invalides", 400);
  }

  try {
    await saveDraftPeriodSchedule(parsed.data);
    const window = await getAdminPlanningPeriodWindow();
    return Response.json({ ok: true, ...window });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Enregistrement impossible";
    return errorResponse(message, 400);
  }
}

export async function POST(request: Request) {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;

  const raw = await request.json().catch(() => null);
  const fromSuggestion = z.object({ action: z.literal("from_suggestion") }).safeParse(raw);

  try {
    if (fromSuggestion.success) {
      const published = await getPlanningPeriodConfigEnriched();
      const suggestion = published.suggestedRenewal;
      if (!suggestion) {
        return errorResponse("Aucune période suivante à proposer.", 400);
      }
      await prepareDraftFromSuggestion(suggestion);
    } else {
      return errorResponse("Action invalide.", 400);
    }
    const window = await getAdminPlanningPeriodWindow();
    return Response.json({ ok: true, ...window });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Impossible de préparer le brouillon.";
    return errorResponse(message, 400);
  }
}

export async function DELETE() {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;

  try {
    await clearDraftPeriodSchedule();
    const window = await getAdminPlanningPeriodWindow();
    return Response.json({ ok: true, ...window });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Suppression impossible";
    return errorResponse(message, 400);
  }
}
