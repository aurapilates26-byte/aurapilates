/**
 * Restaure backup.sql (données prod mai 2026) dans une base locale au schéma Prisma actuel.
 *
 * Usage : npm run restore-backup-local
 *
 * Étapes :
 * 1. Supprime toute la data locale et recrée le schéma actuel (prisma db push --force-reset)
 * 2. Importe les données du backup (adhérentes, packs, QR, planning…)
 * 3. Complète les tables/colonnes ajoutées depuis le backup (caisse, périodes, paiements)
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { execSync } from "node:child_process";
import { loadEnvConfig } from "@next/env";
import { PrismaClient, type Prisma } from "@prisma/client";
import { copyBlockByTable, parsePgCopyBlocks } from "./lib/parse-pg-copy";
import { seedLocalStaffAccounts } from "./lib/seed-local-staff";
import { formatYmdLocal, parseYmdToPrismaDate } from "../lib/calendar-day";
import { bookingWindowDateRange } from "../lib/planning-booking-window";
import { resetMembersToPendingForHistoricalPresence } from "../lib/admin/reset-members-pending-state";

loadEnvConfig(process.cwd());

const prisma = new PrismaClient();
const ROOT = process.cwd();
const BACKUP_PATH = resolve(ROOT, "backup.sql");

const IMPORT_TABLES = [
  "users",
  "packs",
  "pack_course_quotas",
  "pack_features",
  "coaches",
  "planning",
  "members",
  "member_pack_balances",
  "qrcodes",
] as const;

const OBSOLETE_ARCHIVE_STARTS = ["2026-05-01", "2026-05-11"];
const ARCHIVE_SEEDS = [
  { periodStartYmd: "2026-05-18", bookingWindow: "WEEKLY" as const },
  { periodStartYmd: "2026-05-25", bookingWindow: "WEEKLY" as const },
  { periodStartYmd: "2026-06-01", bookingWindow: "WEEKLY" as const },
  { periodStartYmd: "2026-06-08", bookingWindow: "WEEKLY" as const },
];

/** Période affichée au moment du backup (semaine du 1er juin 2026). */
const CURRENT_PERIOD_START_YMD = "2026-06-01";

function toDate(value: string | null): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function toInt(value: string | null): number | null {
  if (value === null) return null;
  const n = Number(value);
  return Number.isNaN(n) ? null : n;
}

function toBool(value: string | null): boolean {
  return value === "t" || value === "true" || value === "1";
}

function rowToObject(columns: string[], row: (string | null)[]): Record<string, string | null> {
  const out: Record<string, string | null> = {};
  columns.forEach((col, idx) => {
    out[col] = row[idx] ?? null;
  });
  return out;
}

function resetDatabase() {
  console.log("→ Suppression de toutes les données + schéma actuel (prisma db push --force-reset)…");
  execSync("npx prisma db push --force-reset --accept-data-loss", {
    cwd: ROOT,
    stdio: "inherit",
    env: process.env,
  });
}

