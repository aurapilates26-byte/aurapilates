import Image from "next/image";
import { Suspense } from "react";
import { Button } from "@/components/ui";
// import { PublicCoachesSection } from "@/components/public/public-coaches-section";
import { PublicPacksPricing } from "@/components/public/public-packs-pricing";
import { PublicPlanningDisplay } from "@/components/public/public-planning";
import { PublicSectionHeading } from "@/components/public/public-section-heading";
import { Input } from "@/components/ui/input";
import { publicPanelSurfaceClass } from "@/lib/public-panel-surface";
import { courseContent, homeTestimonials, homeText } from "@/lib/text";

const faqItems = [
  {
    question: "Je suis débutante, puis-je commencer maintenant ?",
    answer:
      "Oui, les séances sont adaptées à votre niveau avec des options progressives.",
  },
  {
    question: "Dois-je apporter du matériel ?",
    answer:
      "Le studio fournit l'équipement principal. Une tenue confortable est recommandée.",
  },
  {
    question: "Puis-je changer mon horaire ?",
    answer:
      "Oui, selon la disponibilité. Contactez-nous en avance pour reprogrammer facilement.",
  },
];

/** Offset pour les ancres sous le header fixe. */
const sectionScrollTop = "scroll-mt-14";

/** Bande 1 : ton studio (fond crème, aligné planning / tarifs / FAQ). */
const sectionBgStripA = "bg-brand-light px-4 py-13 text-brand-dark";

