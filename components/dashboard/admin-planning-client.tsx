"use client";

import { useRef, useState } from "react";
import { DashboardHeader } from "@/components/dashboard/header";
import { PlanningHeaderActions } from "@/components/dashboard/planning-header-actions";
import { PlanningManager, type PlanningManagerHandle } from "@/components/dashboard/planning-manager";

export function AdminPlanningClient() {
  const managerRef = useRef<PlanningManagerHandle | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "form">("list");

  return (
    <>
      <DashboardHeader
        role="ADMIN"
        title="Planning"
        description="Creez et organisez les seances par jour, heure, duree et capacite."
        showRoleLine={false}
        actions={
          <PlanningHeaderActions
            managerRef={managerRef}
            viewMode={viewMode}
            onToggleViewMode={() => setViewMode((prev) => (prev === "list" ? "form" : "list"))}
          />
        }
      />
      <PlanningManager ref={managerRef} viewMode={viewMode} onChangeViewMode={setViewMode} />
    </>
  );
}

