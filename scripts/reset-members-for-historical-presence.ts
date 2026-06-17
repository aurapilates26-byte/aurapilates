/**
 * Remet tous les adhérents avec pack en « En attente » pour reconstituer
 * l'historique via Planning → Historique → Présences.
 *
 * Usage :
 *   npm run reset-members-for-historical-presence
 *   npm run reset-members-for-historical-presence -- --dry-run
 */
import { loadEnvConfig } from "@next/env";
import { PrismaClient } from "@prisma/client";
import { resetMembersToPendingForHistoricalPresence } from "../lib/admin/reset-members-pending-state";

loadEnvConfig(process.cwd());

const prisma = new PrismaClient();
const dryRun = process.argv.includes("--dry-run");

async function main() {
  console.log(dryRun ? "→ Simulation (dry-run)…" : "→ Remise en attente des adhérents…");

  const result = await resetMembersToPendingForHistoricalPresence(prisma, { dryRun });

  console.log("\nRésumé :");
  console.log(`  Adhérents ciblés      : ${result.membersTargeted}`);
  console.log(`  Réservations suppr.   : ${result.reservationsDeleted}`);
  console.log(`  Présences suppr.      : ${result.attendancesDeleted}`);
  console.log(`  Check-ins suppr.      : ${result.checkInsDeleted}`);
  console.log(`  Paiements AUTO suppr. : ${result.autoPaymentsDeleted}`);

  if (dryRun) {
    console.log("\nRelancez sans --dry-run pour appliquer.");
  } else {
    console.log(
      "\nTerminé. Marquez les présences passées dans Planning → Historique :",
      "chaque 1ʳᵉ présence démarre le pack à la date du cours.",
    );
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
