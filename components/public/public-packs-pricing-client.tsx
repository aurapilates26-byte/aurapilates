"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { publicFilterPillClass } from "@/lib/public-filter-pill";
import { publicPanelSurfaceClass } from "@/lib/public-panel-surface";
import { normalizePackCategory, packCategoryMenuLabel } from "@/lib/pack-categories";
import { promotionLifecycleLabelFr } from "@/lib/pack-pricing";
import { courseLabel } from "@/lib/course-labels";
import type { PublicPackCard } from "@/components/public/public-packs-pricing";

type Props = {
  packs: PublicPackCard[];
  canonicalCategories: readonly string[];
};

export function PublicPacksPricingClient({ packs, canonicalCategories }: Props) {
  const categories = useMemo(() => {
    const present = new Set<string>();
    for (const p of packs) {
      const c = p.category?.trim();
      if (c) present.add(normalizePackCategory(c));
    }
    const ordered = canonicalCategories.filter((c) => present.has(c));
    const extras = [...present].filter((c) => !canonicalCategories.includes(c)).sort((a, b) => a.localeCompare(b));
    return [...ordered, ...extras];
  }, [packs, canonicalCategories]);

  const [pickedCategory, setPickedCategory] = useState<string | null>(null);
  const selected = pickedCategory ?? categories[0] ?? "";

  const visible = useMemo(() => {
    if (categories.length === 0) return packs;
    return packs.filter((p) => normalizePackCategory((p.category ?? "").trim()) === selected);
  }, [packs, selected, categories.length]);

  if (packs.length === 0) {
    return (
      <div className={`rounded-2xl border border-brand-medium/20 p-6 text-sm text-brand-dark/70 shadow-sm ${publicPanelSurfaceClass}`}>
        Aucun pack n&apos;est disponible pour le moment. Le studio n&apos;a pas encore publié de tarifs.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {categories.length > 0 ? (
        <div
          className="flex flex-wrap items-center justify-center gap-2 px-1 pb-2"
          aria-label="Catégories de packs"
        >
          {categories.map((c) => {
            const active = selected === c;
            return (
              <button
                key={c}
                type="button"
                onClick={() => setPickedCategory(c)}
                className={`${publicFilterPillClass(active)} max-w-full min-w-0`}
              >
                {packCategoryMenuLabel(c).toUpperCase()}
              </button>
            );
          })}
        </div>
      ) : null}

      {visible.length === 0 ? (
        <div className={`rounded-2xl border border-brand-medium/20 p-6 text-sm text-brand-dark/70 shadow-sm ${publicPanelSurfaceClass}`}>
          Aucun pack dans cette catégorie.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-4 lg:gap-6">
          {visible.map((p, idx) => {
            const price = p.priceDisplay;
            const duration = p.durationDisplay;
            const sessions = p.sessionsDisplay;
            const promoPercent = p.discountPercent ?? p.upcomingPromoPercent;
            const isUpcomingPromo = p.upcomingPromoPercent != null;
            const isUpcomingOnly = isUpcomingPromo && !p.hasDiscount;
            const hasActiveDiscount = p.hasDiscount && p.originalPriceDisplay;

            const quotaLine =
              p.courseQuotas.length > 0
                ? p.courseQuotas
                    .slice()
                    .sort((a, b) => a.courseSlug.localeCompare(b.courseSlug))
                    .map((q) => `${q.sessionCount}× ${courseLabel(q.courseSlug)}`)
                    .join(" · ")
                : null;

            const priceShown = price ?? "—";
            const sessionsShown = sessions != null ? String(sessions) : "—";
            const durationShown = duration ?? "—";
            
            // Calculer prix par séance
            const pricePerSession = 
              p.priceCents != null && sessions != null && sessions > 0
                ? Math.round(p.priceCents / sessions)
                : null;
            const pricePerSessionText = pricePerSession != null ? `soit ${pricePerSession} DT / séance` : null;
            
            // Badge "La plus choisie" pour le 2e pack
            const showBestChoice = idx === 1 && visible.length > 1;
            
            // Description lisible: "5 séances, Valide 1 mois"
            const descriptionParts = [];
            if (sessions != null) descriptionParts.push(`${sessionsShown} séance${sessions > 1 ? 's' : ''}`);
            if (duration) descriptionParts.push(`Valide ${duration}`);
            const description = descriptionParts.join(", ");

            return (
              <article
                key={p.id}
                className={`group relative flex h-full w-full min-w-0 flex-col overflow-hidden rounded-2xl border border-brand-medium/20 p-5 sm:p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-medium/35 ${publicPanelSurfaceClass}`}
              >
                <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-dark/55 via-brand-dark/20 to-transparent" />

                {/* Badge "La plus choisie" */}
                {showBestChoice && (
                  <div className="mb-4 inline-flex w-fit rounded-full border border-amber-300/60 bg-amber-50 px-3 py-1">
                    <span className="text-xs font-semibold text-amber-900">La plus choisie</span>
                  </div>
                )}

                {/* Titre */}
                <h3 className="text-[1.75rem] font-semibold leading-tight text-brand-dark">
                  {p.name}
                </h3>

                {/* Description (sessions + durée) */}
                {description && (
                  <p className="mt-2 text-sm text-brand-dark/70">
                    {description}
                  </p>
                )}

                {/* Prix principal - très visible */}
                <div className="mt-5 flex items-end gap-2">
                  <span className="text-[2.65rem] font-bold leading-none text-brand-dark">
                    {hasActiveDiscount ? (
                      <>
                        <span className="mr-2 text-base font-medium text-brand-dark/45 line-through">
                          {p.originalPriceDisplay}
                        </span>
                        {priceShown}
                      </>
                    ) : (
                      priceShown
                    )}
                  </span>
                  <span className="pb-1 text-xs font-semibold tracking-wide text-brand-dark/70">DT</span>
                </div>

                {/* Prix par séance */}
                {pricePerSessionText && (
                  <p className="mt-1 text-xs text-brand-dark/60">
                    {pricePerSessionText}
                  </p>
                )}

                {/* Bouton */}
                <Link
                  href="/inscription"
                  className={`mt-6 inline-flex w-full shrink-0 items-center justify-center rounded-full border-2 ${
                    showBestChoice
                      ? "border-brand-dark bg-brand-dark text-white hover:bg-brand-dark/90"
                      : "border-brand-dark text-brand-dark hover:bg-brand-dark/5"
                  } px-6 py-2.5 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-dark`}
                  title={`Choisir ${p.name}`}
                  aria-label={`Choisir ${p.name}`}
                >
                  {p.name === "Séance à l'unité" ? "Réserver cette séance" : "Choisir cette formule"}
                </Link>

                {/* Features */}
                {p.features.length > 0 && (
                  <ul className="mt-5 space-y-2 border-t border-brand-dark/10 pt-5 text-sm text-brand-dark/75">
                    {p.features.slice(0, 5).map((f) => (
                      <li key={f} className="flex gap-2">
                        <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-brand-dark/35" />
                        <span className="leading-relaxed">{f}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
