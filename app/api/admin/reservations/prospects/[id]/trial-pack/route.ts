import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { isStaffRole } from "@/lib/admin/access";
import { resolveProspectTrialPack } from "@/lib/admin/prospect-trial-pack";
import { prisma } from "@/lib/prisma";

function errorResponse(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

const ERROR_MESSAGES: Record<string, string> = {
  PROSPECT_NOT_FOUND: "Prospect introuvable.",
  TRIAL_PACK_NOT_CONFIGURED: "Aucun pack à l'unité n'est configuré pour ce cours.",
  TRIAL_PACK_NOT_FOUND: "Le pack séance à l'unité est introuvable ou inactif.",
};

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !isStaffRole(session.user.role)) {
    return errorResponse("Forbidden", 403);
  }

  const { id } = await context.params;
  const prospect = await prisma.sessionProspect.findUnique({
    where: { id },
    select: { id: true, courseSlug: true, status: true, trialPaidAt: true },
  });
  if (!prospect) return errorResponse("Prospect introuvable.", 404);
  if (prospect.status === "CONVERTED") {
    return errorResponse("Ce prospect a déjà été converti en adhérente.", 409);
  }
  if (prospect.trialPaidAt) {
    return errorResponse("La séance d'essai a déjà été encaissée.", 409);
  }

  try {
    const pack = await resolveProspectTrialPack(prospect.courseSlug);
    return Response.json({ pack });
  } catch (e) {
    const code = e instanceof Error ? e.message : "UNKNOWN";
    const message = ERROR_MESSAGES[code] ?? "Chargement du pack impossible.";
    const status = code === "TRIAL_PACK_NOT_CONFIGURED" || code === "TRIAL_PACK_NOT_FOUND" ? 404 : 400;
    return errorResponse(message, status);
  }
}
