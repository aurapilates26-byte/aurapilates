import { loadEnvConfig } from "@next/env";
import { PrismaClient } from "@prisma/client";
import { formatYmdPrismaDate } from "../lib/calendar-day";

loadEnvConfig(process.cwd());
const prisma = new PrismaClient();

async function main() {
  const [users, members, packs, planning, qrcodes, payments, period, archives] = await Promise.all([
    prisma.user.count(),
    prisma.member.count(),
    prisma.pack.count(),
    prisma.planning.count(),
    prisma.qrCode.count(),
    prisma.packPayment.count(),
    prisma.studioPlanningPeriod.findUnique({ where: { id: "singleton" } }),
    prisma.studioPlanningPeriodArchive.findMany({ orderBy: { periodStartDate: "desc" } }),
  ]);

  const sampleMembers = await prisma.member.findMany({
    take: 3,
    select: { firstName: true, lastName: true, phone: true, pack: { select: { name: true } } },
  });
  const staff = await prisma.user.findMany({
    where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } },
    select: { email: true, role: true, name: true },
  });

  console.log(
    JSON.stringify(
      {
        users,
        members,
        packs,
        planning,
        qrcodes,
        payments,
        staff,
        periodStart: period ? formatYmdPrismaDate(period.periodStartDate) : null,
        archives: archives.map((a) => ({
          start: formatYmdPrismaDate(a.periodStartDate),
          end: formatYmdPrismaDate(a.periodEndDate),
        })),
        sampleMembers,
      },
      null,
      2,
    ),
  );
}

main()
  .finally(() => prisma.$disconnect());