async function importCopyTable(table: string, columns: string[], rows: (string | null)[][]) {
  if (rows.length === 0) {
    console.log(`  · ${table} : vide`);
    return;
  }

  switch (table) {
    case "users": {
      await prisma.user.createMany({
        data: rows.map((row) => {
          const r = rowToObject(columns, row);
          return {
            id: r.id!,
            name: r.name,
            email: r.email!,
            image: r.image,
            password: r.password,
            role: r.role as Prisma.UserCreateManyInput["role"],
            createdAt: toDate(r.createdAt)!,
            updatedAt: toDate(r.updatedAt)!,
          };
        }),
        skipDuplicates: true,
      });
      break;
    }
    case "packs": {
      await prisma.pack.createMany({
        data: rows.map((row) => {
          const r = rowToObject(columns, row);
          return {
            id: r.id!,
            category: r.category,
            name: r.name!,
            description: r.description,
            sessionCount: toInt(r.sessionCount),
            priceCents: toInt(r.priceCents),
            durationDays: r.durationDays,
            isActive: toBool(r.isActive),
            createdAt: toDate(r.createdAt)!,
            updatedAt: toDate(r.updatedAt)!,
          };
        }),
        skipDuplicates: true,
      });
      break;
    }
    case "pack_course_quotas": {
      await prisma.packCourseQuota.createMany({
        data: rows.map((row) => {
          const r = rowToObject(columns, row);
          return {
            id: r.id!,
            packId: r.packId!,
            courseSlug: r.courseSlug!,
            sessionCount: toInt(r.sessionCount)!,
            createdAt: toDate(r.createdAt)!,
            updatedAt: toDate(r.updatedAt)!,
          };
        }),
        skipDuplicates: true,
      });
      break;
    }
    case "pack_features": {
      await prisma.packFeature.createMany({
        data: rows.map((row) => {
          const r = rowToObject(columns, row);
          return {
            id: r.id!,
            packId: r.packId!,
            label: r.label!,
            sortOrder: toInt(r.sortOrder) ?? 0,
            createdAt: toDate(r.createdAt)!,
            updatedAt: toDate(r.updatedAt)!,
          };
        }),
        skipDuplicates: true,
      });
      break;
    }
    case "coaches": {
      await prisma.coach.createMany({
        data: rows.map((row) => {
          const r = rowToObject(columns, row);
          return {
            id: r.id!,
            imageUrl: r.imageUrl,
            firstName: r.firstName!,
            lastName: r.lastName!,
            description: r.description,
            email: r.email,
            phone: r.phone,
            isActive: toBool(r.isActive),
            createdAt: toDate(r.createdAt)!,
            updatedAt: toDate(r.updatedAt)!,
          };
        }),
        skipDuplicates: true,
      });
      break;
    }
    case "planning": {
      await prisma.planning.createMany({
        data: rows.map((row) => {
          const r = rowToObject(columns, row);
          return {
            id: r.id!,
            courseSlug: r.courseSlug!,
            coachId: r.coachId,
            dayOfWeek: r.dayOfWeek as Prisma.PlanningCreateManyInput["dayOfWeek"],
            level: r.level as Prisma.PlanningCreateManyInput["level"],
            bookingWindow: r.bookingWindow as Prisma.PlanningCreateManyInput["bookingWindow"],
            startTime: r.startTime ?? "00:00",
            endTime: r.endTime ?? "00:00",
            durationMinutes: toInt(r.durationMinutes)!,
            capacity: toInt(r.capacity)!,
            waitlistCapacity: toInt(r.waitlistCapacity),
            createdAt: toDate(r.createdAt)!,
            updatedAt: toDate(r.updatedAt)!,
          };
        }),
        skipDuplicates: true,
      });
      break;
    }
    case "members": {
      await prisma.member.createMany({
        data: rows.map((row) => {
          const r = rowToObject(columns, row);
          return {
            id: r.id!,
            userId: r.userId,
            firstName: r.firstName,
            lastName: r.lastName,
            phone: r.phone,
            birthDate: toDate(r.birthDate),
            packId: r.packId,
            packStartedAt: null,
            isActive: false,
            createdAt: toDate(r.createdAt)!,
            updatedAt: toDate(r.updatedAt)!,
          };
        }),
        skipDuplicates: true,
      });
      break;
    }
    case "member_pack_balances": {
      await prisma.memberPackBalance.createMany({
        data: rows.map((row) => {
          const r = rowToObject(columns, row);
          return {
            id: r.id!,
            memberId: r.memberId!,
            packId: r.packId!,
            courseSlug: r.courseSlug,
            remaining: toInt(r.remaining)!,
            createdAt: toDate(r.createdAt)!,
            updatedAt: toDate(r.updatedAt)!,
          };
        }),
        skipDuplicates: true,
      });
      break;
    }
    case "qrcodes": {
      await prisma.qrCode.createMany({
        data: rows.map((row) => {
          const r = rowToObject(columns, row);
          return {
            id: r.id!,
            publicId: r.publicId!,
            qrKey: r.qrKey ?? "",
            name: r.name!,
            status: r.status as Prisma.QrCodeCreateManyInput["status"],
            assignedMemberId: r.assignedMemberId,
            createdByUserId: r.createdByUserId!,
            assignedAt: toDate(r.assignedAt),
            createdAt: toDate(r.createdAt)!,
            updatedAt: toDate(r.updatedAt)!,
          };
        }),
        skipDuplicates: true,
      });
      break;
    }
    case "reservations": {
      await prisma.reservation.createMany({
        data: rows.map((row) => {
          const r = rowToObject(columns, row);
          return {
            id: r.id!,
            memberId: r.memberId!,
            planningId: r.planningId!,
            sessionDate: toDate(r.sessionDate)!,
            status: r.status as Prisma.ReservationCreateManyInput["status"],
            packRefundedAt: toDate(r.packRefundedAt),
            createdAt: toDate(r.createdAt)!,
            updatedAt: toDate(r.updatedAt)!,
          };
        }),
        skipDuplicates: true,
      });
      break;
    }
    case "attendance": {
      await prisma.attendance.createMany({
        data: rows.map((row) => {
          const r = rowToObject(columns, row);
          return {
            id: r.id!,
            reservationId: r.reservationId!,
            memberId: r.memberId!,
            planningId: r.planningId!,
            sessionDate: toDate(r.sessionDate)!,
            markedAt: toDate(r.markedAt)!,
            markedBy: r.markedBy ?? "STAFF_KEY",
          };
        }),
        skipDuplicates: true,
      });
      break;
    }
    case "checkins": {
      await prisma.checkIn.createMany({
        data: rows.map((row) => {
          const r = rowToObject(columns, row);
          return {
            id: r.id!,
            memberId: r.memberId!,
            qrCodeId: r.qrCodeId!,
            reservationId: r.reservationId,
            scannedAt: toDate(r.scannedAt)!,
            method: r.method!,
          };
        }),
        skipDuplicates: true,
      });
      break;
    }
    default:
      console.warn(`  ! Table ignorée : ${table}`);
      return;
  }

  console.log(`  · ${table} : ${rows.length} ligne(s)`);
}

