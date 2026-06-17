"use client";

import {
  PublicPlanningTabsClient,
  type PublicPlanningTableRow,
} from "@/components/public/public-planning-tabs-client";
import type { PlanningPeriodEnriched } from "@/types/admin/planning";

type PublicPlanningSectionClientProps = {
  rows: PublicPlanningTableRow[];
  initialPeriodConfig: PlanningPeriodEnriched;
};

export function PublicPlanningSectionClient({ rows, initialPeriodConfig }: PublicPlanningSectionClientProps) {
  return <PublicPlanningTabsClient rows={rows} initialPeriodConfig={initialPeriodConfig} />;
}
