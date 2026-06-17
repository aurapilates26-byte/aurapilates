import { promotionsConflict, type PackPromotionRecord } from "@/lib/pack-pricing";
import { prisma } from "@/lib/prisma";

export const promotionInclude = {
  targetPacks: {
    select: {
      packId: true,
      pack: { select: { id: true, name: true } },
    },
  },
} as const;

export type PromotionWithTargets = {
  id: string;
  label: string | null;
  appliesToAll: boolean;
  discountType: "PERCENT";
  discountValue: number;
  startsAt: Date;
  endsAt: Date;
  isActive: boolean;
  targetPacks: { packId: string; pack: { id: string; name: string } }[];
};

export function toPromotionRecord(row: PromotionWithTargets): PackPromotionRecord {
  return {
    id: row.id,
    label: row.label,
    appliesToAll: row.appliesToAll,
    packIds: row.targetPacks.map((t) => t.packId),
    discountType: row.discountType,
    discountValue: row.discountValue,
    startsAt: row.startsAt,
    endsAt: row.endsAt,
    isActive: row.isActive,
  };
}

export function formatPromotionScopeLabel(row: PromotionWithTargets): string {
  if (row.appliesToAll) return "Tous les packs";
  const names = row.targetPacks.map((t) => t.pack.name);
  if (names.length === 0) return "—";
  if (names.length <= 3) return names.join(", ");
  return `${names.slice(0, 3).join(", ")} (+${names.length - 3})`;
}

export type PromotionScopeInput = {
  appliesToAllPacks: boolean;
  packIds: string[];
};

export function parsePromotionScopeInput(input: PromotionScopeInput): { ok: true; packIds: string[] } | { ok: false; error: string } {
  const uniqueIds = [...new Set(input.packIds.filter(Boolean))];
  if (input.appliesToAllPacks) {
    if (uniqueIds.length > 0) {
      return { ok: false, error: "Retirez la sélection de packs ou décochez « Tous les packs »." };
    }
    return { ok: true, packIds: [] };
  }
  if (uniqueIds.length === 0) {
    return { ok: false, error: "Sélectionnez au moins un pack." };
  }
  return { ok: true, packIds: uniqueIds };
}

export async function assertPromotionScopeValid(packIds: string[]): Promise<string | null> {
  if (packIds.length === 0) return null;
  const found = await prisma.pack.findMany({
    where: { id: { in: packIds } },
    select: { id: true },
  });
  if (found.length !== packIds.length) return "Un ou plusieurs packs sélectionnés sont introuvables.";
  return null;
}

export async function assertNoPromotionConflict(input: {
  appliesToAll: boolean;
  packIds: string[];
  startsAt: Date;
  endsAt: Date;
  isActive: boolean;
  excludeId?: string;
}): Promise<string | null> {
  if (!input.isActive) return null;

  const existing = await prisma.packPromotion.findMany({
    where: {
      isActive: true,
      ...(input.excludeId ? { id: { not: input.excludeId } } : {}),
    },
    include: promotionInclude,
  });

  const candidate: PackPromotionRecord = {
    id: input.excludeId ?? "new",
    label: null,
    appliesToAll: input.appliesToAll,
    packIds: input.packIds,
    discountType: "PERCENT",
    discountValue: 0,
    startsAt: input.startsAt,
    endsAt: input.endsAt,
    isActive: true,
  };

  const conflict = existing.find((row) =>
    promotionsConflict(candidate, toPromotionRecord(row)),
  );

  if (conflict) {
    return "Une autre remise active couvre déjà un de ces packs sur cette période.";
  }
  return null;
}
