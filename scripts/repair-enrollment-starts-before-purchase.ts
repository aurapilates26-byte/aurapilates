/**
 * Répare les inscriptions dont packStartedAt < purchasedAt (héritage du pack précédent).
 * Usage: npx tsx scripts/repair-enrollment-starts-before-purchase.ts [memberId?]
 */
import { loadEnvConfig } from "@next/env";
import { PrismaClient } from "@prisma/client";
import { formatYmdLocal, parseYmdToPrismaDate } from "../lib/calendar-day";
import { addPackDurationToStartDate } from "../lib/pack-duration";
import {
  clampPackStartToPurchasedAt,
  isPackStartBeforePurchase,
} from "../lib/member-pack-period";

loadEnvConfig(process.cwd());

const prisma = new PrismaClient();
const MOLKA_ID = "cmp6n9pyb0047p401exgskztu";

function toPrismaDateLocal(d: Date): Date {
  return parseYmdToPrismaDate(formatYmdLocal(d))!;
}

async function findFirstPostPurchaseSession(input: {
  memberId: string;
  packId: string;
  purchasedAt: Date;
  periodEndExclusive: Date | null;
  courseSlugs: string[];
}): Promise<Date | null> {
  const purchased = toPrismaDateLocal(input.purchasedAt);
  const row = await prisma.reservation.findFirst({
    where: {
      memberId: input.memberId,
      sessionDate: {
        gte: purchased,
        ...(input.periodEndExclusive ? { lt: input.periodEndExclusive } : {}),
      },
      AND: [
        {
          OR: [
            { status: "ATTENDED" },
            { status: "CANCELLED", packRefundedAt: null },
          ],
        },
        {
          OR: [
            { debitedPackId: input.packId },
            { debitedPackId: null, status: "ATTENDED" },
          ],
        },
      ],
      ...(input.courseSlugs.length > 0
        ? { planning: { courseSlug: { in: input.courseSlugs } } }
        : {}),
    },
    orderBy: [{ sessionDate: "asc" }, { createdAt: "asc" }],
    select: { sessionDate: true },
  });
  return row?.sessionDate ?? null;
}

async function repairMember(memberId: string): Promise<number> {
  const enrollments = await prisma.memberPackEnrollment.findMany({
    where: { memberId, packStartedAt: { not: null } },
    orderBy: [{ purchasedAt: "asc" }, { createdAt: "asc" }],
    include: {
      pack: {
        select: {
          durationDays: true,
          courseQuotas: { select: { courseSlug: true, sessionCount: true } },
        },
      },
    },
  });

  let fixed = 0;
  for (const enrollment of enrollments) {
    if (!enrollment.packStartedAt) continue;
    if (!isPackStartBeforePurchase(enrollment.packStartedAt, enrollment.purchasedAt)) continue;

    const nextSamePack = enrollments.find(
      (e) =>
        e.packId === enrollment.packId &&
        e.id !== enrollment.id &&
        e.purchasedAt.getTime() > enrollment.purchasedAt.getTime(),
    );
    const periodEndExclusive = nextSamePack
      ? toPrismaDateLocal(nextSamePack.purchasedAt)
      : enrollment.closedAt
        ? toPrismaDateLocal(enrollment.closedAt)
        : null;

    const firstSessionDate = await findFirstPostPurchaseSession({
      memberId,
      packId: enrollment.packId,
      purchasedAt: enrollment.purchasedAt,
      periodEndExclusive,
      courseSlugs: enrollment.pack.courseQuotas.map((q) => q.courseSlug),
    });

    if (
      firstSessionDate &&
      !isPackStartBeforePurchase(firstSessionDate, enrollment.purchasedAt)
    ) {
      const start = clampPackStartToPurchasedAt(firstSessionDate, enrollment.purchasedAt);
      const packExpiresAt =
        addPackDurationToStartDate(start, enrollment.pack.durationDays) ?? null;
      await prisma.memberPackEnrollment.update({
        where: { id: enrollment.id },
        data: {
          packStartedAt: start,
          packExpiresAt,
          status: enrollment.status === "PENDING_START" ? "ACTIVE" : enrollment.status,
          closedAt:
            enrollment.status === "REPLACED" || enrollment.status === "EXPIRED"
              ? enrollment.closedAt
              : null,
        },
      });
    } else {
      const reopen =
        enrollment.status === "ACTIVE" || enrollment.status === "PENDING_START";
      await prisma.memberPackEnrollment.update({
        where: { id: enrollment.id },
        data: {
          packStartedAt: null,
          packExpiresAt: null,
          ...(reopen ? { status: "PENDING_START" as const, closedAt: null } : {}),
        },
      });
    }
    fixed += 1;
  }

  const member = await prisma.member.findUnique({
    where: { id: memberId },
    select: { packId: true },
  });
  if (member?.packId) {
    const current = await prisma.memberPackEnrollment.findFirst({
      where: {
        memberId,
        packId: member.packId,
        status: { in: ["ACTIVE", "PENDING_START"] },
      },
      orderBy: [{ purchasedAt: "desc" }, { createdAt: "desc" }],
      select: { packStartedAt: true },
    });
    if (current) {
      await prisma.member.update({
        where: { id: memberId },
        data: { packStartedAt: current.packStartedAt },
      });
    }
  }

  return fixed;
}

