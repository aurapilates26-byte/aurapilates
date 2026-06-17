import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { isStaffRole } from "@/lib/admin/access";
import {
  cancelMemberReservation,
  cancelMemberReservationErrorMessage,
} from "@/lib/cancel-member-reservation";

function errorResponse(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return errorResponse("Unauthorized", 401);
  if (!isStaffRole(session.user.role)) return errorResponse("Forbidden", 403);
  return null;
}

type Params = { params: Promise<{ id: string; reservationId: string }> };

export async function DELETE(_request: Request, { params }: Params) {
  const guard = await requireAdmin();
  if (guard) return guard;

  const { id: memberId, reservationId } = await params;

  const result = await cancelMemberReservation({
    reservationId,
    memberId,
    asAdmin: true,
  });

  if (!result.ok) {
    const status =
      result.code === "NOT_FOUND" ? 404 : result.code === "ATTENDED" ? 409 : 409;
    return errorResponse(cancelMemberReservationErrorMessage(result.code), status);
  }

  return Response.json({ ok: true, refundable: result.refundable });
}
