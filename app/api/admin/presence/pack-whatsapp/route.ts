import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/auth";
import { isStaffRole } from "@/lib/admin/access";
import {
  getPresencePackWhatsAppPayload,
  presencePackWhatsAppErrorMessage,
} from "@/lib/admin/presence-pack-whatsapp";

function errorResponse(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

const querySchema = z.object({
  reservationId: z.string().trim().cuid(),
});

/** Lecture seule : confirmation WhatsApp après présence (sans historique complet). */
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !isStaffRole(session.user.role)) {
    return errorResponse("Accès refusé", 403);
  }

  const url = new URL(request.url);
  const parsed = querySchema.safeParse({
    reservationId: url.searchParams.get("reservationId") ?? "",
  });
  if (!parsed.success) {
    return errorResponse("Données invalides", 400);
  }

  const result = await getPresencePackWhatsAppPayload(parsed.data.reservationId);
  if (!result.ok) {
    const status =
      result.code === "NOT_FOUND"
        ? 404
        : result.code === "NOT_ATTENDED"
          ? 409
          : 422;
    return errorResponse(presencePackWhatsAppErrorMessage(result.code), status);
  }

  return Response.json({ ok: true, ...result.value });
}
