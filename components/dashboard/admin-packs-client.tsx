"use client";

import { useEffect, useRef, useState } from "react";
import { usePacksStore } from "@/store/admin/packs-store";
import { DashboardHeader } from "@/components/dashboard/header";
import { PackPromotionsManager, type PackPromotionsManagerHandle } from "@/components/dashboard/pack-promotions-manager";
import { PacksHeaderActions } from "@/components/dashboard/packs-header-actions";
import { PacksManager, type PacksManagerHandle } from "@/components/dashboard/packs-manager";

export type PacksPageViewMode = "list" | "form" | "promotions" | "promotion-form";

export function AdminPacksClient() {
  const packsManagerRef = useRef<PacksManagerHandle | null>(null);
  const promotionsManagerRef = useRef<PackPromotionsManagerHandle | null>(null);
  const [viewMode, setViewMode] = useState<PacksPageViewMode>("list");

  const isPromotionsView = viewMode === "promotions" || viewMode === "promotion-form";
  useEffect(() => {
    const { fetchPacks, fetchPromotions } = usePacksStore.getState();
    void Promise.all([fetchPacks(), fetchPromotions()]);
  }, []);

  const handleBackToPacks = () => {
    setViewMode("list");
  };

  return (
    <>
      <DashboardHeader
        role="ADMIN"
        title="Packs"
        description={
          isPromotionsView
            ? "Créez des remises par pourcentage avec date de début et de fin."
            : "Gérez les packs du studio avec catégorie, durée et prix."
        }
        showRoleLine={false}
        actions={
          <PacksHeaderActions
            packsManagerRef={packsManagerRef}
            promotionsManagerRef={promotionsManagerRef}
            viewMode={viewMode}
            onOpenPromotions={() => setViewMode("promotions")}
            onBackToPacks={handleBackToPacks}
            onTogglePackForm={() =>
              setViewMode((prev) => {
                if (prev === "form") return "list";
                return "form";
              })
            }
            onAddPromotion={() => setViewMode("promotion-form")}
            onShowPromotionsList={() => setViewMode("promotions")}
          />
        }
      />

      <div className={isPromotionsView ? "hidden" : undefined}>
        <PacksManager
          ref={packsManagerRef}
          viewMode={viewMode === "form" ? "form" : "list"}
          onChangeViewMode={(mode) => setViewMode(mode)}
        />
      </div>
      <div className={isPromotionsView ? undefined : "hidden"}>
        <PackPromotionsManager
          ref={promotionsManagerRef}
          viewMode={viewMode === "promotion-form" ? "promotion-form" : "promotions"}
          onChangeViewMode={(mode) => setViewMode(mode)}
          onBackToPacks={handleBackToPacks}
        />
      </div>
    </>
  );
}
