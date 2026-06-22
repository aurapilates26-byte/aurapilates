/**
 * Répare les séances Pilates reformer dont le niveau est null en base.
 * Cause : avant correction, « initiation » (ALL_LEVELS) était enregistré comme null.
 *
 * Usage :
 *   npx tsx scripts/repair-planning-null-levels.ts          # aperçu
 *   npx tsx scripts/repair-planning-null-levels.ts --apply  # applique ALL_LEVELS
 */
import { loadEnvConfig } from "@next/env";
import { PrismaClient } from "@prisma/client";
import { REFORMER_PLANNING_COURSE_SLUG } from "@/lib/planning-course-level";

loadEnvConfig(process.cwd());
const prisma = new PrismaClient();
const apply = process.argv.includes("--apply");

async function main() {
  const rows = await prisma.planning.findMany({
    where: { courseSlug: REFORMER_PLANNING_COURSE_SLUG, level: null },
    select: {
      id: true,
      startTime: true,
      anchorSessionYmd: true,
      dayOfWeek: true,
    },
    orderBy: [{ anchorSessionYmd: "asc" }, { startTime: "asc" }],
  });

  console.log(`Séances reformer sans niveau : ${rows.length}`);
  for (const row of rows) {
    const date = row.anchorSessionYmd?.toISOString().slice(0, 10) ?? "?";
    console.log(`  - ${date} ${row.startTime} (${row.id})`);
  }

  if (!apply) {
    console.log("\nAucune modification (ajoutez --apply pour définir ALL_LEVELS / initiation).");
    return;
  }

  const result = await prisma.planning.updateMany({
    where: { courseSlug: REFORMER_PLANNING_COURSE_SLUG, level: null },
    data: { level: "ALL_LEVELS" },
  });
  console.log(`\n${result.count} séance(s) mises à jour → initiation (ALL_LEVELS).`);
}

main().finally(() => prisma.$disconnect());
