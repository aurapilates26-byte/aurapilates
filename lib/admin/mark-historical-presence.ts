import "server-only";

import { Prisma } from "@prisma/client";
import {
  formatYmdLocal,
  formatYmdPrismaDate,
  isSessionSlotEndedLocal,
  parseYmdLocal,
  parseYmdToPrismaDate,
  prismaDayOfWeekFromLocalDate,
  startOfLocalToday,
} from "@/lib/calendar-day";
import { PACK_ERRORS } from "@/lib/create-member-reservation";
import { tryActivatePendingPackIfCurrentFinished } from "@/lib/admin/member-pack-renewal";
import {
  activateMemberPackOnSessionDate,
  syncMemberPackBalancesFromReservations,
} from "@/lib/admin/member-pack-activation";
import { isSessionYmdWithinPlanningPeriod } from "@/lib/planning-period-status";
import { getEligibilityForPack, isCourseAllowedForPack } from "@/lib/pack-eligibility";
import {
  isSessionDateWithinPackPeriod,
  packExpiresAtLocal,
  packStartDateLocal,
} from "@/lib/member-pack-period";
import { prisma } from "@/lib/prisma";
import type { PlanningPeriodConfig } from "@/types/admin/planning";

const ATTENDANCE_MARKED_BY = "ADMIN_HISTORICAL" as const;

export type HistoricalPresenceRosterItem = {
  reservationId: string;
  memberId: string;
  memberName: string;
  phone: string | null;
  markedAt: string;
};

export type MarkHistoricalPresenceResult = {
  reservationId: string;
  memberId: string;
  sessionDateYmd: string;
  alreadyMarked: boolean;
  /** Pack démarré ou reculé à la date de la séance. */
  packStartAdjusted: boolean;
  packStartedAtYmd: string;
};

function memberDisplayName(firstName: string | null, lastName: string | null): string {
  return `${firstName ?? ""} ${lastName ?? ""}`.trim() || "Adhérente";
}

export function historicalPresenceErrorMessage(code: string): string {
  if (code === "PLANNING_NOT_FOUND") return "Créneau introuvable";
  if (code === "MEMBER_NOT_FOUND") return "Adhérente introuvable";
  if (code === "INVALID_DATE") return "Date invalide";
  if (code === "FUTURE_DATE") return "La saisie concerne uniquement les cours déjà passés";
  if (code === "SESSION_NOT_ENDED") return "Présence disponible après la fin du cours";
  if (code === "DAY_MISMATCH") return "Ce cours n'a pas lieu à cette date";
  if (code === "ANCHOR_MISMATCH") return "La date ne correspond pas au créneau";
  if (code === "OUTSIDE_PERIOD") return "Date hors de la période sélectionnée";
  if (code === "DRAFT_SLOT") return "Créneau brouillon non éligible";
  if (code === "ALREADY_ATTENDED") return "Présence déjà enregistrée";
  if (code === PACK_ERRORS.noPack) return "Aucun pack associé";
  if (code === PACK_ERRORS.packInactive) return "Pack inactif";
  if (code === PACK_ERRORS.packExpired) return "Pack expiré à cette date";
  if (code === PACK_ERRORS.packNotStarted) return "Pack non démarré à cette date";
  if (code === PACK_ERRORS.notAllowedCourse || code === PACK_ERRORS.packCategoryMismatch) {
    return "Ce pack ne permet pas ce cours";
  }
  if (code === PACK_ERRORS.noSessionsLeft) return "Plus de séances disponibles sur le pack";
  return "Enregistrement impossible";
}

