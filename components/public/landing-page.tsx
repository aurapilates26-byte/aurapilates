import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui";
// import { PublicCoachesSection } from "@/components/public/public-coaches-section";
import { PublicAboutSection } from "@/components/public/public-about-section";
import { PublicCourseCardsGrid } from "@/components/public/public-course-cards-grid";
import { PublicReadySection } from "@/components/public/public-ready-section";
import { PublicSectionHeading } from "@/components/public/public-section-heading";
import { PublicTestimonialsSection } from "@/components/public/public-testimonials-section";
import { homeText } from "@/lib/text";

const sectionScrollTop = "scroll-mt-14";

const HERO_FEATURE_ICONS = [
  (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <circle cx="12" cy="5" r="2.5" />
      <path d="M8 10c0-2 1.5-3 4-3s4 1 4 3v1H8v-1Z" />
      <path d="M7 14h10l-1.5 7H8.5L7 14Z" />
    </svg>
  ),
  (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M12 21c4-4 7-7.5 7-11a7 7 0 1 0-14 0c0 3.5 3 7 7 11Z" />
      <path d="M12 13a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
    </svg>
  ),
  (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="m12 3 1.2 3.6L17 7.8l-3 2.2 1.2 3.6L12 11.4 8.8 13.6 10 10 7 7.8l3.8-1.2L12 3Z" />
      <path d="M5 19h14M8 16h8" />
    </svg>
  ),
  (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M12 20s-6.5-4.5-6.5-9a4.5 4.5 0 0 1 8.2-2.6A4.5 4.5 0 0 1 18.5 11c0 4.5-6.5 9-6.5 9Z" />
    </svg>
  ),
] as const;

export function LandingPage() {
  return (
    <div className="w-full">
      <section id="accueil" className={`relative min-h-[100vh] w-full overflow-visible ${sectionScrollTop}`}>
        <Image
          src={homeText.hero.image}
          alt={homeText.hero.imageAlt}
          fill
          priority
          sizes="100vw"
          className="object-cover object-[72%_center]"
        />

        <div className="relative z-10 mx-auto flex h-[calc(100vh-5rem)] w-full max-w-6xl items-center px-5 sm:px-8 md:px-10 lg:px-12">
          <div className="max-w-xl">
            <h1 className="text-[clamp(2.25rem,5.5vw,3.75rem)] leading-[1.08] tracking-tight text-brand-dark">
              {homeText.hero.headingLines.map((line) => (
                <span
                  key={line.text}
                  className={`block ${line.weight === "bold" ? "font-bold" : "font-normal"}`}
                >
                  {line.text}
                </span>
              ))}
            </h1>
            <p className="mt-5 max-w-lg text-[clamp(0.95rem,2vw,1.125rem)] leading-relaxed text-brand-dark/75">
              {homeText.hero.description}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-2.5">
              <Button href="/planning" size="sm" className="shadow-sm">
                {homeText.hero.primaryCta}
              </Button>
              <Link
                href="/cours"
                className="inline-flex items-center justify-center rounded-full border border-brand-dark/25 bg-white/70 px-5 py-2 text-sm font-semibold text-brand-dark backdrop-blur-sm transition hover:bg-white"
              >
                {homeText.hero.secondaryCta}
              </Link>
            </div>
            <p className="mt-5 flex items-center gap-2 text-sm font-medium text-brand-dark/80">
              <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
                <path d="M12 20s-6.5-4.5-6.5-9a4.5 4.5 0 0 1 8.2-2.6A4.5 4.5 0 0 1 18.5 11c0 4.5-6.5 9-6.5 9Z" />
              </svg>
              {homeText.hero.feminineTagline}
            </p>
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 z-20 translate-y-1/2 px-5 sm:px-8 lg:px-12">
          <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-6 rounded-2xl border border-brand-medium/15 bg-[#f7f4ef] px-5 py-6 shadow-[0_10px_40px_rgba(112,72,60,0.12)] sm:grid-cols-2 sm:px-8 sm:py-7 lg:grid-cols-4 lg:gap-8 lg:px-10">
            {homeText.hero.features.map((feature, index) => (
              <div key={feature.title} className="flex gap-3">
                <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-brand-dark/15 text-brand-dark/70">
                  {HERO_FEATURE_ICONS[index]}
                </span>
                <div>
                  <p className="text-sm font-bold text-brand-dark">{feature.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-brand-dark/65 sm:text-sm">
                    {feature.subtitle}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="cours" className={`bg-[#faf7f2] px-6 pb-13 pt-24 text-brand-dark sm:px-8 sm:pt-28 lg:px-10 ${sectionScrollTop}`}>
        <div className="mx-auto w-full max-w-7xl">
          <PublicSectionHeading
            kicker={homeText.sections.cours.kicker}
            title={homeText.sections.cours.title}
            subtitle={homeText.sections.cours.subtitle}
            titleClassName="font-serif font-normal tracking-tight"
          />
          <PublicCourseCardsGrid />
        </div>
      </section>

      <PublicAboutSection />
      <PublicTestimonialsSection />
      <PublicReadySection />

    </div>
  );
}
