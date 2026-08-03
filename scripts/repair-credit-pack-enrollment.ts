/**
 * Répare un renouvellement « Crédit » sans MemberPackEnrollment.
 * Usage: npx tsx scripts/repair-credit-pack-enrollment.ts <memberId>
 */
import { loadEnvConfig } from "@next/env";
import { PrismaClient } from "@prisma/client";

loadEnvConfig(process.cwd());
const prisma = new PrismaClient();

async function main() {
  const memberId = process.argv[2];
  if (!memberId) {
    console.error("Usage: npx tsx scripts/repair-credit-pack-enrollment.ts <memberId>");
    process.exit(1);
  }

  const member = await prisma.member.findUnique({
    where: { id: memberId },
    select: {
      firstName: true,
      lastName: true,
      packId: true,
      expectedPackAmountDinars: true,
      enrollmentStatus: true,
      pack: { select: { name: true, sessionCount: true, courseQuotas: true } },
    },
  });
  if (!member?.packId || !member.pack) {
    console.error("Member/pack not found");
    process.exit(1);
  }

  const open = await prisma.memberPackEnrollment.findFirst({
    where: {
      memberId,
      packId: member.packId,
      status: { in: ["PENDING_START", "ACTIVE"] },
    },
  });
  if (open) {
    console.log("Open enrollment already exists:", open.id, open.status);
    return;
  }

  const purchasedAt = new Date();
  purchasedAt.setHours(0, 0, 0, 0);

  const created = await prisma.memberPackEnrollment.create({
    data: {
      memberId,
      packId: member.packId,
      packPaymentId: null,
      purchasedAt,
      status: "PENDING_START",
    },
  });

  // Solde catalogue pour ce nouvel achat (recompute simplifié).
  const openCount = await prisma.memberPackEnrollment.count({
    where: {
      memberId,
      packId: member.packId,
      status: { in: ["PENDING_START", "ACTIVE"] },
    },
  });
  const pack = member.pack;
  if (pack.courseQuotas.length > 0) {
    for (const q of pack.courseQuotas) {
      const remaining = q.sessionCount * openCount;
      const existing = await prisma.memberPackBalance.findFirst({
        where: { memberId, packId: member.packId, courseSlug: q.courseSlug },
      });
      if (existing) {
        await prisma.memberPackBalance.update({
          where: { id: existing.id },
          data: { remaining },
        });
      } else {
        await prisma.memberPackBalance.create({
          data: {
            memberId,
            packId: member.packId,
            courseSlug: q.courseSlug,
            remaining,
          },
        });
      }
    }
  } else if (pack.sessionCount != null) {
    const remaining = pack.sessionCount * openCount;
    const existing = await prisma.memberPackBalance.findFirst({
      where: { memberId, packId: member.packId, courseSlug: null },
    });
    if (existing) {
      await prisma.memberPackBalance.update({
        where: { id: existing.id },
        data: { remaining },
      });
    } else {
      await prisma.memberPackBalance.create({
        data: {
          memberId,
          packId: member.packId,
          courseSlug: null,
          remaining,
        },
      });
    }
  }

  console.log(
    `Repaired ${member.firstName} ${member.lastName}: created ${member.pack.name} enrollment ${created.id} (credit)`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
