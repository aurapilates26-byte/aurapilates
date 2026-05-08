"use client";

import type { RefObject } from "react";
import type { MembersManagerHandle } from "@/components/dashboard/members-manager";

type MembersHeaderActionsProps = {
  managerRef: RefObject<MembersManagerHandle | null>;
  viewMode: "list" | "form";
  onToggleViewMode: () => void;
};

export function MembersHeaderActions({ managerRef, viewMode, onToggleViewMode }: MembersHeaderActionsProps) {
  return (
    <>
      <button
        onClick={() => managerRef.current?.refresh()}
        className="rounded-full border border-brand-medium/35 bg-white px-4 py-2 text-sm font-medium text-brand-dark transition hover:bg-zinc-50"
      >
        Rafraichir
      </button>
      <button
        onClick={onToggleViewMode}
        className="rounded-full bg-brand-dark px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
      >
        {viewMode === "form" ? "Retour a la liste" : "Nouvel adherent"}
      </button>
    </>
  );
}

