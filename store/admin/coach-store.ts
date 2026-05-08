import { create } from "zustand";
import type { AdminCoach, CoachFilters } from "@/types/admin/coach";

type CoachStoreState = {
  items: AdminCoach[];
  filters: CoachFilters;
  isLoading: boolean;
  error: string | null;
  setItems: (items: AdminCoach[]) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setSearch: (search: string) => void;
  setStatus: (status: CoachFilters["status"]) => void;
  resetFilters: () => void;
};

const defaultFilters: CoachFilters = {
  search: "",
  status: "ALL",
};

export const useCoachStore = create<CoachStoreState>((set) => ({
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
  setStatus: (status) =>
    set((state) => ({
      filters: { ...state.filters, status },
    })),
  resetFilters: () => set({ filters: defaultFilters }),
}));
