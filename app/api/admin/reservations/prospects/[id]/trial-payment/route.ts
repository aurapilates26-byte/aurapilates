import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { isStaffRole } from "@/lib/admin/access";
import {
  recordProspectTrialPaymentSchema,
  recordSessionProspectTrialPayment,
} from "@/lib/admin/session-prospect";

function errorResponse(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

const ERROR_MESSAGES: Record<string, string> = {
  PROSPECT_NOT_FOUND: "Prospect introuvable.",
  PROSPECT_ALREADY_CONVERTED: "Ce prospect a déjà été converti en adhérente.",
  TRIAL_ALREADY_PAID: "La séance d'essai a déjà été encaissée.",
  TRIAL_PACK_MISMATCH: "Le pack sélectionné ne correspond pas au cours du prospect.",
  PACK_NO_PRICE: "Ce pack n'a pas de prix catalogue.",
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
  const parsed = recordProspectTrialPaymentSchema.safeParse(rawBody);
  if (!parsed.success) {
    return errorResponse("Données invalides.", 400);
  }

  try {
    const payment = await recordSessionProspectTrialPayment({
      prospectId: id,
      packId: parsed.data.packId,
      paymentMethod: parsed.data.paymentMethod,
      personalDiscount: parsed.data.personalDiscount,
    });
    return Response.json(payment);
  } catch (e) {
    const code = e instanceof Error ? e.message : "UNKNOWN";
    const isStaleClient =
      e instanceof Error && e.message.includes("Unknown argument `trialPackId`");
    const message = isStaleClient
      ? "Client base de données obsolète — redémarrez le serveur de dev puis réessayez."
      : (ERROR_MESSAGES[code] ?? "Encaissement impossible.");
    const status = isStaleClient
      ? 503
      : code === "PROSPECT_NOT_FOUND"
        ? 404
        : code === "PROSPECT_ALREADY_CONVERTED" || code === "TRIAL_ALREADY_PAID"
          ? 409
          : 400;
    return errorResponse(message, status);
  }
}
