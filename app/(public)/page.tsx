import Image from "next/image";
import { Button } from "@/components/ui";
import { courseContent, homeText } from "@/lib/text";

export default function HomePage() {
  return (
    <div className="w-full">
      <section id="accueil" className="relative h-[100vh] w-full overflow-hidden scroll-mt-20">
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
            <p className="mx-auto mt-2 max-w-2xl text-lg font-normal leading-6 text-white drop-shadow-[0_5px_14px_rgba(0,0,0,0.45)] [text-shadow:0_1px_6px_rgba(0,0,0,0.45)] md:text-xl">
              {homeText.hero.centerDescription}
            </p>
          </div>
        </div>
        <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center justify-end rounded-md bg-brand-light/90 px-3 py-2 text-center text-brand-dark md:bottom-8 md:left-10 md:translate-x-0 md:items-start md:text-left">
          <h1 className="text-2xl font-semibold md:text-4xl">{homeText.hero.title}</h1>
          <p className="text-sm md:text-base">{homeText.hero.subtitle}</p>
        </div>
      </section>

      <section id="cours" className="bg-zinc-50 px-4 py-16 text-brand-dark scroll-mt-20">
        <div className="mx-auto w-full max-w-6xl">
          <h2 className="text-3xl font-semibold">{homeText.sections.cours.title}</h2>
          <p className="mt-2 text-brand-dark/80">{homeText.sections.cours.subtitle}</p>
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
            {courseContent.map((course) => (
              <article
                key={course.slug}
                className="overflow-hidden rounded-xl border border-brand-medium/40 bg-white shadow-sm"
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

      <section id="coach" className="bg-zinc-100 px-4 py-16 text-brand-dark scroll-mt-20">
        <div className="mx-auto w-full max-w-6xl">
          <h2 className="text-3xl font-semibold">{homeText.sections.coach.title}</h2>
          <p className="mt-2 text-brand-dark/80">{homeText.sections.coach.subtitle}</p>
        </div>
      </section>

      <section id="tarif" className="bg-zinc-50 px-4 py-16 text-brand-dark scroll-mt-20">
        <div className="mx-auto w-full max-w-6xl">
          <h2 className="text-3xl font-semibold">{homeText.sections.tarif.title}</h2>
          <p className="mt-2 text-brand-dark/80">{homeText.sections.tarif.subtitle}</p>
        </div>
      </section>

      <section id="inscription" className="bg-zinc-100 px-4 py-16 text-brand-dark scroll-mt-20">
        <div className="mx-auto w-full max-w-6xl">
          <h2 className="text-3xl font-semibold">{homeText.sections.inscription.title}</h2>
          <p className="mt-2 text-brand-dark/80">{homeText.sections.inscription.subtitle}</p>
        </div>
      </section>

      <section id="faq" className="bg-zinc-50 px-4 py-16 text-brand-dark scroll-mt-20">
        <div className="mx-auto w-full max-w-6xl">
          <h2 className="text-3xl font-semibold">{homeText.sections.faq.title}</h2>
          <p className="mt-2 text-brand-dark/80">{homeText.sections.faq.subtitle}</p>
        </div>
      </section>

      <section id="contact" className="bg-zinc-100 px-4 py-16 text-brand-dark scroll-mt-20">
        <div className="mx-auto w-full max-w-6xl">
          <h2 className="text-3xl font-semibold">{homeText.sections.contact.title}</h2>
          <p className="mt-2 text-brand-dark/80">{homeText.sections.contact.subtitle}</p>
        </div>
      </section>
    </div>
  );
}
