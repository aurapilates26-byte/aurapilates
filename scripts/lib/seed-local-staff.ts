import { hash } from "bcryptjs";
import type { PrismaClient } from "@prisma/client";

const BCRYPT_ROUNDS = 10;

export type SeedLocalStaffResult = {
  superAdmin: { email: string; role: "SUPER_ADMIN"; name: string };
  admin?: { email: string; role: "ADMIN"; name: string; source: "env" | "backup" };
};

/**
 * Crée ou met à jour les comptes staff locaux.
 * Les mots de passe sont toujours stockés en bcrypt (jamais en clair en base).
 */
export async function seedLocalStaffAccounts(prisma: PrismaClient): Promise<SeedLocalStaffResult> {
  const superEmail = process.env.SUPER_ADMIN_LOGIN_EMAIL?.trim() || "superadmin@gmail.com";
  const superPassword = process.env.SEED_SUPER_ADMIN_PASSWORD?.trim() || "123654";
  const superName = process.env.SEED_SUPER_ADMIN_NAME?.trim() || "Direction";

  const superHash = await hash(superPassword, BCRYPT_ROUNDS);
  const superAdmin = await prisma.user.upsert({
    where: { email: superEmail },
    update: { password: superHash, role: "SUPER_ADMIN", name: superName },
    create: { email: superEmail, password: superHash, role: "SUPER_ADMIN", name: superName },
    select: { email: true, role: true, name: true },
  });

  const result: SeedLocalStaffResult = {
    superAdmin: { email: superAdmin.email, role: "SUPER_ADMIN", name: superAdmin.name ?? superName },
  };

  const adminEmail = process.env.ADMIN_LOGIN_EMAIL?.trim();
  const adminPassword = process.env.SEED_ADMIN_PASSWORD?.trim();
  if (adminEmail && adminPassword) {
    const adminName = process.env.SEED_ADMIN_NAME?.trim() || "Administrateur";
    const adminHash = await hash(adminPassword, BCRYPT_ROUNDS);
    const admin = await prisma.user.upsert({
      where: { email: adminEmail },
      update: { password: adminHash, role: "ADMIN", name: adminName },
      create: { email: adminEmail, password: adminHash, role: "ADMIN", name: adminName },
      select: { email: true, role: true, name: true },
    });
    result.admin = {
      email: admin.email,
      role: "ADMIN",
      name: admin.name ?? adminName,
      source: "env",
    };
  } else if (adminEmail) {
    const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
    if (existing?.role === "ADMIN") {
      result.admin = {
        email: existing.email,
        role: "ADMIN",
        name: existing.name ?? "Administrateur",
        source: "backup",
      };
    }
  }

  return result;
}
