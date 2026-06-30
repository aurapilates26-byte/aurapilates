"use client";

import type { PlanningViewMode } from "@/types/admin/planning";

type PlanningHeaderActionsProps = {
  viewMode: PlanningViewMode;
  showAddSession?: boolean;
  onChangeViewMode: (mode: PlanningViewMode) => void;
  onOpenSessionForm: () => void;
  onBackFromSessionForm: () => void;
};

const btnBase =
  "inline-flex min-h-[42px] min-w-0 flex-1 items-center justify-center rounded-full px-4 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-medium/40 sm:flex-initial sm:min-w-[140px]";

const btnSelected =
  "border border-brand-dark/30 bg-brand-dark text-white shadow-sm hover:opacity-90";
const btnIdle = "border border-brand-medium/35 bg-white text-brand-dark hover:bg-zinc-50";

export function PlanningHeaderActions({
  viewMode,
  showAddSession = true,
  onChangeViewMode,
  onOpenSessionForm,
  onBackFromSessionForm,
}: PlanningHeaderActionsProps) {
  const isList = viewMode === "list";
  const isPeriod = viewMode === "period-form";
  const isSession = viewMode === "session-form";

  const openPeriod = () => onChangeViewMode("period-form");
  const backToList = () => onChangeViewMode("list");

  const periodLabel = isPeriod ? "Planning" : "Période";
  const sessionLabel = isList ? "Ajouter une séance" : isSession ? "Revenir au planning" : "Ajouter une séance";
  const sessionShort = isList ? "Ajouter" : "Planning";

  const periodBtnClass = `${btnBase} ${isPeriod ? btnSelected : btnIdle}`;
  const sessionBtnClass = `${btnBase} ${isSession ? btnSelected : btnIdle}`;

  return (
    <div
      className="flex w-full min-w-0 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end"
      role="group"
      aria-label="Actions planning"
    >
      {isPeriod ? (
        <button
          type="button"
          onClick={backToList}
          className={periodBtnClass}
          aria-pressed="true"
          title="Revenir au planning"
        >
          {periodLabel}
        </button>
      ) : (
        <button
          type="button"
          onClick={openPeriod}
          className={periodBtnClass}
          aria-pressed="false"
          title="Configurer la période"
        >
          {periodLabel}
        </button>
      )}

      {showAddSession ? (
        isSession ? (
          <button
            type="button"
            onClick={onBackFromSessionForm}
            className={sessionBtnClass}
            aria-pressed="true"
          >
            <span className="sm:hidden">{sessionShort}</span>
            <span className="hidden sm:inline">{sessionLabel}</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onOpenSessionForm}
            className={sessionBtnClass}
            aria-pressed="false"
          >
            <span className="sm:hidden">{sessionShort}</span>
            <span className="hidden sm:inline">{sessionLabel}</span>
          </button>
        )
      ) : null}
    </div>
  );
}
