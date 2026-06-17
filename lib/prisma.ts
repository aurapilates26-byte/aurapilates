import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

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
  if (cached && "memberPendingPack" in cached) {
    return cached;
  }

  const client = createPrismaClient();
  global.prisma = client;
  return client;
}

export const prisma = getPrismaClient();
