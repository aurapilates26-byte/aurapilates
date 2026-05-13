import type { Prisma } from "@prisma/client";
import { courseLabel } from "@/lib/course-labels";
import { prisma } from "@/lib/prisma";
import { PublicPlanningTabsClient, type PublicPlanningDay, type PublicPlanningTableRow } from "@/components/public/public-planning-tabs-client";
import { planningLevelLabelFr } from "@/lib/planning-public-labels";

const planningPublicInclude = {
  coach: { select: { firstName: true, lastName: true, imageUrl: true } },
} satisfies Prisma.PlanningInclude;

type PlanningPublicRow = Prisma.PlanningGetPayload<{
  include: typeof planningPublicInclude;
}>;

function coachDisplayName(firstName: string | null, lastName: string | null) {
  const full = [firstName, lastName].filter(Boolean).join(" ").trim();
  return full.length > 0 ? full : "Coach a confirmer";
}

export async function PublicPlanningDisplay() {
  let rows: PlanningPublicRow[] = [];

  try {
    rows = (await prisma.planning.findMany({
      include: planningPublicInclude,
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    })) as PlanningPublicRow[];
  } catch {
    rows = [];
  }

  if (rows.length === 0) {
    return (
      <p className="text-sm leading-6 text-brand-dark/80">
        Le planning détaillé sera affiché ici dès que les créneaux seront publiés depuis l&apos;administration.
      </p>
    );
  }

  const tableRows: PublicPlanningTableRow[] = rows.map((row) => ({
    id: row.id,
    dayOfWeek: row.dayOfWeek as PublicPlanningDay,
    startTime: row.startTime,
    endTime: row.endTime,
    courseTitle: courseLabel(row.courseSlug),
    coachName: coachDisplayName(row.coach?.firstName ?? null, row.coach?.lastName ?? null),
    coachImageUrl: row.coach?.imageUrl ?? null,
    level: row.level,
    levelLabel: planningLevelLabelFr(row.level),
    capacity: row.capacity,
    durationMinutes: row.durationMinutes,
    waitlistCapacity: row.waitlistCapacity,
  }));

  return (
    <PublicPlanningTabsClient
      key={tableRows.map((r) => r.id).join("|")}
      rows={tableRows}
    />
  );
}
