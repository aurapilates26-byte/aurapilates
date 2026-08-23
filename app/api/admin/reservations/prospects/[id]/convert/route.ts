import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { isStaffRole } from "@/lib/admin/access";
import {
  convertSessionProspectSchema,
  convertSessionProspectToMember,
} from "@/lib/admin/session-prospect";

function errorResponse(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

const ERROR_MESSAGES: Record<string, string> = {
  PROSPECT_NOT_FOUND: "Prospect introuvable.",
  PROSPECT_NOT_ACTIVE: "Ce prospect a déjà été converti ou clôturé.",
  EMAIL_ALREADY_USED: "Cet e-mail est déjà utilisé.",
  PACK_NOT_FOUND: "Pack introuvable.",
  PACK_INACTIVE: "Ce pack est inactif.",
  PACK_NO_PRICE: "Ce pack n'a pas de prix catalogue.",
  QR_NOT_FOUND: "QR code introuvable.",
  QR_ALREADY_ASSIGNED: "Ce QR code est déjà assigné.",
  DEPOSIT_REQUIRED: "Indiquez le montant de l'acompte.",
  DEPOSIT_TOO_HIGH: "L'acompte doit être inférieur au montant total du pack.",
};

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !isStaffRole(session.user.role)) {
    return errorResponse("Forbidden", 403);
  }

  const { id } = await context.params;
  const rawBody = await request.json().catch(() => null);
  const parsed = convertSessionProspectSchema.safeParse(rawBody);
  if (!parsed.success) {
    return errorResponse("Données invalides.", 400);
  }

  try {
    const result = await convertSessionProspectToMember({
      prospectId: id,
      adminUserId: session.user.id,
      body: parsed.data,
    });
    return Response.json(result);
  } catch (e) {
    const code = e instanceof Error ? e.message : "UNKNOWN";
    const message = ERROR_MESSAGES[code] ?? "Conversion impossible.";
    const status =
      code === "PROSPECT_NOT_FOUND" || code === "PACK_NOT_FOUND" || code === "QR_NOT_FOUND"
        ? 404
        : code === "PROSPECT_NOT_ACTIVE" || code === "EMAIL_ALREADY_USED" || code === "QR_ALREADY_ASSIGNED" || code === "PACK_INACTIVE"
          ? 409
          : 400;
    return errorResponse(message, status);
  }
}
