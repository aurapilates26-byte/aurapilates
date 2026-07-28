"use client";

import type { MemberPaymentStatus } from "@/lib/admin/member-payment-status";

type MembersHeaderActionsProps = {
  paymentStatusFilter: "ALL" | MemberPaymentStatus;
  unpaidCount: number;
  viewMode: "list" | "form";
  onFilterAdvances: () => void;
  onToggleViewMode: () => void;
};

export function MembersHeaderActions({
  paymentStatusFilter,
  unpaidCount,
  viewMode,
  onFilterAdvances,
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
          onClick={onFilterAdvances}
          className={paymentStatusFilter === "ADVANCE" ? primaryBtnClass : secondaryBtnClass}
          title="Filtrer les adhérentes avec une avance en attente"
        >
          Avances
          {unpaidCount > 0 ? (
            <span className="ml-2 inline-flex min-w-[1.25rem] justify-center rounded-full bg-amber-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
              {unpaidCount}
            </span>
          ) : null}
        </button>
      ) : null}
      <button type="button" onClick={onToggleViewMode} className={primaryBtnClass}>
        {viewMode === "form" ? "Retour à la liste" : "Nouvelle adhérente"}
      </button>
    </div>
  );
}
