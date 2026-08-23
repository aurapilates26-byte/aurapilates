import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { isStaffRole } from "@/lib/admin/access";
import {
  createSessionProspect,
  createSessionProspectSchema,
} from "@/lib/admin/session-prospect";

function errorResponse(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

const ERROR_MESSAGES: Record<string, string> = {
  INVALID_DATE: "Date invalide.",
  PLANNING_NOT_FOUND: "Créneau introuvable pour cette période.",
  FULL: "Plus de place disponible sur ce créneau.",
};

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !isStaffRole(session.user.role)) {
    return errorResponse("Forbidden", 403);
  }

  const rawBody = await request.json().catch(() => null);
  const parsed = createSessionProspectSchema.safeParse(rawBody);
  if (!parsed.success) {
    return errorResponse("Données invalides.", 400);
  }

  try {
    const prospect = await createSessionProspect({
      ...parsed.data,
      createdByUserId: session.user.id,
    });
    return Response.json(prospect, { status: 201 });
  } catch (e) {
    const code = e instanceof Error ? e.message : "UNKNOWN";
    const message = ERROR_MESSAGES[code] ?? "Impossible d'ajouter le prospect.";
    const status = code === "FULL" ? 409 : code === "PLANNING_NOT_FOUND" ? 404 : 400;
    return errorResponse(message, status);
  }
}
