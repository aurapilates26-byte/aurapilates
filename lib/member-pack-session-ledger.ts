import type { Prisma } from "@prisma/client";
import { PACK_ERRORS } from "@/lib/create-member-reservation";

type PackRow = {
  id: string;
  sessionCount: number | null;
  courseQuotas: { courseSlug: string; sessionCount: number }[];
};

export async function debitMemberPackSession(
  tx: Prisma.TransactionClient,
  params: {
    memberId: string;
    pack: PackRow;
    courseSlug: string;
  },
): Promise<void> {
  const isMixed = params.pack.courseQuotas.length > 0;
  const targetCourseSlug = isMixed ? params.courseSlug : null;

  const updated = await tx.memberPackBalance.updateMany({
    where: {
      memberId: params.memberId,
      packId: params.pack.id,
      courseSlug: targetCourseSlug,
      remaining: { gt: 0 },
    },
    data: { remaining: { decrement: 1 } },
  });

  if (updated.count === 0) {
    if (isMixed) {
      const allowed = params.pack.courseQuotas.some((q) => q.courseSlug === params.courseSlug);
      if (!allowed) throw new Error(PACK_ERRORS.notAllowedCourse);
    }
    throw new Error(PACK_ERRORS.noSessionsLeft);
  }
}

export async function creditMemberPackSession(
  tx: Prisma.TransactionClient,
  params: {
    memberId: string;
    pack: PackRow;
    courseSlug: string;
  },
): Promise<void> {
  const isMixed = params.pack.courseQuotas.length > 0;
  const targetCourseSlug = isMixed ? params.courseSlug : null;

  const maxRemaining = isMixed
    ? (params.pack.courseQuotas.find((q) => q.courseSlug === params.courseSlug)?.sessionCount ?? null)
    : params.pack.sessionCount;

  const updated = await tx.memberPackBalance.updateMany({
    where: {
      memberId: params.memberId,
      packId: params.pack.id,
      courseSlug: targetCourseSlug,
    },
    data: { remaining: { increment: 1 } },
  });

  if (updated.count > 0 && maxRemaining != null) {
    await tx.memberPackBalance.updateMany({
      where: {
        memberId: params.memberId,
        packId: params.pack.id,
        courseSlug: targetCourseSlug,
        remaining: { gt: maxRemaining },
      },
      data: { remaining: maxRemaining },
    });
    return;
  }

  if (updated.count > 0) return;

  const credited = maxRemaining == null ? 1 : Math.min(1, maxRemaining);
  await tx.memberPackBalance.create({
    data: {
      memberId: params.memberId,
      packId: params.pack.id,
      courseSlug: targetCourseSlug,
      remaining: credited,
    },
  });
}

/** Tente de promouvoir le prochain en attente ayant une séance disponible. */
export async function promoteNextWaitlistReservation(
  tx: Prisma.TransactionClient,
  params: {
    planningId: string;
    sessionDate: Date;
    courseSlug: string;
  },
): Promise<boolean> {
  const waiters = await tx.reservation.findMany({
    where: {
      planningId: params.planningId,
      sessionDate: params.sessionDate,
      status: "WAITLIST",
    },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      memberId: true,
      member: {
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
      },
    },
  });

  for (const waiter of waiters) {
    if (!waiter.member.packId || !waiter.member.pack) continue;
    try {
      await debitMemberPackSession(tx, {
        memberId: waiter.memberId,
        pack: waiter.member.pack,
        courseSlug: params.courseSlug,
      });
      await tx.reservation.update({
        where: { id: waiter.id },
        data: { status: "BOOKED" },
      });
      return true;
    } catch (error) {
      if (error instanceof Error && error.message === PACK_ERRORS.noSessionsLeft) {
        continue;
      }
      throw error;
    }
  }

  return false;
}
