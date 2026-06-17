/**
 * Secret JWT NextAuth — une seule source pour authOptions et proxy.
 * Accepte AUTH_SECRET (convention Auth.js) ou NEXTAUTH_SECRET (legacy v4).
 */
export function resolveAuthSecret(): string {
  const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
  if (!secret?.trim()) {
    throw new Error(
      "AUTH_SECRET ou NEXTAUTH_SECRET manquant. Ajoutez-en un dans .env.local pour les sessions.",
    );
  }
  return secret.trim();
}
