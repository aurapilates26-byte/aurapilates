import { completeAdminMemberDepositById } from "../../router/handlers";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const { id } = await params;
  try {
    return await completeAdminMemberDepositById(id, request);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    if (message === "MEMBER_NOT_FOUND") {
      return Response.json({ error: "Adhérent introuvable" }, { status: 404 });
    }
    if (message === "NOT_DEPOSIT_PENDING") {
      return Response.json({ error: "Cet adhérent n'est pas en attente d'acompte." }, { status: 409 });
    }
    if (message === "QR_NOT_FOUND") {
      return Response.json({ error: "QR code introuvable" }, { status: 404 });
    }
    if (message === "QR_ALREADY_ASSIGNED") {
      return Response.json({ error: "Ce QR code est déjà assigné." }, { status: 409 });
    }
    return Response.json({ error: "Finalisation impossible." }, { status: 400 });
  }
}
