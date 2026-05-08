"use client";

import { useEffect, useState, type RefObject } from "react";
import { SelectMenu } from "@/components/ui";
import type { PlanningBookingWindow } from "@/types/admin/planning";
import type { PlanningManagerHandle } from "./planning-manager";

type PlanningHeaderActionsProps = {
  managerRef: RefObject<PlanningManagerHandle | null>;
  viewMode: "list" | "form";
  onToggleViewMode: () => void;
};

export function PlanningHeaderActions({ managerRef, viewMode, onToggleViewMode }: PlanningHeaderActionsProps) {
  const [bookingWindow, setBookingWindow] = useState<PlanningBookingWindow>("WEEKLY");
  const [isSavingWindow, setIsSavingWindow] = useState(false);

  useEffect(() => {
    let isMounted = true;
    void (async () => {
      const response = await fetch("/api/admin/planning/window", { cache: "no-store" });
      if (!response.ok) return;
      const data = (await response.json()) as { bookingWindow: PlanningBookingWindow };
      if (isMounted) setBookingWindow(data.bookingWindow);
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  const updateBookingWindow = async (nextValue: PlanningBookingWindow) => {
    setBookingWindow(nextValue);
    setIsSavingWindow(true);
    try {
      const response = await fetch("/api/admin/planning/window", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingWindow: nextValue }),
      });
      if (!response.ok) throw new Error("Unable to save booking window");
      managerRef.current?.refresh();
    } catch {
      // Keep optimistic value in UI; next refresh will re-sync from server.
    } finally {
      setIsSavingWindow(false);
    }
  };

  return (
    <>
      <div className="w-[180px]">
        <SelectMenu
          id="planning-global-window"
          value={bookingWindow}
          onChange={(value) => void updateBookingWindow(value as PlanningBookingWindow)}
          options={[
            { value: "WEEKLY", label: "Hebdomadaire" },
            { value: "FIFTEEN_DAYS", label: "15 jours" },
            { value: "ONE_MONTH", label: "1 mois" },
          ]}
          className={isSavingWindow ? "opacity-70" : ""}
        />
      </div>
      <button
        type="button"
        onClick={() => managerRef.current?.refresh()}
        className="rounded-full border border-brand-medium/35 bg-white px-4 py-2 text-sm font-medium text-brand-dark transition hover:bg-zinc-50"
      >
        Rafraichir
      </button>
      <button
        type="button"
        onClick={onToggleViewMode}
        className="rounded-full bg-brand-dark px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
      >
        {viewMode === "form" ? "Revenir au planning" : "Ajouter seance"}
      </button>
    </>
  );
}

