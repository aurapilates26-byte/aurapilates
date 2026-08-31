import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/auth";
import { isStaffRole } from "@/lib/admin/access";
import { getAdminPlanningPeriodWindow } from "@/lib/admin/planning-period-draft";
import { savePlanningPeriodConfig } from "@/lib/admin/planning-period-config";

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

export async function GET() {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;

  const window = await getAdminPlanningPeriodWindow();
  return Response.json(window);
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
    await savePlanningPeriodConfig(parsed.data);
    const window = await getAdminPlanningPeriodWindow();
    return Response.json({ ok: true, ...window });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Enregistrement impossible";
    return errorResponse(message, 400);
  }
}
