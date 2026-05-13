import { Prisma } from "@prisma/client";
import { courseLabel } from "@/lib/course-labels";
import {
  formatYmdLocal,
  formatYmdPrismaDate,
  isSessionSlotEndedLocal,
  parseYmdLocal,
  parseYmdToPrismaDate,
  prismaDateGteFromLocal,
  prismaDayOfWeekFromLocalDate,
  startOfLocalToday,
} from "@/lib/calendar-day";
import { broadcastMemberBookingRefresh } from "@/lib/member-booking-stream";
import { prisma } from "@/lib/prisma";
import { addPackDurationToStartDate } from "@/lib/pack-duration";
import { requireMemberSession } from "@/lib/require-member";
import { getEligibilityForPack } from "@/lib/pack-eligibility";
import { z } from "zod";

const createSchema = z.object({
  planningId: z.string().trim().cuid(),
  sessionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

function errorResponse(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

const PACK_ERRORS = {
  noSessionsLeft: "NO_SESSIONS_LEFT",
  notAllowedCourse: "PACK_NOT_ALLOWED_FOR_COURSE",
  noPack: "NO_PACK",
  packInactive: "PACK_INACTIVE",
  packExpired: "PACK_EXPIRED",
  packNotStarted: "PACK_NOT_STARTED",
  packCategoryMismatch: "PACK_CATEGORY_MISMATCH",
} as const;

export async function GET() {
  const guard = await requireMemberSession();
  if ("error" in guard) return guard.error;

  const { member } = guard;
  const fromDay = startOfLocalToday();
  const fromYmd = formatYmdLocal(fromDay);
  const sessionGte = prismaDateGteFromLocal(fromDay);

  const itemsRaw = await prisma.reservation.findMany({
    where: {
      memberId: member.id,
      sessionDate: { gte: sessionGte },
      status: { in: ["BOOKED", "WAITLIST"] },
    },
    orderBy: [{ sessionDate: "asc" }, { createdAt: "asc" }],
    include: {
      planning: {
        include: {
          coach: { select: { firstName: true, lastName: true, imageUrl: true } },
        },
      },
    },
  });

  const items = itemsRaw.filter((r) => {
    const ymd = formatYmdPrismaDate(new Date(r.sessionDate));
    return ymd >= fromYmd && !isSessionSlotEndedLocal(ymd, r.planning.endTime);
  });

  const mapReservationRow = (r: (typeof itemsRaw)[number]) => ({
    id: r.id,
    status: r.status,
    sessionDate: formatYmdPrismaDate(new Date(r.sessionDate)),
    reservedAt: r.createdAt.toISOString(),
    packRefundedAt: r.packRefundedAt ? r.packRefundedAt.toISOString() : null,
    planning: {
      id: r.planning.id,
      courseSlug: r.planning.courseSlug,
      courseLabel: courseLabel(r.planning.courseSlug),
      startTime: r.planning.startTime,
      endTime: r.planning.endTime,
      level: r.planning.level,
      coachName: r.planning.coach
        ? `${r.planning.coach.firstName} ${r.planning.coach.lastName}`.trim()
        : null,
      coachImageUrl: r.planning.coach?.imageUrl ?? null,
    },
  });

  /**
   * Historique : annulations, présences, jours passés, et réservations encore BOOKED/WAITLIST
   * dont le créneau (fin du cours) est déjà passé aujourd'hui.
   */
  const historyRaw = await prisma.reservation.findMany({
    where: {
      memberId: member.id,
      NOT: {
        AND: [{ sessionDate: { gte: sessionGte } }, { status: { in: ["BOOKED", "WAITLIST"] } }],
      },
    },
    orderBy: [{ sessionDate: "desc" }, { createdAt: "desc" }],
    take: 80,
    include: {
      planning: {
        include: {
          coach: { select: { firstName: true, lastName: true, imageUrl: true } },
        },
      },
    },
  });

  const fromEndedSlotStillActive = itemsRaw
    .filter((r) => {
      const ymd = formatYmdPrismaDate(new Date(r.sessionDate));
      return ymd >= fromYmd && isSessionSlotEndedLocal(ymd, r.planning.endTime);
    })
    .map(mapReservationRow);

  const historyById = new Map<string, ReturnType<typeof mapReservationRow>>();
  for (const row of fromEndedSlotStillActive) {
    historyById.set(row.id, row);
  }
  for (const r of historyRaw) {
    const row = mapReservationRow(r);
    historyById.set(row.id, row);
  }

  const history = [...historyById.values()]
    .sort((a, b) => {
      const d = b.sessionDate.localeCompare(a.sessionDate);
      if (d !== 0) return d;
      return b.reservedAt.localeCompare(a.reservedAt);
    })
    .slice(0, 50);

  return Response.json({
    items: items.map(mapReservationRow),
    history,
  });
}

export async function POST(request: Request) {
  const guard = await requireMemberSession();
  if ("error" in guard) return guard.error;

  const { member } = guard;
  const raw = await request.json().catch(() => null);
  const parsed = createSchema.safeParse(raw);
  if (!parsed.success) {
    return errorResponse("Données invalides", 400);
  }

  const { planningId, sessionDate: sessionDateStr } = parsed.data;
  const sessionDateLocal = parseYmdLocal(sessionDateStr);
  const sessionDateDb = parseYmdToPrismaDate(sessionDateStr);
  if (!sessionDateLocal || !sessionDateDb) {
    return errorResponse("Date invalide", 400);
  }

  const today = startOfLocalToday();
  if (sessionDateLocal.getTime() < today.getTime()) {
    return errorResponse("Impossible de réserver une date passée", 409);
  }

  try {
    const result = await prisma.$transaction(
      async (tx) => {
        const planning = await tx.planning.findUnique({
          where: { id: planningId },
        });
        if (!planning) {
          throw new Error("PLANNING_NOT_FOUND");
        }
        if (planning.dayOfWeek !== prismaDayOfWeekFromLocalDate(sessionDateLocal)) {
          throw new Error("DAY_MISMATCH");
        }

        const memberWithPack = await tx.member.findUnique({
          where: { id: member.id },
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

        if (!memberWithPack?.pack) throw new Error(PACK_ERRORS.noPack);
        const pack = memberWithPack.pack;
        if (!pack.isActive) throw new Error(PACK_ERRORS.packInactive);

        const packStartDate = memberWithPack.packStartedAt
          ? new Date(
              memberWithPack.packStartedAt.getFullYear(),
              memberWithPack.packStartedAt.getMonth(),
              memberWithPack.packStartedAt.getDate(),
            )
          : null;
        if (!packStartDate && pack.durationDays) {
          throw new Error(PACK_ERRORS.packNotStarted);
        }
        const expiresAt =
          packStartDate && pack.durationDays ? addPackDurationToStartDate(packStartDate, pack.durationDays) : null;
        if (expiresAt && expiresAt.getTime() < today.getTime()) {
          throw new Error(PACK_ERRORS.packExpired);
        }

        const isMixed = pack.courseQuotas.length > 0;
        const eligibility = getEligibilityForPack({
          category: pack.category ?? null,
          courseQuotas: pack.courseQuotas,
        });

        if (!isMixed && eligibility.mode === "single" && eligibility.allowedCourseSlugs.length > 0) {
          if (!eligibility.allowedCourseSlugs.includes(planning.courseSlug)) {
            throw new Error(PACK_ERRORS.packCategoryMismatch);
          }
        }
        const targetCourseSlug = isMixed ? planning.courseSlug : null;

        // Ensure we have a stored balance. If missing (legacy data), initialize from pack definition minus already-allocated sessions.
        const existingBalances = await tx.memberPackBalance.findMany({
          where: { memberId: member.id, packId: pack.id },
          select: { id: true, courseSlug: true, remaining: true },
        });

        if (existingBalances.length === 0) {
          if (isMixed) {
            const usedRows = packStartDate
              ? await tx.reservation.findMany({
                  where: {
                    memberId: member.id,
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
                memberId: member.id,
                packId: pack.id,
                courseSlug: q.courseSlug,
                remaining: Math.max(0, q.sessionCount - (usedBySlug.get(q.courseSlug) ?? 0)),
              })),
            });
          } else if (pack.sessionCount != null) {
            const used = packStartDate
              ? await tx.reservation.count({
                  where: {
                    memberId: member.id,
                    OR: [{ status: { in: ["BOOKED", "ATTENDED"] } }, { status: "CANCELLED", packRefundedAt: null }],
                    sessionDate: { gte: packStartDate, ...(expiresAt ? { lte: expiresAt } : {}) },
                  },
                })
              : 0;
            await tx.memberPackBalance.create({
              data: {
                memberId: member.id,
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
              memberId: member.id,
              planningId,
              sessionDate: sessionDateDb,
            },
          },
          select: { id: true, status: true, packRefundedAt: true },
        });

        if (existing) {
          if (existing.status === "BOOKED" || existing.status === "WAITLIST") {
            throw new Error("ALREADY_RESERVED");
          }
          if (existing.status === "ATTENDED") {
            throw new Error("ALREADY_ATTENDED");
          }
        }

        const rows = await tx.reservation.findMany({
          where: {
            planningId,
            sessionDate: sessionDateDb,
            status: { in: ["BOOKED", "WAITLIST", "ATTENDED"] },
          },
          select: { status: true },
        });

        const mainOccupied = rows.filter((r) => r.status === "BOOKED" || r.status === "ATTENDED").length;
        const waitlistCount = rows.filter((r) => r.status === "WAITLIST").length;

        let status: "BOOKED" | "WAITLIST";
        if (mainOccupied < planning.capacity) {
          status = "BOOKED";
        } else if (planning.waitlistCapacity != null && waitlistCount < planning.waitlistCapacity) {
          status = "WAITLIST";
        } else {
          throw new Error("FULL");
        }

        if (existing?.status === "CANCELLED") {
          // If the cancellation was refunded (>6h), re-activation must consume again.
          if (existing.packRefundedAt) {
            const updatedBalance = await tx.memberPackBalance.updateMany({
              where: {
                memberId: member.id,
                packId: pack.id,
                courseSlug: targetCourseSlug,
                remaining: { gt: 0 },
              },
              data: { remaining: { decrement: 1 } },
            });
            if (updatedBalance.count === 0) {
              if (isMixed) {
                const allowed = pack.courseQuotas.some((q) => q.courseSlug === planning.courseSlug);
                if (!allowed) throw new Error(PACK_ERRORS.notAllowedCourse);
              }
              throw new Error(PACK_ERRORS.noSessionsLeft);
            }
          }

          return tx.reservation.update({
            where: { id: existing.id },
            data: { status, packRefundedAt: null },
          });
        }

        // Consume one session from stored balance (atomic).
        const updatedBalance = await tx.memberPackBalance.updateMany({
          where: {
            memberId: member.id,
            packId: pack.id,
            courseSlug: targetCourseSlug,
            remaining: { gt: 0 },
          },
          data: { remaining: { decrement: 1 } },
        });
        if (updatedBalance.count === 0) {
          if (isMixed) {
            const allowed = pack.courseQuotas.some((q) => q.courseSlug === planning.courseSlug);
            if (!allowed) throw new Error(PACK_ERRORS.notAllowedCourse);
          }
          throw new Error(PACK_ERRORS.noSessionsLeft);
        }

        return tx.reservation.create({
          data: {
            memberId: member.id,
            planningId,
            sessionDate: sessionDateDb,
            status,
            packRefundedAt: null,
          },
        });
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        maxWait: 5000,
        timeout: 10000,
      }
    );

    broadcastMemberBookingRefresh();
    return Response.json({
      item: {
        id: result.id,
        status: result.status,
        sessionDate: sessionDateStr,
        planningId,
      },
    });
  } catch (e) {
    const code = e instanceof Error ? e.message : "";
    if (code === "PLANNING_NOT_FOUND") return errorResponse("Cours introuvable", 404);
    if (code === "DAY_MISMATCH") return errorResponse("Ce cours n'a pas lieu à cette date", 409);
    if (code === "ALREADY_RESERVED") return errorResponse("Vous êtes déjà inscrite sur ce créneau", 409);
    if (code === "ALREADY_ATTENDED") return errorResponse("Présence déjà enregistrée pour ce créneau", 409);
    if (code === "FULL") return errorResponse("Complet (capacité et liste d'attente)", 409);
    if (code === PACK_ERRORS.notAllowedCourse) return errorResponse("Ce pack ne permet pas de réserver ce cours", 409);
    if (code === PACK_ERRORS.packCategoryMismatch) {
      return errorResponse("Votre pack ne permet pas de réserver ce type de cours", 409);
    }
    if (code === PACK_ERRORS.noSessionsLeft) return errorResponse("Vous n'avez plus de séances disponibles pour ce cours", 409);
    if (code === PACK_ERRORS.noPack) return errorResponse("Aucun pack actif n'est associé à votre compte", 409);
    if (code === PACK_ERRORS.packInactive) return errorResponse("Votre pack est inactif", 409);
    if (code === PACK_ERRORS.packNotStarted) return errorResponse("Votre pack n'est pas encore actif (date de début manquante)", 409);
    if (code === PACK_ERRORS.packExpired) return errorResponse("Votre pack est expiré", 409);
    return errorResponse("Réservation impossible", 409);
  }
}
