/**
 * Crée ou met à jour les comptes staff locaux (SUPER_ADMIN + ADMIN optionnel).
 * Les mots de passe sont hashés en bcrypt avant insertion en base.
 *
 * Usage : npm run create-super-admin
 *
 * Variables .env.local :
 *   SUPER_ADMIN_LOGIN_EMAIL, SEED_SUPER_ADMIN_PASSWORD, SEED_SUPER_ADMIN_NAME
 *   ADMIN_LOGIN_EMAIL, SEED_ADMIN_PASSWORD (optionnel — sinon admin du backup conservé)
 */
import { loadEnvConfig } from "@next/env";
import { PrismaClient } from "@prisma/client";
import { seedLocalStaffAccounts } from "./lib/seed-local-staff";

loadEnvConfig(process.cwd());

const prisma = new PrismaClient();

async function main() {
  const result = await seedLocalStaffAccounts(prisma);

  console.log("Comptes staff locaux prêts (mot de passe hashé bcrypt en base) :\n");
  console.log("  Direction (SUPER_ADMIN)");
  console.log(`    Email : ${result.superAdmin.email}`);
  console.log(`    Nom   : ${result.superAdmin.name}`);
  console.log(`    MDP   : valeur de SEED_SUPER_ADMIN_PASSWORD dans .env.local`);

  if (result.admin) {
    console.log("\n  Admin (ADMIN)");
    console.log(`    Email  : ${result.admin.email}`);
    console.log(`    Nom    : ${result.admin.name}`);
    if (result.admin.source === "env") {
      console.log("    MDP    : valeur de SEED_ADMIN_PASSWORD dans .env.local");
    } else {
      console.log("    MDP    : hash du backup (définir SEED_ADMIN_PASSWORD pour un MDP local connu)");
    }
  }

  console.log("\nConnexion : /connexion");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
