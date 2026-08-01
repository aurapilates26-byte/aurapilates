/**
 * Recalcule les soldes pack (modèle débit à la présence = ATTENDED seulement).
 *
 * Usage:
 *   npx tsx scripts/recompute-pack-balances-presence-debit.ts
 *   npx tsx scripts/recompute-pack-balances-presence-debit.ts cmp5d9vn5006zl401fo5j5q04
 */
import { loadEnvConfig } from "@next/env";
import { PrismaClient } from "@prisma/client";

loadEnvConfig(process.cwd());

const prisma = new PrismaClient();

async function recomputeMember(memberId: string): Promise<void> {
  const enrollments = await prisma.memberPackEnrollment.findMany({
    where: { memberId },
    orderBy: [{ purchasedAt: "asc" }, { createdAt: "asc" }],
    select: {
      packId: true,
      pack: {
        select: {
          id: true,
          sessionCount: true,
          courseQuotas: { select: { courseSlug: true, sessionCount: true } },
        },
      },
    },
  });

  const packIds = [...new Set(enrollments.map((e) => e.packId))];
  if (packIds.length === 0) {
    const member = await prisma.member.findUnique({
      where: { id: memberId },
      select: {
        packId: true,
        pack: {
          select: {
            id: true,
            sessionCount: true,
            courseQuotas: { select: { courseSlug: true, sessionCount: true } },
          },
        },
      },
    });
    if (member?.packId && member.pack) {
      packIds.push(member.packId);
      enrollments.push({ packId: member.packId, pack: member.pack });
    }
  }

  const attended = await prisma.reservation.findMany({
    where: { memberId, status: "ATTENDED" },
    orderBy: [{ sessionDate: "asc" }, { createdAt: "asc" }],
    select: {
      debitedPackId: true,
      planning: { select: { courseSlug: true } },
    },
  });

  for (const packId of packIds) {
    const pack = enrollments.find((e) => e.packId === packId)?.pack;
    if (!pack) continue;

    const purchaseCount = Math.max(
      1,
      enrollments.filter((e) => e.packId === packId).length,
    );
    const isMixed = pack.courseQuotas.length > 0;

    const usedByCourse = new Map<string, number>();
    let usedTotal = 0;
    for (const row of attended) {
      const slug = row.planning.courseSlug;
      const attributed =
        row.debitedPackId === packId ||
        (row.debitedPackId == null &&
          (!isMixed || pack.courseQuotas.some((q) => q.courseSlug === slug)));
      // Attribution simple : séance liée au pack ou sans debitedPackId sur cours du pack.
      // Pour éviter le double-compte multi-packs, on n'attribue null qu'au premier pack qui matche.
      if (row.debitedPackId != null) {
        if (row.debitedPackId !== packId) continue;
      } else {
        // null-debited : compter une seule fois via le premier enrollment pack qui accepte le cours
        const firstAccepting = packIds.find((pid) => {
          const p = enrollments.find((e) => e.packId === pid)?.pack;
          if (!p) return false;
          if (p.courseQuotas.length === 0) return true;
          return p.courseQuotas.some((q) => q.courseSlug === slug);
        });
        if (firstAccepting !== packId) continue;
      }

      if (isMixed) {
        if (!pack.courseQuotas.some((q) => q.courseSlug === slug)) continue;
        usedByCourse.set(slug, (usedByCourse.get(slug) ?? 0) + 1);
      } else {
        usedTotal += 1;
      }
    }

    if (isMixed) {
      for (const q of pack.courseQuotas) {
        const capacity = q.sessionCount * purchaseCount;
        const used = usedByCourse.get(q.courseSlug) ?? 0;
        const remaining = Math.max(0, capacity - used);
        const existing = await prisma.memberPackBalance.findFirst({
          where: { memberId, packId, courseSlug: q.courseSlug },
        });
        if (existing) {
          await prisma.memberPackBalance.update({
            where: { id: existing.id },
            data: { remaining },
          });
        } else {
          await prisma.memberPackBalance.create({
            data: { memberId, packId, courseSlug: q.courseSlug, remaining },
          });
        }
      }
    } else {
      const capacity = (pack.sessionCount ?? 0) * purchaseCount;
      const remaining = Math.max(0, capacity - usedTotal);
      const existing = await prisma.memberPackBalance.findFirst({
        where: { memberId, packId, courseSlug: null },
      });
      if (existing) {
        await prisma.memberPackBalance.update({
          where: { id: existing.id },
          data: { remaining },
        });
      } else if (pack.sessionCount != null) {
        await prisma.memberPackBalance.create({
          data: { memberId, packId, courseSlug: null, remaining },
        });
      }
    }
  }
}

async function main() {
  const focusId = process.argv[2] ?? null;

  if (focusId) {
    await recomputeMember(focusId);
    const member = await prisma.member.findUnique({
      where: { id: focusId },
      select: {
        firstName: true,
        lastName: true,
        packBalances: {
          select: { courseSlug: true, remaining: true, pack: { select: { name: true } } },
        },
      },
    });
    console.log("Recomputed", member?.firstName, member?.lastName);
    for (const b of member?.packBalances ?? []) {
      console.log(`  ${b.pack.name} ${b.courseSlug ?? "global"} remaining=${b.remaining}`);
    }
    const booked = await prisma.reservation.count({
      where: { memberId: focusId, status: "BOOKED" },
    });
    const attended = await prisma.reservation.count({
      where: { memberId: focusId, status: "ATTENDED" },
    });
    console.log(`  reservations: BOOKED=${booked} ATTENDED=${attended}`);
    return;
  }

  const members = await prisma.member.findMany({
    where: {
      OR: [{ packId: { not: null } }, { packEnrollments: { some: {} } }, { packBalances: { some: {} } }],
    },
    select: { id: true },
  });

  console.log(`Recomputing ${members.length} members…`);
  let i = 0;
  for (const m of members) {
    i += 1;
    await recomputeMember(m.id);
    if (i % 20 === 0) console.log(`  ${i}/${members.length}`);
  }
  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
