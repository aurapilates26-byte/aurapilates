/**
 * Ajoute les 7 adhérentes manuelles avec date d'inscription passée.
 *
 * Usage : npm run seed-seven-members
 *         npm run seed-seven-members -- --dry-run
 */
import { loadEnvConfig } from "@next/env";
import { PrismaClient, type Prisma } from "@prisma/client";
import { parseYmdToPrismaDate } from "../lib/calendar-day";

loadEnvConfig(process.cwd());

const prisma = new PrismaClient();
const dryRun = process.argv.includes("--dry-run");

type SeedMember = {
  firstName: string;
  lastName: string;
  phone: string;
  birthDateYmd: string | null;
  enrolledAtYmd: string;
  packName: string;
};

const MEMBERS: SeedMember[] = [
  {
    firstName: "Hend",
    lastName: "Khadraoui",
    phone: "99357206",
    birthDateYmd: "1973-11-21",
    enrolledAtYmd: "2026-06-10",
    packName: "AURA HARMONY",
  },
  {
    firstName: "Fatma",
    lastName: "Zouaidi",
    phone: "28126231",
    birthDateYmd: null,
    enrolledAtYmd: "2026-06-11",
    packName: "AURA GRACE",
  },
  {
    firstName: "Nouha",
    lastName: "Neffeti",
    phone: "93930579",
    birthDateYmd: "1997-07-12",
    enrolledAtYmd: "2026-06-12",
    packName: "AURA START",
  },
  {
    firstName: "Yasmine",
    lastName: "Rjeb",
    phone: "95857505",
    birthDateYmd: "1997-04-06",
    enrolledAtYmd: "2026-06-12",
    packName: "AURA START",
  },
  {
    firstName: "Fatma",
    lastName: "Ben Hassen",
    phone: "29098006",
    birthDateYmd: "1993-10-07",
    enrolledAtYmd: "2026-06-13",
    packName: "AURA START",
  },
  {
    firstName: "Chaima",
    lastName: "Arfaoui",
    phone: "96616545",
    birthDateYmd: "1989-04-19",
    enrolledAtYmd: "2026-06-14",
    packName: "AURA START",
  },
  {
    firstName: "Farah",
    lastName: "Arres",
    phone: "22713638",
    birthDateYmd: "1997-10-14",
    enrolledAtYmd: "2026-06-14",
    packName: "AURA START",
  },
];

function enrolledAtLocal(enrolledAtYmd: string): Date {
  const [y, m, d] = enrolledAtYmd.split("-").map(Number);
  return new Date(y!, m! - 1, d!, 12, 0, 0, 0);
}

async function findPackByName(name: string) {
  return prisma.pack.findFirst({
    where: { name: { equals: name, mode: "insensitive" }, isActive: true },
    select: {
      id: true,
      name: true,
      priceCents: true,
      sessionCount: true,
      courseQuotas: { select: { courseSlug: true, sessionCount: true } },
    },
  });
}

async function findStaffUserId(): Promise<string | null> {
  const staff = await prisma.user.findFirst({
    where: { role: { in: ["SUPER_ADMIN", "ADMIN"] } },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
  return staff?.id ?? null;
}

async function memberExists(phone: string, firstName: string, lastName: string): Promise<boolean> {
  const rows = await prisma.member.findMany({
    where: { phone },
    select: { firstName: true, lastName: true },
  });
  return rows.some(
    (r) =>
      r.firstName?.trim().toLowerCase() === firstName.trim().toLowerCase() &&
      r.lastName?.trim().toLowerCase() === lastName.trim().toLowerCase(),
  );
}

async function resetBalances(tx: Prisma.TransactionClient, memberId: string, packId: string) {
  const pack = await tx.pack.findUnique({
    where: { id: packId },
    select: { id: true, sessionCount: true, courseQuotas: { select: { courseSlug: true, sessionCount: true } } },
  });
  if (!pack) return;

  await tx.memberPackBalance.deleteMany({ where: { memberId, packId } });

  if (pack.courseQuotas.length > 0) {
    await tx.memberPackBalance.createMany({
      data: pack.courseQuotas.map((q) => ({
        memberId,
        packId: pack.id,
        courseSlug: q.courseSlug,
        remaining: q.sessionCount,
      })),
    });
    return;
  }

  if (pack.sessionCount != null) {
    await tx.memberPackBalance.create({
      data: { memberId, packId: pack.id, courseSlug: null, remaining: pack.sessionCount },
    });
  }
}

async function main() {
  const staffUserId = await findStaffUserId();
  if (!staffUserId && !dryRun) {
    throw new Error("Aucun compte ADMIN/SUPER_ADMIN trouvé pour enregistrer le paiement.");
  }

  console.log(dryRun ? "→ Simulation (dry-run)…\n" : "→ Ajout des 7 adhérentes…\n");

  let created = 0;
  let skipped = 0;

  for (const row of MEMBERS) {
    const pack = await findPackByName(row.packName);
    if (!pack) {
      console.error(`✗ ${row.firstName} ${row.lastName} — pack introuvable : « ${row.packName} »`);
      continue;
    }

    if (pack.priceCents == null) {
      console.error(`✗ ${row.firstName} ${row.lastName} — pack sans prix : ${pack.name}`);
      continue;
    }
    const priceDinars = pack.priceCents;

    if (await memberExists(row.phone, row.firstName, row.lastName)) {
      console.log(`· ${row.firstName} ${row.lastName} — déjà en base (ignoré)`);
      skipped += 1;
      continue;
    }

    const enrolledAt = enrolledAtLocal(row.enrolledAtYmd);
    const birthDate = row.birthDateYmd ? parseYmdToPrismaDate(row.birthDateYmd) : null;
    const paidAt = parseYmdToPrismaDate(row.enrolledAtYmd) ?? enrolledAt;
    const dateLabel = row.enrolledAtYmd.split("-").reverse().join("/");
    const label = `${row.firstName} ${row.lastName} · ${row.phone} · inscrit ${dateLabel} · ${pack.name}`;

    if (dryRun) {
      console.log(`  [dry-run] ${label}`);
      created += 1;
      continue;
    }

    await prisma.$transaction(async (tx) => {
      const member = await tx.member.create({
        data: {
          firstName: row.firstName,
          lastName: row.lastName,
          phone: row.phone,
          birthDate,
          packId: pack.id,
          packStartedAt: null,
          isActive: false,
          enrollmentStatus: "ACTIVE",
          createdAt: enrolledAt,
          updatedAt: enrolledAt,
        },
      });

      await resetBalances(tx, member.id, pack.id);

      await tx.packPayment.create({
        data: {
          memberId: member.id,
          packId: pack.id,
          amountDinars: priceDinars,
          listPriceDinars: priceDinars,
          paidAt,
          source: "AUTO",
          paymentKind: "FULL",
          paymentMethod: "CASH",
          note: `Inscription manuelle (${dateLabel})`,
          recordedByUserId: staffUserId!,
        },
      });
    });

    console.log(`✓ ${label}`);
    created += 1;
  }

  console.log(`\nRésumé : ${created} ajouté(s), ${skipped} ignoré(s).`);
  if (!dryRun && created > 0) {
    console.log(
      "\nProchaine étape : marquer les présences passées dans Planning → Historique pour démarrer chaque pack.",
    );
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
