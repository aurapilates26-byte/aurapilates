import { create } from "zustand";
import { BOOKING_WINDOW_SHORT_FR } from "@/lib/planning-booking-window";
import { proposeNextPlanningPeriod } from "@/lib/planning-period-status";
import type {
  AdminPlanningPeriodWindow,
  PlanningBookingWindow,
  PlanningPeriodDraftSchedule,
  PlanningPeriodEnriched,
} from "@/types/admin/planning";

type FetchOptions = {
  force?: boolean;
  /** Admin dashboard vs site public */
  source?: "admin" | "public";
};

type SavePublishedInput = {
  bookingWindow: PlanningBookingWindow;
  periodStartYmd: string;
};

type SaveDraftInput = {
  bookingWindow: PlanningBookingWindow;
  periodStartYmd: string;
};

type PlanningPeriodStoreState = {
  /** Période affichée (adhérentes / site). */
  config: PlanningPeriodEnriched | null;
  draft: PlanningPeriodDraftSchedule | null;
  bookingRules: AdminPlanningPeriodWindow["bookingRules"] | null;
  loaded: boolean;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  /** Valeurs du formulaire brouillon (synchro avant enregistrement). */
  draftFormInput: SaveDraftInput | null;
  setDraftFormInput: (input: SaveDraftInput) => void;
  /** Crée le brouillon si absent (utilise le formulaire ou la proposition). */
  ensureDraftSaved: () => Promise<PlanningPeriodDraftSchedule>;
  hydrate: (window: AdminPlanningPeriodWindow) => void;
  setWindow: (window: AdminPlanningPeriodWindow) => void;
  fetchConfig: (options?: FetchOptions) => Promise<void>;
  saveConfig: (input: SavePublishedInput) => Promise<AdminPlanningPeriodWindow>;
  saveDraftSchedule: (input: SaveDraftInput) => Promise<AdminPlanningPeriodWindow>;
  prepareDraftFromSuggestion: () => Promise<AdminPlanningPeriodWindow>;
  clearDraft: () => Promise<AdminPlanningPeriodWindow>;
  renewSuggestedPeriod: () => Promise<AdminPlanningPeriodWindow>;
  windowShortLabel: () => string;
};

const ADMIN_URL = "/api/admin/planning-window";
const ADMIN_DRAFT_URL = "/api/admin/planning-window-draft";
const PUBLIC_URL = "/api/public/planning-period";

function endpointFor(source: "admin" | "public") {
  return source === "public" ? PUBLIC_URL : ADMIN_URL;
}

function applyWindow(set: (partial: Partial<PlanningPeriodStoreState>) => void, window: AdminPlanningPeriodWindow) {
  set({
    config: window.published,
    draft: window.draft,
    bookingRules: window.bookingRules,
    loaded: true,
    error: null,
  });
}

