import type { Prisma } from "@prisma/client";
import { formatYmdPrismaDate, parseYmdLocal } from "@/lib/calendar-day";
import { PACK_ERRORS } from "@/lib/create-member-reservation";
import {
  packBalanceCapacityUnits,
  setMemberPackBalanceRemaining,
} from "@/lib/admin/member-pack-renewal";
import {
  debitSelectedPackSession,
  resolvePackForMemberBooking,
} from "@/lib/admin/member-pack-selection";

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

  const [enrollmentCount, member] = await Promise.all([
    tx.memberPackEnrollment.count({
      where: { memberId: params.memberId, packId: params.pack.id },
    }),
    tx.member.findUnique({
      where: { id: params.memberId },
      select: { packId: true },
    }),
  ]);
  const units = packBalanceCapacityUnits(enrollmentCount, member?.packId === params.pack.id);
  const perPurchase = isMixed
    ? (params.pack.courseQuotas.find((q) => q.courseSlug === params.courseSlug)?.sessionCount ?? null)
    : params.pack.sessionCount;
  const maxRemaining = perPurchase == null ? null : perPurchase * Math.max(1, units);

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
  await setMemberPackBalanceRemaining(tx, {
    memberId: params.memberId,
    packId: params.pack.id,
    courseSlug: targetCourseSlug,
    remaining: credited,
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
      debitedPackId: true,
    },
  });

  for (const waiter of waiters) {
    const memberRow = await tx.member.findUnique({
      where: { id: waiter.memberId },
      select: { packStartedAt: true },
    });
    if (!memberRow) continue;

    const sessionYmd = formatYmdPrismaDate(new Date(params.sessionDate));
    const sessionDateLocal = parseYmdLocal(sessionYmd);
    if (!sessionDateLocal) continue;

    try {
      const selected = await resolvePackForMemberBooking(tx, {
        memberId: waiter.memberId,
        courseSlug: params.courseSlug,
        sessionDateLocal,
        preferredPackId: waiter.debitedPackId,
      });
      await debitSelectedPackSession(tx, {
        memberId: waiter.memberId,
        pack: selected.pack,
        courseSlug: params.courseSlug,
        sessionDateDb: params.sessionDate,
      });
      await tx.reservation.update({
        where: { id: waiter.id },
        data: { status: "BOOKED", debitedPackId: selected.pack.id },
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
