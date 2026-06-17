import { create } from "zustand";
import { adminCoachFromApiRow } from "@/lib/admin/coach-map";
import type { AdminCoach, CoachFilters } from "@/types/admin/coach";

type FetchCoachesOptions = {
  /** Recharge même si la liste est déjà en cache. */
  force?: boolean;
};

type CoachStoreState = {
  items: AdminCoach[];
  filters: CoachFilters;
  listLoaded: boolean;
  isLoading: boolean;
  error: string | null;
  setItems: (items: AdminCoach[]) => void;
  upsertCoach: (coach: AdminCoach) => void;
  removeCoach: (id: string) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setSearch: (search: string) => void;
  setStatus: (status: CoachFilters["status"]) => void;
  resetFilters: () => void;
  invalidateList: () => void;
  fetchCoaches: (options?: FetchCoachesOptions) => Promise<void>;
};

const defaultFilters: CoachFilters = {
  search: "",
  status: "ALL",
};

export const useCoachStore = create<CoachStoreState>((set, get) => ({
  items: [],
  filters: defaultFilters,
  listLoaded: false,
  isLoading: false,
  error: null,
  setItems: (items) => set({ items, listLoaded: true }),
  upsertCoach: (coach) =>
    set((state) => {
      const index = state.items.findIndex((c) => c.id === coach.id);
      if (index === -1) {
        return { items: [coach, ...state.items], listLoaded: true };
      }
      const items = [...state.items];
      items[index] = coach;
      return { items, listLoaded: true };
    }),
  removeCoach: (id) =>
    set((state) => ({
      items: state.items.filter((c) => c.id !== id),
      listLoaded: state.items.length > 0,
    })),
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
  invalidateList: () => set({ listLoaded: false }),
  fetchCoaches: async (options) => {
    const state = get();
    if (!options?.force && state.listLoaded) {
      return;
    }

    const showLoading = !state.listLoaded;
    if (showLoading) {
      set({ isLoading: true, error: null });
    }

    try {
      const response = await fetch("/api/admin/coaches", { cache: "no-store" });
      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? "Impossible de charger les coachs.");
      }
      const data = (await response.json()) as { items: Parameters<typeof adminCoachFromApiRow>[0][] };
      set({
        items: data.items.map(adminCoachFromApiRow),
        listLoaded: true,
        error: null,
      });
    } catch (e) {
      set({
        error: e instanceof Error ? e.message : "Une erreur est survenue.",
      });
    } finally {
      set({ isLoading: false });
    }
  },
}));