async function ensurePackBalances(
  tx: Prisma.TransactionClient,
  memberId: string,
  pack: {
    id: string;
    sessionCount: number | null;
    courseQuotas: { courseSlug: string; sessionCount: number }[];
  },
  packStartedAt: Date,
  packDurationDays: string | null,
) {
  const existingBalances = await tx.memberPackBalance.findMany({
    where: { memberId, packId: pack.id },
    select: { id: true },
  });
  if (existingBalances.length > 0) return;

  const packStartDate = packStartDateLocal(packStartedAt);
  const expiresAt = packExpiresAtLocal(packStartedAt, packDurationDays);
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
    await tx.memberPackBalance.createMany({
      data: pack.courseQuotas.map((q) => ({
        memberId,
        packId: pack.id,
        courseSlug: q.courseSlug,
        remaining: Math.max(0, q.sessionCount - (usedBySlug.get(q.courseSlug) ?? 0)),
      })),
    });
  } else if (pack.sessionCount != null) {
    const used = packStartDate
      ? await tx.reservation.count({
          where: {
            memberId,
            OR: [{ status: { in: ["BOOKED", "ATTENDED"] } }, { status: "CANCELLED", packRefundedAt: null }],
            sessionDate: { gte: packStartDate, ...(expiresAt ? { lte: expiresAt } : {}) },
          },
        })
      : 0;
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

async function decrementPackBalance(
  tx: Prisma.TransactionClient,
  memberId: string,
  packId: string,
  targetCourseSlug: string | null,
  courseSlug: string,
  isMixed: boolean,
) {
  const updatedBalance = await tx.memberPackBalance.updateMany({
    where: {
      memberId,
      packId,
      courseSlug: targetCourseSlug,
      remaining: { gt: 0 },
    },
    data: { remaining: { decrement: 1 } },
  });
  if (updatedBalance.count === 0) {
    if (isMixed) throw new Error(PACK_ERRORS.notAllowedCourse);
    throw new Error(PACK_ERRORS.noSessionsLeft);
  }
}

export async function listHistoricalPresenceRoster(
  planningId: string,
  sessionDateYmd: string,
): Promise<HistoricalPresenceRosterItem[]> {
  const sessionDateDb = parseYmdToPrismaDate(sessionDateYmd);
  if (!sessionDateDb) return [];

  const rows = await prisma.reservation.findMany({
    where: {
      planningId,
      sessionDate: sessionDateDb,
      status: "ATTENDED",
    },
    orderBy: [{ attendance: { markedAt: "asc" } }],
    select: {
      id: true,
      memberId: true,
      member: { select: { firstName: true, lastName: true, phone: true } },
      attendance: { select: { markedAt: true } },
    },
  });

  return rows
    .filter((r) => r.attendance)
    .map((r) => ({
      reservationId: r.id,
      memberId: r.memberId,
      memberName: memberDisplayName(r.member.firstName, r.member.lastName),
      phone: r.member.phone,
      markedAt: r.attendance!.markedAt.toISOString(),
    }));
}

export async function markHistoricalPresence(input: {
  memberId: string;
  planningId: string;
  sessionDateYmd: string;
  periodConfig: PlanningPeriodConfig;
  createdByUserId?: string | null;
}): Promise<MarkHistoricalPresenceResult> {
  const sessionDateLocal = parseYmdLocal(input.sessionDateYmd);
  const sessionDateDb = parseYmdToPrismaDate(input.sessionDateYmd);
  if (!sessionDateLocal || !sessionDateDb) {
    throw new Error("INVALID_DATE");
  }

  const today = startOfLocalToday();
  const todayYmd = formatYmdLocal(today);
  if (input.sessionDateYmd > todayYmd) {
    throw new Error("FUTURE_DATE");
  }
  if (input.sessionDateYmd === todayYmd) {
    const slot = await prisma.planning.findUnique({
      where: { id: input.planningId },
      select: { endTime: true },
    });
    if (!slot?.endTime || !isSessionSlotEndedLocal(input.sessionDateYmd, slot.endTime)) {
      throw new Error("SESSION_NOT_ENDED");
    }
  }

  if (!isSessionYmdWithinPlanningPeriod(input.sessionDateYmd, input.periodConfig)) {
    throw new Error("OUTSIDE_PERIOD");
  }

  const result = await prisma.$transaction(
    async (tx) => {
      const planning = await tx.planning.findUnique({ where: { id: input.planningId } });
      if (!planning) throw new Error("PLANNING_NOT_FOUND");
      if (planning.isDraft) throw new Error("DRAFT_SLOT");
      if (planning.dayOfWeek !== prismaDayOfWeekFromLocalDate(sessionDateLocal)) {
        throw new Error("DAY_MISMATCH");
      }
      if (planning.anchorSessionYmd) {
        const anchorYmd = formatYmdPrismaDate(planning.anchorSessionYmd);
        if (anchorYmd !== input.sessionDateYmd) throw new Error("ANCHOR_MISMATCH");
      }

      await tryActivatePendingPackIfCurrentFinished(tx, input.memberId);

      const member = await tx.member.findUnique({
        where: { id: input.memberId },
        select: {
          id: true,
          packStartedAt: true,
          pack: {
            select: {
              id: true,
              category: true,
              durationDays: true,
              sessionCount: true,
              isActive: true,
              courseQuotas: { select: { courseSlug: true, sessionCount: true } },
            },
          },
        },
      });
      if (!member) throw new Error("MEMBER_NOT_FOUND");
      if (!member.pack) throw new Error(PACK_ERRORS.noPack);
      if (!member.pack.isActive) throw new Error(PACK_ERRORS.packInactive);

      const pack = member.pack;
      const activation = await activateMemberPackOnSessionDate(tx, {
        memberId: input.memberId,
        currentPackStartedAt: member.packStartedAt,
        sessionDateDb,
        sessionDateLocal,
      });
      const packStartedAt = activation.packStartedAt;

      if (!isSessionDateWithinPackPeriod(sessionDateLocal, packStartedAt, pack.durationDays)) {
        const expiresAt = packExpiresAtLocal(packStartedAt, pack.durationDays);
        if (expiresAt && sessionDateLocal.getTime() > expiresAt.getTime()) {
          throw new Error(PACK_ERRORS.packExpired);
        }
        throw new Error(PACK_ERRORS.packNotStarted);
      }

      const isMixed = pack.courseQuotas.length > 0;
      const eligibility = getEligibilityForPack({
        category: pack.category ?? null,
        courseQuotas: pack.courseQuotas,
      });
      if (!isCourseAllowedForPack(eligibility, planning.courseSlug)) {
        throw new Error(
          eligibility.mode === "single" ? PACK_ERRORS.packCategoryMismatch : PACK_ERRORS.notAllowedCourse,
        );
      }

      const targetCourseSlug = isMixed ? planning.courseSlug : null;
      if (activation.packStartAdjusted) {
        await syncMemberPackBalancesFromReservations(tx, input.memberId, pack, packStartedAt);
      } else {
        await ensurePackBalances(tx, input.memberId, pack, packStartedAt, pack.durationDays);
      }

      const existing = await tx.reservation.findUnique({
        where: {
          memberId_planningId_sessionDate: {
            memberId: input.memberId,
            planningId: input.planningId,
            sessionDate: sessionDateDb,
          },
        },
        select: { id: true, status: true, packRefundedAt: true, attendance: { select: { reservationId: true } } },
      });

      if (existing?.status === "ATTENDED") {
        if (existing.attendance) {
          return {
            reservationId: existing.id,
            alreadyMarked: true,
            packStartAdjusted: activation.packStartAdjusted,
          };
        }
        await tx.attendance.create({
          data: {
            reservationId: existing.id,
            memberId: input.memberId,
            planningId: input.planningId,
            sessionDate: sessionDateDb,
            markedBy: ATTENDANCE_MARKED_BY,
          },
        });
        return {
          reservationId: existing.id,
          alreadyMarked: false,
          packStartAdjusted: activation.packStartAdjusted,
        };
      }

      if (existing?.status === "BOOKED") {
        await tx.reservation.update({
          where: { id: existing.id },
          data: { status: "ATTENDED", source: "ADMIN", createdByUserId: input.createdByUserId ?? null },
        });
        await tx.attendance.create({
          data: {
            reservationId: existing.id,
            memberId: input.memberId,
            planningId: input.planningId,
            sessionDate: sessionDateDb,
            markedBy: ATTENDANCE_MARKED_BY,
          },
        });
        return { reservationId: existing.id, alreadyMarked: false, packStartAdjusted: activation.packStartAdjusted };
      }

      if (existing?.status === "WAITLIST") {
        await decrementPackBalance(tx, input.memberId, pack.id, targetCourseSlug, planning.courseSlug, isMixed);
        await tx.reservation.update({
          where: { id: existing.id },
          data: { status: "ATTENDED", source: "ADMIN", createdByUserId: input.createdByUserId ?? null },
        });
        await tx.attendance.create({
          data: {
            reservationId: existing.id,
            memberId: input.memberId,
            planningId: input.planningId,
            sessionDate: sessionDateDb,
            markedBy: ATTENDANCE_MARKED_BY,
          },
        });
        return { reservationId: existing.id, alreadyMarked: false, packStartAdjusted: activation.packStartAdjusted };
      }

      if (existing?.status === "CANCELLED") {
        if (!existing.packRefundedAt) {
          await tx.reservation.update({
            where: { id: existing.id },
            data: { status: "ATTENDED", source: "ADMIN", createdByUserId: input.createdByUserId ?? null },
          });
          await tx.attendance.create({
            data: {
              reservationId: existing.id,
              memberId: input.memberId,
              planningId: input.planningId,
              sessionDate: sessionDateDb,
              markedBy: ATTENDANCE_MARKED_BY,
            },
          });
          return { reservationId: existing.id, alreadyMarked: false, packStartAdjusted: activation.packStartAdjusted };
        }
        await decrementPackBalance(tx, input.memberId, pack.id, targetCourseSlug, planning.courseSlug, isMixed);
        await tx.reservation.update({
          where: { id: existing.id },
          data: {
            status: "ATTENDED",
            source: "ADMIN",
            createdByUserId: input.createdByUserId ?? null,
            packRefundedAt: null,
          },
        });
        await tx.attendance.create({
          data: {
            reservationId: existing.id,
            memberId: input.memberId,
            planningId: input.planningId,
            sessionDate: sessionDateDb,
            markedBy: ATTENDANCE_MARKED_BY,
          },
        });
        return { reservationId: existing.id, alreadyMarked: false, packStartAdjusted: activation.packStartAdjusted };
      }

      await decrementPackBalance(tx, input.memberId, pack.id, targetCourseSlug, planning.courseSlug, isMixed);
      const created = await tx.reservation.create({
        data: {
          memberId: input.memberId,
          planningId: input.planningId,
          sessionDate: sessionDateDb,
          status: "ATTENDED",
          source: "ADMIN",
          createdByUserId: input.createdByUserId ?? null,
          packRefundedAt: null,
        },
      });
      await tx.attendance.create({
        data: {
          reservationId: created.id,
          memberId: input.memberId,
          planningId: input.planningId,
          sessionDate: sessionDateDb,
          markedBy: ATTENDANCE_MARKED_BY,
        },
      });
      return { reservationId: created.id, alreadyMarked: false, packStartAdjusted: activation.packStartAdjusted };
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      maxWait: 5000,
      timeout: 10000,
    },
  );

  return {
    reservationId: result.reservationId,
    memberId: input.memberId,
    sessionDateYmd: input.sessionDateYmd,
    alreadyMarked: result.alreadyMarked,
    packStartAdjusted: result.packStartAdjusted,
    packStartedAtYmd: input.sessionDateYmd,
  };
}
