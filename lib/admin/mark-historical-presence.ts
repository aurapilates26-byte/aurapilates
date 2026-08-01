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
  debitSelectedPackSession,
  preparePackForAdminPresenceDebit,
} from "@/lib/admin/member-pack-selection";
import { ensureMemberParallelPackStockForDebit, refreshMemberPackBalancesForDebit } from "@/lib/admin/member-owned-packs";
import { isSessionYmdWithinPlanningPeriod } from "@/lib/planning-period-status";
import { resolvePlanningPeriodConfigForSessionYmd } from "@/lib/admin/planning-period-archive";
import { prisma } from "@/lib/prisma";
import { HISTORICAL_PRESENCE_MARKED_BY } from "@/lib/admin/unmark-historical-presence";
import type { PlanningPeriodConfig } from "@/types/admin/planning";

function isTransactionWriteConflict(error: unknown): boolean {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034") {
    return true;
  }
  return error instanceof Error && /write conflict|deadlock/i.test(error.message);
}

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
    return "Aucune séance disponible sur vos packs pour ce cours";
  }
  if (code === PACK_ERRORS.noSessionsLeft) return "Plus de séances disponibles pour ce cours";
  if (code === PACK_ERRORS.packChoiceRequired) {
    return "Plusieurs packs couvrent ce cours : précisez le pack à débiter.";
  }
  if (code === "P2034" || /write conflict|deadlock/i.test(code)) {
    return "Conflit temporaire, réessayez";
  }
  return "Enregistrement impossible";
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
  preferredPackId?: string | null;
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
    const resolved = await resolvePlanningPeriodConfigForSessionYmd(input.sessionDateYmd);
    if (!resolved || !isSessionYmdWithinPlanningPeriod(input.sessionDateYmd, resolved)) {
      throw new Error("OUTSIDE_PERIOD");
    }
  }

  // Avant le débit : rouvrir les packs « En cours / pas démarrés » restés REPLACED + recalculer le solde.
  await ensureMemberParallelPackStockForDebit(input.memberId);

  const maxAttempts = 3;
  let result: {
    reservationId: string;
    alreadyMarked: boolean;
    packStartAdjusted: boolean;
  } | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      result = await prisma.$transaction(
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
            select: { id: true, packId: true, packStartedAt: true },
          });
          if (!member) throw new Error("MEMBER_NOT_FOUND");

          const existing = await tx.reservation.findUnique({
            where: {
              memberId_planningId_sessionDate: {
                memberId: input.memberId,
                planningId: input.planningId,
                sessionDate: sessionDateDb,
              },
            },
            select: {
              id: true,
              status: true,
              packRefundedAt: true,
              debitedPackId: true,
              attendance: { select: { reservationId: true } },
            },
          });

          const preferredPackId = input.preferredPackId ?? existing?.debitedPackId ?? null;

          if (existing?.status === "ATTENDED") {
            if (existing.attendance) {
              return {
                reservationId: existing.id,
                alreadyMarked: true,
                packStartAdjusted: false,
              };
            }
            await tx.attendance.create({
              data: {
                reservationId: existing.id,
                memberId: input.memberId,
                planningId: input.planningId,
                sessionDate: sessionDateDb,
                markedBy: HISTORICAL_PRESENCE_MARKED_BY.ATTENDED_REPAIR,
              },
            });
            return {
              reservationId: existing.id,
              alreadyMarked: false,
              packStartAdjusted: false,
            };
          }

          if (existing?.status === "BOOKED") {
            const selected = await preparePackForAdminPresenceDebit(tx, {
              memberId: input.memberId,
              memberPackId: member.packId,
              memberPackStartedAt: member.packStartedAt,
              courseSlug: planning.courseSlug,
              sessionDateDb,
              sessionDateLocal,
              preferredPackId: existing.debitedPackId ?? preferredPackId,
            });
            await debitSelectedPackSession(tx, {
              memberId: input.memberId,
              pack: selected.pack,
              courseSlug: planning.courseSlug,
              sessionDateDb,
            });
            await tx.reservation.update({
              where: { id: existing.id },
              data: {
                status: "ATTENDED",
                source: "ADMIN",
                createdByUserId: input.createdByUserId ?? null,
                debitedPackId: selected.pack.id,
              },
            });
            await tx.attendance.create({
              data: {
                reservationId: existing.id,
                memberId: input.memberId,
                planningId: input.planningId,
                sessionDate: sessionDateDb,
                markedBy: HISTORICAL_PRESENCE_MARKED_BY.BOOKED,
              },
            });
            return { reservationId: existing.id, alreadyMarked: false, packStartAdjusted: true };
          }

          if (existing?.status === "CANCELLED" && !existing.packRefundedAt) {
            const selected = await preparePackForAdminPresenceDebit(tx, {
              memberId: input.memberId,
              memberPackId: member.packId,
              memberPackStartedAt: member.packStartedAt,
              courseSlug: planning.courseSlug,
              sessionDateDb,
              sessionDateLocal,
              preferredPackId: preferredPackId,
            });
            await debitSelectedPackSession(tx, {
              memberId: input.memberId,
              pack: selected.pack,
              courseSlug: planning.courseSlug,
              sessionDateDb,
            });
            await tx.reservation.update({
              where: { id: existing.id },
              data: {
                status: "ATTENDED",
                source: "ADMIN",
                createdByUserId: input.createdByUserId ?? null,
                debitedPackId: selected.pack.id,
              },
            });
            await tx.attendance.create({
              data: {
                reservationId: existing.id,
                memberId: input.memberId,
                planningId: input.planningId,
                sessionDate: sessionDateDb,
                markedBy: HISTORICAL_PRESENCE_MARKED_BY.CANCELLED,
              },
            });
            return { reservationId: existing.id, alreadyMarked: false, packStartAdjusted: true };
          }

          const selected = await preparePackForAdminPresenceDebit(tx, {
            memberId: input.memberId,
            memberPackId: member.packId,
            memberPackStartedAt: member.packStartedAt,
            courseSlug: planning.courseSlug,
            sessionDateDb,
            sessionDateLocal,
            preferredPackId,
          });

          if (existing?.status === "WAITLIST") {
            await debitSelectedPackSession(tx, {
              memberId: input.memberId,
              pack: selected.pack,
              courseSlug: planning.courseSlug,
              sessionDateDb,
            });
            await tx.reservation.update({
              where: { id: existing.id },
              data: {
                status: "ATTENDED",
                source: "ADMIN",
                createdByUserId: input.createdByUserId ?? null,
                debitedPackId: selected.pack.id,
              },
            });
            await tx.attendance.create({
              data: {
                reservationId: existing.id,
                memberId: input.memberId,
                planningId: input.planningId,
                sessionDate: sessionDateDb,
                markedBy: HISTORICAL_PRESENCE_MARKED_BY.WAITLIST,
              },
            });
            return { reservationId: existing.id, alreadyMarked: false, packStartAdjusted: true };
          }

          if (existing?.status === "CANCELLED" && existing.packRefundedAt) {
            await debitSelectedPackSession(tx, {
              memberId: input.memberId,
              pack: selected.pack,
              courseSlug: planning.courseSlug,
              sessionDateDb,
            });
            await tx.reservation.update({
              where: { id: existing.id },
              data: {
                status: "ATTENDED",
                source: "ADMIN",
                createdByUserId: input.createdByUserId ?? null,
                packRefundedAt: null,
                debitedPackId: selected.pack.id,
              },
            });
            await tx.attendance.create({
              data: {
                reservationId: existing.id,
                memberId: input.memberId,
                planningId: input.planningId,
                sessionDate: sessionDateDb,
                markedBy: HISTORICAL_PRESENCE_MARKED_BY.CANCELLED_REFUNDED,
              },
            });
            return { reservationId: existing.id, alreadyMarked: false, packStartAdjusted: true };
          }

          await debitSelectedPackSession(tx, {
            memberId: input.memberId,
            pack: selected.pack,
            courseSlug: planning.courseSlug,
            sessionDateDb,
          });
          const created = await tx.reservation.create({
            data: {
              memberId: input.memberId,
              planningId: input.planningId,
              sessionDate: sessionDateDb,
              status: "ATTENDED",
              source: "ADMIN",
              createdByUserId: input.createdByUserId ?? null,
              packRefundedAt: null,
              debitedPackId: selected.pack.id,
            },
          });
          await tx.attendance.create({
            data: {
              reservationId: created.id,
              memberId: input.memberId,
              planningId: input.planningId,
              sessionDate: sessionDateDb,
              markedBy: HISTORICAL_PRESENCE_MARKED_BY.NEW,
            },
          });
          return { reservationId: created.id, alreadyMarked: false, packStartAdjusted: true };
        },
        {
          isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
          maxWait: 5000,
          timeout: 10000,
        },
      );
      break;
    } catch (error) {
      if (!isTransactionWriteConflict(error) || attempt === maxAttempts) {
        if (isTransactionWriteConflict(error)) throw new Error("P2034");
        throw error;
      }
      await refreshMemberPackBalancesForDebit(input.memberId);
    }
  }

  if (!result) throw new Error("UNKNOWN");

  return {
    reservationId: result.reservationId,
    memberId: input.memberId,
    sessionDateYmd: input.sessionDateYmd,
    alreadyMarked: result.alreadyMarked,
    packStartAdjusted: result.packStartAdjusted,
    packStartedAtYmd: input.sessionDateYmd,
  };
}
