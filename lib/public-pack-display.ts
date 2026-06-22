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

export function resolvePackSessionCount(p: {
  sessionCount?: number | null;
  courseQuotas?: { courseSlug: string; sessionCount: number }[];
}): number | null {
  if (Array.isArray(p.courseQuotas) && p.courseQuotas.length > 0) {
    const sum = p.courseQuotas.reduce((s, q) => s + q.sessionCount, 0);
    return sum > 0 ? sum : null;
  }
  if (p.sessionCount != null) return p.sessionCount;
  return null;
}

export function computePackSessionsDisplay(p: {
  sessionCount: number | null;
  courseQuotas: { courseSlug: string; sessionCount: number }[];
}): number | null {
  return resolvePackSessionCount(p);
}

export type PackSelectItem = {
  name: string;
  isActive?: boolean;
  sessionCount?: number | null;
  courseQuotas?: { courseSlug: string; sessionCount: number }[];
};

export function formatPackSelectOptionLabel(pack: PackSelectItem): string {
  const count = resolvePackSessionCount(pack);
  const inactiveSuffix = pack.isActive === false ? " (inactive)" : "";
  if (count === null) return `${pack.name}${inactiveSuffix}`;
  const seanceWord = count === 1 ? "séance" : "séances";
  return `${pack.name} (${count} ${seanceWord})${inactiveSuffix}`;
}

export function comparePacksBySessionAsc<T extends PackSelectItem>(a: T, b: T): number {
  const sa = resolvePackSessionCount(a);
  const sb = resolvePackSessionCount(b);
  if (sa === null && sb === null) return a.name.localeCompare(b.name, "fr");
  if (sa === null) return 1;
  if (sb === null) return -1;
  if (sa !== sb) return sa - sb;
  return a.name.localeCompare(b.name, "fr");
}

export function sortPacksBySessionAsc<T extends PackSelectItem>(packs: T[]): T[] {
  return [...packs].sort(comparePacksBySessionAsc);
}