async function main() {
  const focusMemberId = process.argv[2] ?? null;

  const rows = await prisma.memberPackEnrollment.findMany({
    where: { packStartedAt: { not: null } },
    select: {
      id: true,
      memberId: true,
      packStartedAt: true,
      purchasedAt: true,
      status: true,
      pack: { select: { name: true } },
      member: { select: { firstName: true, lastName: true } },
    },
  });

  const bad = rows.filter(
    (e) => e.packStartedAt && formatYmdLocal(e.packStartedAt) < formatYmdLocal(e.purchasedAt),
  );

  console.log(`BEFORE bad enrollments: ${bad.length}`);
  for (const e of bad) {
    console.log(
      `- ${e.member.firstName} ${e.member.lastName} | ${e.pack.name} | start=${formatYmdLocal(e.packStartedAt!)} purchase=${formatYmdLocal(e.purchasedAt)} | ${e.status}`,
    );
  }

  const memberIds = new Set(bad.map((e) => e.memberId));
  if (focusMemberId) memberIds.add(focusMemberId);
  else memberIds.add(MOLKA_ID);

  let totalFixed = 0;
  for (const id of memberIds) {
    totalFixed += await repairMember(id);
  }
  console.log(`Fixed enrollments: ${totalFixed}`);

  const afterRows = await prisma.memberPackEnrollment.findMany({
    where: { packStartedAt: { not: null } },
    select: { packStartedAt: true, purchasedAt: true },
  });
  const afterBad = afterRows.filter(
    (e) => e.packStartedAt && formatYmdLocal(e.packStartedAt) < formatYmdLocal(e.purchasedAt),
  );
  console.log(`AFTER bad enrollments: ${afterBad.length}`);

  const verifyId = focusMemberId ?? MOLKA_ID;
  const packs = await prisma.memberPackEnrollment.findMany({
    where: { memberId: verifyId },
    orderBy: [{ purchasedAt: "desc" }],
    include: { pack: { select: { name: true } } },
  });
  console.log(`\nEnrollments for ${verifyId}:`);
  for (const p of packs) {
    console.log(
      `  ${p.pack.name} | ${p.status} | started=${p.packStartedAt ? formatYmdLocal(p.packStartedAt) : "null"} | purchased=${formatYmdLocal(p.purchasedAt)} | expires=${p.packExpiresAt ? formatYmdLocal(p.packExpiresAt) : "null"}`,
    );
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
