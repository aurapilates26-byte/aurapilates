import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { courseLabel } from "@/lib/course-labels";
import {
  formatYmdLocal,
  formatYmdPrismaDate,
  parseYmdToPrismaDate,
  prismaDayOfWeekLocalNow,
  startOfLocalToday,
} from "@/lib/calendar-day";
import { prisma } from "@/lib/prisma";

function errorResponse(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

function pad2(value: number) {
  return String(value).padStart(2, "0");
}

function localNowTimeString(offsetMinutes: number = 0) {
  const n = new Date();
  if (offsetMinutes === 0) return `${pad2(n.getHours())}:${pad2(n.getMinutes())}`;
  const d = new Date(n.getTime() + offsetMinutes * 60_000);
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

function minus15Minutes(clock: string) {
  const [hhRaw, mmRaw] = clock.split(":");
  const hh = Number(hhRaw ?? 0);
  const mm = Number(mmRaw ?? 0);
  const total = hh * 60 + mm - 15;
  const clamped = ((total % (24 * 60)) + 24 * 60) % (24 * 60);
  const outH = Math.floor(clamped / 60);
  const outM = clamped % 60;
  return `${pad2(outH)}:${pad2(outM)}`;
}

function formatDayLabelFr(targetYmd: string, todayYmd: string) {
  if (targetYmd === todayYmd) return "aujourd'hui";
  const [y, m, d] = targetYmd.split("-").map(Number);
  const target = new Date(y, (m ?? 1) - 1, d ?? 1);
  const tomorrow = new Date(target.getFullYear(), target.getMonth(), target.getDate() - 0);
  // build tomorrow from "today" for exact compare (avoid DST weirdness)
  const [ty, tm, td] = todayYmd.split("-").map(Number);
  const t = new Date(ty, (tm ?? 1) - 1, td ?? 1);
  const tmr = new Date(t.getFullYear(), t.getMonth(), t.getDate() + 1);
  const tmrYmd = formatYmdLocal(tmr);
  if (targetYmd === tmrYmd) return "demain";

  const rawWeekday = target.toLocaleDateString("fr-FR", { weekday: "long" });
  const weekday = rawWeekday ? `${rawWeekday.slice(0, 1).toUpperCase()}${rawWeekday.slice(1)}` : rawWeekday;
  const dateFr = target.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
  return `${weekday} ${dateFr}`;
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return errorResponse("Forbidden", 403);
  }

  const url = new URL(request.url);
  const qrPublicId = url.searchParams.get("qrPublicId")?.trim() ?? "";
  const memberId = url.searchParams.get("memberId")?.trim() ?? "";

  const qr = qrPublicId
    ? await prisma.qrCode.findUnique({
        where: { publicId: qrPublicId },
        select: {
          publicId: true,
          assignedMemberId: true,
          assignedMember: {
            select: { id: true, firstName: true, lastName: true, phone: true },
          },
        },
      })
    : null;

  if (qrPublicId && (!qr?.assignedMemberId || !qr.assignedMember)) {
    return errorResponse("QR non affecte a un membre", 404);
  }

  const member =
    !qrPublicId && memberId
      ? await prisma.member.findUnique({
          where: { id: memberId },
          select: { id: true, firstName: true, lastName: true, phone: true },
        })
      : null;

  if (!qrPublicId && memberId && !member) {
    return errorResponse("Membre introuvable", 404);
  }

  const sessionDate = startOfLocalToday();
  const sessionDateYmd = formatYmdLocal(sessionDate);
  const sessionDateDb = parseYmdToPrismaDate(sessionDateYmd);
  if (!sessionDateDb) return errorResponse("Date invalide", 400);
  const todayDow = prismaDayOfWeekLocalNow();
  const nowTime = localNowTimeString();
  const nowPlus15 = localNowTimeString(15);

  const activeSlot = await prisma.planning.findFirst({
    where: {
      dayOfWeek: todayDow,
      // Ouverture présence 15 minutes avant le début du cours.
      startTime: { lte: nowPlus15 },
      endTime: { gte: nowTime },
    },
    orderBy: { startTime: "desc" },
    include: { coach: { select: { firstName: true, lastName: true, imageUrl: true } } },
  });

  const memberIdForNext = (qr?.assignedMemberId ?? member?.id) || null;
  const nextReservedAfterNow =
    memberIdForNext
      ? await prisma.reservation.findFirst({
          where: {
            memberId: memberIdForNext,
            status: { in: ["BOOKED", "WAITLIST"] },
            OR: [
              // Futur (demain et après)
              { sessionDate: { gt: sessionDateDb } },
              // Aujourd'hui mais à venir (après maintenant)
              { sessionDate: sessionDateDb, planning: { startTime: { gt: nowTime } } },
            ],
          },
          orderBy: [{ sessionDate: "asc" }, { planning: { startTime: "asc" } }, { createdAt: "asc" }],
          include: {
            planning: { include: { coach: { select: { firstName: true, lastName: true, imageUrl: true } } } },
          },
        })
      : null;

  const nextUpcomingClass =
    nextReservedAfterNow != null
      ? (() => {
          const nextYmd = formatYmdPrismaDate(new Date(nextReservedAfterNow.sessionDate));
          const opensAt = minus15Minutes(nextReservedAfterNow.planning.startTime);
          const dayLabel = formatDayLabelFr(nextYmd, sessionDateYmd);
          const coachName = nextReservedAfterNow.planning.coach
            ? `${nextReservedAfterNow.planning.coach.firstName} ${nextReservedAfterNow.planning.coach.lastName}`.trim()
            : null;
          const coachImageUrl = nextReservedAfterNow.planning.coach?.imageUrl ?? null;

          return {
            planningId: nextReservedAfterNow.planningId,
            courseSlug: nextReservedAfterNow.planning.courseSlug,
            courseLabel: courseLabel(nextReservedAfterNow.planning.courseSlug),
            sessionDate: nextYmd,
            dayLabel,
            opensAt,
            startTime: nextReservedAfterNow.planning.startTime,
            endTime: nextReservedAfterNow.planning.endTime,
            level: nextReservedAfterNow.planning.level,
            capacity: nextReservedAfterNow.planning.capacity,
            waitlistCapacity: nextReservedAfterNow.planning.waitlistCapacity,
            coachName,
            coachImageUrl,
          };
        })()
      : null;

  // Mode manuel (sans QR): on affiche la liste du créneau ouvrable actuel (ou prochain dans ≤15min).
  if (!qrPublicId && !memberId) {
    if (!activeSlot) {
      return Response.json({
        scannedMember: null,
        sessionDate: sessionDateYmd,
        nowTime,
        message: "Aucun cours ouvrable pour le moment.",
        class: null,
        upcomingClass: null,
        nextUpcomingClass: null,
      });
    }

    const planning = await prisma.planning.findUnique({
      where: { id: activeSlot.id },
      include: {
        coach: { select: { firstName: true, lastName: true, imageUrl: true } },
        reservations: {
          where: {
            sessionDate: sessionDateDb,
            status: { in: ["BOOKED", "WAITLIST", "ATTENDED"] },
          },
          orderBy: { createdAt: "asc" },
          include: {
            member: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                phone: true,
                user: { select: { email: true } },
              },
            },
          },
        },
      },
    });

    if (!planning) return errorResponse("Creneau introuvable", 404);

    return Response.json({
      scannedMember: null,
      sessionDate: sessionDateYmd,
      nowTime,
      message: null,
      class: {
        planningId: planning.id,
        courseSlug: planning.courseSlug,
        courseLabel: courseLabel(planning.courseSlug),
        startTime: planning.startTime,
        endTime: planning.endTime,
        level: planning.level,
        capacity: planning.capacity,
        waitlistCapacity: planning.waitlistCapacity,
        coachName: planning.coach ? `${planning.coach.firstName} ${planning.coach.lastName}`.trim() : null,
        coachImageUrl: planning.coach?.imageUrl ?? null,
        scannedReservationId: null,
        scannedReservationStatus: null,
        reservations: planning.reservations.map((r) => ({
          id: r.id,
          status: r.status,
          member: {
            id: r.member.id,
            firstName: r.member.firstName,
            lastName: r.member.lastName,
            email: r.member.user?.email ?? null,
            phone: r.member.phone ?? null,
          },
        })),
      },
      upcomingClass: null,
      nextUpcomingClass: null,
    });
  }

  const nextReserved = await prisma.reservation.findFirst({
    where: {
      memberId: (qr?.assignedMemberId ?? member?.id)!,
      status: { in: ["BOOKED", "WAITLIST"] },
      OR: [
        // Futur (demain et après)
        { sessionDate: { gt: sessionDateDb } },
        // Aujourd'hui mais pas terminé
        { sessionDate: sessionDateDb, planning: { endTime: { gte: nowTime } } },
      ],
    },
    orderBy: [{ sessionDate: "asc" }, { planning: { startTime: "asc" } }, { createdAt: "asc" }],
    include: {
      planning: { include: { coach: { select: { firstName: true, lastName: true, imageUrl: true } } } },
    },
  });

  // Si aucun cours "ouvrable" maintenant (activeSlot null),
  // on affiche un message guidant l'admin vers le prochain cours réservé (aujourd'hui/demain/…).
  if (!activeSlot) {
    if (!nextReserved) {
      return Response.json({
        scannedMember: qr?.assignedMember ?? member,
        sessionDate: sessionDateYmd,
        nowTime,
        message: "Aucun cours reserve pour ce membre (aujourd'hui ou apres).",
        class: null,
        upcomingClass: null,
        nextUpcomingClass: null,
      });
    }

    // sessionDate est un @db.Date => sérialisé en JS à minuit UTC.
    // On utilise le format Prisma (UTC) pour éviter un décalage de jour en local.
    const nextYmd = formatYmdPrismaDate(new Date(nextReserved.sessionDate));
    const opensAt = minus15Minutes(nextReserved.planning.startTime);
    const dayLabel = formatDayLabelFr(nextYmd, sessionDateYmd);
    const coachName = nextReserved.planning.coach
      ? `${nextReserved.planning.coach.firstName} ${nextReserved.planning.coach.lastName}`.trim()
      : null;
    const coachImageUrl = nextReserved.planning.coach?.imageUrl ?? null;

    return Response.json({
      scannedMember: qr?.assignedMember ?? member,
      sessionDate: sessionDateYmd,
      nowTime,
      message: null,
      class: null,
      upcomingClass: {
        planningId: nextReserved.planningId,
        courseSlug: nextReserved.planning.courseSlug,
        courseLabel: courseLabel(nextReserved.planning.courseSlug),
        sessionDate: nextYmd,
        dayLabel,
        opensAt,
        startTime: nextReserved.planning.startTime,
        endTime: nextReserved.planning.endTime,
        level: nextReserved.planning.level,
        capacity: nextReserved.planning.capacity,
        waitlistCapacity: nextReserved.planning.waitlistCapacity,
        coachName,
        coachImageUrl,
      },
      nextUpcomingClass: null,
    });
  }

  const targetSlot = activeSlot;

  const scannedReservation = await prisma.reservation.findFirst({
    where: {
      memberId: (qr?.assignedMemberId ?? member?.id)!,
      planningId: targetSlot.id,
      sessionDate: sessionDateDb,
      status: { in: ["BOOKED", "WAITLIST", "ATTENDED"] },
    },
    select: { id: true, status: true },
  });

  if (!scannedReservation) {
    return Response.json({
      scannedMember: qr?.assignedMember ?? member,
      sessionDate: sessionDateYmd,
      nowTime,
      message:
        "Membre non inscrit au cours actuellement ouvrable. Verifiez le prochain cours du membre ci-dessous.",
      class: null,
      upcomingClass: null,
      nextUpcomingClass,
    });
  }

  const planning = await prisma.planning.findUnique({
    where: { id: targetSlot.id },
    include: {
      coach: { select: { firstName: true, lastName: true, imageUrl: true } },
      reservations: {
        where: {
          sessionDate: sessionDateDb,
          status: { in: ["BOOKED", "WAITLIST", "ATTENDED"] },
        },
        orderBy: { createdAt: "asc" },
        include: {
          member: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phone: true,
              user: { select: { email: true } },
            },
          },
        },
      },
    },
  });

  if (!planning) {
    return errorResponse("Creneau introuvable", 404);
  }

  return Response.json({
    scannedMember: qr?.assignedMember ?? member,
    sessionDate: sessionDateYmd,
    nowTime,
    message: null,
    class: {
      planningId: planning.id,
      courseSlug: planning.courseSlug,
      courseLabel: courseLabel(planning.courseSlug),
      startTime: planning.startTime,
      endTime: planning.endTime,
      level: planning.level,
      capacity: planning.capacity,
      waitlistCapacity: planning.waitlistCapacity,
      coachName: planning.coach ? `${planning.coach.firstName} ${planning.coach.lastName}`.trim() : null,
      coachImageUrl: planning.coach?.imageUrl ?? null,
      scannedReservationId: scannedReservation.id,
      scannedReservationStatus: scannedReservation.status,
      reservations: planning.reservations.map((r) => ({
        id: r.id,
        status: r.status,
        member: {
          id: r.member.id,
          firstName: r.member.firstName,
          lastName: r.member.lastName,
          email: r.member.user?.email ?? null,
          phone: r.member.phone ?? null,
        },
      })),
    },
    upcomingClass: null,
    nextUpcomingClass,
  });
}
