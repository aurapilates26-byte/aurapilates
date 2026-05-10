import Image from "next/image";
import { Button } from "@/components/ui";
import { ContactMap } from "@/components/public/contact-map";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { courseContent, homeText } from "@/lib/text";

const coachHighlights = [
  "Coaching 100% femmes, avec progression adaptee a chaque niveau.",
  "Approche alliant posture, respiration, renforcement et mobilite.",
  "Suivi bienveillant pour prevenir les douleurs et gagner en confiance.",
];

const pricingPlans = [
  {
    title: "Seance decouverte",
    description: "Ideal pour tester le studio et definir votre niveau de depart.",
    cta: "Reserver une seance",
  },
  {
    title: "Pack mensuel",
    description: "Le meilleur choix pour une progression reguliere semaine apres semaine.",
    cta: "Voir les packs",
  },
  {
    title: "Accompagnement prive",
    description: "Format personnalise avec objectifs precis et suivi approfondi.",
    cta: "Demander un devis",
  },
];

const planningSlots = [
  { day: "Lundi - Vendredi", hours: "07:00 - 20:30" },
  { day: "Samedi", hours: "08:00 - 14:00" },
  { day: "Dimanche", hours: "Sur reservation" },
];

const faqItems = [
  {
    question: "Je suis debutante, puis-je commencer maintenant ?",
    answer:
      "Oui, les seances sont adaptees a votre niveau avec des options progressives.",
  },
  {
    question: "Dois-je apporter du materiel ?",
    answer:
      "Le studio fournit l'equipement principal. Une tenue confortable est recommandee.",
  },
  {
    question: "Puis-je changer mon horaire ?",
    answer:
      "Oui, selon disponibilite. Contactez-nous en avance pour reprogrammer facilement.",
  },
];

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
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button href="/#cours" size="sm" className="!bg-white !text-brand-dark">
                Voir les cours
              </Button>
              <Button
                href="/#inscription"
                size="sm"
                className="border-white bg-transparent text-white hover:bg-white/10"
              >
                Commencer maintenant
              </Button>
            </div>
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
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {coachHighlights.map((item) => (
              <article
                key={item}
                className="rounded-xl border border-brand-medium/30 bg-white p-5 shadow-sm"
              >
                <p className="text-sm leading-6 text-brand-dark/90">{item}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="tarif" className="bg-zinc-50 px-4 py-16 text-brand-dark scroll-mt-20">
        <div className="mx-auto w-full max-w-6xl">
          <h2 className="text-3xl font-semibold">{homeText.sections.tarif.title}</h2>
          <p className="mt-2 text-brand-dark/80">{homeText.sections.tarif.subtitle}</p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {pricingPlans.map((plan) => (
              <article
                key={plan.title}
                className="rounded-xl border border-brand-medium/30 bg-white p-5 shadow-sm"
              >
                <h3 className="text-lg font-semibold">{plan.title}</h3>
                <p className="mt-2 text-sm text-brand-dark/80">{plan.description}</p>
                <div className="mt-4">
                  <Button href="/#contact" size="xs">
                    {plan.cta}
                  </Button>
                </div>
              </article>
            ))}
          </div>
          <div className="mt-8 rounded-xl border border-brand-medium/30 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold">Planning indicatif</h3>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {planningSlots.map((slot) => (
                <div key={slot.day} className="rounded-lg bg-zinc-50 p-4">
                  <p className="text-sm font-semibold">{slot.day}</p>
                  <p className="mt-1 text-sm text-brand-dark/80">{slot.hours}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="inscription" className="bg-zinc-100 px-4 py-16 text-brand-dark scroll-mt-20">
        <div className="mx-auto w-full max-w-6xl">
          <h2 className="text-3xl font-semibold">{homeText.sections.inscription.title}</h2>

          <article className="mt-8 rounded-xl border border-brand-medium/30 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-semibold">Formulaire d'inscription</h3>
            <p className="mt-2 text-sm text-brand-dark/80">
              Ce formulaire est dedie a l'inscription au studio, pas aux reservations.
            </p>

            <form
              className="mt-5 grid gap-3 md:grid-cols-2"
              action="mailto:aurapilates26@gmail.com"
              method="post"
            >
              <Input id="fullName" name="fullName" label="Nom complet" placeholder="Votre nom complet" />
              <Input id="phone" name="phone" label="Telephone" placeholder="Votre numero" />
              <Input
                id="email"
                name="email"
                type="email"
                label="Email"
                placeholder="votre-email@exemple.com"
              />
              <Input
                id="objective"
                name="objective"
                label="Objectif"
                placeholder="Ex: debuter Pilates Reformer"
              />
              <div className="md:col-span-2">
                <Textarea
                  id="message"
                  name="message"
                  label="Message"
                  rows={4}
                  placeholder="Parlez-nous de vos besoins et disponibilites."
                />
              </div>
              <div className="md:col-span-2">
                <Button type="submit" size="sm" className="w-full md:w-auto">
                  Envoyer ma demande d'inscription
                </Button>
              </div>
            </form>
          </article>
        </div>
      </section>

      <section id="faq" className="bg-zinc-50 px-4 py-16 text-brand-dark scroll-mt-20">
        <div className="mx-auto w-full max-w-6xl">
          <h2 className="text-3xl font-semibold">{homeText.sections.faq.title}</h2>
          <p className="mt-2 text-brand-dark/80">{homeText.sections.faq.subtitle}</p>
          <div className="mt-8 space-y-3">
            {faqItems.map((item) => (
              <details
                key={item.question}
                className="rounded-xl border border-brand-medium/30 bg-white p-5 shadow-sm"
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

      <section id="contact" className="bg-zinc-100 px-4 py-16 text-brand-dark scroll-mt-20">
        <div className="mx-auto w-full max-w-6xl">
          <h2 className="text-3xl font-semibold">{homeText.sections.contact.title}</h2>
          <p className="mt-2 text-brand-dark/80">{homeText.sections.contact.subtitle}</p>
          <div className="mt-8">
            <ContactMap />
          </div>
        </div>
      </section>
    </div>
  );
}
