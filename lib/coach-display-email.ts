/** Email technique créé pour la connexion téléphone + QR coach (pas un vrai email). */
export const COACH_PLACEHOLDER_EMAIL_SUFFIX = "@coaches.aurapilates.local";

export function coachPlaceholderEmail(coachId: string): string {
  return `coach.${coachId}${COACH_PLACEHOLDER_EMAIL_SUFFIX}`;
}

export function isCoachPlaceholderEmail(email: string | null | undefined): boolean {
  if (!email?.trim()) return false;
  const normalized = email.trim().toLowerCase();
  return normalized.endsWith(COACH_PLACEHOLDER_EMAIL_SUFFIX) && normalized.startsWith("coach.");
}
