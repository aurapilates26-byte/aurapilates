/**
 * Supprime les créneaux publiés en double (même date + cours + heure).
 * Garde celui qui a le plus de réservations, sinon le plus ancien.
 *
 * Usage: node scripts/repair-planning-duplicate-published.mjs
 *        node scripts/repair-planning-duplicate-published.mjs --dry-run
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const dryRun = process.argv.includes("--dry-run");

function slotKey(row) {
  const ymd = row.anchorSessionYmd ? row.anchorSessionYmd.toISOString().slice(0, 10) : "null";
  return `${ymd}|${row.courseSlug}|${row.startTime}`;
}

const rows = await prisma.planning.findMany({
  where: { isDraft: false },
  select: {
    id: true,
    courseSlug: true,
    startTime: true,
    anchorSessionYmd: true,
    createdAt: true,
    _count: {
      select: {
        reservations: true,
        attendance: true,
      },
    },
  },
});

const groups = new Map();
for (const row of rows) {
  const key = slotKey(row);
  if (!groups.has(key)) groups.set(key, []);
  groups.get(key).push(row);
}

let deleted = 0;
let kept = 0;

for (const [key, list] of groups) {
  if (list.length <= 1) continue;

  const sorted = [...list].sort((a, b) => {
    const aUsage = a._count.reservations + a._count.attendance;
    const bUsage = b._count.reservations + b._count.attendance;
    if (bUsage !== aUsage) return bUsage - aUsage;
    return a.createdAt.getTime() - b.createdAt.getTime();
  });

  const [winner, ...losers] = sorted;
  kept += 1;

  for (const loser of losers) {
    const usage = loser._count.reservations + loser._count.attendance;
    if (usage > 0) {
      console.warn(`SKIP (réservations liées): ${key} -> ${loser.id}`);
      continue;
    }
    console.log(`${dryRun ? "[dry-run] " : ""}DELETE ${key} -> ${loser.id} (keep ${winner.id})`);
    if (!dryRun) {
      await prisma.planning.delete({ where: { id: loser.id } });
    }
    deleted += 1;
  }
}

console.log(`\nGroupes en double traités: ${[...groups.values()].filter((g) => g.length > 1).length}`);
console.log(`Créneaux conservés: ${kept}`);
console.log(`Créneaux supprimés: ${deleted}${dryRun ? " (simulation)" : ""}`);

await prisma.$disconnect();
