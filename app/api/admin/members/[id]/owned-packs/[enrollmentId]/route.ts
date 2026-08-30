import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/auth";
import { isStaffRole } from "@/lib/admin/access";
import {
  changeMemberPackEnrollmentAndList,
  changeMemberPackEnrollmentErrorMessage,
} from "@/lib/admin/change-member-pack-enrollment";
import { PACK_PAYMENT_METHODS } from "@/lib/pack-payment-method";

function errorResponse(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

type Params = { params: Promise<{ id: string; enrollmentId: string }> };

const bodySchema = z.object({
  packId: z.string().trim().cuid(),
  additionalSessions: z.number().int().min(0).max(999).optional(),
  paymentMethod: z.enum(PACK_PAYMENT_METHODS).nullable().optional(),
  personalDiscount: z
    .union([
      z.object({
        type: z.enum(["PERCENT", "AMOUNT"]),
        value: z.number().int().positive(),
        reason: z.string().trim().max(160).optional(),
      }),
      z.null(),
    ])
    .optional(),
});

export async function PATCH(request: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return errorResponse("Unauthorized", 401);
  if (!isStaffRole(session.user.role)) return errorResponse("Forbidden", 403);

  const { id: memberId, enrollmentId } = await params;
  const raw = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) return errorResponse("Données invalides", 400);

  try {
    const items = await changeMemberPackEnrollmentAndList({
      memberId,
      enrollmentId,
      packId: parsed.data.packId,
      additionalSessions: parsed.data.additionalSessions,
      paymentMethod: parsed.data.paymentMethod,
      personalDiscount: parsed.data.personalDiscount,
    });
    return Response.json({ ok: true, items });
  } catch (e) {
    const code = e instanceof Error ? e.message : "UNKNOWN";
    const status = code === "NOT_FOUND" || code === "PACK_NOT_FOUND" ? 404 : code === "INVALID_ADDITIONAL_SESSIONS" ? 400 : 409;
    return errorResponse(changeMemberPackEnrollmentErrorMessage(code), status);
  }
}
