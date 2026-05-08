import Image from "next/image";
import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";

export default function ConnexionPage() {
  return (
    <section className="flex min-h-dvh items-center bg-zinc-50 px-4 py-4 text-brand-dark md:px-8 md:py-6">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 overflow-hidden rounded-2xl border border-brand-medium/30 bg-white shadow-sm lg:grid-cols-2">
        <div className="relative min-h-[260px] lg:min-h-[520px]">
          <Image
            src="/images/conexion.png"
            alt="Connexion Aura Pilates"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/20 to-black/50" />
          <div className="absolute bottom-6 left-6 right-6 text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/85">Aura Pilates</p>
            <h1 className="mt-2 text-2xl font-semibold md:text-3xl">Bienvenue dans votre espace membre</h1>
            <p className="mt-2 text-sm text-white/85">
              Connectez-vous pour gerer vos seances, votre abonnement et votre progression.
            </p>
          </div>
        </div>

        <div className="p-6 md:p-10">
          <div className="max-w-md">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-brand-dark/80 transition hover:opacity-75"
            >
              <span aria-hidden="true" className="text-base">
                ←
              </span>
              Retour a l&apos;accueil
            </Link>

            <h2 className="mt-4 text-3xl font-semibold">Se connecter</h2>
            <p className="mt-2 text-sm text-brand-dark/75">
              Entrez vos informations pour acceder a votre compte.
            </p>

            <LoginForm />

            <p className="mt-6 text-sm text-brand-dark/80">
              Vous n&apos;avez pas encore de compte ?{" "}
              <Link href="/#inscription" className="font-semibold text-brand-dark hover:opacity-75">
                S&apos;inscrire
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
