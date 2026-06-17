"use client";

import type { RefObject } from "react";
import type { CoachesManagerHandle } from "@/components/dashboard/coaches-manager";

type CoachesHeaderActionsProps = {
  managerRef: RefObject<CoachesManagerHandle | null>;
  viewMode: "list" | "form";
  onToggleViewMode: () => void;
};

export function CoachesHeaderActions({ managerRef, viewMode, onToggleViewMode }: CoachesHeaderActionsProps) {
  return (
    <>
      <button
        type="button"
        onClick={() => managerRef.current?.refresh()}
        className="rounded-full border border-brand-medium/35 bg-white px-4 py-2 text-sm font-medium text-brand-dark transition hover:bg-zinc-50"
      >
        Rafraîchir
      </button>
      <button
        type="button"
        onClick={onToggleViewMode}
        className="rounded-full bg-brand-dark px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
      >
        {viewMode === "form" ? "Revenir aux coachs" : "Ajouter coach"}
      </button>
    </>
  );
}
