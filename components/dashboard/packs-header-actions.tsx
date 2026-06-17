"use client";

import type { RefObject } from "react";
import type { PacksPageViewMode } from "@/components/dashboard/admin-packs-client";
import type { PackPromotionsManagerHandle } from "@/components/dashboard/pack-promotions-manager";
import type { PacksManagerHandle } from "@/components/dashboard/packs-manager";

type PacksHeaderActionsProps = {
  packsManagerRef: RefObject<PacksManagerHandle | null>;
  promotionsManagerRef: RefObject<PackPromotionsManagerHandle | null>;
  viewMode: PacksPageViewMode;
  onOpenPromotions: () => void;
  onBackToPacks: () => void;
  onTogglePackForm: () => void;
  onAddPromotion: () => void;
  onShowPromotionsList: () => void;
};

const secondaryBtnClass =
  "rounded-full border border-brand-medium/35 bg-white px-4 py-2 text-sm font-medium text-brand-dark transition hover:bg-zinc-50";
const primaryBtnClass =
  "rounded-full bg-brand-dark px-4 py-2 text-sm font-medium text-white transition hover:opacity-90";

export function PacksHeaderActions({
  packsManagerRef,
  promotionsManagerRef,
  viewMode,
  onOpenPromotions,
  onBackToPacks,
  onTogglePackForm,
  onAddPromotion,
  onShowPromotionsList,
}: PacksHeaderActionsProps) {
  const isPromotionsView = viewMode === "promotions" || viewMode === "promotion-form";

  if (isPromotionsView) {
    return (
      <div className="flex w-full min-w-0 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end sm:gap-3">
        <button type="button" onClick={onBackToPacks} className={`${secondaryBtnClass} w-full sm:w-auto`}>
          Retour aux packs
        </button>
        <button
          type="button"
          onClick={() => {
            if (viewMode === "promotion-form") {
              onShowPromotionsList();
              return;
            }
            onAddPromotion();
          }}
          className={`${primaryBtnClass} w-full sm:w-auto`}
        >
          {viewMode === "promotion-form" ? "Liste des remises" : "Ajouter une remise"}
        </button>
      </div>
    );
  }

  return (
    <div className="flex w-full min-w-0 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end sm:gap-3">
      <button
        type="button"
        onClick={onOpenPromotions}
        className={`${secondaryBtnClass} w-full sm:w-auto`}
      >
        Remise
      </button>
      <button type="button" onClick={onTogglePackForm} className={`${primaryBtnClass} w-full sm:w-auto`}>
        {viewMode === "form" ? "Revenir aux packs" : "Ajouter pack"}
      </button>
    </div>
  );
}
