import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { isStaffRole } from "@/lib/admin/access";
import { prolongExpiredPackEnrollment } from "@/lib/admin/expired-pack-remaining-sessions";

function errorResponse(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

const ERROR_MESSAGES: Record<string, string> = {
  ENROLLMENT_NOT_FOUND: "Inscription pack introuvable.",
  PACK_NOT_ELIGIBLE: "Ce pack ne peut pas être prolongé (pas expiré ou plus de séances).",
};

type Params = { params: Promise<{ id: string; enrollmentId: string }> };

export async function POST(_request: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !isStaffRole(session.user.role)) {
    return errorResponse("Forbidden", 403);
  }

  const { id: memberId, enrollmentId } = await params;

  try {
    const result = await prolongExpiredPackEnrollment({ memberId, enrollmentId });
    return Response.json({ ok: true, ...result });
  } catch (e) {
    const code = e instanceof Error ? e.message : "UNKNOWN";
    const isStaleClient =
      e instanceof Error && e.message.includes("Unknown argument `prolongedAt`");
    const status = isStaleClient
      ? 503
      : code === "ENROLLMENT_NOT_FOUND"
        ? 404
        : code === "PACK_NOT_ELIGIBLE"
          ? 409
          : 400;
    const message = isStaleClient
      ? "Client base de données obsolète — redémarrez le serveur de dev puis réessayez."
      : (ERROR_MESSAGES[code] ?? "Prolongation impossible.");
    return errorResponse(message, status);
  }
}
