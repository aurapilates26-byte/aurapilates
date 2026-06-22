/** Email technique créé pour la connexion téléphone + QR (pas un vrai email adhérente). */
export const MEMBER_PLACEHOLDER_EMAIL_SUFFIX = "@members.aurapilates.local";

export function memberPlaceholderEmail(memberId: string): string {
  return `member.${memberId}${MEMBER_PLACEHOLDER_EMAIL_SUFFIX}`;
}

export function isMemberPlaceholderEmail(email: string | null | undefined): boolean {
  if (!email?.trim()) return false;
  const normalized = email.trim().toLowerCase();
  return normalized.endsWith(MEMBER_PLACEHOLDER_EMAIL_SUFFIX) && normalized.startsWith("member.");
}

/** Email affichable côté admin / membre, ou null si absent / placeholder. */
export function displayMemberEmail(email: string | null | undefined): string | null {
  if (!email?.trim() || isMemberPlaceholderEmail(email)) return null;
  return email.trim();
}
