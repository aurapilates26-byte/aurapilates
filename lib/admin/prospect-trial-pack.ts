import "server-only";

import { courseLabel } from "@/lib/course-labels";
import { promotionInclude, toPromotionRecord } from "@/lib/admin/pack-promotion-scope";
import { precomputePackPayment } from "@/lib/admin/pack-payment";
import { computeExpectedPackAmountForCreate } from "@/lib/admin/member-deposit";
import type { PersonalDiscountInput } from "@/lib/admin/pack-payment";
import { resolvePackDisplayPrice } from "@/lib/pack-pricing";
import { formatPackDurationDisplay, formatPackPricingDisplay } from "@/lib/public-pack-display";
import { prisma } from "@/lib/prisma";
import { startOfLocalToday } from "@/lib/calendar-day";
import type { ProspectTrialPackDto } from "@/types/admin/prospect-trial-pack";

/** Pack 1 séance « à l'unité » par type de cours (catalogue admin). */
const TRIAL_PACK_NAME_BY_COURSE_SLUG: Record<string, string> = {
  "mat-pilates": "AURA UNIQUE MAT",
  "pilates-reformer": "AURA UNIQUE REFORMER",
  "coaching-prive": "AURA UNIQUE PRIVE",
};

export type { ProspectTrialPackDto };

export async function resolveProspectTrialPack(courseSlug: string): Promise<ProspectTrialPackDto> {
  const packName = TRIAL_PACK_NAME_BY_COURSE_SLUG[courseSlug];
  if (!packName) throw new Error("TRIAL_PACK_NOT_CONFIGURED");

  const pack = await prisma.pack.findFirst({
    where: { name: packName, sessionCount: 1, isActive: true },
    select: {
      id: true,
      name: true,
      category: true,
      sessionCount: true,
      priceCents: true,
      durationDays: true,
      features: { orderBy: { sortOrder: "asc" }, select: { label: true } },
    },
  });
  if (!pack || pack.priceCents == null) throw new Error("TRIAL_PACK_NOT_FOUND");

  const promotions = await prisma.packPromotion.findMany({
    where: { isActive: true },
    include: promotionInclude,
  });
  const promotionRecords = promotions.map(toPromotionRecord);
  const pricing = resolvePackDisplayPrice({
    basePriceDinars: pack.priceCents,
    promotions: promotionRecords,
    packId: pack.id,
  });
  const priceLabels = formatPackPricingDisplay(pricing);
  const label = courseLabel(courseSlug);

  return {
    id: pack.id,
    name: pack.name,
    category: pack.category,
    sessionCount: pack.sessionCount,
    durationDays: pack.durationDays,
    features: pack.features.map((f) => f.label),
    listPriceDinars: pricing.finalPriceDinars ?? pack.priceCents,
    priceDisplay: priceLabels.priceDisplay,
    originalPriceDisplay: priceLabels.originalPriceDisplay,
    hasPromotion: priceLabels.hasDiscount,
    promotionLabel: pricing.promotionLifecycle === "active" ? pricing.promotionLabel ?? null : null,
    durationDisplay: formatPackDurationDisplay(pack.durationDays),
    sessionLabel: `1× ${label}`,
    courseLabel: label,
  };
}

export async function computeProspectTrialPaymentAmount(input: {
  packId: string;
  personalDiscount: PersonalDiscountInput | null;
}): Promise<{ amountDinars: number; listPriceDinars: number; precomputed: NonNullable<Awaited<ReturnType<typeof precomputePackPayment>>> }> {
  const precomputed = await precomputePackPayment(input.packId, startOfLocalToday());
  if (!precomputed) throw new Error("PACK_NO_PRICE");
  const amountDinars = computeExpectedPackAmountForCreate(precomputed, input.personalDiscount);
  return {
    amountDinars,
    listPriceDinars: precomputed.resolved.amountDinars,
    precomputed,
  };
}
