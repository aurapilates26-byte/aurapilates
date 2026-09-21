import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/auth";
import { isStaffRole } from "@/lib/admin/access";
import {
  getPackHistoryWhatsAppPayload,
  packHistoryWhatsAppErrorMessage,
} from "@/lib/admin/member-pack-history-whatsapp";

function errorResponse(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

type Params = { params: Promise<{ id: string; enrollmentId: string }> };

const idsSchema = z.object({
  id: z.string().trim().cuid(),
  enrollmentId: z.string().trim().cuid(),
});

/** Lecture seule : historique WhatsApp d'un pack (onglet Packs fiche adhérente). */
export async function GET(_request: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !isStaffRole(session.user.role)) {
    return errorResponse("Accès refusé", 403);
  }

  const raw = await params;
  const parsed = idsSchema.safeParse(raw);
  if (!parsed.success) {
    return errorResponse("Données invalides", 400);
  }

  const result = await getPackHistoryWhatsAppPayload({
    memberId: parsed.data.id,
    enrollmentId: parsed.data.enrollmentId,
  });

  if (!result.ok) {
    const status =
      result.code === "MEMBER_NOT_FOUND" || result.code === "PACK_NOT_FOUND" ? 404 : 422;
    return errorResponse(packHistoryWhatsAppErrorMessage(result.code), status);
  }

  return Response.json({ ok: true, ...result.value });
}
