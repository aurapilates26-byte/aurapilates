import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { isStaffRole } from "@/lib/admin/access";
import { precomputePackPayment } from "@/lib/admin/pack-payment";

type Params = { params: Promise<{ id: string }> };

function errorResponse(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

export async function GET(_request: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return errorResponse("Unauthorized", 401);
  if (!isStaffRole(session.user.role)) return errorResponse("Forbidden", 403);

  const { id } = await params;
  const precomputed = await precomputePackPayment(id);
  if (!precomputed) return errorResponse("Pack introuvable ou sans prix", 404);

  return Response.json({
    listPriceDinars: precomputed.resolved.listPriceDinars,
    amountDinars: precomputed.resolved.amountDinars,
    promotionId: precomputed.resolved.promotionId,
  });
}
