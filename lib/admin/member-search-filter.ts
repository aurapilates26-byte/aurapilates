import type { Prisma } from "@prisma/client";

/** Recherche adhérente par prénom, nom ou téléphone (supporte « Nadia Mezzi »). */
export function buildMemberSearchWhere(query: string): Prisma.MemberWhereInput {
  const tokens = query
    .trim()
    .split(/\s+/)
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 4);

  if (tokens.length === 0) return {};

  const tokenClause = (token: string): Prisma.MemberWhereInput => ({
    OR: [
      { firstName: { contains: token, mode: "insensitive" } },
      { lastName: { contains: token, mode: "insensitive" } },
      { phone: { contains: token, mode: "insensitive" } },
    ],
  });

  return tokens.length > 1 ? { AND: tokens.map(tokenClause) } : tokenClause(tokens[0]!);
}
