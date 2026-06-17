import { loadEnvConfig } from "@next/env";
import { PrismaClient, type PlanningLevel } from "@prisma/client";

loadEnvConfig(process.cwd());
const prisma = new PrismaClient();

/** Met des niveaux variés sur les séances du 30–31/05 pour vérifier l'affichage admin. */
const SAMPLES: { startTime: string; ymd: string; level: PlanningLevel }[] = [
  { ymd: "2026-05-25", startTime: "10:00", level: "ADVANCED" },
  { ymd: "2026-05-30", startTime: "09:00", level: "ALL_LEVELS" },
  { ymd: "2026-05-30", startTime: "10:00", level: "BEGINNER" },
  { ymd: "2026-05-31", startTime: "10:00", level: "INTERMEDIATE" },
];

async function main() {
  for (const sample of SAMPLES) {
    const anchor = new Date(`${sample.ymd}T00:00:00.000Z`);
    const updated = await prisma.planning.updateMany({
      where: {
        courseSlug: "pilates-reformer",
        anchorSessionYmd: anchor,
        startTime: sample.startTime,
      },
      data: { level: sample.level },
    });
    console.log(`${sample.ymd} ${sample.startTime} → ${sample.level}: ${updated.count} row(s)`);
  }
}

main().finally(() => prisma.$disconnect());
