import type { Prisma } from "@prisma/client";
import { packExpiresAtLocal, packStartDateLocal } from "@/lib/member-pack-period";
import { syncActiveEnrollmentDates } from "@/lib/admin/member-pack-enrollment";
import { resetMemberPackBalancesForPack } from "@/lib/admin/member-pack-renewal";

export type ActivateMemberPackOnSessionResult = {
  packStartedAt: Date;
  packStartDate: Date;
  /** Date de début du pack modifiée (1ʳᵉ activation ou recul sur une séance plus ancienne). */
  packStartAdjusted: boolean;
};

/** Démarre ou recule le pack à la date de séance (1ʳᵉ réservation ou saisie historique). */
export async function activateMemberPackOnSessionDate(
  tx: Prisma.TransactionClient,
  input: {
    memberId: string;
    packId: string;
    durationDays: string | null;
    currentPackStartedAt: Date | null;
    sessionDateDb: Date;
    sessionDateLocal: Date;
  },
): Promise<ActivateMemberPackOnSessionResult> {
  let packStartedAt = input.currentPackStartedAt;
  let packStartAdjusted = false;

  if (!packStartedAt) {
    await tx.member.update({
      where: { id: input.memberId },
      data: { packStartedAt: input.sessionDateDb, isActive: true },
    });
    packStartedAt = input.sessionDateDb;
    packStartAdjusted = true;
  } else {
    const packStartLocal = packStartDateLocal(packStartedAt);
    if (packStartLocal && input.sessionDateLocal.getTime() < packStartLocal.getTime()) {
      await tx.member.update({
        where: { id: input.memberId },
        data: { packStartedAt: input.sessionDateDb, isActive: true },
      });
      packStartedAt = input.sessionDateDb;
      packStartAdjusted = true;
    }
  }

  const packStartDate =
    packStartDateLocal(packStartedAt) ??
    new Date(
      input.sessionDateLocal.getFullYear(),
      input.sessionDateLocal.getMonth(),
      input.sessionDateLocal.getDate(),
    );

  if (packStartAdjusted) {
    await syncActiveEnrollmentDates(tx, {
      memberId: input.memberId,
      packId: input.packId,
      packStartedAt,
      durationDays: input.durationDays,
    });
  }

  return { packStartedAt, packStartDate, packStartAdjusted };
}

/** Active le pack choisi à la réservation (pack principal membre ou pack parallèle). */
export async function activateSelectedPackOnSessionDate(
  tx: Prisma.TransactionClient,
  input: {
    memberId: string;
    packId: string;
    memberPackId: string | null;
    memberPackStartedAt: Date | null;
    durationDays: string | null;
    sessionDateDb: Date;
    sessionDateLocal: Date;
  },
): Promise<void> {
  const isMemberPrimaryPack = input.memberPackId === input.packId;
  let currentStartedAt = isMemberPrimaryPack ? input.memberPackStartedAt : null;

  if (!isMemberPrimaryPack) {
    const enrollment = await tx.memberPackEnrollment.findFirst({
      where: {
        memberId: input.memberId,
        packId: input.packId,
        status: { in: ["PENDING_START", "ACTIVE"] },
        packStartedAt: null,
      },
      orderBy: [{ purchasedAt: "asc" }, { createdAt: "asc" }],
      select: { packStartedAt: true },
    });
    currentStartedAt =
      enrollment?.packStartedAt ??
      (
        await tx.memberPackEnrollment.findFirst({
          where: {
            memberId: input.memberId,
            packId: input.packId,
            status: { in: ["PENDING_START", "ACTIVE"] },
          },
          orderBy: [{ purchasedAt: "asc" }, { createdAt: "asc" }],
          select: { packStartedAt: true },
        })
      )?.packStartedAt ??
      null;
  } else if (!currentStartedAt) {
    const enrollment = await tx.memberPackEnrollment.findFirst({
      where: {
        memberId: input.memberId,
        packId: input.packId,
        status: { in: ["PENDING_START", "ACTIVE"] },
        packStartedAt: { not: null },
      },
      orderBy: [{ purchasedAt: "asc" }, { createdAt: "asc" }],
      select: { packStartedAt: true },
    });
    currentStartedAt = enrollment?.packStartedAt ?? null;
  }

  let packStartedAt = currentStartedAt;
  let packStartAdjusted = false;

  if (!packStartedAt) {
    if (isMemberPrimaryPack) {
      await tx.member.update({
        where: { id: input.memberId },
        data: { packStartedAt: input.sessionDateDb, isActive: true },
      });
    }
    packStartedAt = input.sessionDateDb;
    packStartAdjusted = true;
  } else {
    const packStartLocal = packStartDateLocal(packStartedAt);
    if (packStartLocal && input.sessionDateLocal.getTime() < packStartLocal.getTime()) {
      if (isMemberPrimaryPack) {
        await tx.member.update({
          where: { id: input.memberId },
          data: { packStartedAt: input.sessionDateDb, isActive: true },
        });
      }
      packStartedAt = input.sessionDateDb;
      packStartAdjusted = true;
    } else if (isMemberPrimaryPack && !input.memberPackStartedAt) {
      await tx.member.update({
        where: { id: input.memberId },
        data: { packStartedAt, isActive: true },
      });
    }
  }

  if (packStartAdjusted) {
    await syncActiveEnrollmentDates(tx, {
      memberId: input.memberId,
      packId: input.packId,
      packStartedAt,
      durationDays: input.durationDays,
    });
  }
}

