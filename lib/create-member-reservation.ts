import { Prisma } from "@prisma/client";
import {
  isSessionSlotEndedLocal,
  parseYmdLocal,
  parseYmdToPrismaDate,
  prismaDayOfWeekFromLocalDate,
  startOfLocalToday,
} from "@/lib/calendar-day";
import { getPlanningPeriodConfig } from "@/lib/admin/planning-period-config";
import { getStudioBookingRules } from "@/lib/studio-booking-rules-server";
import { isMemberReservationDeskOpen } from "@/lib/studio-booking-rules";
import { assertMemberCanBookOccurrence } from "@/lib/admin/planning-staggered-publish";
import { resetMemberPackBalancesForPack } from "@/lib/admin/member-pack-renewal";
import { activateSelectedPackOnSessionDate } from "@/lib/admin/member-pack-activation";
import {
  debitSelectedPackSession,
  resolvePackForMemberBooking,
} from "@/lib/admin/member-pack-selection";
import { ensureMemberParallelPackStockForDebit } from "@/lib/admin/member-owned-packs";
import { effectivePlanningCapacity } from "@/lib/planning-session-slot";
import { prisma } from "@/lib/prisma";

export const PACK_ERRORS = {
  noSessionsLeft: "NO_SESSIONS_LEFT",
  notAllowedCourse: "PACK_NOT_ALLOWED_FOR_COURSE",
  noPack: "NO_PACK",
  packInactive: "PACK_INACTIVE",
  packExpired: "PACK_EXPIRED",
  packNotStarted: "PACK_NOT_STARTED",
  packCategoryMismatch: "PACK_CATEGORY_MISMATCH",
  packChoiceRequired: "PACK_CHOICE_REQUIRED",
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
  /** Pack à débiter. Obligatoire si plusieurs packs couvrent ce cours. */
  packId?: string;
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
    const bookingRules = await getStudioBookingRules();
    if (!isMemberReservationDeskOpen(bookingRules)) {
      throw new Error("RESERVATION_DESK_CLOSED");
    }
    await getPlanningPeriodConfig();
  }

  await ensureMemberParallelPackStockForDebit(params.memberId);

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

      const memberRow = await tx.member.findUnique({
        where: { id: params.memberId },
        select: {
          id: true,
          userId: true,
          isActive: true,
          packId: true,
          packStartedAt: true,
        },
      });
      if (!memberRow) throw new Error("MEMBER_NOT_FOUND");

      const selected = await resolvePackForMemberBooking(tx, {
        memberId: params.memberId,
        courseSlug: planning.courseSlug,
        sessionDateLocal,
        preferredPackId: params.packId ?? null,
      });

      const pack = selected.pack;
      if (!pack.isActive) throw new Error(PACK_ERRORS.packInactive);

      const createdByUserId =
        source === "ADMIN" ? params.createdByUserId ?? null : memberRow.userId ?? null;

      await activateSelectedPackOnSessionDate(tx, {
        memberId: params.memberId,
        packId: pack.id,
        memberPackId: memberRow.packId,
        memberPackStartedAt: memberRow.packStartedAt,
        durationDays: pack.durationDays,
        sessionDateDb,
        sessionDateLocal,
      });

      const existingBalances = await tx.memberPackBalance.findMany({
        where: { memberId: params.memberId, packId: pack.id },
        select: { id: true },
      });
      if (existingBalances.length === 0) {
        await resetMemberPackBalancesForPack(tx, { memberId: params.memberId, packId: pack.id });
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
      const slotCapacity = effectivePlanningCapacity(planning.courseSlug, planning.capacity);
      let status: "BOOKED" | "WAITLIST";
      if (mainOccupied < slotCapacity) status = "BOOKED";
      else if (planning.waitlistCapacity != null && waitlistCount < planning.waitlistCapacity) status = "WAITLIST";
      else throw new Error("FULL");

      if (existing?.status === "CANCELLED") {
        if (status === "BOOKED" && existing.packRefundedAt) {
          await debitSelectedPackSession(tx, {
            memberId: params.memberId,
            pack,
            courseSlug: planning.courseSlug,
            sessionDateDb,
          });
        }
        const updated = await tx.reservation.update({
          where: { id: existing.id },
          data: {
            status,
            packRefundedAt: null,
            source,
            createdByUserId,
            debitedPackId: pack.id,
          },
        });
        if (!memberRow.isActive) {
          await tx.member.update({ where: { id: params.memberId }, data: { isActive: true } });
        }
        return updated;
      }

      if (status === "BOOKED") {
        await debitSelectedPackSession(tx, {
          memberId: params.memberId,
          pack,
          courseSlug: planning.courseSlug,
          sessionDateDb,
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
          debitedPackId: pack.id,
        },
      });

      if (!memberRow.isActive) {
        await tx.member.update({ where: { id: params.memberId }, data: { isActive: true } });
      }

      return created;
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      maxWait: 5000,
      timeout: 10000,
    },
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
  if (code === "RESERVATION_DESK_CLOSED") {
    return "Les réservations en ligne sont fermées pour le moment (voir les horaires affichés dans le planning).";
  }
  if (code === "DAY_MISMATCH") return "Ce cours n'a pas lieu à cette date";
  if (code === "ALREADY_RESERVED") return "Déjà inscrit sur ce créneau";
  if (code === "ALREADY_ATTENDED") return "Présence déjà enregistrée";
  if (code === "FULL") return "Complet (capacité et liste d'attente)";
  if (code === PACK_ERRORS.notAllowedCourse) {
    return "Ce pack ne permet pas ce type de cours.";
  }
  if (code === PACK_ERRORS.packCategoryMismatch) {
    return "Pack incompatible avec ce type de cours.";
  }
  if (code === PACK_ERRORS.noSessionsLeft) {
    return "Pack terminé : plus aucune séance disponible.";
  }
  if (code === PACK_ERRORS.noPack) {
    return "Aucun pack associé à cette adhérente.";
  }
  if (code === PACK_ERRORS.packInactive) {
    return "Ce pack n'est plus actif.";
  }
  if (code === PACK_ERRORS.packNotStarted) {
    return "Date trop tôt : le pack n'a pas encore démarré pour cette séance.";
  }
  if (code === PACK_ERRORS.packExpired) {
    return "Pack expiré pour cette date. Renouvelez le pack ou choisissez une date avant l'échéance.";
  }
  if (code === PACK_ERRORS.packChoiceRequired) {
    return "Plusieurs packs sont disponibles pour ce cours : choisissez le pack à utiliser.";
  }
  if (code === "OUTSIDE_PLANNING_PERIOD") {
    return "Cette date est en dehors de la période de réservation ouverte.";
  }
  return "Réservation impossible";
}
