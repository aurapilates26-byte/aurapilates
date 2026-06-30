"use client";

import { useRef, useState } from "react";
import { DashboardHeader } from "@/components/dashboard/header";
import { PlanningHeaderActions } from "@/components/dashboard/planning-header-actions";
import { PlanningManager, type PlanningManagerHandle } from "@/components/dashboard/planning-manager";
import { useToast } from "@/components/ui/toast-provider";
import { usePlanningPeriodStore } from "@/store/planning-period-store";
import type { PlanningSessionFormSource, PlanningViewMode } from "@/types/admin/planning";

export function AdminPlanningClient() {
  const managerRef = useRef<PlanningManagerHandle | null>(null);
  const [viewMode, setViewMode] = useState<PlanningViewMode>("list");
  const [sessionFormSource, setSessionFormSource] = useState<PlanningSessionFormSource>("list");
  const [sessionFormReturnView, setSessionFormReturnView] = useState<"list" | "period-form">("list");
  const ensureDraftSaved = usePlanningPeriodStore((s) => s.ensureDraftSaved);
  const { toast } = useToast();

  const openSessionForm = (returnView: "list" | "period-form") => {
    setSessionFormReturnView(returnView);
    setViewMode("session-form");
  };

  const handleOpenSessionForm = async () => {
    const returnView: "list" | "period-form" = viewMode === "period-form" ? "period-form" : "list";

    if (viewMode === "list" && sessionFormSource === "draft") {
      try {
        await ensureDraftSaved();
        openSessionForm(returnView);
      } catch (e) {
        toast({
          variant: "error",
          title: "Brouillon",
          description: e instanceof Error ? e.message : "Impossible de préparer le brouillon.",
        });
      }
      return;
    }

    openSessionForm(returnView);
  };

  const handleBackFromSessionForm = () => {
    setViewMode(sessionFormReturnView);
  };

  return (
    <>
      <DashboardHeader
        role="ADMIN"
        title="Planning"
        description="Créez et organisez les séances par jour, heure, durée et capacité."
        showRoleLine={false}
        actions={
          <PlanningHeaderActions
            viewMode={viewMode}
            onChangeViewMode={setViewMode}
            onOpenSessionForm={handleOpenSessionForm}
            onBackFromSessionForm={handleBackFromSessionForm}
          />
        }
      />
      <PlanningManager
        ref={managerRef}
        viewMode={viewMode}
        onChangeViewMode={setViewMode}
        sessionFormSource={sessionFormSource}
        onSessionFormSourceChange={setSessionFormSource}
        sessionFormReturnView={sessionFormReturnView}
        onSessionFormReturnViewChange={setSessionFormReturnView}
      />
    </>
  );
}
