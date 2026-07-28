import Image from "next/image";
import Link from "next/link";
import {
  PublicPageHero,
  publicHeroDescriptionClass,
  publicHeroSubtitleClass,
  publicHeroTitleClass,
} from "@/components/public/public-page-hero";
import { aboutPageText } from "@/lib/text";

const kickerClass =
  "text-[11px] font-medium uppercase tracking-[0.28em] text-brand-dark/45 sm:text-xs";

const sectionTitleClass =
  "font-serif text-[clamp(1.85rem,3.8vw,2.6rem)] font-normal leading-[1.15] tracking-tight text-brand-dark";

const bodyClass = "text-[15px] leading-[1.7] text-brand-dark/70 sm:text-base sm:leading-[1.75]";

const PHILOSOPHY_ICONS = [
  (
    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.25" aria-hidden>
      <path d="M12 21c0-6 5-8 5-13a5 5 0 1 0-10 0c0 5 5 7 5 13Z" />
      <path d="M12 8v13" />
    </svg>
  ),
  (
    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.25" aria-hidden>
      <path d="M12 20.5S4.5 15.2 4.5 10A4.5 4.5 0 0 1 12 7.2 4.5 4.5 0 0 1 19.5 10c0 5.2-7.5 10.5-7.5 10.5Z" />
    </svg>
  ),
  (
    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.25" aria-hidden>
      <path d="m12 3 1.35 4.1L17.5 8.5l-3.4 2.5 1.3 4.2L12 12.9 8.6 15.2l1.3-4.2-3.4-2.5 4.15-1.4L12 3Z" />
    </svg>
  ),
  (
    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.25" aria-hidden>
      <path d="M12 14c2.5-2.2 5-3.2 5-6.2A3.5 3.5 0 0 0 12 4.8 3.5 3.5 0 0 0 7 7.8c0 3 2.5 4 5 6.2Z" />
      <path d="M12 14v6M9 20h6" />
      <path d="M8.5 11.5c-2 .8-3.5 2.2-3.5 4M15.5 11.5c2 .8 3.5 2.2 3.5 4" />
    </svg>
  ),
] as const;

const VISION_ICONS = [
  (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.25" aria-hidden>
      <circle cx="9" cy="8" r="2.75" />
      <circle cx="16" cy="9" r="2.25" />
      <path d="M3.5 19c0-2.8 2.3-4.8 5.5-4.8s5.5 2 5.5 4.8M14 19c.2-1.8 1.6-3.2 3.8-3.2 1.4 0 2.5.6 3.2 1.5" />
    </svg>
  ),
  (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.25" aria-hidden>
      <path d="M8 13c-2.2.4-3.5 1.8-3.5 3.8V19h6.5" />
      <path d="M12.5 19H19v-2.2c0-2-1.3-3.4-3.5-3.8" />
      <path d="M12 16.5s-3.8-2.6-3.8-5.2A2.6 2.6 0 0 1 12 9a2.6 2.6 0 0 1 3.8 2.3c0 2.6-3.8 5.2-3.8 5.2Z" />
    </svg>
  ),
  (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.25" aria-hidden>
      <path d="m12 4 0.7 2.1L15 7l-2.1.8L12 10l-.9-2.2L9 7l2.3-.9L12 4Z" />
      <path d="m18 10 .5 1.5L20 12.5l-1.5.5L18 14.5l-.5-1.5L16 12.5l1.5-.5L18 10Z" />
      <path d="m6 11 .45 1.35L8 13l-1.55.45L6 14.8l-.45-1.35L4 13l1.55-.65L6 11Z" />
      <path d="m14.5 16 .4 1.2 1.3.4-1.3.4-.4 1.2-.4-1.2-1.3-.4 1.3-.4.4-1.2Z" />
    </svg>
  ),
] as const;

const ENGAGEMENT_ICONS = [
  (
    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.25" aria-hidden>
      <circle cx="12" cy="8" r="3.25" />
      <path d="M5 20c0-3.4 2.9-5.8 7-5.8s7 2.4 7 5.8" />
    </svg>
  ),
  (
    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.25" aria-hidden>
      <circle cx="9" cy="9" r="2.75" />
      <circle cx="16" cy="10" r="2.25" />
      <path d="M3.5 19.5c0-2.8 2.3-4.8 5.5-4.8 1.8 0 3.3.6 4.3 1.6M13.5 19.5c.3-1.7 1.6-3 3.7-3 1.5 0 2.7.7 3.3 1.7" />
    </svg>
  ),
  (
    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.25" aria-hidden>
      <rect x="4" y="5" width="16" height="15" rx="2" />
      <path d="M8 3.5V7M16 3.5V7M4 10h16" />
      <path d="m9.5 14.5 1.6 1.6 3.4-3.6" />
    </svg>
  ),
  (
    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.25" aria-hidden>
      <path d="M12 20.5S4.5 15.2 4.5 10A4.5 4.5 0 0 1 12 7.2 4.5 4.5 0 0 1 19.5 10c0 5.2-7.5 10.5-7.5 10.5Z" />
    </svg>
  ),
] as const;

