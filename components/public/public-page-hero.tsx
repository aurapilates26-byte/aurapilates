import Image from "next/image";
import type { ReactNode } from "react";
import { homeText } from "@/lib/text";

/** Hauteur hero unifiée sur accueil, à propos, planning, tarifs et contact. */
export const PUBLIC_PAGE_HERO_HEIGHT_CLASS = "h-[min(560px,75vh)]";

/** Typographie hero partagée (planning, tarifs, à propos). */
export const publicHeroTitleClass =
  "font-serif text-[clamp(2.5rem,5vw,3.5rem)] leading-tight tracking-tight text-brand-dark";
export const publicHeroSubtitleClass =
  "mt-2 font-serif text-[clamp(1.35rem,2.8vw,1.85rem)] leading-snug text-brand-dark/90";
export const publicHeroDescriptionClass =
  "mt-4 max-w-lg text-sm leading-relaxed text-brand-dark/75 sm:text-base";

type PublicPageHeroProps = {
  children: ReactNode;
  /** Image de fond (défaut : hero accueil). */
  imageSrc?: string;
  imageAlt?: string;
  /** Recadrage horizontal de l'image studio (identique par défaut). */
  imagePosition?: string;
  id?: string;
  priority?: boolean;
  contentClassName?: string;
};

/**
 * Hero pleine largeur pour les pages publiques.
 * L'image démarre sous le header fixe (h-14) : le bandeau recouvre le haut,
 * le texte est décalé avec pt-14 pour rester lisible.
 */
export function PublicPageHero({
  children,
  imageSrc = homeText.hero.image,
  imageAlt = homeText.hero.imageAlt,
  imagePosition = "object-[72%_center]",
  id,
  priority = true,
  contentClassName,
}: PublicPageHeroProps) {
  return (
    <section
      id={id}
      className={`relative w-full scroll-mt-14 overflow-hidden ${PUBLIC_PAGE_HERO_HEIGHT_CLASS}`}
    >
      <Image
        src={imageSrc}
        alt={imageAlt}
        fill
        priority={priority}
        sizes="100vw"
        className={`object-cover ${imagePosition}`}
      />

      <div
        className={`relative z-10 mx-auto flex h-full w-full max-w-6xl items-start px-5 pb-8 pt-14 sm:px-8 md:px-10 lg:px-12 ${contentClassName ?? ""}`}
      >
        <div className="max-w-xl">{children}</div>
      </div>
    </section>
  );
}

/** Bandeau features accueil — sous le hero, sans chevauchement. */
export function PublicLandingHeroFeatures({ children }: { children: ReactNode }) {
  return (
    <section className="relative z-20 w-full bg-[#faf7f2] px-5 py-6 sm:px-8 lg:px-12">
      {children}
    </section>
  );
}
