"use client";

type MembersHeaderActionsProps = {
  listMode: "members" | "deposits";
  depositCount: number;
  viewMode: "list" | "form";
  onShowDeposits: () => void;
  onShowMembers: () => void;
  onToggleViewMode: () => void;
};

export function MembersHeaderActions({
  listMode,
  depositCount,
  viewMode,
  onShowDeposits,
  onShowMembers,
  onToggleViewMode,
}: MembersHeaderActionsProps) {
  const secondaryBtnClass =
    "rounded-full border border-brand-medium/35 bg-white px-4 py-2 text-sm font-medium text-brand-dark transition hover:bg-zinc-50";
  const primaryBtnClass =
    "rounded-full bg-brand-dark px-4 py-2 text-sm font-medium text-white transition hover:opacity-90";

  return (
    <div className="flex flex-wrap items-center justify-end gap-3">
      {viewMode === "list" ? (
        <button
          type="button"
          onClick={listMode === "deposits" ? onShowMembers : onShowDeposits}
          className={listMode === "deposits" ? primaryBtnClass : secondaryBtnClass}
        >
          Avances
          {depositCount > 0 ? (
            <span className="ml-2 inline-flex min-w-[1.25rem] justify-center rounded-full bg-amber-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
              {depositCount}
            </span>
          ) : null}
        </button>
      ) : null}
      <button
        type="button"
        onClick={onToggleViewMode}
        className={primaryBtnClass}
      >
        {viewMode === "form" ? "Retour à la liste" : "Nouvelle adhérente"}
      </button>
    </div>
  );
}
