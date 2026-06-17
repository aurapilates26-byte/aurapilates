import { z } from "zod";
import { serializePackPromotion } from "@/lib/admin/pack-promotion-serialize";
import {
  assertNoPromotionConflict,
  assertPromotionScopeValid,
  parsePromotionScopeInput,
  promotionInclude,
} from "@/lib/admin/pack-promotion-scope";
import { errorResponse, requireAdmin } from "@/lib/admin/pack-promotion-auth";
import { parseYmdToPrismaDate } from "@/lib/calendar-day";
import { prisma } from "@/lib/prisma";
import { revalidatePublicPacks } from "@/lib/revalidate-public-packs";

const updatePromotionSchema = z.object({
  label: z.string().trim().max(120).optional(),
  appliesToAllPacks: z.boolean(),
  packIds: z.array(z.string().trim().cuid()).default([]),
  discountPercent: z.number().int().min(1).max(100),
  startsAt: z.string().trim(),
  endsAt: z.string().trim(),
  isActive: z.boolean().optional(),
});

type Params = {
  params: Promise<{ id: string }>;
};

function parsePromotionDates(startsAt: string, endsAt: string) {
  const start = parseYmdToPrismaDate(startsAt);
  const end = parseYmdToPrismaDate(endsAt);
  if (!start || !end) return { ok: false as const, error: "Dates invalides (format AAAA-MM-JJ)." };
  if (end.getTime() < start.getTime()) {
    return { ok: false as const, error: "La date de fin doit être après la date de début." };
  }
  return { ok: true as const, startsAt: start, endsAt: end };
}

export async function PUT(request: Request, { params }: Params) {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;

  const { id } = await params;
  const raw = await request.json().catch(() => null);
  const parsed = updatePromotionSchema.safeParse(raw);
  if (!parsed.success) return errorResponse("Données invalides.", 400);

  const data = parsed.data;
  const scope = parsePromotionScopeInput({
    appliesToAllPacks: data.appliesToAllPacks,
    packIds: data.packIds,
  });
  if (!scope.ok) return errorResponse(scope.error, 400);

  const dates = parsePromotionDates(data.startsAt, data.endsAt);
  if (!dates.ok) return errorResponse(dates.error, 400);

  const packError = await assertPromotionScopeValid(scope.packIds);
  if (packError) return errorResponse(packError, 404);

  const isActive = data.isActive ?? true;
  const conflictMessage = await assertNoPromotionConflict({
    appliesToAll: data.appliesToAllPacks,
    packIds: scope.packIds,
    startsAt: dates.startsAt,
    endsAt: dates.endsAt,
    isActive,
    excludeId: id,
  });
  if (conflictMessage) return errorResponse(conflictMessage, 409);

  try {
    const updated = await prisma.$transaction(async (tx) => {
      await tx.packPromotionPack.deleteMany({ where: { promotionId: id } });
      return tx.packPromotion.update({
        where: { id },
        data: {
          label: data.label?.trim() || null,
          appliesToAll: data.appliesToAllPacks,
          discountType: "PERCENT",
          discountValue: data.discountPercent,
          startsAt: dates.startsAt,
          endsAt: dates.endsAt,
          isActive,
          targetPacks:
            scope.packIds.length > 0
              ? {
                  create: scope.packIds.map((packId) => ({ packId })),
                }
              : undefined,
        },
        include: promotionInclude,
      });
    });
    revalidatePublicPacks();
    return Response.json({ item: serializePackPromotion(updated) });
  } catch {
    return errorResponse("Remise introuvable.", 404);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;

  const { id } = await params;
  try {
    await prisma.packPromotion.delete({ where: { id } });
    revalidatePublicPacks();
    return Response.json({ ok: true });
  } catch {
    return errorResponse("Remise introuvable.", 404);
  }
}
