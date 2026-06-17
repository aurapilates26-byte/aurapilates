"use client";

import type { PlanningAdminScope } from "@/types/admin/planning";

const tabBtnBase =
  "flex-1 rounded-lg px-3 py-2 text-center text-xs font-semibold transition sm:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-medium/40";
const tabBtnActive = "border border-brand-medium/25 bg-white text-brand-dark shadow-sm";
const tabBtnIdle = "text-brand-dark/70 hover:bg-white/60 hover:text-brand-dark";

type PlanningPeriodScopeTabsProps = {
  value: PlanningAdminScope;
  onChange: (scope: PlanningAdminScope) => void;
  hasDraft?: boolean;
  includeArchive?: boolean;
  publishedLabel?: string;
  draftLabel?: string;
  archiveLabel?: string;
  className?: string;
};

export function PlanningPeriodScopeTabs({
  value,
  onChange,
  hasDraft = false,
  includeArchive = false,
  publishedLabel = "Période affichée",
  draftLabel,
  archiveLabel = "Historique",
  className = "",
}: PlanningPeriodScopeTabsProps) {
  const draftTabLabel = draftLabel ?? (hasDraft ? "Prochaine (brouillon)" : "Prochaine période");
  const tabs: { id: PlanningAdminScope; label: string }[] = [
    ...(includeArchive ? [{ id: "archive" as const, label: archiveLabel }] : []),
    { id: "published", label: publishedLabel },
    { id: "draft", label: draftTabLabel },
  ];

  return (
    <div
      className={`flex rounded-xl border border-brand-medium/20 bg-zinc-50/80 p-1 ${className}`.trim()}
      role="tablist"
      aria-label="Période de travail planning"
    >
      {tabs.map((tab) => {
        const isSelected = value === tab.id;
        const className = `${tabBtnBase} ${isSelected ? tabBtnActive : tabBtnIdle}`;

        if (isSelected) {
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              className={className}
              onClick={() => onChange(tab.id)}
              aria-selected="true"
            >
              {tab.label}
            </button>
          );
        }

        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            className={className}
            onClick={() => onChange(tab.id)}
            aria-selected="false"
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
