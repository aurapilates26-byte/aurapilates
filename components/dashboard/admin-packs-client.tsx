"use client";

import { useRef, useState } from "react";
import { DashboardHeader } from "@/components/dashboard/header";
import { PacksHeaderActions } from "@/components/dashboard/packs-header-actions";
import { PacksManager, type PacksManagerHandle } from "@/components/dashboard/packs-manager";

export function AdminPacksClient() {
  const managerRef = useRef<PacksManagerHandle | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "form">("list");

  return (
    <>
      <DashboardHeader
        role="ADMIN"
        title="Packs"
        description="Gérez les packs du studio avec catégorie, durée, prix et points de description."
        showRoleLine={false}
        actions={
          <PacksHeaderActions
            managerRef={managerRef}
            viewMode={viewMode}
            onToggleViewMode={() => setViewMode((prev) => (prev === "list" ? "form" : "list"))}
          />
        }
      />

      <PacksManager ref={managerRef} viewMode={viewMode} onChangeViewMode={setViewMode} />
    </>
  );
}
