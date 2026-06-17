import { create } from "zustand";
import type { PackDisplayPricing } from "@/lib/pack-pricing";
import type { AdminPackPromotionItem } from "@/types/admin/pack-promotion";

export type AdminPackListItem = {
  id: string;
  category: string | null;
  name: string;
  description: string | null;
  sessionCount: number | null;
  courseQuotas?: { courseSlug: string; sessionCount: number }[];
  priceCents: number | null;
  durationDays: string | null;
  isActive: boolean;
  features: string[];
  /** Prix effectif aujourd'hui (remise en cours uniquement). */
  pricing: PackDisplayPricing;
  /** Remise planifiée ou en cours (colonne Remise). */
  promotionPreview: PackDisplayPricing | null;
};

type FetchPacksOptions = {
  /** Recharge même si des données sont déjà en cache. */
  force?: boolean;
};

type PacksStoreState = {
  packs: AdminPackListItem[];
  promotions: AdminPackPromotionItem[];
  packsLoaded: boolean;
  promotionsLoaded: boolean;
  isLoadingPacks: boolean;
  isLoadingPromotions: boolean;
  error: string | null;
  syncVersion: number;
  setPacks: (packs: AdminPackListItem[]) => void;
  setPromotions: (promotions: AdminPackPromotionItem[]) => void;
  setLoadingPacks: (value: boolean) => void;
  setLoadingPromotions: (value: boolean) => void;
  setError: (error: string | null) => void;
  bumpSync: () => void;
  fetchPacks: (options?: FetchPacksOptions) => Promise<void>;
  fetchPromotions: (options?: FetchPacksOptions) => Promise<void>;
  syncAll: () => Promise<void>;
};

export const usePacksStore = create<PacksStoreState>((set, get) => ({
  packs: [],
  promotions: [],
  packsLoaded: false,
  promotionsLoaded: false,
  isLoadingPacks: false,
  isLoadingPromotions: false,
  error: null,
  syncVersion: 0,
  setPacks: (packs) => set({ packs }),
  setPromotions: (promotions) => set({ promotions }),
  setLoadingPacks: (isLoadingPacks) => set({ isLoadingPacks }),
  setLoadingPromotions: (isLoadingPromotions) => set({ isLoadingPromotions }),
  setError: (error) => set({ error }),
  bumpSync: () => set((state) => ({ syncVersion: state.syncVersion + 1 })),
  fetchPacks: async (options) => {
    const state = get();
    if (!options?.force && state.packsLoaded) {
      return;
    }

    const showLoading = !state.packsLoaded;
    if (showLoading) {
      set({ isLoadingPacks: true, error: null });
    }

    try {
      const response = await fetch("/api/admin/packs", { cache: "no-store" });
      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? "Impossible de charger les packs.");
      }
      const data = (await response.json()) as { items: AdminPackListItem[] };
      set({ packs: data.items, packsLoaded: true });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : "Une erreur est survenue." });
      throw e;
    } finally {
      if (showLoading) {
        set({ isLoadingPacks: false });
      }
    }
  },
  fetchPromotions: async (options) => {
    const state = get();
    if (!options?.force && state.promotionsLoaded) {
      return;
    }

    const showLoading = !state.promotionsLoaded;
    if (showLoading) {
      set({ isLoadingPromotions: true, error: null });
    }

    try {
      const response = await fetch("/api/admin/pack-promotions", { cache: "no-store" });
      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? "Impossible de charger les remises.");
      }
      const data = (await response.json()) as { items: AdminPackPromotionItem[] };
      set({ promotions: data.items, promotionsLoaded: true });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : "Une erreur est survenue." });
      throw e;
    } finally {
      if (showLoading) {
        set({ isLoadingPromotions: false });
      }
    }
  },
  syncAll: async () => {
    const { fetchPacks, fetchPromotions, bumpSync } = get();
    await Promise.all([fetchPacks({ force: true }), fetchPromotions({ force: true })]);
    bumpSync();
  },
}));
