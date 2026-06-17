import type { PackDiscountType } from "@prisma/client";
import { formatYmdLocal, formatYmdPrismaDate, startOfLocalToday } from "@/lib/calendar-day";

export type PackPromotionRecord = {
  id: string;
  label: string | null;
  appliesToAll: boolean;
  packIds: string[];
  discountType: PackDiscountType;
  discountValue: number;
  startsAt: Date;
  endsAt: Date;
  isActive: boolean;
};

export type PackPromotionLifecycle = "disabled" | "upcoming" | "active" | "ended";

export type PackDisplayPricing = {
  originalPriceDinars: number | null;
  finalPriceDinars: number | null;
  hasDiscount: boolean;
  discountPercent: number | null;
  promotionId: string | null;
  promotionLabel: string | null;
  /** En cours ou à venir (aperçu admin). */
  promotionLifecycle?: PackPromotionLifecycle | null;
};

export function isoDateToLocalDayStart(iso: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const monthIndex = Number(match[2]) - 1;
  const day = Number(match[3]);
  if (!Number.isFinite(year) || monthIndex < 0 || monthIndex > 11 || day < 1 || day > 31) return null;
  return new Date(year, monthIndex, day);
}

export function dateToIsoDateLocal(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Inclusive calendar-day range (Prisma `@db.Date` + jour local « aujourd’hui »). */
export function isDateWithinPromotionRange(at: Date, startsAt: Date, endsAt: Date): boolean {
  const atYmd = formatYmdLocal(new Date(at.getFullYear(), at.getMonth(), at.getDate()));
  const startYmd = formatYmdPrismaDate(startsAt);
  const endYmd = formatYmdPrismaDate(endsAt);
  return atYmd >= startYmd && atYmd <= endYmd;
}

export function getPackPromotionLifecycle(
  promotion: Pick<PackPromotionRecord, "startsAt" | "endsAt" | "isActive">,
  at: Date = startOfLocalToday(),
): PackPromotionLifecycle {
  if (!promotion.isActive) return "disabled";
  if (!isDateWithinPromotionRange(at, promotion.startsAt, promotion.endsAt)) {
    const atYmd = formatYmdLocal(new Date(at.getFullYear(), at.getMonth(), at.getDate()));
    const startYmd = formatYmdPrismaDate(promotion.startsAt);
    return atYmd < startYmd ? "upcoming" : "ended";
  }
  return "active";
}

export function promotionLifecycleLabelFr(lifecycle: PackPromotionLifecycle): string {
  if (lifecycle === "active") return "En cours";
  if (lifecycle === "upcoming") return "À venir";
  if (lifecycle === "ended") return "Terminée";
  return "Désactivée";
}

function applyPercentDiscount(basePriceDinars: number, percent: number): number {
  const clamped = Math.min(100, Math.max(1, Math.round(percent)));
  return Math.max(0, Math.round(basePriceDinars * (1 - clamped / 100)));
}

export function promotionAppliesToPack(promotion: PackPromotionRecord, packId: string): boolean {
  if (promotion.appliesToAll) return true;
  return promotion.packIds.includes(packId);
}

export function findPackPromotionMatch(
  promotions: PackPromotionRecord[],
  packId: string,
  at: Date = startOfLocalToday(),
  options?: { includeUpcoming?: boolean },
): { promotion: PackPromotionRecord; lifecycle: "active" | "upcoming" } | null {
  const lifecycles: ("active" | "upcoming")[] = ["active"];
  if (options?.includeUpcoming) lifecycles.push("upcoming");

  for (const lifecycle of lifecycles) {
    const scoped = promotions.filter(
      (p) =>
        p.isActive &&
        promotionAppliesToPack(p, packId) &&
        getPackPromotionLifecycle(p, at) === lifecycle,
    );
    const packSpecific = scoped.find((p) => !p.appliesToAll);
    if (packSpecific) return { promotion: packSpecific, lifecycle };
    const globalPromo = scoped.find((p) => p.appliesToAll);
    if (globalPromo) return { promotion: globalPromo, lifecycle };
  }
  return null;
}

export function findApplicablePromotion(
  promotions: PackPromotionRecord[],
  packId: string,
  at: Date = startOfLocalToday(),
): PackPromotionRecord | null {
  return findPackPromotionMatch(promotions, packId, at)?.promotion ?? null;
}

export function resolvePackDisplayPrice(input: {
  basePriceDinars: number | null;
  promotions: PackPromotionRecord[];
  packId: string;
  at?: Date;
  /** Admin : afficher aussi les remises à venir comme aperçu. */
  includeUpcoming?: boolean;
}): PackDisplayPricing {
  const { basePriceDinars, promotions, packId, at = startOfLocalToday(), includeUpcoming } = input;
  const empty: PackDisplayPricing = {
    originalPriceDinars: basePriceDinars,
    finalPriceDinars: basePriceDinars,
    hasDiscount: false,
    discountPercent: null,
    promotionId: null,
    promotionLabel: null,
    promotionLifecycle: null,
  };

  if (basePriceDinars == null) return empty;

  const match = findPackPromotionMatch(promotions, packId, at, { includeUpcoming });
  if (!match || match.promotion.discountType !== "PERCENT") return empty;

  const finalPriceDinars = applyPercentDiscount(basePriceDinars, match.promotion.discountValue);
  if (finalPriceDinars >= basePriceDinars) return empty;

  return {
    originalPriceDinars: basePriceDinars,
    finalPriceDinars,
    hasDiscount: true,
    discountPercent: match.promotion.discountValue,
    promotionId: match.promotion.id,
    promotionLabel: match.promotion.label,
    promotionLifecycle: match.lifecycle,
  };
}

function dateRangesOverlap(aStart: string, aEnd: string, bStart: string, bEnd: string): boolean {
  return aStart <= bEnd && bStart <= aEnd;
}

/** True when two active promotions cannot coexist (overlapping dates + shared pack scope). */
export function promotionsConflict(a: PackPromotionRecord, b: PackPromotionRecord): boolean {
  if (!a.isActive || !b.isActive) return false;
  if (a.id === b.id) return false;

  const aStart = formatYmdPrismaDate(a.startsAt);
  const aEnd = formatYmdPrismaDate(a.endsAt);
  const bStart = formatYmdPrismaDate(b.startsAt);
  const bEnd = formatYmdPrismaDate(b.endsAt);
  if (!dateRangesOverlap(aStart, aEnd, bStart, bEnd)) return false;

  if (a.appliesToAll || b.appliesToAll) return true;

  return a.packIds.some((id) => b.packIds.includes(id));
}

export function formatPromotionPeriodFr(startsAt: Date, endsAt: Date): string {
  const fmt = (d: Date) =>
    d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
  return `${fmt(startsAt)} → ${fmt(endsAt)}`;
}
