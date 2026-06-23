import { generateCoachQrCode } from "@/lib/admin/coach-qrcode-server";
import { errorResponse, requireStaff } from "@/lib/admin/pack-promotion-auth";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const guard = await requireStaff();
  if ("error" in guard) return guard.error;

  const { id } = await params;

  try {
    const qrCode = await generateCoachQrCode({
      coachId: id,
      createdByUserId: guard.session.user.id,
      request,
    });
    return Response.json({ qrCode }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur";
    if (message === "COACH_NOT_FOUND") return errorResponse("Coach introuvable", 404);
    if (message === "COACH_PHONE_REQUIRED") {
      return errorResponse("Un numéro de téléphone est requis avant de générer le QR code coach.", 400);
    }
    return errorResponse("Impossible de générer le QR code coach.", 400);
  }
}
