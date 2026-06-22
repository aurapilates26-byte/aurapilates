import { hash } from "bcryptjs";
import { loadEnvConfig } from "@next/env";
import { PrismaClient } from "@prisma/client";

loadEnvConfig(process.cwd());

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_LOGIN_EMAIL?.trim();
  const seedAdminPassword = process.env.SEED_ADMIN_PASSWORD;

  if (adminEmail && seedAdminPassword) {
    const adminPasswordHash = await hash(seedAdminPassword, 10);
    const adminName = process.env.SEED_ADMIN_NAME?.trim() || "Administrateur";

    await prisma.user.upsert({
      where: { email: adminEmail },
      update: {
        password: adminPasswordHash,
        role: "ADMIN",
        name: adminName,
      },
      create: {
        email: adminEmail,
        password: adminPasswordHash,
        role: "ADMIN",
        name: adminName,
      },
    });

    console.log(`Admin prêt (ADMIN_LOGIN_EMAIL) : ${adminEmail}`);
  } else {
    console.warn(
      "Seed admin ignoré : définissez ADMIN_LOGIN_EMAIL et SEED_ADMIN_PASSWORD dans .env.local pour créer ou mettre à jour l'admin du tableau de bord.",
    );
  }

  const superAdminEmail = process.env.SUPER_ADMIN_LOGIN_EMAIL?.trim();
  const seedSuperAdminPassword = process.env.SEED_SUPER_ADMIN_PASSWORD;

  if (superAdminEmail && seedSuperAdminPassword) {
    const superAdminPasswordHash = await hash(seedSuperAdminPassword, 10);
    const superAdminName = process.env.SEED_SUPER_ADMIN_NAME?.trim() || "Direction";

    await prisma.user.upsert({
      where: { email: superAdminEmail },
      update: {
        password: superAdminPasswordHash,
        role: "SUPER_ADMIN",
        name: superAdminName,
      },
      create: {
        email: superAdminEmail,
        password: superAdminPasswordHash,
        role: "SUPER_ADMIN",
        name: superAdminName,
      },
    });

    console.log(`Direction prête (SUPER_ADMIN_LOGIN_EMAIL) : ${superAdminEmail}`);
  } else {
    console.warn(
      "Seed direction ignoré : définissez SUPER_ADMIN_LOGIN_EMAIL et SEED_SUPER_ADMIN_PASSWORD dans .env.local.",
    );
  }

  await prisma.pack.upsert({
    where: { name: "Pack Mensuel" },
    update: {
      description: "Accès libre aux séances du studio pendant 30 jours.",
      durationDays: "30 jours",
      isActive: true,
    },
    create: {
      name: "Pack Mensuel",
      description: "Accès libre aux séances du studio pendant 30 jours.",
      durationDays: "30 jours",
      isActive: true,
    },
  });

  await prisma.pack.upsert({
    where: { name: "Pack Trimestriel" },
    update: {
      description: "Suivi de la progression et accès 3 mois.",
      durationDays: "90 jours",
      isActive: true,
    },
    create: {
      name: "Pack Trimestriel",
      description: "Suivi de la progression et accès 3 mois.",
      durationDays: "90 jours",
      isActive: true,
    },
  });

  console.log("Packs par défaut : Pack Mensuel, Pack Trimestriel");
  console.log("Les adhérentes (comptes MEMBRE + fiche Member) sont créés uniquement depuis le tableau de bord admin.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
