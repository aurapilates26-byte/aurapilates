/**
 * Aligne l'historique des périodes planning (supprime 01/05 et 11/05, crée 18/05 et 25/05).
 * Usage : npm run sync-planning-period-archives
 */
import { loadEnvConfig } from "@next/env";
import { PrismaClient } from "@prisma/client";
import { bookingWindowDateRange } from "@/lib/planning-booking-window";
import {
  formatYmdLocal,
  formatYmdPrismaDate,
  parseYmdLocal,
  parseYmdToPrismaDate,
} from "@/lib/calendar-day";
import type { PlanningBookingWindow } from "@/types/admin/planning";

loadEnvConfig(process.cwd());

const prisma = new PrismaClient();

const KNOWN_SEEDS: { periodStartYmd: string; bookingWindow: PlanningBookingWindow }[] = [
  { periodStartYmd: "2026-05-18", bookingWindow: "WEEKLY" },
  { periodStartYmd: "2026-05-25", bookingWindow: "WEEKLY" },
  { periodStartYmd: "2026-06-01", bookingWindow: "WEEKLY" },
  { periodStartYmd: "2026-06-08", bookingWindow: "WEEKLY" },
];

const OBSOLETE_STARTS = ["2026-05-01", "2026-05-11"];

function periodStartFromRow(periodStartDate: Date): Date {
  const ymd = formatYmdPrismaDate(periodStartDate);
  return parseYmdLocal(ymd) ?? periodStartDate;
}

async function main() {
  let removed = 0;
  for (const wrongYmd of OBSOLETE_STARTS) {
    const start = parseYmdToPrismaDate(wrongYmd);
    if (!start) continue;
    const result = await prisma.studioPlanningPeriodArchive.deleteMany({
      where: { periodStartDate: start },
    });
    removed += result.count;
  }

  let created = 0;
  let updated = 0;

  for (const seed of KNOWN_SEEDS) {
    const start = parseYmdToPrismaDate(seed.periodStartYmd);
    if (!start) continue;
    const periodStart = periodStartFromRow(start);
    const { to } = bookingWindowDateRange(seed.bookingWindow, periodStart);
    const periodEndDate = parseYmdToPrismaDate(formatYmdLocal(to));
    if (!periodEndDate) continue;

    const existing = await prisma.studioPlanningPeriodArchive.findUnique({
      where: { periodStartDate: start },
    });

    if (existing) {
      const endYmd = formatYmdPrismaDate(existing.periodEndDate);
      const expectedEndYmd = formatYmdLocal(to);
      if (endYmd !== expectedEndYmd || existing.bookingWindow !== seed.bookingWindow) {
        await prisma.studioPlanningPeriodArchive.update({
          where: { periodStartDate: start },
          data: {
            bookingWindow: seed.bookingWindow,
            periodEndDate,
          },
        });
        updated += 1;
      }
    } else {
      await prisma.studioPlanningPeriodArchive.create({
        data: {
          bookingWindow: seed.bookingWindow,
          periodStartDate: start,
          periodEndDate,
        },
      });
      created += 1;
    }
  }

  const items = await prisma.studioPlanningPeriodArchive.findMany({
    orderBy: { periodStartDate: "desc" },
  });

  console.log({ removed, created, updated });
  for (const row of items) {
    const startYmd = formatYmdPrismaDate(row.periodStartDate);
    const endYmd = formatYmdPrismaDate(row.periodEndDate);
    console.log(`- ${startYmd} → ${endYmd}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
