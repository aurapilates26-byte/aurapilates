/**
 * Répare les débits packs parallèles (FIFO) : séances encore sur un pack plus récent
 * alors qu'un pack plus ancien a de la capacité (ex. Anissa START→GLOW vs INFINITY).
 *
 * Usage:
 *   npx tsx scripts/repair-member-pack-debit-fifo.ts <memberId>
 *   npx tsx scripts/repair-member-pack-debit-fifo.ts cmp9pbn9j00b7p401wd3w8sn0
 */
import { repairMemberParallelPackDebitsFifo } from "../lib/admin/reclaim-pack-sessions-fifo";
import { prisma } from "../lib/prisma";

async function main() {
  const memberId = process.argv[2]?.trim();
  if (!memberId) {
    console.error("Usage: npx tsx scripts/repair-member-pack-debit-fifo.ts <memberId>");
    process.exit(1);
  }

  const member = await prisma.member.findUnique({
    where: { id: memberId },
    select: { id: true, firstName: true, lastName: true },
  });
  if (!member) {
    console.error(`Adhérente introuvable: ${memberId}`);
    process.exit(1);
  }

  console.log(`Réparation FIFO: ${member.firstName} ${member.lastName} (${member.id})`);

  const before = await prisma.reservation.groupBy({
    by: ["debitedPackId"],
    where: {
      memberId,
      status: { in: ["BOOKED", "ATTENDED", "CANCELLED"] },
    },
    _count: true,
  });
  console.log("Avant (debitedPackId counts):", before);

  const result = await repairMemberParallelPackDebitsFifo(memberId);
  console.log("Résultat:", result);

  const after = await prisma.reservation.groupBy({
    by: ["debitedPackId"],
    where: {
      memberId,
      status: { in: ["BOOKED", "ATTENDED", "CANCELLED"] },
    },
    _count: true,
  });
  console.log("Après (debitedPackId counts):", after);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