async function seedPlanningPeriod() {
  const start = parseYmdToPrismaDate(CURRENT_PERIOD_START_YMD);
  if (!start) return;

  await prisma.studioPlanningPeriod.upsert({
    where: { id: "singleton" },
    create: {
      id: "singleton",
      bookingWindow: "WEEKLY",
      periodStartDate: start,
    },
    update: {
      bookingWindow: "WEEKLY",
      periodStartDate: start,
      draftPeriodStartDate: null,
      draftBookingWindow: null,
      draftPublishAt: null,
    },
  });

  console.log(`→ Période affichée : ${CURRENT_PERIOD_START_YMD}`);
}

async function seedPlanningArchives() {
  for (const wrongYmd of OBSOLETE_ARCHIVE_STARTS) {
    const start = parseYmdToPrismaDate(wrongYmd);
    if (!start) continue;
    await prisma.studioPlanningPeriodArchive.deleteMany({ where: { periodStartDate: start } });
  }

  for (const seed of ARCHIVE_SEEDS) {
    const start = parseYmdToPrismaDate(seed.periodStartYmd);
    if (!start) continue;
    const localStart = new Date(
      start.getUTCFullYear(),
      start.getUTCMonth(),
      start.getUTCDate(),
    );
    const { to } = bookingWindowDateRange(seed.bookingWindow, localStart);
    const periodEndDate = parseYmdToPrismaDate(formatYmdLocal(to));
    if (!periodEndDate) continue;

    await prisma.studioPlanningPeriodArchive.upsert({
      where: { periodStartDate: start },
      create: {
        bookingWindow: seed.bookingWindow,
        periodStartDate: start,
        periodEndDate,
      },
      update: {
        bookingWindow: seed.bookingWindow,
        periodEndDate,
      },
    });
  }

  console.log("→ Archives planning (18/05, 25/05, 01/06, 08/06)");
}

