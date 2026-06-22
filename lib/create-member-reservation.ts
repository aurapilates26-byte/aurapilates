import { Prisma } from "@prisma/client";
import {
  isSessionSlotEndedLocal,
  parseYmdLocal,
  parseYmdToPrismaDate,
  prismaDayOfWeekFromLocalDate,
  startOfLocalToday,
} from "@/lib/calendar-day";
import { getPlanningPeriodConfig } from "@/lib/admin/planning-period-config";
import { assertMemberCanBookOccurrence } from "@/lib/admin/planning-staggered-publish";
import { prisma } from "@/lib/prisma";
import { getEligibilityForPack, isCourseAllowedForPack } from "@/lib/pack-eligibility";
import { tryActivatePendingPackIfCurrentFinished } from "@/lib/admin/member-pack-renewal";
import { activateMemberPackOnSessionDate } from "@/lib/admin/member-pack-activation";
import { debitMemberPackSession } from "@/lib/member-pack-session-ledger";
import {
  isSessionDateWithinPackPeriod,
  packExpiresAtLocal,
} from "@/lib/member-pack-period";

export const PACK_ERRORS = {
  noSessionsLeft: "NO_SESSIONS_LEFT",
  notAllowedCourse: "PACK_NOT_ALLOWED_FOR_COURSE",
  noPack: "NO_PACK",
  packInactive: "PACK_INACTIVE",
  packExpired: "PACK_EXPIRED",
  packNotStarted: "PACK_NOT_STARTED",
  packCategoryMismatch: "PACK_CATEGORY_MISMATCH",
} as const;

export type CreateMemberReservationResult = {
  id: string;
  status: "BOOKED" | "WAITLIST";
  sessionDate: string;
  planningId: string;
};

