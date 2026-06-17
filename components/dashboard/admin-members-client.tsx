"use client";

import { useState } from "react";
import { DashboardHeader } from "@/components/dashboard/header";
import { MembersHeaderActions } from "@/components/dashboard/members-header-actions";
import { MembersManager } from "@/components/dashboard/members-manager";

export function AdminMembersClient() {
  const [viewMode, setViewMode] = useState<"list" | "form">("list");
  const [listMode, setListMode] = useState<"members" | "deposits">("members");
  const [depositCount, setDepositCount] = useState(0);

  return (
    <>
      <DashboardHeader
        role="ADMIN"
        title={listMode === "deposits" && viewMode === "list" ? "Avances adhérents" : "Adhérents"}
        description={
          listMode === "deposits" && viewMode === "list"
            ? "Adhérents avec acompte en attente. Finalisez le solde et assignez le QR pour les activer dans la liste principale."
            : "Ajoutez des adhérents et assignez un QR code maintenant ou plus tard depuis leur fiche."
        }
        showRoleLine={false}
        actions={
          <MembersHeaderActions
            listMode={listMode}
            depositCount={depositCount}
            viewMode={viewMode}
            onShowDeposits={() => {
              setListMode("deposits");
              setViewMode("list");
            }}
            onShowMembers={() => setListMode("members")}
            onToggleViewMode={() => setViewMode((prev) => (prev === "list" ? "form" : "list"))}
          />
        }
      />
      <MembersManager
        listMode={listMode}
        viewMode={viewMode}
        onChangeViewMode={setViewMode}
        onDepositCountChange={setDepositCount}
      />
    </>
  );
}
