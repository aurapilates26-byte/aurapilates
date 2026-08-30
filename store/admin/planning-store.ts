import { create } from "zustand";
import type { AdminPlanningItem, PlanningFilters } from "@/types/admin/planning";

type FetchGridOptions = {
  force?: boolean;
};

type PlanningStoreState = {
  items: AdminPlanningItem[];
  filters: PlanningFilters;
  isLoading: boolean;
  error: string | null;
  gridCache: Record<string, AdminPlanningItem[]>;
  gridLoadingKey: string | null;
  gridError: string | null;
  gridErrorKey: string | null;
  gridHydrated: boolean;
  setItems: (items: AdminPlanningItem[]) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setSearch: (search: string) => void;
  setDayOfWeek: (dayOfWeek: PlanningFilters["dayOfWeek"]) => void;
  resetFilters: () => void;
  getGridItems: (cacheKey: string) => AdminPlanningItem[] | undefined;
  hasGridCache: (cacheKey: string) => boolean;
  fetchGridForSlot: (
    cacheKey: string,
    url: string,
    options?: FetchGridOptions,
  ) => Promise<AdminPlanningItem[]>;
  removeGridItem: (cacheKey: string, itemId: string) => void;
  invalidateGridCache: () => void;
};

const defaultFilters: PlanningFilters = {
  search: "",
  dayOfWeek: "ALL",
};

export const usePlanningStore = create<PlanningStoreState>((set, get) => ({
  items: [],
  filters: defaultFilters,
  isLoading: false,
  error: null,
  gridCache: {},
  gridLoadingKey: null,
  gridError: null,
  gridErrorKey: null,
  gridHydrated: false,

  setItems: (items) => set({ items }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setSearch: (search) =>
    set((state) => ({
      filters: { ...state.filters, search },
    })),
  setDayOfWeek: (dayOfWeek) =>
    set((state) => ({
      filters: { ...state.filters, dayOfWeek },
    })),
  resetFilters: () => set({ filters: defaultFilters }),

  getGridItems: (cacheKey) => get().gridCache[cacheKey],
  hasGridCache: (cacheKey) => cacheKey in get().gridCache,

  fetchGridForSlot: async (cacheKey, url, options) => {
    const { force = false } = options ?? {};
    const cached = get().gridCache[cacheKey];
    if (!force && cached) {
      return cached;
    }

    set({ gridLoadingKey: cacheKey, gridError: null, gridErrorKey: null });

    try {
      const response = await fetch(url, { cache: "no-store" });
      const data = (await response.json()) as { items?: AdminPlanningItem[]; error?: string };
      if (!response.ok) {
        throw new Error(data.error ?? "Impossible de charger le planning.");
      }
      const items = data.items ?? [];
      set((state) => ({
        gridCache: { ...state.gridCache, [cacheKey]: items },
        gridLoadingKey: null,
        gridError: null,
        gridErrorKey: null,
        gridHydrated: true,
        items:
          cacheKey.startsWith("published:") && !cacheKey.startsWith("current-archive:")
            ? items
            : state.items,
      }));
      return items;
    } catch (e) {
      const message = e instanceof Error ? e.message : "Une erreur est survenue.";
      set({ gridLoadingKey: null, gridError: message, gridErrorKey: cacheKey, gridHydrated: true });
      throw e;
    }
  },

  removeGridItem: (cacheKey, itemId) =>
    set((state) => {
      const current = state.gridCache[cacheKey];
      if (!current) return state;
      return {
        gridCache: {
          ...state.gridCache,
          [cacheKey]: current.filter((item) => item.id !== itemId),
        },
      };
    }),

  invalidateGridCache: () =>
    set({
      gridCache: {},
      gridLoadingKey: null,
      gridError: null,
      gridErrorKey: null,
      gridHydrated: false,
    }),
}));
