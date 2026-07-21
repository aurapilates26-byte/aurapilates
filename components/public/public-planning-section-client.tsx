"use client";

import { PublicPlanningWeekGridClient } from "@/components/public/public-planning-week-grid-client";
import type { PublicPlanningTableRow } from "@/components/public/public-planning-tabs-client";
import type { PlanningPeriodEnriched } from "@/types/admin/planning";

type PublicPlanningSectionClientProps = {
  rows: PublicPlanningTableRow[];
  initialPeriodConfig: PlanningPeriodEnriched;
};

export function PublicPlanningSectionClient({ rows, initialPeriodConfig }: PublicPlanningSectionClientProps) {
  return <PublicPlanningWeekGridClient rows={rows} initialPeriodConfig={initialPeriodConfig} />;
}