export function LandingPage() {
  return (
    <div className="w-full">
      <section id="accueil" className={`relative h-[100vh] w-full overflow-hidden ${sectionScrollTop}`}>
        <Image
          src={homeText.hero.image}
          alt={homeText.hero.imageAlt}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/35 to-black/55" />
        <div className="absolute inset-0 z-10 flex items-center justify-center px-6 text-center">
          <div className="w-full max-w-4xl">
            <h2 className="text-4xl font-bold leading-[1.05] tracking-tight text-white drop-shadow-[0_6px_16px_rgba(0,0,0,0.55)] [text-shadow:0_1px_6px_rgba(0,0,0,0.55)] md:text-6xl">
              {homeText.hero.centerTitle}
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-xl font-medium leading-6 text-white drop-shadow-[0_5px_14px_rgba(0,0,0,0.5)] [text-shadow:0_1px_6px_rgba(0,0,0,0.5)] md:text-2xl">
              {homeText.hero.centerSubtitle}
            </p>
          </div>
        </div>
        <div className="absolute bottom-4 z-10 flex max-w-[calc(100vw-2rem)] flex-col items-center rounded-md bg-brand-light/90 px-3 py-2 text-center text-brand-dark max-lg:left-1/2 max-lg:-translate-x-1/2 lg:bottom-8 lg:left-10 lg:translate-x-0">
          <h1 className="whitespace-nowrap text-[clamp(1.6rem,4.4vw,2.25rem)] font-semibold leading-none">
            {homeText.hero.title}
          </h1>
          <p className="whitespace-nowrap text-[clamp(0.65rem,2.4vw,1rem)]">{homeText.hero.subtitle}</p>
        </div>
      </section>

      <section id="cours" className={`${sectionBgStripA} ${sectionScrollTop}`}>
        <div className="mx-auto w-full max-w-6xl">
          <PublicSectionHeading
            kicker={homeText.sections.cours.kicker}
            title={homeText.sections.cours.title}
            subtitle={homeText.sections.cours.subtitle}
          />
          <div className="mt-10 grid grid-cols-1 gap-6 md:mt-12 md:grid-cols-2">
            {courseContent.map((course) => (
              <article
                key={course.slug}
                className={`overflow-hidden rounded-xl border border-brand-medium/40 shadow-sm ${publicPanelSurfaceClass}`}
              >
                <div className="relative h-56 w-full">
                  <Image
                    src={course.cardImage}
                    alt={course.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
                <div className="px-4 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-xl font-semibold">{course.title}</h3>
                    <Button href={`/cours/${course.slug}`} size="xs">
                      Voir plus
                    </Button>
                  </div>
                  <p className="mt-2 text-sm text-brand-dark/80">{course.cardDescription}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Section « Coach » masquée temporairement — décommenter + réactiver l’import `PublicCoachesSection`.
      <section id="coach" className={`${sectionBgStripA} ${sectionScrollTop}`}>
        <div className="mx-auto w-full max-w-6xl">
          <PublicSectionHeading
            kicker={homeText.sections.coach.kicker}
            title={homeText.sections.coach.title}
            subtitle={homeText.sections.coach.subtitle}
          />
          <Suspense
            fallback={
              <div className="mt-5 rounded-xl border border-brand-medium/20 bg-white/70 px-5 py-13 text-center text-sm text-brand-dark/60">
                Chargement de l&apos;équipe…
              </div>
            }
          >
            <PublicCoachesSection />
          </Suspense>
        </div>
      </section>
      */}

      <section id="planning" className={`${sectionBgStripA} ${sectionScrollTop}`}>
        <div className="mx-auto w-full max-w-6xl">
          <PublicSectionHeading
            kicker={homeText.sections.planning.kicker}
            title={homeText.sections.planning.title}
            subtitle={homeText.sections.planning.subtitle}
          />
          <div className="mt-10 md:mt-12">
            <PublicPlanningDisplay />
          </div>
        </div>
      </section>

      <section id="tarif" className={`${sectionBgStripA} ${sectionScrollTop}`}>
        <div className="mx-auto w-full max-w-6xl">
          <PublicSectionHeading
            kicker={homeText.sections.tarif.kicker}
            title={homeText.sections.tarif.title}
            subtitle={homeText.sections.tarif.subtitle}
          />
          <div className="mt-10 md:mt-12">
            <Suspense
              fallback={
                <div
                  className={`rounded-2xl border border-brand-medium/20 p-6 text-sm text-brand-dark/70 shadow-sm ${publicPanelSurfaceClass}`}
                >
                  Chargement des packs...
                </div>
              }
            >
              <PublicPacksPricing />
            </Suspense>
          </div>
        </div>
      </section>

      <section id="inscription" className={`${sectionBgStripA} ${sectionScrollTop}`}>
        <div className="mx-auto w-full max-w-6xl">
          <PublicSectionHeading title={homeText.sections.inscription.title} subtitle={homeText.sections.inscription.subtitle} />

          <div className="mt-10 md:mt-12">
            <article
              className={`mx-auto flex w-full max-w-3xl flex-col rounded-xl border border-brand-medium/30 p-5 shadow-sm ${publicPanelSurfaceClass}`}
            >
              <h3 className="text-lg font-semibold">Formulaire d&apos;inscription</h3>

              <form
                className="mt-5 grid gap-3 md:grid-cols-2"
                action="mailto:aurapilates26@gmail.com"
                method="post"
              >
                <Input variant="soft" id="firstName" name="firstName" label="Prénom" placeholder="Votre prénom" />
                <Input variant="soft" id="lastName" name="lastName" label="Nom" placeholder="Votre nom" />
                <Input
                  variant="soft"
                  id="email"
                  name="email"
                  type="email"
                  label="Email"
                  placeholder="votre-email@exemple.com"
                />
                <Input
                  variant="soft"
                  id="phone"
                  name="phone"
                  type="tel"
                  label="Téléphone"
                  placeholder="Votre numéro"
                />
                <div className="md:col-span-2">
                  <Button type="submit" size="sm" className="w-full md:w-auto">
                    Envoyer ma demande d&apos;inscription
                  </Button>
                </div>
              </form>
            </article>
          </div>
        </div>
      </section>

      <section id="temoignages" className={`${sectionBgStripA} ${sectionScrollTop}`}>
        <div className="mx-auto w-full max-w-6xl">
          <PublicSectionHeading
            kicker={homeText.sections.temoignages.kicker}
            title={homeText.sections.temoignages.title}
            subtitle={homeText.sections.temoignages.subtitle}
          />
          <div className="mt-10 grid grid-cols-1 gap-5 md:mt-12 md:grid-cols-3 md:gap-6">
            {homeTestimonials.map((t) => (
              <article
                key={t.name}
                className="rounded-2xl border border-brand-medium/25 bg-white p-5 shadow-sm sm:p-6"
              >
                <div className="flex items-start gap-3">
                  <span
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-medium text-sm font-semibold text-white shadow-inner"
                    aria-hidden
                  >
                    {t.initials}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-brand-dark">{t.name}</p>
                    <span className="mt-1.5 inline-block rounded-full border border-brand-medium/35 bg-brand-light px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-brand-dark">
                      Membre
                    </span>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-brand-dark/85">«{t.quote}»</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className={`${sectionBgStripA} ${sectionScrollTop}`}>
        <div className="mx-auto w-full max-w-6xl">
          <PublicSectionHeading
            kicker={homeText.sections.faq.kicker}
            title={homeText.sections.faq.title}
            subtitle={homeText.sections.faq.subtitle}
          />
          <div className="mt-10 space-y-3 md:mt-12">
            {faqItems.map((item) => (
              <details
                key={item.question}
                className={`rounded-2xl border border-brand-medium/20 p-4 shadow-sm sm:p-5 ${publicPanelSurfaceClass}`}
              >
                <summary className="cursor-pointer list-none text-sm font-semibold">
                  {item.question}
                </summary>
                <p className="mt-3 text-sm leading-6 text-brand-dark/80">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
