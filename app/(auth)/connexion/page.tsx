import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { LoginForm } from "@/components/auth/login-form";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { postLoginPath } from "@/lib/admin/access";

export default async function ConnexionPage() {
  const session = await getServerSession(authOptions);
  if (session?.user) {
    redirect(postLoginPath(session.user.role));
  }

  return (
    <div className="flex min-h-dvh flex-col bg-white text-brand-dark">
      {/* Header - Masqué sur mobile */}
      <div className="hidden lg:block">
        <Header />
      </div>

      {/* Main Content */}
      <main className="flex-1">
        {/* Section Formulaire avec Image */}
        <section className="flex flex-col lg:min-h-dvh lg:flex-row">
        {/* Image gauche */}
        <div className="relative hidden lg:block lg:w-1/2">
          <Image
            src="/images/cnx.png"
            alt="Connexion Aura Pilates"
            fill
            priority
            sizes="50vw"
            className="object-cover"
          />
        </div>

        {/* Formulaire droite */}
        <div className="flex w-full flex-col items-center justify-center px-4 py-12 lg:w-1/2 lg:py-12">
          {/* Back button - Mobile only */}
          <div className="mb-6 w-full max-w-md lg:hidden">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-brand-dark/70 hover:text-brand-dark transition"
              title="Retour à l'accueil"
            >
              <span className="text-lg">←</span>
              <span>Retour</span>
            </Link>
          </div>

          <div className="w-full max-w-md rounded-2xl border border-brand-medium/20 bg-white p-8 sm:p-10 shadow-lg">
            {/* Header */}
            <div className="flex flex-col items-center gap-4 text-center mb-8">
              <div className="flex h-16 w-16 items-center justify-center rounded-full border border-brand-medium/20 bg-brand-light text-brand-dark">
                <span className="text-2xl">🧘</span>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-dark/45">Connexion</p>
                <p className="text-sm italic text-brand-dark/70 mt-2">Espace adhérente</p>
              </div>
              <p className="max-w-sm text-sm leading-relaxed text-brand-dark/75">
                Connectez-vous à votre compte pour accéder à votre espace personnel.
              </p>
            </div>

            {/* Formulaire */}
            <LoginForm />

            {/* Lien Créer compte */}
            <div className="mt-8 text-center">
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-brand-dark/20 bg-white px-6 py-3 text-sm font-semibold text-brand-dark shadow-sm hover:bg-zinc-50 transition"
              >
                <span>👤</span>
                Première connexion ? Créer mon compte
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Section Bénéfices - Masquée sur mobile */}
      <section className="hidden lg:block px-4 py-12 sm:py-16 md:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-2xl bg-zinc-100 p-6 sm:p-8 md:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.8fr] gap-8 lg:gap-12 items-center">
              {/* Gauche - Titre et description */}
              <div>
                <h3 className="text-2xl sm:text-3xl font-semibold text-brand-dark mb-2">
                  Votre pratique, votre suivi.
                </h3>
                <h3 className="text-2xl sm:text-3xl font-semibold text-brand-dark mb-6">
                  Tout au même endroit.
                </h3>
                <div className="w-12 h-1 bg-brand-dark/30 mb-6" />
                <p className="text-sm leading-relaxed text-brand-dark/75">
                  Grâce à votre espace adhérente, gérez facilement vos réservations, consultez votre planning et restez motivée au quotidien.
                </p>
              </div>

              {/* Droite - Features en ligne horizontale */}
              <div className="grid grid-cols-4 gap-6">
                <div className="flex flex-col items-center text-center">
                  <div className="text-4xl sm:text-5xl mb-3">📅</div>
                  <h4 className="font-semibold text-brand-dark text-xs sm:text-sm">Réservez vos cours</h4>
                  <p className="text-xs text-brand-dark/60 mt-1">à tout moment</p>
                </div>

                <div className="flex flex-col items-center text-center">
                  <div className="text-4xl sm:text-5xl mb-3">⏰</div>
                  <h4 className="font-semibold text-brand-dark text-xs sm:text-sm">Consultez votre</h4>
                  <p className="text-xs text-brand-dark/60 mt-1">planning</p>
                </div>

                <div className="flex flex-col items-center text-center">
                  <div className="text-4xl sm:text-5xl mb-3">📊</div>
                  <h4 className="font-semibold text-brand-dark text-xs sm:text-sm">Suivez votre</h4>
                  <p className="text-xs text-brand-dark/60 mt-1">progression</p>
                </div>

                <div className="flex flex-col items-center text-center">
                  <div className="text-4xl sm:text-5xl mb-3">🔔</div>
                  <h4 className="font-semibold text-brand-dark text-xs sm:text-sm">Recevez nos</h4>
                  <p className="text-xs text-brand-dark/60 mt-1">actualités</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section CTA - Masquée sur mobile */}
      <section className="hidden lg:block px-4 pb-12 sm:pb-16 md:pb-24">
        <div className="mx-auto max-w-6xl">
          <div className="relative overflow-hidden rounded-2xl">
            {/* Image de fond */}
            <Image
              src="/images/cnx1.png"
              alt="Pas encore adhérente"
              width={1200}
              height={400}
              priority
              className="w-full h-auto object-cover"
            />
            
            {/* Overlay sombre */}
            <div className="absolute inset-0 bg-black/40" />
            
            {/* Contenu centré */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
              <h3 className="text-3xl sm:text-4xl font-semibold text-white mb-3 sm:mb-4">
                Pas encore adhérente ?
              </h3>
              <p className="max-w-md text-sm sm:text-base text-white/90 mb-6 sm:mb-8">
                Rejoignez Aura et commencez votre expérience bien-être dès aujourd'hui.
              </p>
              <Link
                href="/packs"
                className="inline-flex items-center justify-center rounded-full bg-white px-8 py-3 text-sm sm:text-base font-semibold text-brand-dark shadow-md hover:bg-gray-50 transition"
              >
                Découvrir nos formules
              </Link>
            </div>
          </div>
        </div>
      </section>
      </main>

      {/* Footer - Masqué sur mobile */}
      <div className="hidden lg:block">
        <Footer />
      </div>
    </div>
  );
}
