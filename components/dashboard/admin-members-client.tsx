"use client";

import { useRef, useState } from "react";
import { DashboardHeader } from "@/components/dashboard/header";
import { MembersHeaderActions } from "@/components/dashboard/members-header-actions";
import { MembersManager, type MembersManagerHandle } from "@/components/dashboard/members-manager";

export function AdminMembersClient() {
  const managerRef = useRef<MembersManagerHandle | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "form">("list");

  return (
    <>
      <DashboardHeader
        role="ADMIN"
        title="Adherents"
        description="Ajoutez des adherents en scannant des QR codes vierges, puis assignez-les de maniere securisee."
        showRoleLine={false}
        actions={
          <MembersHeaderActions
            managerRef={managerRef}
            viewMode={viewMode}
            onToggleViewMode={() => setViewMode((prev) => (prev === "list" ? "form" : "list"))}
          />
        }
      />
      <MembersManager ref={managerRef} viewMode={viewMode} onChangeViewMode={setViewMode} />
    </>
  );
}

