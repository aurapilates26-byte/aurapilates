import { create } from "zustand";
import type { AdminPlanningItem, PlanningFilters } from "@/types/admin/planning";

type PlanningStoreState = {
  items: AdminPlanningItem[];
  filters: PlanningFilters;
  isLoading: boolean;
  error: string | null;
  setItems: (items: AdminPlanningItem[]) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setSearch: (search: string) => void;
  setDayOfWeek: (dayOfWeek: PlanningFilters["dayOfWeek"]) => void;
  resetFilters: () => void;
};

const defaultFilters: PlanningFilters = {
  search: "",
  dayOfWeek: "ALL",
};

export const usePlanningStore = create<PlanningStoreState>((set) => ({
  items: [],
  filters: defaultFilters,
  isLoading: false,
  error: null,
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
}));

