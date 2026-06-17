import type { PackDisplayPricing, PackPromotionLifecycle } from "@/lib/pack-pricing";
import { promotionLifecycleLabelFr } from "@/lib/pack-pricing";
import { formatPackPriceDt } from "@/lib/public-pack-display";

type PackPriceDisplayProps = {
  pricing: PackDisplayPricing;
  size?: "sm" | "md";
  className?: string;
  /** Masquer le badge « À venir » (ex. colonne Remise du tableau). */
  showLifecycleBadge?: boolean;
  /** Masquer le badge pourcentage (ex. colonne Remise du tableau). */
  showPercentBadge?: boolean;
};

function promotionLifecycleBadgeClass(lifecycle: PackPromotionLifecycle): string {
  if (lifecycle === "active") return "border-emerald-200 bg-emerald-50 text-emerald-900";
  if (lifecycle === "upcoming") return "border-sky-200 bg-sky-50 text-sky-900";
  if (lifecycle === "ended") return "border-zinc-200 bg-zinc-50 text-zinc-700";
  return "border-amber-200 bg-amber-50 text-amber-900";
}

export function PackPromotionPercentCell({ pricing }: { pricing: PackDisplayPricing }) {
  if (!pricing.hasDiscount || pricing.discountPercent == null) {
    return <span className="text-sm text-brand-dark/45">—</span>;
  }

  return (
    <span className="text-xs font-semibold tabular-nums text-brand-dark/80">
      −{pricing.discountPercent} %
    </span>
  );
}

export function PackPromotionEtatCell({ pricing }: { pricing: PackDisplayPricing }) {
  if (!pricing.hasDiscount || pricing.promotionLifecycle == null) {
    return <span className="text-sm text-brand-dark/45">—</span>;
  }

  const lifecycle = pricing.promotionLifecycle;

  return (
    <span
      className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold ${promotionLifecycleBadgeClass(lifecycle)}`}
    >
      {promotionLifecycleLabelFr(lifecycle)}
    </span>
  );
}

export function PackPromotionRemiseCell({ pricing }: { pricing: PackDisplayPricing }) {
  if (!pricing.hasDiscount || pricing.promotionLifecycle == null) {
    return <span className="text-sm text-brand-dark/45">—</span>;
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <PackPromotionPercentCell pricing={pricing} />
      <PackPromotionEtatCell pricing={pricing} />
    </div>
  );
}

export function PackPriceDisplay({
  pricing,
  size = "md",
  className = "",
  showLifecycleBadge = true,
  showPercentBadge = true,
}: PackPriceDisplayProps) {
  const textClass = size === "sm" ? "text-xs" : "text-sm";
  const priceClass = size === "sm" ? "text-sm font-semibold" : "text-sm font-semibold";

  if (pricing.originalPriceDinars == null) {
    return <span className={`text-brand-dark/60 ${textClass} ${className}`.trim()}>—</span>;
  }

  if (!pricing.hasDiscount || pricing.finalPriceDinars == null) {
    return (
      <span className={`tabular-nums text-brand-dark/80 ${priceClass} ${className}`.trim()}>
        {formatPackPriceDt(pricing.originalPriceDinars)}
      </span>
    );
  }

  const isUpcoming = pricing.promotionLifecycle === "upcoming";
  const percentBadgeClass = isUpcoming
    ? "border-sky-200 bg-sky-50 text-sky-900"
    : "border-emerald-200 bg-emerald-50 text-emerald-900";

  return (
    <div className={`flex min-w-0 flex-col gap-1 ${className}`.trim()}>
      <div className={`flex flex-wrap items-center gap-2 ${isUpcoming ? "opacity-90" : ""}`}>
        <span className={`tabular-nums text-brand-dark/45 line-through ${textClass}`}>
          {formatPackPriceDt(pricing.originalPriceDinars)}
        </span>
        <span className={`tabular-nums text-brand-dark ${priceClass}`}>
          {formatPackPriceDt(pricing.finalPriceDinars)}
        </span>
        {showPercentBadge && pricing.discountPercent != null ? (
          <span
            className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold ${percentBadgeClass}`}
          >
            −{pricing.discountPercent} %
          </span>
        ) : null}
      </div>
      {showLifecycleBadge && isUpcoming ? (
        <span className="inline-flex w-fit rounded-full border border-sky-200/80 bg-sky-50/80 px-2 py-0.5 text-[10px] font-semibold text-sky-900">
          {promotionLifecycleLabelFr("upcoming")}
        </span>
      ) : null}
    </div>
  );
}
