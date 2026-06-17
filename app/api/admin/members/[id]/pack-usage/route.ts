import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { isStaffRole } from "@/lib/admin/access";
import { prismaDateInclusiveUtcRange } from "@/lib/calendar-day";
import { packExpiresAtLocal } from "@/lib/member-pack-period";
import { prisma } from "@/lib/prisma";

function errorResponse(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return errorResponse("Unauthorized", 401);
  if (!isStaffRole(session.user.role)) return errorResponse("Forbidden", 403);

  const { id: memberId } = await params;
  const member = await prisma.member.findUnique({
    where: { id: memberId },
    select: {
      id: true,
      packId: true,
      packStartedAt: true,
      pack: {
        select: {
          id: true,
          sessionCount: true,
          durationDays: true,
          courseQuotas: { select: { courseSlug: true, sessionCount: true } },
        },
      },
      packBalances: {
        select: { packId: true, courseSlug: true, remaining: true },
      },
    },
  });
  if (!member) return errorResponse("Adhérent introuvable", 404);
  if (!member.packId || !member.pack) {
    return Response.json({
      totalSessions: null,
      consumedSessions: 0,
      remainingSessions: null,
    });
  }

  const isMixed = member.pack.courseQuotas.length > 0;
  const totalSessions = isMixed
    ? member.pack.courseQuotas.reduce((sum, q) => sum + q.sessionCount, 0)
    : member.pack.sessionCount ?? null;

  const balancesForPack = member.packBalances.filter((b) => b.packId === member.packId);
  const remainingSessions =
    balancesForPack.length > 0
      ? balancesForPack.reduce((sum, b) => sum + Math.max(0, b.remaining), 0)
      : totalSessions;

  const periodStart = member.packStartedAt ?? null;
  const periodEnd = periodStart ? packExpiresAtLocal(periodStart, member.pack.durationDays) : null;

  const reservationWhere =
    periodStart == null
      ? { memberId }
      : {
          memberId,
          sessionDate: prismaDateInclusiveUtcRange(periodStart, periodEnd ?? periodStart),
        };

  const consumedSessions = await prisma.reservation.count({
    where: {
      ...reservationWhere,
      OR: [{ status: { in: ["BOOKED", "ATTENDED"] } }, { status: "CANCELLED", packRefundedAt: null }],
      ...(isMixed
        ? { planning: { courseSlug: { in: member.pack.courseQuotas.map((q) => q.courseSlug) } } }
        : {}),
    },
  });

  return Response.json({
    totalSessions,
    consumedSessions,
    remainingSessions: remainingSessions ?? null,
  });
}
