"use client";

import { useRef, useState } from "react";
import { DashboardHeader } from "@/components/dashboard/header";
import { PlanningHeaderActions } from "@/components/dashboard/planning-header-actions";
import { PlanningManager, type PlanningManagerHandle } from "@/components/dashboard/planning-manager";
import { usePlanningPeriodStore } from "@/store/planning-period-store";
import type { PlanningAdminScope, PlanningSessionFormSource, PlanningViewMode } from "@/types/admin/planning";

export function AdminPlanningClient() {
  const managerRef = useRef<PlanningManagerHandle | null>(null);
  const [viewMode, setViewMode] = useState<PlanningViewMode>("list");
  const [periodSettingsTab, setPeriodSettingsTab] = useState<PlanningAdminScope>("published");
  const [sessionFormSource, setSessionFormSource] = useState<PlanningSessionFormSource>("list");
  const draft = usePlanningPeriodStore((s) => s.draft);

  const showAddSession =
    viewMode === "list" ||
    viewMode === "session-form" ||
    (viewMode === "period-form" && periodSettingsTab === "archive") ||
    (viewMode === "period-form" && periodSettingsTab === "draft" && Boolean(draft));

  const handleOpenSessionForm = () => {
    if (viewMode === "period-form" && periodSettingsTab === "archive") {
      setSessionFormSource("archive");
    } else if (viewMode === "period-form" && periodSettingsTab === "draft") {
      setSessionFormSource("draft");
    } else {
      setSessionFormSource("list");
    }
    setViewMode("session-form");
  };

  const handleBackFromSessionForm = () => {
    setViewMode(sessionFormSource === "list" ? "list" : "period-form");
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
      />
    </>
  );
}
