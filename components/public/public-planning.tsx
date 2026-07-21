import type { Prisma } from "@prisma/client";
import { PublicPlanningSectionClient } from "@/components/public/public-planning-section-client";
import type { PublicPlanningDay, PublicPlanningTableRow } from "@/components/public/public-planning-tabs-client";
import { courseLabel } from "@/lib/course-labels";
import { getPlanningPeriodConfigEnriched } from "@/lib/admin/planning-period-config";
import {
  memberBookingWindowFromContext,
  planningSlotHasPublicOccurrenceInRange,
  readStaggeredPublicationContext,
} from "@/lib/admin/planning-staggered-publish";
import { parseYmdLocal } from "@/lib/calendar-day";
import { prisma } from "@/lib/prisma";
import { planningLevelDisplay } from "@/lib/planning-level-display";

const planningPublicInclude = {
  coach: { select: { firstName: true, lastName: true, imageUrl: true } },
} satisfies Prisma.PlanningInclude;

type PlanningPublicRow = Prisma.PlanningGetPayload<{
  include: typeof planningPublicInclude;
}>;

function coachDisplayName(firstName: string | null, lastName: string | null) {
  const full = [firstName, lastName].filter(Boolean).join(" ").trim();
  return full.length > 0 ? full : "Coach à confirmer";
}

export async function PublicPlanningDisplay() {
  const periodConfig = await getPlanningPeriodConfigEnriched();
  const staggeredCtx = await readStaggeredPublicationContext();

  let rows: PlanningPublicRow[] = [];
  try {
    const allRows = (await prisma.planning.findMany({
      where: staggeredCtx?.mode === "partial" ? undefined : { isDraft: false },
      include: planningPublicInclude,
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    })) as PlanningPublicRow[];

    if (staggeredCtx) {
      const range = memberBookingWindowFromContext(staggeredCtx);
      const from = parseYmdLocal(range.fromYmd);
      const to = parseYmdLocal(range.toYmd);
      if (from && to) {
        rows = allRows.filter((row) => {
          if (staggeredCtx.mode === "normal" && row.isDraft) return false;
          return planningSlotHasPublicOccurrenceInRange(staggeredCtx, row, from, to);
        });
      }
    } else {
      rows = allRows;
    }
  } catch {
    rows = [];
  }

  const tableRows: PublicPlanningTableRow[] = rows.map((row) => {
    const levelDisplay = planningLevelDisplay(row.level);
    return {
      id: row.id,
      courseSlug: row.courseSlug,
      dayOfWeek: row.dayOfWeek as PublicPlanningDay,
      startTime: row.startTime,
      endTime: row.endTime,
      courseTitle: courseLabel(row.courseSlug),
      coachName: coachDisplayName(row.coach?.firstName ?? null, row.coach?.lastName ?? null),
      coachImageUrl: row.coach?.imageUrl ?? null,
      level: row.level,
      levelLabel: levelDisplay?.label ?? null,
      levelToneClass: levelDisplay?.toneClass ?? null,
      capacity: row.capacity,
      durationMinutes: row.durationMinutes,
      waitlistCapacity: row.waitlistCapacity,
    };
  });

  return (
    <PublicPlanningSectionClient
      key={`${tableRows.map((r) => r.id).join("|")}-${periodConfig.periodStartYmd}`}
      rows={tableRows}
      initialPeriodConfig={periodConfig}
    />
  );
}
