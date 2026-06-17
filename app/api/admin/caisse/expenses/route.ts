import { z } from "zod";
import { createCashExpense, parseExpenseDateYmd } from "@/lib/admin/cash-expense";
import { errorResponse, requireSuperAdmin } from "@/lib/admin/pack-promotion-auth";

const createSchema = z.object({
  kind: z.enum(["FIXED", "VARIABLE"]),
  label: z.string().trim().min(1).max(120),
  amountDinars: z.number().int().positive(),
  expenseDateYmd: z.string().trim().optional(),
  note: z.string().trim().max(500).optional(),
});

export async function POST(request: Request) {
  const guard = await requireSuperAdmin();
  if ("error" in guard) return guard.error;

  const rawBody = await request.json().catch(() => null);
  const parsed = createSchema.safeParse(rawBody);
  if (!parsed.success) {
    return errorResponse("Données invalides.", 400);
  }

  const expenseDate = parsed.data.expenseDateYmd ? parseExpenseDateYmd(parsed.data.expenseDateYmd) : null;
  if (parsed.data.expenseDateYmd && !expenseDate) {
    return errorResponse("Date invalide (AAAA-MM-JJ).", 400);
  }

  try {
    const item = await createCashExpense({
      kind: parsed.data.kind,
      label: parsed.data.label,
      amountDinars: parsed.data.amountDinars,
      expenseDate: expenseDate ?? undefined,
      note: parsed.data.note ?? null,
      recordedByUserId: guard.session.user.id,
    });
    return Response.json({ item }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inattendue";
    return errorResponse(message, 400);
  }
}