async function backfillPackPayments() {
  const members = await prisma.member.findMany({
    where: { packId: { not: null }, packStartedAt: { not: null } },
    include: { pack: true },
  });

  let created = 0;
  for (const member of members) {
    if (!member.packId || !member.packStartedAt || !member.pack?.priceCents) continue;

    const paidAt = new Date(
      member.packStartedAt.getFullYear(),
      member.packStartedAt.getMonth(),
      member.packStartedAt.getDate(),
    );

    const existing = await prisma.packPayment.findFirst({
      where: { memberId: member.id, packId: member.packId, paidAt },
    });
    if (existing) continue;

    await prisma.packPayment.create({
      data: {
        memberId: member.id,
        packId: member.packId,
        amountDinars: member.pack.priceCents,
        listPriceDinars: member.pack.priceCents,
        paidAt,
        source: "AUTO",
        paymentKind: "FULL",
        paymentMethod: "CASH",
      },
    });
    created += 1;
  }

  console.log(`→ Paiements pack reconstitués : ${created}`);
}

async function printSummary() {
  const [users, members, packs, qrcodes, planning, payments, archives, staff] = await Promise.all([
    prisma.user.count(),
    prisma.member.count(),
    prisma.pack.count(),
    prisma.qrCode.count({ where: { status: "ACTIVE" } }),
    prisma.planning.count({ where: { isDraft: false } }),
    prisma.packPayment.count(),
    prisma.studioPlanningPeriodArchive.count(),
    prisma.user.findMany({
      where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } },
      select: { email: true, role: true },
    }),
  ]);

  console.log("\nRésumé :");
  console.log(`  Utilisateurs : ${users}`);
  console.log(`  Adhérentes    : ${members}`);
  console.log(`  Staff        : ${staff.map((s) => `${s.email} (${s.role})`).join(", ")}`);
  console.log(`  Packs        : ${packs}`);
  console.log(`  QR actifs    : ${qrcodes}`);
  console.log(`  Créneaux     : ${planning}`);
  console.log(`  Paiements    : ${payments}`);
  console.log(`  Archives     : ${archives}`);
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL manquant (.env.local)");
  }

  const sql = readFileSync(BACKUP_PATH, "utf8");
  const blocks = parsePgCopyBlocks(sql);

  console.log(`Backup : ${BACKUP_PATH}`);
  resetDatabase();

  console.log("→ Import des données…");
  for (const table of IMPORT_TABLES) {
    const block = copyBlockByTable(blocks, table);
    if (!block) {
      console.log(`  · ${table} : absent du backup`);
      continue;
    }
    await importCopyTable(block.table, block.columns, block.rows);
  }

  await seedPlanningPeriod();
  await seedPlanningArchives();

  console.log("→ Adhérentes remises en attente (pack non démarré, sans réservations importées)…");
  const resetSummary = await resetMembersToPendingForHistoricalPresence(prisma, {
    clearAutoPackPayments: true,
  });
  console.log(
    `  · ${resetSummary.membersTargeted} adhérentes · ${resetSummary.reservationsDeleted} réservations supprimées`,
  );

  const staff = await seedLocalStaffAccounts(prisma);
  console.log(`→ SUPER_ADMIN créé (bcrypt) : ${staff.superAdmin.email}`);
  if (staff.admin) {
    console.log(
      `→ ADMIN : ${staff.admin.email} (${staff.admin.source === "env" ? "MDP .env hashé" : "hash backup conservé"})`,
    );
  }
  await printSummary();

  console.log("\nRestauration terminée. Relancez l'app (npm run dev).");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
