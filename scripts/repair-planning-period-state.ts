/**
 * Répare l'état planning après doublons / période vide :
 * peuple la période en cours depuis la précédente si vide, puis recrée les miroirs brouillon.
 *
 * Usage: npx tsx scripts/repair-planning-period-state.ts
 */
import { ensureDraftPeriodWithMirrors } from "../lib/admin/planning-draft-sync";
import { prisma } from "../lib/prisma";

function ymdRange(a: string, b: string) {
  return {
    gte: new Date(`${a}T00:00:00.000Z`),
    lte: new Date(`${b}T00:00:00.000Z`),
  };
}

async function countRange(label: string, a: string, b: string) {
  const published = await prisma.planning.count({
    where: { isDraft: false, anchorSessionYmd: ymdRange(a, b) },
  });
  const draft = await prisma.planning.count({
    where: { isDraft: true, anchorSessionYmd: ymdRange(a, b) },
  });
  console.log(`${label} (${a}..${b}): published=${published} draft=${draft}`);
}

async function main() {
  console.log("Avant réparation:");
  await countRange("Historique", "2026-08-31", "2026-09-06");
  await countRange("En cours", "2026-09-07", "2026-09-13");
  await countRange("Brouillon", "2026-09-14", "2026-09-20");

  await ensureDraftPeriodWithMirrors();

  console.log("\nAprès ensureDraftPeriodWithMirrors:");
  await countRange("Historique", "2026-08-31", "2026-09-06");
  await countRange("En cours", "2026-09-07", "2026-09-13");
  await countRange("Brouillon", "2026-09-14", "2026-09-20");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
