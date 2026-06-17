"use client";

import { useEffect } from "react";
import { PlanningLateCancellationRuleToggle } from "@/components/planning/planning-late-cancellation-rule-toggle";
import { PlanningHistoricalPeriodPanel } from "@/components/planning/planning-historical-period-panel";
import { PlanningPeriodAdminAlert } from "@/components/planning/planning-period-admin-alert";
import { PlanningPeriodDraftForm } from "@/components/planning/planning-period-draft-form";
import { PlanningPeriodForm } from "@/components/planning/planning-period-form";
import { PlanningPeriodScopeTabs } from "@/components/planning/planning-period-scope-tabs";
import { usePlanningPeriodStore } from "@/store/planning-period-store";
import type {
  AdminPlanningItem,
  PlanningAdminScope,
  PlanningArchivedPeriodItem,
  PlanningDayOfWeek,
  PlanningPeriodConfig,
} from "@/types/admin/planning";

type PlanningPeriodSettingsPanelProps = {
  settingsTab: PlanningAdminScope;
  onSettingsTabChange: (tab: PlanningAdminScope) => void;
  onSaved?: () => void;
  archiveProps: {
    archivedPeriods: PlanningArchivedPeriodItem[];
    selectedArchiveStartYmd: string;
    onSelectedArchiveStartYmdChange: (ymd: string) => void;
    archivesLoading: boolean;
    seedingArchives: boolean;
    onSeedArchives: () => void;
    selectedArchivePeriod: PlanningPeriodConfig | null;
    selectedDay: PlanningDayOfWeek;
    onSelectedDayChange: (day: PlanningDayOfWeek) => void;
    items: AdminPlanningItem[];
    isLoading: boolean;
    error: string | null;
    onEditSession: (item: AdminPlanningItem) => void;
    onDeleteSession: (item: AdminPlanningItem) => void;
    onOpenPresence: (item: AdminPlanningItem) => void;
  };
};

export function PlanningPeriodSettingsPanel({
  settingsTab,
  onSettingsTabChange,
  onSaved,
  archiveProps,
}: PlanningPeriodSettingsPanelProps) {
  const fetchConfig = usePlanningPeriodStore((s) => s.fetchConfig);
  const draft = usePlanningPeriodStore((s) => s.draft);

  useEffect(() => {
    void fetchConfig({ source: "admin", force: true });
  }, [fetchConfig]);

  return (
    <div className="rounded-2xl border border-brand-medium/20 bg-white p-4 shadow-sm sm:p-6">
      <h3 className="text-lg font-semibold text-brand-dark sm:text-xl">Période du planning</h3>
      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-brand-dark/70">
        Configurez la période visible par les adhérents, préparez la suivante en brouillon, ou reconstituez
        l&apos;historique des périodes passées.
      </p>

      <div className="mt-4">
        <PlanningPeriodAdminAlert hideModifyButton onRenewed={onSaved} />
      </div>

      <div className="mt-4">
        <PlanningLateCancellationRuleToggle />
      </div>

      <div className="mt-6 flex justify-center px-1">
        <div className="w-full max-w-lg">
          <PlanningPeriodScopeTabs
            value={settingsTab}
            hasDraft={Boolean(draft)}
            includeArchive
            publishedLabel="Période affichée"
            draftLabel="Prochaine période"
            archiveLabel="Historique"
            onChange={onSettingsTabChange}
          />
        </div>
      </div>

      <div className="mt-6">
        {settingsTab === "published" ? (
          <div className="space-y-4">
            <p className="text-sm text-brand-dark/65">
              Ce que les adhérents et le site public voient actuellement.
            </p>
            <PlanningPeriodForm embedded onSaved={onSaved} />
          </div>
        ) : settingsTab === "draft" ? (
          <div className="space-y-4">
            <p className="text-sm text-brand-dark/65">
              Invisible pour les adhérents jusqu&apos;au jour de début choisi (affichage automatique à 00:00 ce
              jour-là).
            </p>
            <PlanningPeriodDraftForm embedded onSaved={onSaved} />
          </div>
        ) : (
          <PlanningHistoricalPeriodPanel {...archiveProps} />
        )}
      </div>
    </div>
  );
}
