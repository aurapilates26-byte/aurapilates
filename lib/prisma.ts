import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
  /** Invalide le client Prisma en dev après `prisma generate` / migration. */
  var prismaSchemaFingerprint: string | undefined;
}

/** Incrémenter quand le schéma Prisma change (évite client global obsolète en dev). */
const PRISMA_SCHEMA_FINGERPRINT = "session-prospect-trial-pack-v1";

function createPrismaClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

/** En dev, recrée le client si le schéma a évolué (ex. après `prisma generate`). */
function getPrismaClient(): PrismaClient {
  if (process.env.NODE_ENV === "production") {
    return global.prisma ?? createPrismaClient();
  }

  const cached = global.prisma;
  if (
    cached &&
    global.prismaSchemaFingerprint === PRISMA_SCHEMA_FINGERPRINT &&
    "memberPendingPack" in cached &&
    "sessionProspect" in cached
  ) {
    return cached;
  }

  const client = createPrismaClient();
  global.prisma = client;
  global.prismaSchemaFingerprint = PRISMA_SCHEMA_FINGERPRINT;
  return client;
}

export const prisma = getPrismaClient();
