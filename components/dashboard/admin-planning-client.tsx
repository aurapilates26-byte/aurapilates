"use client";

import { useRef, useState } from "react";
import { DashboardHeader } from "@/components/dashboard/header";
import { PlanningHeaderActions } from "@/components/dashboard/planning-header-actions";
import { PlanningManager, type PlanningManagerHandle } from "@/components/dashboard/planning-manager";
import { useToast } from "@/components/ui/toast-provider";
import { usePlanningPeriodStore } from "@/store/planning-period-store";
import type { PlanningAdminScope, PlanningSessionFormSource, PlanningViewMode } from "@/types/admin/planning";

export function AdminPlanningClient() {
  const managerRef = useRef<PlanningManagerHandle | null>(null);
  const [viewMode, setViewMode] = useState<PlanningViewMode>("list");
  const [periodSettingsTab, setPeriodSettingsTab] = useState<PlanningAdminScope>("published");
  const [sessionFormSource, setSessionFormSource] = useState<PlanningSessionFormSource>("list");
  const [sessionFormReturnView, setSessionFormReturnView] = useState<"list" | "period-form">("list");
  const ensureDraftSaved = usePlanningPeriodStore((s) => s.ensureDraftSaved);
  const { toast } = useToast();

  const openSessionForm = (returnView: "list" | "period-form") => {
    setSessionFormReturnView(returnView);
    setViewMode("session-form");
  };

  const showAddSession =
    viewMode === "list" ||
    viewMode === "session-form" ||
    (viewMode === "period-form" && periodSettingsTab === "archive") ||
    (viewMode === "period-form" && periodSettingsTab === "draft");

  const handleOpenSessionForm = async () => {
    const returnView: "list" | "period-form" = viewMode === "period-form" ? "period-form" : "list";

    if (viewMode === "period-form" && periodSettingsTab === "archive") {
      setSessionFormSource("archive");
      openSessionForm(returnView);
      return;
    }
    if (
      (viewMode === "period-form" && periodSettingsTab === "draft") ||
      (viewMode === "list" && sessionFormSource === "draft")
    ) {
      try {
        await ensureDraftSaved();
        setSessionFormSource("draft");
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
    if (viewMode === "list" && sessionFormSource === "archive") {
      openSessionForm(returnView);
      return;
    }
    setSessionFormSource("list");
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
            showAddSession={showAddSession}
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
        periodSettingsTab={periodSettingsTab}
        onPeriodSettingsTabChange={setPeriodSettingsTab}
        sessionFormSource={sessionFormSource}
        onSessionFormSourceChange={setSessionFormSource}
        sessionFormReturnView={sessionFormReturnView}
        onSessionFormReturnViewChange={setSessionFormReturnView}
      />
    </>
  );
}
