"use client";

import { PublicPlanningTabsClient } from "@/components/public/public-planning-tabs-client";
import { PublicPlanningWeekGridClient } from "@/components/public/public-planning-week-grid-client";
import type { PublicPlanningTableRow } from "@/components/public/public-planning-tabs-client";
import type { PlanningPeriodEnriched } from "@/types/admin/planning";

type PublicPlanningSectionClientProps = {
  rows: PublicPlanningTableRow[];
  initialPeriodConfig: PlanningPeriodEnriched;
};

export function PublicPlanningSectionClient({ rows, initialPeriodConfig }: PublicPlanningSectionClientProps) {
  return (
    <>
      {/* Mobile/tablette : lecture par jour, sans grille large horizontale. */}
      <div className="lg:hidden">
        <PublicPlanningTabsClient rows={rows} initialPeriodConfig={initialPeriodConfig} />
      </div>

      {/* Desktop : grille hebdomadaire complète. */}
      <div className="hidden lg:block">
        <PublicPlanningWeekGridClient rows={rows} initialPeriodConfig={initialPeriodConfig} />
      </div>
    </>
  );
}
