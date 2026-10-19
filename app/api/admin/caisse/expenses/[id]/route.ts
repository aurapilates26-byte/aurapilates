import { z } from "zod";
import {
  parseExpenseDateYmd,
  stopCashExpenseRecurrence,
  updateCashExpense,
} from "@/lib/admin/cash-expense";
import { errorResponse, requireSuperAdmin } from "@/lib/admin/pack-promotion-auth";

const updateSchema = z.object({
  kind: z.enum(["FIXED", "VARIABLE"]),
  label: z.string().trim().min(1).max(120),
  amountDinars: z.number().int().positive(),
  expenseDateYmd: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/),
  effectiveFromYmd: z.string().trim().regex(/^\d{4}-\d{2}-01$/),
  note: z.string().trim().max(500).optional(),
});

type Params = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: Request, { params }: Params) {
  const guard = await requireSuperAdmin();
  if ("error" in guard) return guard.error;

  const { id } = await params;
  const rawBody = await request.json().catch(() => null);
  const parsed = updateSchema.safeParse(rawBody);
  if (!parsed.success) {
    return errorResponse("Données invalides.", 400);
  }

  const expenseDate = parseExpenseDateYmd(parsed.data.expenseDateYmd);
  const effectiveFrom = parseExpenseDateYmd(parsed.data.effectiveFromYmd);
  if (!expenseDate || !effectiveFrom) {
    return errorResponse("Date invalide (AAAA-MM-JJ).", 400);
  }
  if (
    parsed.data.kind === "FIXED" &&
    parsed.data.expenseDateYmd.slice(0, 7) !== parsed.data.effectiveFromYmd.slice(0, 7)
  ) {
    return errorResponse("La date d’une charge fixe doit être dans le mois de modification.", 400);
  }

  const item = await updateCashExpense(id, {
    kind: parsed.data.kind,
    label: parsed.data.label,
    amountDinars: parsed.data.amountDinars,
    expenseDate,
    effectiveFrom,
    note: parsed.data.note ?? null,
    recordedByUserId: guard.session.user.id,
  });
  if (!item) return errorResponse("Charge introuvable.", 404);

  return Response.json({ item });
}

export async function DELETE(request: Request, { params }: Params) {
  const guard = await requireSuperAdmin();
  if ("error" in guard) return guard.error;

  const { id } = await params;
  const fromYmd = new URL(request.url).searchParams.get("fromYmd");
  const fromDate = fromYmd ? parseExpenseDateYmd(fromYmd) : null;
  if (!fromDate) return errorResponse("Mois de fin invalide (format AAAA-MM-JJ).", 400);

  const deleted = await stopCashExpenseRecurrence(id, fromDate);
  if (!deleted) return errorResponse("Charge introuvable.", 404);

  return Response.json({ ok: true });
}