export function AboutPage() {
  const { story, philosophy, vision, studio, engagement, cta } = aboutPageText;

  return (
    <div className="w-full bg-[#f7f4ef] text-brand-dark">
      <PublicPageHero id="a-propos">
        <p className={kickerClass}>{story.kicker}</p>
        <h1 className={`mt-4 ${publicHeroTitleClass}`}>{story.title}</h1>
        <p className={publicHeroSubtitleClass}>{story.subtitle}</p>
        <div className={`mt-6 space-y-4 ${publicHeroDescriptionClass}`}>
          {story.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <p className="mt-7 font-serif text-[1.35rem] italic leading-snug text-brand-dark/80 sm:text-[1.5rem]">
          {story.closingLines.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </p>
      </PublicPageHero>

      {/* —— Notre philosophie —— */}
      <section className="bg-[#faf8f4] px-6 py-16 sm:px-8 lg:px-12 lg:py-24">
        <div className="mx-auto w-full max-w-6xl">
          <header className="mx-auto max-w-4xl text-center">
            <p className={kickerClass}>{philosophy.kicker}</p>
            <h2 className={`mx-auto mt-5 max-w-3xl ${sectionTitleClass}`}>
              {philosophy.quote}
            </h2>
          </header>

          <div className="mt-14 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0">
            {philosophy.pillars.map((pillar, index) => (
              <div
                key={pillar.title}
                className={`flex flex-col items-center px-4 text-center lg:px-8 ${
                  index > 0 ? "lg:border-l lg:border-brand-dark/10" : ""
                }`}
              >
                <span className="text-brand-dark/55">{PHILOSOPHY_ICONS[index]}</span>
                <p className="mt-4 text-[15px] font-semibold text-brand-dark">{pillar.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-brand-dark/60">{pillar.subtitle}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* —— Notre vision —— */}
      <section className="bg-[#f7f4ef] px-6 py-16 sm:px-8 lg:px-12 lg:py-24">
        <div className="mx-auto grid w-full max-w-7xl items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="relative aspect-[5/4] w-full overflow-hidden rounded-2xl lg:aspect-[6/5]">
            <Image
              src={vision.image}
              alt={vision.imageAlt}
              fill
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-cover"
            />
          </div>

          <div>
            <p className={kickerClass}>{vision.kicker}</p>
            <h2 className={`mt-4 ${sectionTitleClass}`}>{vision.title}</h2>
            <div className={`mt-5 space-y-4 ${bodyClass}`}>
              {vision.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-5">
              {vision.points.map((point, index) => (
                <div key={point} className="flex flex-col items-start gap-2.5">
                  <span className="text-brand-dark/55">{VISION_ICONS[index]}</span>
                  <p className="text-sm font-medium leading-snug text-brand-dark">{point}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* —— Notre studio —— */}
      <section className="bg-[#faf8f4] px-6 py-16 sm:px-8 lg:px-12 lg:py-24">
        <div className="mx-auto w-full max-w-7xl">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.55fr)] lg:items-start lg:gap-12 xl:gap-16">
            <div className="max-w-md lg:pt-2">
              <p className={kickerClass}>{studio.kicker}</p>
              <h2 className={`mt-4 ${sectionTitleClass}`}>{studio.title}</h2>
              <p className={`mt-5 ${bodyClass}`}>{studio.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-3 lg:gap-4">
              {studio.cards.map((card) => (
                <article key={card.title} className="min-w-0">
                  <div className="relative aspect-[3/4] overflow-hidden rounded-xl">
                    <Image
                      src={card.image}
                      alt={card.imageAlt}
                      fill
                      sizes="(min-width: 1024px) 15vw, 45vw"
                      className="object-cover"
                    />
                  </div>
                  <p className="mt-3 text-center text-[11px] font-semibold leading-snug text-brand-dark sm:text-xs">
                    {card.title}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* —— Notre engagement —— */}
      <section className="bg-[#f7f4ef] px-6 py-16 sm:px-8 lg:px-12 lg:py-24">
        <div className="mx-auto w-full max-w-7xl">
          <header className="mx-auto max-w-2xl text-center">
            <p className={kickerClass}>{engagement.kicker}</p>
            <h2 className={`mt-4 ${sectionTitleClass}`}>{engagement.title}</h2>
          </header>

          <div className="mt-14 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            {engagement.items.map((item, index) => (
              <div key={item.title} className="flex gap-3.5">
                <span className="mt-0.5 shrink-0 text-brand-dark/55">{ENGAGEMENT_ICONS[index]}</span>
                <div>
                  <p className="text-[15px] font-semibold leading-snug text-brand-dark">{item.title}</p>
                  <p className="mt-2 text-sm leading-relaxed text-brand-dark/60">{item.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* —— CTA —— */}
      <section className="bg-[#f7f4ef] px-6 pb-16 sm:px-8 lg:px-12 lg:pb-24">
        <div className="mx-auto w-full max-w-7xl">
          <div className="relative flex min-h-[160px] overflow-hidden rounded-2xl sm:min-h-[180px]">
            <Image
              src={cta.image}
              alt={cta.imageAlt}
              fill
              sizes="(min-width: 1024px) 70vw, 100vw"
              className="object-cover object-center"
              priority
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
