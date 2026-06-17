import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { PublicPacksPricingClient } from "@/components/public/public-packs-pricing-client";
import { PACK_CATEGORIES } from "@/lib/pack-categories";
import { promotionInclude, toPromotionRecord } from "@/lib/admin/pack-promotion-scope";
import {
  resolvePackDisplayPrice,
  type PackPromotionLifecycle,
  type PackPromotionRecord,
} from "@/lib/pack-pricing";
import {
  computePackSessionsDisplay,
  formatPackDurationDisplay,
  formatPackPricingDisplay,
} from "@/lib/public-pack-display";

const packsInclude = {
  features: { orderBy: { sortOrder: "asc" as const }, select: { label: true } },
  courseQuotas: { select: { courseSlug: true, sessionCount: true } },
} satisfies Prisma.PackInclude;

type PackRow = Prisma.PackGetPayload<{ include: typeof packsInclude }>;

export type PublicPackCard = {
  id: string;
  category: string | null;
  name: string;
  sessionCount: number | null;
  priceCents: number | null;
  durationDays: string | null;
  features: string[];
  courseQuotas: { courseSlug: string; sessionCount: number }[];
  /** Précalculé côté serveur (hydration-safe). */
  priceDisplay: string | null;
  originalPriceDisplay: string | null;
  hasDiscount: boolean;
  discountPercent: number | null;
  promotionLifecycle: PackPromotionLifecycle | null;
  /** Promo planifiée (pas encore en cours) — affichée séparément du prix actuel. */
  upcomingPromoPercent: number | null;
  upcomingPromoPriceDisplay: string | null;
  durationDisplay: string | null;
  sessionsDisplay: number | null;
};

export async function PublicPacksPricing() {
  let packs: PackRow[] = [];
  let promotionRecords: PackPromotionRecord[] = [];

  try {
    const [packRows, promoRows] = await Promise.all([
      prisma.pack.findMany({
        where: { isActive: true },
        orderBy: [{ category: "asc" }, { createdAt: "asc" }],
        include: packsInclude,
      }),
      prisma.packPromotion.findMany({
        where: { isActive: true },
        include: promotionInclude,
      }),
    ]);
    packs = packRows;
    promotionRecords = promoRows.map(toPromotionRecord);
  } catch {
    packs = [];
    promotionRecords = [];
  }

  const cards: PublicPackCard[] = packs.map((p) => {
    const courseQuotas = p.courseQuotas;
    const pricing = resolvePackDisplayPrice({
      basePriceDinars: p.priceCents,
      promotions: promotionRecords,
      packId: p.id,
    });
    const promotionPreview = resolvePackDisplayPrice({
      basePriceDinars: p.priceCents,
      promotions: promotionRecords,
      packId: p.id,
      includeUpcoming: true,
    });
    const priceLabels = formatPackPricingDisplay(pricing);
    const isUpcomingOnly =
      promotionPreview.promotionLifecycle === "upcoming" && !pricing.hasDiscount;
    const previewLabels = isUpcomingOnly ? formatPackPricingDisplay(promotionPreview) : null;
    return {
      id: p.id,
      category: p.category,
      name: p.name,
      sessionCount: p.sessionCount,
      priceCents: p.priceCents,
      durationDays: p.durationDays,
      features: p.features.map((f) => f.label),
      courseQuotas,
      priceDisplay: priceLabels.priceDisplay,
      originalPriceDisplay: priceLabels.originalPriceDisplay,
      hasDiscount: priceLabels.hasDiscount,
      discountPercent: priceLabels.hasDiscount ? priceLabels.discountPercent : null,
      promotionLifecycle: pricing.promotionLifecycle ?? null,
      upcomingPromoPercent: isUpcomingOnly ? promotionPreview.discountPercent : null,
      upcomingPromoPriceDisplay: isUpcomingOnly ? previewLabels?.priceDisplay ?? null : null,
      durationDisplay: formatPackDurationDisplay(p.durationDays),
      sessionsDisplay: computePackSessionsDisplay({
        sessionCount: p.sessionCount,
        courseQuotas,
      }),
    };
  });

  return (
    <PublicPacksPricingClient
      packs={cards}
      canonicalCategories={PACK_CATEGORIES as readonly string[]}
    />
  );
}

