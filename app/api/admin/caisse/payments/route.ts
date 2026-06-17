import { z } from "zod";
import { PACK_PAYMENT_METHODS } from "@/lib/pack-payment-method";
import { createPackPayment, parsePaidAtYmd } from "@/lib/admin/pack-payment";
import { errorResponse, requireSuperAdmin } from "@/lib/admin/pack-promotion-auth";

const createSchema = z.object({
  memberId: z.string().trim().cuid(),
  packId: z.string().trim().cuid(),
  paidAtYmd: z.string().trim().optional(),
  amountDinars: z.number().int().nonnegative().optional(),
  note: z.string().trim().max(500).optional(),
  paymentMethod: z.enum(PACK_PAYMENT_METHODS),
  personalDiscount: z
    .object({
      type: z.enum(["PERCENT", "AMOUNT"]),
      value: z.number().int().positive(),
    })
    .optional(),
});

export async function POST(request: Request) {
  const guard = await requireSuperAdmin();
  if ("error" in guard) return guard.error;

  const rawBody = await request.json().catch(() => null);
  const parsed = createSchema.safeParse(rawBody);
  if (!parsed.success) {
    return errorResponse("Données invalides.", 400);
  }

  const paidAt = parsed.data.paidAtYmd ? parsePaidAtYmd(parsed.data.paidAtYmd) : null;
  if (parsed.data.paidAtYmd && !paidAt) {
    return errorResponse("Date de paiement invalide (AAAA-MM-JJ).", 400);
  }

  try {
    const item = await createPackPayment({
      memberId: parsed.data.memberId,
      packId: parsed.data.packId,
      paidAt: paidAt ?? undefined,
      source: "MANUAL",
      amountDinars: parsed.data.amountDinars,
      personalDiscount: parsed.data.personalDiscount ?? null,
      note: parsed.data.note ?? null,
      recordedByUserId: guard.session.user.id,
      paymentMethod: parsed.data.paymentMethod,
    });
    return Response.json({ item }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inattendue";
    return errorResponse(message, 400);
  }
}
