import Image from "next/image";
import Link from "next/link";
import { PublicPageHero, publicHeroDescriptionClass, publicHeroSubtitleClass, publicHeroTitleClass } from "@/components/public/public-page-hero";
import { PublicPacksPricing } from "@/components/public/public-packs-pricing";

const HERO_FEATURE_ICONS = [
  (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.5-6 8-6s8 2 8 6" />
    </svg>
  ),
  (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <circle cx="12" cy="10" r="4" />
      <path d="M7 20c0-1.5.5-3 1.5-4M16 20c0-1.5-.5-3-1.5-4" />
    </svg>
  ),
  (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 9h18M8 3v4M16 3v4" />
    </svg>
  ),
] as const;

export function TarifPageComponent() {
  return (
    <div className="w-full">
      <PublicPageHero>
        <h1 className={publicHeroTitleClass}>Nos tarifs</h1>
        <p className={publicHeroSubtitleClass}>Des formules pensées pour vous</p>
        <p className={publicHeroDescriptionClass}>
          Choisissez la formule qui correspond à votre rythme et à vos objectifs. Toutes nos formules
          incluent l&apos;accès à un studio premium et un accompagnement bienveillant.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-6">
          {[
            { title: "Studio 100%", subtitle: "Féminin" },
            { title: "Coachs certifiées", subtitle: "et attentionnées" },
            { title: "Réservation", subtitle: "flexible" },
          ].map((feature, index) => (
            <div key={feature.title} className="flex items-center gap-3">
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
      </PublicPageHero>

      <section className="px-6 py-4 sm:px-8 md:py-6 lg:px-10 lg:py-8">
        <div className="mx-auto w-full max-w-6xl">
          <div className="mb-3 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-dark/45 mb-2">
              NOS FORMULES
            </p>
            <h2 className="text-3xl sm:text-4xl font-semibold text-brand-dark mb-3">
              Des formules adaptées à vos besoins
            </h2>
            <p className="max-w-2xl mx-auto text-sm sm:text-base text-brand-dark/75">
              Toutes nos formules sont valables à partir de la date d'achat et non nominatives. Elles peuvent être utilisées pour les cours Reformer, Mat Pilates et Yoga.
            </p>
          </div>

          {/* Packs Grid */}
          <PublicPacksPricing />
        </div>
      </section>

      {/* Options Section */}
      <section className="bg-zinc-50 px-6 py-8 sm:px-8 md:py-10 lg:px-10 lg:py-12">
        <div className="mx-auto w-full max-w-6xl">
          <div className="mb-8 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-dark/70 mb-2">
              OPTIONS & SUPPLÉMENTS
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-4">
            {[
              { title: "Cours privé", subtitle: "(1 personne)", price: "75 DT", icon: "👤" },
              { title: "Tapis personnel", subtitle: "obligatoire", price: "Disponible à la vente", icon: "📋" },
              { title: "Bouteille d'eau", subtitle: "réutilisable", price: "Disponible à la vente", icon: "💧" },
            ].map((option) => (
              <div key={option.title} className="rounded-2xl border border-brand-medium/15 bg-white px-4 py-4 shadow-sm flex gap-4">
                <div className="text-3xl shrink-0">{option.icon}</div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-brand-dark">{option.title}</p>
                  <p className="text-xs text-brand-dark/65 mt-0.5">{option.subtitle}</p>
                  <p className="text-xs font-semibold text-brand-dark mt-2">{option.price}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="px-6 py-12 sm:px-8 md:py-16 lg:px-10 lg:py-20">
        <div className="mx-auto w-full max-w-6xl">
          <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-stretch">
            {/* Content Left */}
            <div className="w-full md:w-1/3">
              <h2 className="text-2xl sm:text-3xl font-serif text-brand-dark mb-2">
                Plus qu'un studio, une expérience
              </h2>
              <p className="text-xs sm:text-sm text-brand-dark/75 mb-4">
                Chez Aura, chaque détail est pensé pour vous offrir un moment de bien-être unique.
              </p>
              <ul className="space-y-2 text-xs sm:text-sm text-brand-dark/75">
                <li>✓ Équipements haut de gamme</li>
                <li>✓ Coachs certifiées et à votre écoute</li>
                <li>✓ Cours en petits groupes</li>
                <li>✓ Ambiance chaleureuse et apaisante</li>
              </ul>
            </div>

            {/* Images Right */}
            <div className="w-full md:w-2/3 grid grid-cols-3 gap-3 md:gap-4">
              {[
                { id: 1, src: "/images/tarifimg1.jpg" },
                { id: 2, src: "/images/tarifimg2.jpg" },
                { id: 3, src: "/images/tarifimg3.jpg" },
              ].map((img) => (
                <div key={img.id} className="relative h-48 sm:h-56 md:h-64 rounded-lg overflow-hidden">
                  <Image
                    src={img.src}
                    alt="Expérience Aura"
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-zinc-50 px-6 py-16 sm:px-8 md:py-20 lg:px-10 lg:py-28">
        <div className="mx-auto w-full max-w-3xl">
          <div className="mb-12 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-dark/45 mb-2">
              QUESTIONS FRÉQUENTES
            </p>
            <h2 className="text-3xl sm:text-4xl font-semibold text-brand-dark">
              Vous avez des questions ?
            </h2>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "Puis-je utiliser mes séances pour différents types de cours ?",
                a: "Oui, toutes les formules vous permettent de suivre les cours Reformer, Mat Pilates et Yoga.",
              },
              {
                q: "Comment réserver mes séances ?",
                a: "Vous pouvez réserver directement via notre plateforme en ligne ou contacter notre équipe.",
              },
              {
                q: "Puis-je souscrire au prolongement ma formule ?",
                a: "Oui, vous pouvez renouveler ou prolonger votre formule à tout moment.",
              },
              {
                q: "Y a-t-il des frais d'inscription ?",
                a: "Non, il n'y a pas de frais d'inscription. Vous payez uniquement votre formule choisie.",
              },
            ].map((faq, idx) => (
              <details
                key={idx}
                className="group border-b border-brand-dark/10 py-4 cursor-pointer"
              >
                <summary className="flex items-center justify-between font-semibold text-brand-dark hover:text-brand-dark/70 transition">
                  <span className="text-sm sm:text-base">{faq.q}</span>
                  <span className="text-xl group-open:rotate-45 transition">+</span>
                </summary>
                <p className="mt-4 text-sm text-brand-dark/75">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-16 sm:px-8 md:py-20 lg:px-10 lg:py-28">
        <div className="mx-auto w-full max-w-6xl">
          <div className="relative overflow-hidden rounded-2xl">
            <Image
              src="/images/cnx1.png"
              alt="Prêt à commencer"
              width={1200}
              height={400}
              className="w-full h-auto object-cover"
            />
            <div className="absolute inset-0 bg-black/40" />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
              <h3 className="text-3xl sm:text-4xl font-semibold text-white mb-3 sm:mb-4">
                Prêt à commencer ?
              </h3>
              <p className="max-w-md text-sm sm:text-base text-white/90 mb-6 sm:mb-8">
                Réservez votre séance et offrez-vous un moment pour vous.
              </p>
              <Link
                href="/connexion"
                className="inline-flex items-center justify-center rounded-full bg-white px-8 py-3 text-sm sm:text-base font-semibold text-brand-dark shadow-sm hover:bg-gray-50 transition"
              >
                Réserver une séance
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

