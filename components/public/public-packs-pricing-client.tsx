"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { publicFilterPillClass } from "@/lib/public-filter-pill";
import { publicPanelSurfaceClass } from "@/lib/public-panel-surface";
import { normalizePackCategory, packCategoryMenuLabel } from "@/lib/pack-categories";
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

  const cardCtaClass =
    "inline-flex shrink-0 items-center justify-center rounded-full border border-brand-dark/35 bg-brand-dark px-3 py-1 text-xs font-semibold text-white transition hover:bg-brand-dark/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-dark sm:text-sm";

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
        <div className="flex flex-wrap justify-center gap-4 md:gap-5">
          {visible.map((p) => {
            const price = p.priceDisplay;
            const duration = p.durationDisplay;
            const sessions = p.sessionsDisplay;

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

            return (
              <article
                key={p.id}
                className={`flex h-full w-full min-w-0 max-w-sm flex-col rounded-2xl border border-brand-medium/20 p-3 shadow-sm transition hover:border-brand-medium/35 hover:shadow-md sm:max-w-md sm:p-4 ${publicPanelSurfaceClass}`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="min-w-0 flex-1 text-lg font-semibold leading-snug text-brand-dark break-words">
                    {p.name}
                  </h3>
                  <Link
                    href="/inscription"
                    className={cardCtaClass}
                    title="Aller au formulaire d'inscription"
                    aria-label="Choisir ce pack — aller à l'inscription"
                  >
                    Choisir
                  </Link>
                </div>

                <div
                  className="mt-4 grid gap-0 text-center [grid-template-columns:minmax(0,0.88fr)_minmax(2.85rem,0.66fr)_minmax(0,0.96fr)]"
                  role="group"
                  aria-label={`Prix ${priceShown}, séances ${sessionsShown}, durée ${durationShown}`}
                >
                  <div className="min-w-0 px-1 sm:px-2">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-brand-dark/50">
                      Prix
                    </p>
                    <p className="mt-1 break-words text-base font-bold tabular-nums leading-tight text-brand-dark sm:text-lg">
                      {priceShown}
                    </p>
                  </div>
                  <div className="min-w-0 border-l border-brand-medium/25 px-1 sm:px-1.5">
                    <p className="text-[9px] font-semibold uppercase tracking-wide text-brand-dark/50 sm:text-[10px] sm:tracking-wider">
                      Séances
                    </p>
                    <p className="mt-1 whitespace-nowrap text-base font-bold tabular-nums leading-tight text-brand-dark sm:text-lg">
                      {sessionsShown}
                    </p>
                  </div>
                  <div className="min-w-0 border-l border-brand-medium/25 px-1 sm:px-2">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-brand-dark/50">
                      Durée
                    </p>
                    <p className="mt-1 break-words text-base font-bold leading-tight text-brand-dark sm:text-lg">
                      {durationShown}
                    </p>
                  </div>
                </div>

                {quotaLine ? <p className="mt-3 text-sm text-brand-dark/75">{quotaLine}</p> : null}

                {p.features.length > 0 ? (
                  <ul className="mt-4 space-y-1.5 text-sm text-brand-dark/85">
                    {p.features.slice(0, 6).map((f) => (
                      <li key={f} className="flex gap-2">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-dark/35" />
                        <span className="leading-relaxed">{f}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
