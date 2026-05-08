import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/auth";
import { courseLabel } from "@/lib/course-labels";
import {
  addLocalDays,
  formatYmdLocal,
  formatYmdPrismaDate,
  parseYmdLocal,
  prismaDateInclusiveUtcRange,
  startOfLocalToday,
} from "@/lib/calendar-day";
import { prisma } from "@/lib/prisma";

function errorResponse(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

const querySchema = z.object({
  q: z.string().trim().min(1),
  date: z.string().optional(),
});

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return errorResponse("Forbidden", 403);
  }

  const url = new URL(request.url);
  const parsed = querySchema.safeParse({
    q: url.searchParams.get("q") ?? "",
    date: url.searchParams.get("date") ?? undefined,
  });
  if (!parsed.success) return errorResponse("Invalid query parameters", 400);

  const q = parsed.data.q.trim();

  const day = parsed.data.date ? parseYmdLocal(parsed.data.date) : startOfLocalToday();
  if (!day) return errorResponse("Date invalide", 400);

  const from = day;
  const to = parsed.data.date ? day : addLocalDays(day, 6);
  const range = prismaDateInclusiveUtcRange(from, to);

  const rows = await prisma.reservation.findMany({
    where: {
      sessionDate: range,
      member: {
        OR: [
          { firstName: { contains: q, mode: "insensitive" } },
          { lastName: { contains: q, mode: "insensitive" } },
          { phone: { contains: q, mode: "insensitive" } },
        ],
      },
    },
    select: {
      planningId: true,
      sessionDate: true,
      status: true,
      member: {
        select: { firstName: true, lastName: true, phone: true },
      },
      planning: {
        select: {
          courseSlug: true,
          startTime: true,
          endTime: true,
          level: true,
          capacity: true,
          waitlistCapacity: true,
          coach: { select: { firstName: true, lastName: true } },
        },
      },
    },
    orderBy: [{ sessionDate: "asc" }, { planningId: "asc" }],
    take: 800,
  });

  const byKey = new Map<
    string,
    {
      date: string;
      planningId: string;
      courseLabel: string;
      startTime: string;
      endTime: string;
      level: string;
      coachName: string | null;
      capacity: number;
      waitlistCapacity: number | null;
      matchCount: number;
      sampleMembers: { name: string; phone: string | null }[];
    }
  >();

  for (const r of rows) {
    // sessionDate est un @db.Date => sérialisé à minuit UTC; utiliser le format Prisma pour éviter les décalages.
    const ymd = formatYmdPrismaDate(new Date(r.sessionDate));
    const key = `${ymd}:${r.planningId}`;
    const coachName = r.planning.coach ? `${r.planning.coach.firstName} ${r.planning.coach.lastName}`.trim() : null;
    const memberName = `${r.member.firstName ?? ""} ${r.member.lastName ?? ""}`.trim() || "—";

    const cur =
      byKey.get(key) ??
      ({
        date: ymd,
        planningId: r.planningId,
        courseLabel: courseLabel(r.planning.courseSlug),
        startTime: r.planning.startTime,
        endTime: r.planning.endTime,
        level: r.planning.level,
        coachName,
        capacity: r.planning.capacity,
        waitlistCapacity: r.planning.waitlistCapacity,
        matchCount: 0,
        sampleMembers: [],
      } as const);

    const next = {
      ...cur,
      matchCount: cur.matchCount + 1,
      sampleMembers:
        cur.sampleMembers.length >= 3
          ? cur.sampleMembers
          : [...cur.sampleMembers, { name: memberName, phone: r.member.phone ?? null }],
    };

    byKey.set(key, next);
  }

  const items = [...byKey.values()].sort((a, b) => {
    const d = a.date.localeCompare(b.date);
    if (d !== 0) return d;
    return a.startTime.localeCompare(b.startTime);
  });

  return Response.json({
    q,
    from: formatYmdLocal(from),
    to: formatYmdLocal(to),
    items,
  });
}

