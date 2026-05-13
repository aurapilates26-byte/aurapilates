/** Unite de duree pack (libelle en base : « 50 jours », « 12 mois »). */
export type PackDurationUnit = "jours" | "mois";

const DURATION_RE = /^(\d+)\s*(jour|jours|mois)$/i;

export function parsePackDurationLabel(stored: string | null | undefined): { amount: number; unit: PackDurationUnit } | null {
  if (stored == null || typeof stored !== "string") return null;
  const s = stored.trim().replace(/\s+/g, " ");
  if (!s) return null;
  const m = DURATION_RE.exec(s);
  if (!m) {
    if (/^\d+$/.test(s)) {
      const amount = Number(s);
      if (Number.isInteger(amount) && amount >= 1) return { amount, unit: "jours" };
    }
    return null;
  }
  const amount = Number(m[1]);
  if (!Number.isInteger(amount) || amount < 1) return null;
  const u = m[2].toLowerCase();
  return { amount, unit: u === "mois" ? "mois" : "jours" };
}

export function isValidPackDurationLabel(s: string): boolean {
  return parsePackDurationLabel(s) !== null;
}

/** Libelle normalise pour la base : « 12 mois », « 50 jours ». */
export function formatPackDurationLabel(amount: number, unit: PackDurationUnit): string {
  return `${amount} ${unit}`;
}

export function splitPackDurationForForm(stored: string | null): { amount: string; unit: PackDurationUnit } {
  const p = parsePackDurationLabel(stored);
  if (!p) return { amount: "", unit: "jours" };
  return { amount: String(p.amount), unit: p.unit };
}

/** Date de fin de validite du pack a partir de la date de debut (minuit local) et du libelle duree. */
export function addPackDurationToStartDate(start: Date, stored: string | null | undefined): Date | null {
  const p = parsePackDurationLabel(stored);
  if (!p) return null;
  const out = new Date(start.getTime());
  if (p.unit === "mois") {
    out.setMonth(out.getMonth() + p.amount);
    return out;
  }
  out.setTime(out.getTime() + p.amount * 24 * 60 * 60 * 1000);
  return out;
}

/** Valide une saisie (admin ou API) et retourne le texte a stocker, ou null si vide. */
export function normalizeDurationForApi(
  raw: string | undefined | null,
): { ok: true; value: string | null } | { ok: false; error: string } {
  if (raw === undefined || raw === null) return { ok: true, value: null };
  const t = String(raw).trim();
  if (t === "") return { ok: true, value: null };
  if (!isValidPackDurationLabel(t)) {
    return { ok: false, error: "Duree invalide : exemples 50 jours, 12 mois." };
  }
  const p = parsePackDurationLabel(t)!;
  return { ok: true, value: formatPackDurationLabel(p.amount, p.unit) };
}
