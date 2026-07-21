export const PUBLIC_LANDING_SECTIONS = [
  { label: "Cours", slug: "cours" },
  /* Masque temporairement — réactiver avec la section `#coach` sur `landing-page.tsx`. */
  // { label: "Coach", slug: "coach" },
  { label: "Planning", slug: "planning" },
  { label: "Pack", slug: "tarif" },
  { label: "Inscription", slug: "inscription" },
  { label: "Témoignages", slug: "temoignages" },
  /* Masqué temporairement — page dédiée à venir. */
  // { label: "FAQ", slug: "faq" },
] as const;

export type PublicLandingSectionSlug = (typeof PUBLIC_LANDING_SECTIONS)[number]["slug"];

export const PUBLIC_LANDING_SECTION_SLUGS: PublicLandingSectionSlug[] =
  PUBLIC_LANDING_SECTIONS.map((item) => item.slug);

export function isPublicLandingSectionSlug(value: string): value is PublicLandingSectionSlug {
  return (PUBLIC_LANDING_SECTION_SLUGS as readonly string[]).includes(value);
}

/** Slugs servis par `app/(public)/(marketing)/[section]/page.tsx` (pas `cours`, reserve a `cours/page.tsx`). */
export const MARKETING_DYNAMIC_SECTION_SLUGS = [
  /* "coach", // masqué temporairement (aligné sur le nav public) */
  /* "planning", // page dédiée : app/(public)/planning/page.tsx */
  "tarif",
  "inscription",
  "temoignages",
  /* "faq", // masqué temporairement */
] as const;

export type MarketingDynamicSectionSlug = (typeof MARKETING_DYNAMIC_SECTION_SLUGS)[number];

export function isMarketingDynamicSectionSlug(
  value: string
): value is MarketingDynamicSectionSlug {
  return (MARKETING_DYNAMIC_SECTION_SLUGS as readonly string[]).includes(value);
}
