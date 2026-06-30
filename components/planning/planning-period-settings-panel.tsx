"use client";

import { useEffect } from "react";
import { PlanningLateCancellationRuleToggle } from "@/components/planning/planning-late-cancellation-rule-toggle";
import { PlanningMemberReservationHoursPanel } from "@/components/planning/planning-member-reservation-hours-panel";
import { usePlanningPeriodStore } from "@/store/planning-period-store";

export function PlanningPeriodSettingsPanel() {
  const fetchConfig = usePlanningPeriodStore((s) => s.fetchConfig);

  useEffect(() => {
    void fetchConfig({ source: "admin", force: true });
  }, [fetchConfig]);

  return (
    <div className="rounded-2xl border border-brand-medium/20 bg-white p-4 shadow-sm sm:p-6">
      <h3 className="text-lg font-semibold text-brand-dark sm:text-xl">Réservations adhérentes</h3>
      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-brand-dark/70">
        Horaires d&apos;accès au formulaire de réservation en ligne et règles d&apos;annulation. Le planning
        hebdomadaire se gère depuis la grille principale (flèches de navigation).
      </p>

      <div className="mt-6 space-y-4">
        <PlanningMemberReservationHoursPanel />
        <PlanningLateCancellationRuleToggle />
      </div>
    </div>
  );
}