export async function createMemberReservation(params: {
  memberId: string;
  planningId: string;
  sessionDate: string;
  source?: "ADMIN" | "MEMBER";
  /** Compte staff (admin/direction) ayant saisi la réservation manuellement. */
  createdByUserId?: string;
}): Promise<CreateMemberReservationResult> {
  const source = params.source ?? "MEMBER";
  const sessionDateLocal = parseYmdLocal(params.sessionDate);
  const sessionDateDb = parseYmdToPrismaDate(params.sessionDate);
  if (!sessionDateLocal || !sessionDateDb) {
    throw new Error("INVALID_DATE");
  }

  const today = startOfLocalToday();
  if (sessionDateLocal.getTime() < today.getTime()) {
    throw new Error("PAST_DATE");
  }

  if (source === "MEMBER") {
    await getPlanningPeriodConfig();
  }

  const result = await prisma.$transaction(
    async (tx) => {
      const planning = await tx.planning.findUnique({ where: { id: params.planningId } });
      if (!planning) throw new Error("PLANNING_NOT_FOUND");
      if (source === "MEMBER") {
        await assertMemberCanBookOccurrence({
          planning: {
            isDraft: planning.isDraft,
            dayOfWeek: planning.dayOfWeek,
            anchorSessionYmd: planning.anchorSessionYmd,
          },
          sessionYmd: params.sessionDate,
        });
      }
      if (isSessionSlotEndedLocal(params.sessionDate, planning.endTime)) {
        throw new Error("SLOT_ENDED");
      }
      if (planning.dayOfWeek !== prismaDayOfWeekFromLocalDate(sessionDateLocal)) {
        throw new Error("DAY_MISMATCH");
      }

      await tryActivatePendingPackIfCurrentFinished(tx, params.memberId);

      const memberWithPack = await tx.member.findUnique({
        where: { id: params.memberId },
        select: {
          id: true,
          userId: true,
          isActive: true,
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

      if (!memberWithPack) throw new Error("MEMBER_NOT_FOUND");
      if (!memberWithPack.pack) throw new Error(PACK_ERRORS.noPack);

      const createdByUserId =
        source === "ADMIN" ? params.createdByUserId ?? null : memberWithPack.userId ?? null;

      const pack = memberWithPack.pack;
      if (!pack.isActive) throw new Error(PACK_ERRORS.packInactive);

      const activation = await activateMemberPackOnSessionDate(tx, {
        memberId: params.memberId,
        currentPackStartedAt: memberWithPack.packStartedAt,
        sessionDateDb,
        sessionDateLocal,
      });
      const packStartedAt = activation.packStartedAt;
      const packStartDate = activation.packStartDate;

      if (
        memberWithPack.packStartedAt &&
        !isSessionDateWithinPackPeriod(sessionDateLocal, packStartedAt, pack.durationDays)
      ) {
        const expiresAt = packExpiresAtLocal(packStartedAt, pack.durationDays);
        if (expiresAt && sessionDateLocal.getTime() > expiresAt.getTime()) {
          throw new Error(PACK_ERRORS.packExpired);
        }
        throw new Error(PACK_ERRORS.packNotStarted);
      }

      const expiresAt = packExpiresAtLocal(packStartedAt, pack.durationDays);
      if (expiresAt && expiresAt.getTime() < today.getTime()) throw new Error(PACK_ERRORS.packExpired);

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

      const existingBalances = await tx.memberPackBalance.findMany({
        where: { memberId: params.memberId, packId: pack.id },
        select: { id: true, courseSlug: true, remaining: true },
      });

      if (existingBalances.length === 0) {
        if (isMixed) {
          const usedRows = packStartDate
            ? await tx.reservation.findMany({
                where: {
                  memberId: params.memberId,
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
              memberId: params.memberId,
              packId: pack.id,
              courseSlug: q.courseSlug,
              remaining: Math.max(0, q.sessionCount - (usedBySlug.get(q.courseSlug) ?? 0)),
            })),
          });
        } else if (pack.sessionCount != null) {
          const used = packStartDate
            ? await tx.reservation.count({
                where: {
                  memberId: params.memberId,
                  OR: [{ status: { in: ["BOOKED", "ATTENDED"] } }, { status: "CANCELLED", packRefundedAt: null }],
                  sessionDate: { gte: packStartDate, ...(expiresAt ? { lte: expiresAt } : {}) },
                },
              })
            : 0;
          await tx.memberPackBalance.create({
            data: {
              memberId: params.memberId,
              packId: pack.id,
              courseSlug: null,
              remaining: Math.max(0, pack.sessionCount - used),
            },
          });
        }
      }

      const existing = await tx.reservation.findUnique({
        where: {
          memberId_planningId_sessionDate: {
            memberId: params.memberId,
            planningId: params.planningId,
            sessionDate: sessionDateDb,
          },
        },
        select: { id: true, status: true, packRefundedAt: true },
      });

      if (existing) {
        if (existing.status === "BOOKED" || existing.status === "WAITLIST") throw new Error("ALREADY_RESERVED");
        if (existing.status === "ATTENDED") throw new Error("ALREADY_ATTENDED");
      }

      const rows = await tx.reservation.findMany({
        where: {
          planningId: params.planningId,
          sessionDate: sessionDateDb,
          status: { in: ["BOOKED", "WAITLIST", "ATTENDED"] },
        },
        select: { status: true },
      });

      const mainOccupied = rows.filter((r) => r.status === "BOOKED" || r.status === "ATTENDED").length;
      const waitlistCount = rows.filter((r) => r.status === "WAITLIST").length;

      let status: "BOOKED" | "WAITLIST";
      if (mainOccupied < planning.capacity) status = "BOOKED";
      else if (planning.waitlistCapacity != null && waitlistCount < planning.waitlistCapacity) status = "WAITLIST";
      else throw new Error("FULL");

      if (existing?.status === "CANCELLED") {
        if (status === "BOOKED" && existing.packRefundedAt) {
          await debitMemberPackSession(tx, {
            memberId: params.memberId,
            pack,
            courseSlug: planning.courseSlug,
          });
        }
        const updated = await tx.reservation.update({
          where: { id: existing.id },
          data: { status, packRefundedAt: null, source, createdByUserId },
        });
        if (!memberWithPack.isActive) {
          await tx.member.update({ where: { id: params.memberId }, data: { isActive: true } });
        }
        await tryActivatePendingPackIfCurrentFinished(tx, params.memberId);
        return updated;
      }

      if (status === "BOOKED") {
        await debitMemberPackSession(tx, {
          memberId: params.memberId,
          pack,
          courseSlug: planning.courseSlug,
        });
      }

      const created = await tx.reservation.create({
        data: {
          memberId: params.memberId,
          planningId: params.planningId,
          sessionDate: sessionDateDb,
          status,
          source,
          createdByUserId,
          packRefundedAt: null,
        },
      });

      if (!memberWithPack.isActive) {
        await tx.member.update({ where: { id: params.memberId }, data: { isActive: true } });
      }
      await tryActivatePendingPackIfCurrentFinished(tx, params.memberId);

      return created;
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      maxWait: 5000,
      timeout: 10000,
    }
  );

  return {
    id: result.id,
    status: result.status as "BOOKED" | "WAITLIST",
    sessionDate: params.sessionDate,
    planningId: params.planningId,
  };
}

export function reservationErrorMessage(code: string): string {
  if (code === "PLANNING_NOT_FOUND") return "Cours introuvable";
  if (code === "MEMBER_NOT_FOUND") return "Adhérente introuvable";
  if (code === "INVALID_DATE" || code === "PAST_DATE") return "Date invalide ou passée";
  if (code === "SLOT_ENDED") return "Ce créneau est déjà terminé";
  if (code === "DAY_MISMATCH") return "Ce cours n'a pas lieu à cette date";
  if (code === "ALREADY_RESERVED") return "Déjà inscrit sur ce créneau";
  if (code === "ALREADY_ATTENDED") return "Présence déjà enregistrée";
  if (code === "FULL") return "Complet (capacité et liste d'attente)";
  if (code === PACK_ERRORS.notAllowedCourse) return "Ce pack ne permet pas ce cours";
  if (code === PACK_ERRORS.packCategoryMismatch) return "Pack incompatible avec ce type de cours";
  if (code === PACK_ERRORS.noSessionsLeft) return "Plus de séances disponibles";
  if (code === PACK_ERRORS.noPack) return "Aucun pack associé";
  if (code === PACK_ERRORS.packInactive) return "Pack inactif";
  if (code === PACK_ERRORS.packNotStarted) return "Date hors période de validité du pack";
  if (code === PACK_ERRORS.packExpired) return "Pack expiré";
  if (code === "OUTSIDE_PLANNING_PERIOD") {
    return "Cette date est en dehors de la période de réservation ouverte.";
  }
  return "Réservation impossible";
}