export const usePlanningPeriodStore = create<PlanningPeriodStoreState>((set, get) => ({
  config: null,
  draft: null,
  bookingRules: null,
  loaded: false,
  isLoading: false,
  isSaving: false,
  error: null,
  draftFormInput: null,

  setDraftFormInput: (input) => set({ draftFormInput: input }),

  ensureDraftSaved: async () => {
    const state = get();
    if (state.draft) return state.draft;

    const fromForm = state.draftFormInput;
    const fromSuggestion = state.config ? proposeNextPlanningPeriod(state.config) : null;
    const input: SaveDraftInput | null =
      fromForm?.periodStartYmd && /^\d{4}-\d{2}-\d{2}$/.test(fromForm.periodStartYmd)
        ? fromForm
        : fromSuggestion
          ? {
              bookingWindow: fromSuggestion.bookingWindow,
              periodStartYmd: fromSuggestion.periodStartYmd,
            }
          : null;

    if (!input) {
      throw new Error("Choisissez la date de début de la prochaine période.");
    }

    await get().saveDraftSchedule(input);
    const draft = get().draft;
    if (!draft) {
      throw new Error("Impossible d'enregistrer le brouillon.");
    }
    return draft;
  },

  hydrate: (window) => applyWindow(set, window),

  setWindow: (window) => applyWindow(set, window),

  windowShortLabel: () => {
    const w = get().config?.bookingWindow;
    return w ? BOOKING_WINDOW_SHORT_FR[w] : "";
  },

  fetchConfig: async (options) => {
    const state = get();
    const source = options?.source ?? "admin";
    if (!options?.force && state.loaded && state.config) {
      return;
    }

    const showLoading = !state.loaded;
    if (showLoading) {
      set({ isLoading: true, error: null });
    }

    try {
      const response = await fetch(endpointFor(source), { cache: "no-store" });
      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? "Impossible de charger la période de planning.");
      }
      if (source === "public") {
        const data = (await response.json()) as PlanningPeriodEnriched;
        applyWindow(set, {
          published: data,
          draft: null,
          bookingRules: {
            lateCancellationRuleEnabled: true,
            lateCancellationHours: 6,
            memberReservationOpenTime: "08:00",
            memberReservationCloseTime: "22:00",
          },
        });
      } else {
        const data = (await response.json()) as AdminPlanningPeriodWindow;
        applyWindow(set, data);
      }
    } catch (e) {
      set({
        error: e instanceof Error ? e.message : "Une erreur est survenue.",
      });
    } finally {
      set({ isLoading: false });
    }
  },

  saveConfig: async (input) => {
    set({ isSaving: true, error: null });
    try {
      const response = await fetch(ADMIN_URL, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = (await response.json()) as AdminPlanningPeriodWindow & { error?: string };
      if (!response.ok) {
        throw new Error(data.error ?? "Enregistrement impossible");
      }
      applyWindow(set, data);
      return data;
    } catch (e) {
      const message = e instanceof Error ? e.message : "Enregistrement impossible";
      set({ error: message });
      throw e;
    } finally {
      set({ isSaving: false });
    }
  },

  saveDraftSchedule: async (input) => {
    set({ isSaving: true, error: null });
    try {
      const response = await fetch(ADMIN_DRAFT_URL, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = (await response.json()) as AdminPlanningPeriodWindow & { error?: string };
      if (!response.ok) {
        throw new Error(data.error ?? "Enregistrement impossible");
      }
      applyWindow(set, data);
      return data;
    } catch (e) {
      const message = e instanceof Error ? e.message : "Enregistrement impossible";
      set({ error: message });
      throw e;
    } finally {
      set({ isSaving: false });
    }
  },

  prepareDraftFromSuggestion: async () => {
    set({ isSaving: true, error: null });
    try {
      const response = await fetch(ADMIN_DRAFT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "from_suggestion" }),
      });
      const data = (await response.json()) as AdminPlanningPeriodWindow & { error?: string };
      if (!response.ok) {
        throw new Error(data.error ?? "Impossible de préparer le brouillon");
      }
      applyWindow(set, data);
      return data;
    } catch (e) {
      const message = e instanceof Error ? e.message : "Impossible de préparer le brouillon";
      set({ error: message });
      throw e;
    } finally {
      set({ isSaving: false });
    }
  },

  clearDraft: async () => {
    set({ isSaving: true, error: null });
    try {
      const response = await fetch(ADMIN_DRAFT_URL, { method: "DELETE" });
      const data = (await response.json()) as AdminPlanningPeriodWindow & { error?: string };
      if (!response.ok) {
        throw new Error(data.error ?? "Suppression impossible");
      }
      applyWindow(set, data);
      return data;
    } catch (e) {
      const message = e instanceof Error ? e.message : "Suppression impossible";
      set({ error: message });
      throw e;
    } finally {
      set({ isSaving: false });
    }
  },

  /** Prépare la période suivante en brouillon (ne bascule plus la période affichée). */
  renewSuggestedPeriod: async () => {
    return get().prepareDraftFromSuggestion();
  },
}));
