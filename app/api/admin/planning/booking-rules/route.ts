import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/auth";
import { isStaffRole } from "@/lib/admin/access";
import { getAdminPlanningPeriodWindow } from "@/lib/admin/planning-period-draft";
import { getStudioBookingRules, saveStudioBookingRules } from "@/lib/studio-booking-rules-server";

const clockSchema = z.string().regex(/^(\d{1,2}):([0-5]\d)$/);

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

  const rules = await getStudioBookingRules();
  return Response.json(rules);
}

export async function PATCH(request: Request) {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;

  const raw = await request.json().catch(() => null);
  const parsed = z
    .object({
      lateCancellationRuleEnabled: z.boolean().optional(),
      memberReservationOpenTime: clockSchema.optional(),
      memberReservationCloseTime: clockSchema.optional(),
    })
    .safeParse(raw);

  if (!parsed.success) {
    return errorResponse("Données invalides", 400);
  }

  if (
    parsed.data.lateCancellationRuleEnabled == null &&
    parsed.data.memberReservationOpenTime == null &&
    parsed.data.memberReservationCloseTime == null
  ) {
    return errorResponse("Aucune modification à enregistrer", 400);
  }

  try {
    const bookingRules = await saveStudioBookingRules(parsed.data);
    const window = await getAdminPlanningPeriodWindow();
    return Response.json({ ok: true, ...window, bookingRules });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Enregistrement impossible";
    return errorResponse(message, 400);
  }
}
