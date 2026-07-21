import Image from "next/image";
import { Suspense } from "react";
import { PublicPlanningDisplay } from "@/components/public/public-planning";
import { PublicReadySection } from "@/components/public/public-ready-section";
import { homeText, planningPageText } from "@/lib/text";

const HERO_FEATURE_ICONS = [
  (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <circle cx="9" cy="7" r="3" />
      <circle cx="17" cy="8" r="2.5" />
      <path d="M3 19c0-3 2.5-5 6-5s6 2 6 5M14 19c0-2 1.5-3.5 4-3.5" />
    </svg>
  ),
  (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M8 3v4M16 3v4M3 10h18" />
      <path d="M8 14h2M12 14h2M16 14h2" />
    </svg>
  ),
] as const;

const TIP_ICONS = [
  (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <circle cx="12" cy="8" r="3" />
      <path d="M6 20c0-3 2.5-5 6-5s6 2 6 5" />
    </svg>
  ),
  (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <circle cx="12" cy="5" r="2" />
      <path d="M12 7v2.5" />
      <path d="M9 10.5h6" />
      <path d="M8 13.5c-1.5 1-2.5 2.5-2.5 4.5h13c0-2-1-3.5-2.5-4.5" />
      <path d="M10 13.5l-1.5 4.5M14 13.5l1.5 4.5" />
    </svg>
  ),
  (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4l3 2" />
    </svg>
  ),
  (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M12 20s-6.5-4.5-6.5-9a4.5 4.5 0 0 1 8.2-2.6A4.5 4.5 0 0 1 18.5 11c0 4.5-6.5 9-6.5 9Z" />
    </svg>
  ),
] as const;

export function PlanningPage() {
  return (
    <div className="w-full">
      <section className="relative min-h-[min(520px,72vh)] w-full pt-14">
        <Image
          src={homeText.hero.image}
          alt={homeText.hero.imageAlt}
          fill
          priority
          sizes="100vw"
          className="object-cover object-[82%_center]"
        />

        <div className="relative z-10 mx-auto flex min-h-[min(480px,68vh)] w-full max-w-6xl items-center px-8 py-12 sm:px-10 md:px-12 lg:px-16 xl:px-20">
          <div className="max-w-xl lg:ml-4 xl:ml-8">
            <h1 className="font-serif text-[clamp(2.5rem,5vw,3.5rem)] leading-tight tracking-tight text-brand-dark">
              {planningPageText.title}
            </h1>
            <p className="mt-2 font-serif text-[clamp(1.35rem,2.8vw,1.85rem)] leading-snug text-brand-dark/90">
              {planningPageText.subtitle}
            </p>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-brand-dark/75 sm:text-base">
              {planningPageText.description}
            </p>
            <div className="mt-6 space-y-4">
              {planningPageText.features.map((feature, index) => (
                <div key={feature.title} className="flex gap-3">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-brand-dark/15 text-brand-dark/70">
                    {HERO_FEATURE_ICONS[index]}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-brand-dark">{feature.title}</p>
                    <p className="mt-0.5 text-sm text-brand-dark/65">{feature.subtitle}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#faf7f2] px-6 pb-10 pt-8 sm:px-8 lg:px-10">
        <div className="mx-auto w-full max-w-7xl">
          <Suspense
            fallback={
              <p className="py-10 text-center text-sm text-brand-dark/60">Chargement du planning…</p>
            }
          >
            <PublicPlanningDisplay />
          </Suspense>
        </div>
      </section>

      <section className="bg-[#faf7f2] px-6 pb-13 pt-2 sm:px-8 lg:px-10">
        <div className="mx-auto w-full max-w-7xl">
          <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
            {planningPageText.tips.map((tip, index) => (
              <div
                key={tip.title}
                className="flex gap-3 rounded-2xl border border-brand-medium/15 bg-[#f7f4ef] px-5 py-5 shadow-[0_10px_40px_rgba(112,72,60,0.08)]"
              >
                <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-brand-dark/15 text-brand-dark/70">
                  {TIP_ICONS[index]}
                </span>
                <div>
                  <p className="text-sm font-bold text-brand-dark">{tip.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-brand-dark/65 sm:text-sm">
                    {tip.subtitle}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <PublicReadySection />
    </div>
  );
}
