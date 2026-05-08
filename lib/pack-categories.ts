import { courseContent } from "@/lib/text";

// Catégories autorisées pour les packs (alignées avec les 4 cours de la page d'accueil).
export const PACK_CATEGORY_MIXED_REFORMER_MAT = "Pilates reformer + Mat pilates" as const;

export const PACK_CATEGORIES = [...courseContent.map((c) => c.title), PACK_CATEGORY_MIXED_REFORMER_MAT] as const;

export function isValidPackCategory(value: string) {
  return (PACK_CATEGORIES as readonly string[]).includes(value);
}

