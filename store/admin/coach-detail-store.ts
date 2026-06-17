import { create } from "zustand";
import { adminCoachFromDetail } from "@/lib/admin/coach-map";
import type { CoachDetailData } from "@/lib/admin/coach-detail-server";
import type { AdminCoach } from "@/types/admin/coach";
import { useCoachStore } from "@/store/admin/coach-store";

type FetchCoachDetailOptions = {
  force?: boolean;
};

type CoachDetailStoreState = {
  previews: Record<string, AdminCoach>;
  cachedDetails: Record<string, CoachDetailData>;
  setPreviewFromList: (coach: AdminCoach) => void;
  setCachedDetail: (coach: CoachDetailData) => void;
  getPreview: (id: string) => AdminCoach | undefined;
  getCachedDetail: (id: string) => CoachDetailData | undefined;
  invalidateDetail: (id: string) => void;
  fetchCoachDetail: (id: string, options?: FetchCoachDetailOptions) => Promise<CoachDetailData>;
};

export const useCoachDetailStore = create<CoachDetailStoreState>((set, get) => ({
  previews: {},
  cachedDetails: {},
  setPreviewFromList: (coach) =>
    set((state) => ({
      previews: { ...state.previews, [coach.id]: coach },
    })),
  setCachedDetail: (coach) => {
    useCoachStore.getState().upsertCoach(adminCoachFromDetail(coach));
    set((state) => ({
      cachedDetails: { ...state.cachedDetails, [coach.id]: coach },
    }));
  },
  getPreview: (id) => get().previews[id],
  getCachedDetail: (id) => get().cachedDetails[id],
  invalidateDetail: (id) =>
    set((state) => {
      const { [id]: _removed, ...cachedDetails } = state.cachedDetails;
      return { cachedDetails };
    }),
  fetchCoachDetail: async (id, options) => {
    const cached = get().cachedDetails[id];
    if (!options?.force && cached) {
      return cached;
    }

    const response = await fetch(`/api/admin/coaches/${encodeURIComponent(id)}/detail`, {
      cache: "no-store",
    });
    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as { error?: string } | null;
      throw new Error(data?.error ?? "Impossible de charger le coach.");
    }
    const data = (await response.json()) as { item: CoachDetailData };
    get().setCachedDetail(data.item);
    return data.item;
  },
}));
