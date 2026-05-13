/** Catégorie « Reformer + Mat » (pack mixte, quotas séparés). */
export const PACK_CATEGORY_MIXED_REFORMER_MAT = "Pilates reformer + Mat pilates" as const;

/** Libellés liste déroulante admin / affichage (sans préfixe « Cours de »). */
export const PACK_CATEGORY_OPTIONS = [
  { value: "Pilates reformer", label: "Pilates reformer" },
  { value: "Mat pilates", label: "Mat pilates" },
  { value: "Yoga", label: "Yoga" },
  { value: "Danse", label: "Danse" },
  { value: PACK_CATEGORY_MIXED_REFORMER_MAT, label: "Reformer + Mat" },
] as const;

/** Valeurs autorisées en base (API + validation). */
export const PACK_CATEGORIES: readonly string[] = PACK_CATEGORY_OPTIONS.map((o) => o.value);

/** Anciens libellés → valeur canonique (lecture / migration douce). */
const LEGACY_TO_CANONICAL = new Map<string, string>(
  [
    ["cours de yoga", "Yoga"],
    ["cours de danse", "Danse"],
    ["cours de dance", "Danse"],
  ].map(([k, v]) => [k, v]),
);

export function normalizePackCategory(raw: string): string {
  const t = raw.trim();
  if (!t) return "";
  const legacy = LEGACY_TO_CANONICAL.get(t.toLowerCase());
  return legacy ?? t;
}

export function isValidPackCategory(value: string): boolean {
  const n = normalizePackCategory(value);
  if (!n) return false;
  return PACK_CATEGORIES.includes(n);
}

export function packCategoryMenuLabel(value: string | null | undefined): string {
  if (value == null || !String(value).trim()) return "—";
  const n = normalizePackCategory(String(value));
  const opt = PACK_CATEGORY_OPTIONS.find((o) => o.value === n);
  return opt?.label ?? n;
}