type PackForBalanceSync = {
  id: string;
  sessionCount: number | null;
  durationDays: string | null;
  courseQuotas: { courseSlug: string; sessionCount: number }[];
};

/** Recalcule les soldes pack à partir des réservations consommées sur la période en cours. */
export async function syncMemberPackBalancesFromReservations(
  tx: Prisma.TransactionClient,
  memberId: string,
  pack: PackForBalanceSync,
  packStartedAt: Date,
): Promise<void> {
  await resetMemberPackBalancesForPack(tx, { memberId, packId: pack.id });

  const packStartDate = packStartDateLocal(packStartedAt);
  const expiresAt = packExpiresAtLocal(packStartedAt, pack.durationDays);
  const isMixed = pack.courseQuotas.length > 0;

  if (isMixed) {
    const usedRows = packStartDate
      ? await tx.reservation.findMany({
          where: {
            memberId,
            OR: [{ status: { in: ["BOOKED", "ATTENDED"] } }, { status: "CANCELLED", packRefundedAt: null }],
            sessionDate: { gte: packStartDate, ...(expiresAt ? { lte: expiresAt } : {}) },
            planning: { courseSlug: { in: pack.courseQuotas.map((q) => q.courseSlug) } },
          },
          select: { planning: { select: { courseSlug: true } } },
        })
      : [];
    const usedBySlug = new Map<string, number>();
    for (const r of usedRows) {
      usedBySlug.set(r.planning.courseSlug, (usedBySlug.get(r.planning.courseSlug) ?? 0) + 1);
    }
    await tx.memberPackBalance.deleteMany({ where: { memberId, packId: pack.id } });
    await tx.memberPackBalance.createMany({
      data: pack.courseQuotas.map((q) => ({
        memberId,
        packId: pack.id,
        courseSlug: q.courseSlug,
        remaining: Math.max(0, q.sessionCount - (usedBySlug.get(q.courseSlug) ?? 0)),
      })),
    });
    return;
  }

  if (pack.sessionCount != null) {
    const used = packStartDate
      ? await tx.reservation.count({
          where: {
            memberId,
            OR: [{ status: { in: ["BOOKED", "ATTENDED"] } }, { status: "CANCELLED", packRefundedAt: null }],
            sessionDate: { gte: packStartDate, ...(expiresAt ? { lte: expiresAt } : {}) },
          },
        })
      : 0;
    await tx.memberPackBalance.deleteMany({ where: { memberId, packId: pack.id } });
    await tx.memberPackBalance.create({
      data: {
        memberId,
        packId: pack.id,
        courseSlug: null,
        remaining: Math.max(0, pack.sessionCount - used),
      },
    });
  }
}
