import {
  cancelMemberReservation,
  cancelMemberReservationErrorMessage,
} from "@/lib/cancel-member-reservation";
import { getMemberPackSummary } from "@/lib/member/member-pack-summary";
import { broadcastMemberBookingRefresh } from "@/lib/member-booking-stream";
import { requireMemberSession } from "@/lib/require-member";

type Params = {
  params: Promise<{ id: string }>;
};

function errorResponse(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

export async function DELETE(_request: Request, { params }: Params) {
  const guard = await requireMemberSession();
  if ("error" in guard) return guard.error;

  const { member } = guard;
  const { id } = await params;

  const result = await cancelMemberReservation({
    reservationId: id,
    memberId: member.id,
    asAdmin: false,
  });

  if (!result.ok) {
    const status =
      result.code === "NOT_FOUND" ? 404 : result.code === "ATTENDED" ? 409 : 409;
    return errorResponse(cancelMemberReservationErrorMessage(result.code), status);
  }

  broadcastMemberBookingRefresh();

  const packSummary = await getMemberPackSummary(member.id);

  return Response.json({
    ok: true,
    refundable: result.refundable,
    waitlistCancellation: result.waitlistCancellation ?? false,
    packSummary,
  });
}
