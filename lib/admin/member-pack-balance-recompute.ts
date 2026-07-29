import "server-only";

import type { Prisma } from "@prisma/client";
import { allocateConsumedSessionsForMemberEnrollments } from "@/lib/admin/member-pack-enrollment";
import {
  computePackCourseRemaining,
  packBalanceCapacityUnits,
} from "@/lib/admin/member-pack-renewal-shared";
import { setMemberPackBalanceRemaining } from "@/lib/admin/member-pack-renewal";
import { sumAttributionForPack } from "@/lib/admin/member-pack-session-attribution";
import { prisma } from "@/lib/prisma";

function dedupeCourseQuotas(
  courseQuotas: { courseSlug: string; sessionCount: number }[],
): { courseSlug: string; sessionCount: number }[] {
  const bySlug = new Map<string, number>();
  for (const quota of courseQuotas) {
    bySlug.set(quota.courseSlug, quota.sessionCount);
  }
  return [...bySlug.entries()].map(([courseSlug, sessionCount]) => ({ courseSlug, sessionCount }));
}

/**
 * Recalcule les soldes de tous les packs catalogue d'une adhérente.
 * Chaque séance n'est décomptée qu'une fois (attribution FIFO globale).
 */
export async function recomputeAllMemberPackBalancesForMember(
  tx: typeof prisma | Prisma.TransactionClient,
  memberId: string,
): Promise<void> {
  const [enrollments, member] = await Promise.all([
    tx.memberPackEnrollment.findMany({
      where: { memberId },
      orderBy: [{ purchasedAt: "asc" }, { createdAt: "asc" }],
      include: {
        pack: {
          select: {
            id: true,
            sessionCount: true,
            courseQuotas: { select: { courseSlug: true, sessionCount: true } },
          },
        },
      },
    }),
    tx.member.findUnique({
      where: { id: memberId },
      select: { packId: true },
    }),
  ]);

  const packIds = [...new Set(enrollments.map((e) => e.packId))];
  if (member?.packId && !packIds.includes(member.packId)) {
    packIds.push(member.packId);
  }
  if (packIds.length === 0) return;

  const attribution = await allocateConsumedSessionsForMemberEnrollments({
    memberId,
    enrollmentsAsc: enrollments,
    forBalance: true,
    tx: tx as Prisma.TransactionClient,
  });

  const enrollmentCountByPack = new Map<string, number>();
  const enrollmentIdsByPack = new Map<string, string[]>();
  for (const enrollment of enrollments) {
    enrollmentCountByPack.set(
      enrollment.packId,
      (enrollmentCountByPack.get(enrollment.packId) ?? 0) + 1,
    );
    const ids = enrollmentIdsByPack.get(enrollment.packId) ?? [];
    ids.push(enrollment.id);
    enrollmentIdsByPack.set(enrollment.packId, ids);
  }

  for (const packId of packIds) {
    const pack =
      enrollments.find((e) => e.packId === packId)?.pack ??
      (await tx.pack.findUnique({
        where: { id: packId },
        select: {
          id: true,
          sessionCount: true,
          courseQuotas: { select: { courseSlug: true, sessionCount: true } },
        },
      }));
    if (!pack) continue;

    const enrollmentCount = enrollmentCountByPack.get(packId) ?? 0;
    const units = packBalanceCapacityUnits(enrollmentCount, member?.packId === packId);
    if (units === 0) {
      await tx.memberPackBalance.deleteMany({
        where: { memberId, packId },
      });
      continue;
    }

    const quotas = dedupeCourseQuotas(pack.courseQuotas);
    const enrollmentIds = enrollmentIdsByPack.get(packId) ?? [];
    const used = sumAttributionForPack(attribution, enrollmentIds);

    if (quotas.length > 0) {
      const desiredSlugs = quotas.map((q) => q.courseSlug);
      await tx.memberPackBalance.deleteMany({
        where: {
          memberId,
          packId,
          OR: [{ courseSlug: null }, { courseSlug: { notIn: desiredSlugs } }],
        },
      });

      for (const quota of quotas) {
        const courseUsed = used.byCourse.get(quota.courseSlug) ?? 0;
        await setMemberPackBalanceRemaining(tx, {
          memberId,
          packId: pack.id,
          courseSlug: quota.courseSlug,
          remaining: computePackCourseRemaining(quota.sessionCount, units, courseUsed),
        });
      }
      continue;
    }

    if (pack.sessionCount != null) {
      await tx.memberPackBalance.deleteMany({
        where: {
          memberId,
          packId,
          courseSlug: { not: null },
        },
      });
      await setMemberPackBalanceRemaining(tx, {
        memberId,
        packId: pack.id,
        courseSlug: null,
        remaining: computePackCourseRemaining(pack.sessionCount, units, used.total),
      });
    }
  }
}

/** Recalcule tous les soldes pack d'une adhérente (alias par packId pour compatibilité). */
export async function recomputeMemberPackBalancesForPack(
  tx: typeof prisma | Prisma.TransactionClient,
  input: { memberId: string; packId: string },
): Promise<void> {
  await recomputeAllMemberPackBalancesForMember(tx, input.memberId);
}
