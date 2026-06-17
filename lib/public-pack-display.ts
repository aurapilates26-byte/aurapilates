import type { PackDisplayPricing } from "@/lib/pack-pricing";

/**
 * Packs page publique : prix affiché tel qu’en base (entier en dinars, colonne `priceCents`).
 */

export function formatPackPriceDt(priceCents: number | null): string | null {
  if (priceCents == null) return null;
  return `${priceCents} DT`;
}

export function formatPackPricingDisplay(pricing: PackDisplayPricing): {
  priceDisplay: string | null;
  originalPriceDisplay: string | null;
  hasDiscount: boolean;
  discountPercent: number | null;
} {
  const final = pricing.finalPriceDinars;
  const original = pricing.originalPriceDinars;
  return {
    priceDisplay: final != null ? formatPackPriceDt(final) : null,
    originalPriceDisplay: original != null ? formatPackPriceDt(original) : null,
    hasDiscount: pricing.hasDiscount,
    discountPercent: pricing.discountPercent,
  };
}

/** Affiche la durée telle qu’en base (ex. « 50 jours », « 12 mois »). */
export function formatPackDurationDisplay(value: string | null): string | null {
  if (value == null || String(value).trim() === "") return null;
  return String(value).trim();
}

export function computePackSessionsDisplay(p: {
  sessionCount: number | null;
  courseQuotas: { courseSlug: string; sessionCount: number }[];
}): number | null {
  if (p.sessionCount != null) return p.sessionCount;
  if (p.courseQuotas.length === 0) return null;
  const sum = p.courseQuotas.reduce((s, q) => s + q.sessionCount, 0);
  return sum > 0 ? sum : null;
}
