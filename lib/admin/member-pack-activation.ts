import type { Prisma } from "@prisma/client";
import { packStartDateLocal } from "@/lib/member-pack-period";
import { syncActiveEnrollmentDates } from "@/lib/admin/member-pack-enrollment";
import { recomputeMemberPackBalancesForPack } from "@/lib/admin/member-pack-renewal";

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

/** Recalcule les soldes pack (quotas × achats − séances consommées). */
export async function syncMemberPackBalancesFromReservations(
  tx: Prisma.TransactionClient,
  memberId: string,
  pack: PackForBalanceSync,
  _packStartedAt: Date,
): Promise<void> {
  await recomputeMemberPackBalancesForPack(tx, { memberId, packId: pack.id });
}
