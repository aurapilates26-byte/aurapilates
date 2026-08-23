"use client";

import type { ProspectTrialPackDto } from "@/types/admin/prospect-trial-pack";

type PackSummaryCardProps = {
  pack: Pick<
    ProspectTrialPackDto,
    | "name"
    | "listPriceDinars"
    | "priceDisplay"
    | "originalPriceDisplay"
    | "hasPromotion"
    | "promotionLabel"
    | "sessionLabel"
    | "courseLabel"
    | "durationDisplay"
    | "features"
  >;
  /** Séance d'essai du prospect (ex. Mat pilates du créneau). */
  trialSessionLabel?: string;
  compact?: boolean;
};

function formatPackPrice(listPriceDinars: number | null | undefined, priceDisplay: string | null): string {
  if (listPriceDinars != null) return `${listPriceDinars} DT`;
  if (!priceDisplay) return "—";
  return priceDisplay.includes("DT") ? priceDisplay : `${priceDisplay} DT`;
}

export function PackSummaryCard({ pack, trialSessionLabel, compact = false }: PackSummaryCardProps) {
  const sessionLine = trialSessionLabel ?? pack.sessionLabel;
  const durationSuffix = pack.durationDisplay ? ` · Valide ${pack.durationDisplay}` : "";
  const priceLabel = formatPackPrice(pack.listPriceDinars, pack.priceDisplay);

  if (compact) {
    return (
      <article className="rounded-xl border border-brand-medium/20 bg-zinc-50/50 px-3 py-2.5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-dark/45">
              Pack séance à l&apos;unité
            </p>
            <p className="text-sm font-semibold leading-snug text-brand-dark">{pack.name}</p>
            <p className="mt-0.5 text-xs text-brand-dark/65">
              {sessionLine}
              {durationSuffix}
            </p>
            {pack.hasPromotion && pack.promotionLabel ? (
              <p className="mt-0.5 text-[11px] font-medium text-emerald-800">Promo : {pack.promotionLabel}</p>
            ) : null}
          </div>
          <div className="shrink-0 pt-3 text-right">
            {pack.hasPromotion && pack.originalPriceDisplay ? (
              <p className="text-[11px] font-medium text-brand-dark/40 line-through">{pack.originalPriceDisplay}</p>
            ) : null}
            <p className="text-base font-bold tabular-nums text-brand-dark">{priceLabel}</p>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="relative overflow-hidden rounded-2xl border border-brand-medium/20 bg-gradient-to-b from-white to-zinc-50/80 p-5 shadow-sm sm:p-6">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-dark/55 via-brand-dark/20 to-transparent" />

      <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-dark/50">Pack séance à l&apos;unité</p>
      <h4 className="mt-1 text-xl font-semibold text-brand-dark">{pack.name}</h4>

      <p className="mt-2 text-sm text-brand-dark/70">
        {sessionLine}
        {durationSuffix}
      </p>

      {trialSessionLabel && trialSessionLabel !== pack.sessionLabel ? (
        <p className="mt-1 text-xs text-violet-900/80">
          Séance d&apos;essai : <span className="font-semibold">{pack.courseLabel}</span>
        </p>
      ) : null}

      <div className="mt-4">
        {pack.hasPromotion && pack.originalPriceDisplay ? (
          <p className="text-sm font-medium text-brand-dark/45 line-through">{pack.originalPriceDisplay}</p>
        ) : null}
        <p className="text-2xl font-bold tabular-nums text-brand-dark">{priceLabel}</p>
      </div>

      {pack.hasPromotion && pack.promotionLabel ? (
        <p className="mt-1 text-xs font-medium text-emerald-800">Promo : {pack.promotionLabel}</p>
      ) : null}

      {pack.features.length > 0 ? (
        <ul className="mt-4 space-y-1.5 border-t border-brand-dark/10 pt-4 text-xs text-brand-dark/75">
          {pack.features.slice(0, 4).map((feature) => (
            <li key={feature} className="flex gap-2">
              <span aria-hidden className="text-brand-dark/40">
                ·
              </span>
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}
