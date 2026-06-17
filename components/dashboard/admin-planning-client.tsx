"use client";

import { useRef, useState } from "react";
import { DashboardHeader } from "@/components/dashboard/header";
import { PlanningHeaderActions } from "@/components/dashboard/planning-header-actions";
import { PlanningManager, type PlanningManagerHandle } from "@/components/dashboard/planning-manager";
import type { PlanningAdminScope, PlanningViewMode } from "@/types/admin/planning";

export function AdminPlanningClient() {
  const managerRef = useRef<PlanningManagerHandle | null>(null);
  const [viewMode, setViewMode] = useState<PlanningViewMode>("list");
  const [periodSettingsTab, setPeriodSettingsTab] = useState<PlanningAdminScope>("published");
  const [sessionFormSource, setSessionFormSource] = useState<"list" | "archive">("list");

  const showAddSession =
    viewMode === "list" ||
    viewMode === "session-form" ||
    (viewMode === "period-form" && periodSettingsTab === "archive");

  const handleOpenSessionForm = () => {
    if (viewMode === "period-form" && periodSettingsTab === "archive") {
      setSessionFormSource("archive");
    } else {
      setSessionFormSource("list");
    }
    setViewMode("session-form");
  };

  const handleBackFromSessionForm = () => {
    setViewMode(sessionFormSource === "archive" ? "period-form" : "list");
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
