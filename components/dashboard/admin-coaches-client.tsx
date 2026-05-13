"use client";

import { useRef, useState } from "react";
import { DashboardHeader } from "@/components/dashboard/header";
import { CoachesHeaderActions } from "@/components/dashboard/coaches-header-actions";
import { CoachesManager, type CoachesManagerHandle } from "@/components/dashboard/coaches-manager";

export function AdminCoachesClient() {
  const managerRef = useRef<CoachesManagerHandle | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "form">("list");

  return (
    <>
      <DashboardHeader
        role="ADMIN"
        title="Coachs"
        description="Gérez les coachs du studio avec leurs informations et leur statut."
        showRoleLine={false}
        actions={
          <CoachesHeaderActions
            managerRef={managerRef}
            viewMode={viewMode}
            onToggleViewMode={() => setViewMode((prev) => (prev === "list" ? "form" : "list"))}
          />
        }
      />
      <CoachesManager ref={managerRef} viewMode={viewMode} onChangeViewMode={setViewMode} />
    </>
  );
}
