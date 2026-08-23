"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/header";
import { MembersHeaderActions } from "@/components/dashboard/members-header-actions";
import { MembersManager } from "@/components/dashboard/members-manager";
import type { ProspectConversionContext } from "@/components/dashboard/reservations/prospect-types";
import { useToast } from "@/components/ui/toast-provider";
import type { MemberPaymentStatus } from "@/lib/admin/member-payment-status";

export function AdminMembersClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const prospectId = searchParams.get("prospectId");
  const from = searchParams.get("from");

  const [viewMode, setViewMode] = useState<"list" | "form">("list");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<"ALL" | MemberPaymentStatus>("ALL");
  const [unpaidCount, setUnpaidCount] = useState(0);
  const [prospectConversion, setProspectConversion] = useState<ProspectConversionContext | null>(null);
  const [prospectLoading, setProspectLoading] = useState(false);

  const clearProspectConversion = useCallback(() => {
    setProspectConversion(null);
    if (from === "reservations") {
      router.push("/dashboard/reservations-admin");
      return;
    }
    router.replace("/dashboard/adherents");
    setViewMode("list");
  }, [from, router]);

  useEffect(() => {
    if (!prospectId) {
      setProspectConversion(null);
      return;
    }

    let cancelled = false;
    setProspectLoading(true);
    void fetch(`/api/admin/reservations/prospects/${encodeURIComponent(prospectId)}`, { cache: "no-store" })
      .then(async (res) => {
        const data = (await res.json().catch(() => null)) as (ProspectConversionContext & { error?: string }) | null;
        if (!res.ok) throw new Error(data?.error ?? "Prospect introuvable.");
        return data as ProspectConversionContext;
      })
      .then((data) => {
        if (cancelled) return;
        setProspectConversion(data);
        setViewMode("form");
      })
      .catch((e) => {
        if (cancelled) return;
        setProspectConversion(null);
        setViewMode("list");
        router.replace("/dashboard/adherents");
        toast({
          variant: "error",
          title: "Prospect introuvable",
          description: e instanceof Error ? e.message : "Impossible de charger le prospect.",
        });
      })
      .finally(() => {
        if (!cancelled) setProspectLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [prospectId, router, toast]);

  const headerTitle = prospectConversion ? "Convertir en adhérente" : "Adhérentes";
  const headerDescription = prospectConversion
    ? `${prospectConversion.firstName} ${prospectConversion.lastName} — complétez le formulaire pour créer l'adhérente et débiter la séance d'essai.`
    : "Liste unique des adhérentes. Filtrez par paiement : Payé, Avance ou Crédit. Les séances sont utilisables dès l'achat du pack.";

  return (
    <>
      <DashboardHeader
        role="ADMIN"
        title={headerTitle}
        description={headerDescription}
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
            onToggleViewMode={() => {
              if (prospectConversion) clearProspectConversion();
              else setViewMode((prev) => (prev === "list" ? "form" : "list"));
            }}
          />
        }
      />
      {prospectLoading ? (
        <div className="rounded-2xl border border-brand-medium/20 bg-white p-6 text-sm text-brand-dark/70 shadow-sm">
          Chargement du prospect…
        </div>
      ) : (
        <MembersManager
          viewMode={viewMode}
          onChangeViewMode={setViewMode}
          paymentStatusFilter={paymentStatusFilter}
          onPaymentStatusFilterChange={setPaymentStatusFilter}
          onUnpaidCountChange={setUnpaidCount}
          prospectConversion={prospectConversion}
          onProspectConversionComplete={clearProspectConversion}
        />
      )}
    </>
  );
}
