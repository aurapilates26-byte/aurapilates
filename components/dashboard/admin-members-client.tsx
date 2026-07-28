"use client";

import { useState } from "react";
import { DashboardHeader } from "@/components/dashboard/header";
import { MembersHeaderActions } from "@/components/dashboard/members-header-actions";
import { MembersManager } from "@/components/dashboard/members-manager";
import type { MemberPaymentStatus } from "@/lib/admin/member-payment-status";

export function AdminMembersClient() {
  const [viewMode, setViewMode] = useState<"list" | "form">("list");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<"ALL" | MemberPaymentStatus>("ALL");
  const [unpaidCount, setUnpaidCount] = useState(0);

  return (
    <>
      <DashboardHeader
        role="ADMIN"
        title="Adhérentes"
        description="Liste unique des adhérentes. Filtrez par paiement : Payé, Avance ou Crédit. Les séances sont utilisables dès l'achat du pack."
        showRoleLine={false}
        actions={
          <MembersHeaderActions
            paymentStatusFilter={paymentStatusFilter}
            unpaidCount={unpaidCount}
            viewMode={viewMode}
            onFilterAdvances={() => {
              setPaymentStatusFilter((prev) => (prev === "ADVANCE" ? "ALL" : "ADVANCE"));
              setViewMode("list");
            }}
            onToggleViewMode={() => setViewMode((prev) => (prev === "list" ? "form" : "list"))}
          />
        }
      />
      <MembersManager
        viewMode={viewMode}
        onChangeViewMode={setViewMode}
        paymentStatusFilter={paymentStatusFilter}
        onPaymentStatusFilterChange={setPaymentStatusFilter}
        onUnpaidCountChange={setUnpaidCount}
      />
    </>
  );
}
