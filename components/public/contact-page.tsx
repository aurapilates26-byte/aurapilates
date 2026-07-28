import Image from "next/image";
import Link from "next/link";
import { ContactMap } from "@/components/public/contact-map";
import {
  PublicPageHero,
  publicHeroDescriptionClass,
  publicHeroSubtitleClass,
  publicHeroTitleClass,
} from "@/components/public/public-page-hero";
import { contactPageText } from "@/lib/text";

const kickerClass =
  "text-[11px] font-medium uppercase tracking-[0.28em] text-brand-dark/45 sm:text-xs";

const sectionTitleClass =
  "font-serif text-[clamp(1.85rem,3.8vw,2.6rem)] font-normal leading-[1.15] tracking-tight text-brand-dark";

const STUDIO_FEATURE_ICONS = [
  (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.25" aria-hidden>
      <circle cx="12" cy="8" r="3.25" />
      <path d="M5 20c0-3.4 2.9-5.8 7-5.8s7 2.4 7 5.8" />
    </svg>
  ),
  (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.25" aria-hidden>
      <path d="M12 20.5S4.5 15.2 4.5 10A4.5 4.5 0 0 1 12 7.2 4.5 4.5 0 0 1 19.5 10c0 5.2-7.5 10.5-7.5 10.5Z" />
    </svg>
  ),
  (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.25" aria-hidden>
      <path d="m12 3 1.35 4.1L17.5 8.5l-3.4 2.5 1.3 4.2L12 12.9 8.6 15.2l1.3-4.2-3.4-2.5 4.15-1.4L12 3Z" />
    </svg>
  ),
  (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.25" aria-hidden>
      <circle cx="9" cy="9" r="2.75" />
      <circle cx="16" cy="10" r="2.25" />
      <path d="M3.5 19.5c0-2.8 2.3-4.8 5.5-4.8 1.8 0 3.3.6 4.3 1.6M13.5 19.5c.3-1.7 1.6-3 3.7-3 1.5 0 2.7.7 3.3 1.7" />
    </svg>
  ),
] as const;

export function ContactPage() {
  const { hero, studio, cta } = contactPageText;

  return (
    <div className="w-full bg-[#f7f4ef] text-brand-dark">
      <PublicPageHero
        id="contact"
        imageSrc={hero.image}
        imageAlt={hero.imageAlt}
        imagePosition="object-[65%_center]"
      >
        <p className={kickerClass}>{hero.kicker}</p>
        <h1 className={`mt-4 ${publicHeroTitleClass}`}>{hero.title}</h1>
        <p className={`${publicHeroSubtitleClass} italic`}>{hero.subtitle}</p>
        <p className={publicHeroDescriptionClass}>{hero.description}</p>
      </PublicPageHero>

      {/* —— Carte + studio —— */}
      <section className="bg-[#f7f4ef] px-6 py-14 sm:px-8 lg:px-12 lg:py-20">
        <div className="mx-auto grid w-full max-w-7xl gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.9fr)] lg:gap-6 xl:gap-8">
          <div className="min-h-[320px] lg:min-h-[420px]">
            <ContactMap layout="split" />
          </div>

          <div className="flex flex-col justify-center px-0 lg:px-4">
            <h2 className={sectionTitleClass}>{studio.title}</h2>
            <p className="mt-4 text-sm leading-relaxed text-brand-dark/70 sm:text-[15px]">{studio.description}</p>
            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              {studio.features.map((feature, index) => (
                <div key={feature.title} className="flex gap-3">
                  <span className="mt-0.5 shrink-0 text-brand-dark/55">{STUDIO_FEATURE_ICONS[index]}</span>
                  <div>
                    <p className="text-sm font-semibold text-brand-dark">{feature.title}</p>
                    <p className="mt-1 text-xs leading-relaxed text-brand-dark/60">{feature.subtitle}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative min-h-[280px] overflow-hidden rounded-2xl lg:min-h-[420px]">
            <Image
              src={studio.loungeImage}
              alt={studio.loungeImageAlt}
              fill
              sizes="(min-width: 1024px) 30vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* —— CTA —— */}
      <section className="bg-[#f7f4ef] px-6 pb-16 sm:px-8 lg:px-12 lg:pb-24">
        <div className="mx-auto w-full max-w-7xl">
          <div className="relative flex min-h-[180px] overflow-hidden rounded-2xl sm:min-h-[200px]">
            <Image
              src={cta.image}
              alt={cta.imageAlt}
              fill
              sizes="(min-width: 1024px) 70vw, 100vw"
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-[#5c4a42]/70" />

            <div className="relative z-10 flex w-full flex-col items-center justify-center gap-5 px-6 py-10 text-center sm:px-8 md:px-10 lg:px-12">
              <div className="max-w-2xl">
                <h2 className="font-serif text-[clamp(1.4rem,2.8vw,2rem)] font-normal leading-tight text-white">
                  {cta.title}
                </h2>
                <p className="mt-2 text-sm text-white/75 sm:text-[15px]">{cta.subtitle}</p>
              </div>
              <Link
                href={cta.href}
                className="inline-flex shrink-0 items-center justify-center rounded-full bg-[#f7f4ef] px-7 py-3 text-sm font-semibold text-brand-dark transition hover:bg-white"
              >
                {cta.button}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
