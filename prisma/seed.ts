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

    console.log(`Admin pret (ADMIN_LOGIN_EMAIL): ${adminEmail}`);
  } else {
    console.warn(
      "Seed admin ignore: definissez ADMIN_LOGIN_EMAIL et SEED_ADMIN_PASSWORD dans .env.local pour creer ou mettre a jour l'admin du tableau de bord.",
    );
  }

  await prisma.pack.upsert({
    where: { name: "Pack Mensuel" },
    update: {
      description: "Acces libre aux seances du studio pendant 30 jours.",
      durationDays: 30,
      isActive: true,
    },
    create: {
      name: "Pack Mensuel",
      description: "Acces libre aux seances du studio pendant 30 jours.",
      durationDays: 30,
      isActive: true,
    },
  });

  await prisma.pack.upsert({
    where: { name: "Pack Trimestriel" },
    update: {
      description: "Suivi progression et acces 3 mois.",
      durationDays: 90,
      isActive: true,
    },
    create: {
      name: "Pack Trimestriel",
      description: "Suivi progression et acces 3 mois.",
      durationDays: 90,
      isActive: true,
    },
  });

  console.log("Packs par defaut: Pack Mensuel, Pack Trimestriel");
  console.log("Les adherents (comptes MEMBRE + fiche Member) sont crees uniquement depuis le dashboard admin.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
