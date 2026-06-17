import { create } from "zustand";
import { CAISSE_HISTORY_FETCH_DAYS } from "@/lib/caisse-history-period";
import { cashExpenseToLedgerEntry, sortCaisseLedgerEntries } from "@/lib/caisse-ledger-entry";
import type { CaisseHistoryPeriod } from "@/types/admin/caisse-history";
import type { CaisseLedgerEntryDto } from "@/types/admin/caisse-ledger";
import type { CashExpenseDto } from "@/types/admin/cash-expense";

type FetchHistoryOptions = {
  force?: boolean;
};

type CaisseHistoryStoreState = {
  fullLedger: CaisseLedgerEntryDto[];
  listLoaded: boolean;
  isLoading: boolean;
  error: string | null;
  fetchHistory: (options?: FetchHistoryOptions) => Promise<void>;
  appendExpense: (expense: CashExpenseDto) => void;
  invalidate: () => void;
};

export const useCaisseHistoryStore = create<CaisseHistoryStoreState>((set, get) => ({
  fullLedger: [],
  listLoaded: false,
  isLoading: false,
  error: null,
  invalidate: () => set({ listLoaded: false }),
  appendExpense: (expense) => {
    const entry = cashExpenseToLedgerEntry(expense);
    set((state) => {
      if (state.fullLedger.some((e) => e.id === entry.id)) return state;
      return {
        fullLedger: sortCaisseLedgerEntries([entry, ...state.fullLedger]),
        listLoaded: true,
      };
    });
  },
  fetchHistory: async (options) => {
    const state = get();
    if (!options?.force && state.listLoaded) return;

    const showLoading = !state.listLoaded;
    if (showLoading) set({ isLoading: true, error: null });

    try {
      const res = await fetch(
        `/api/admin/caisse/history?days=${CAISSE_HISTORY_FETCH_DAYS}`,
        { cache: "no-store" },
      );
      const data = (await res.json()) as CaisseHistoryPeriod & { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Chargement historique impossible");
      set({
        fullLedger: data.ledger,
        listLoaded: true,
        isLoading: false,
        error: null,
      });
    } catch (e) {
      set({
        isLoading: false,
        error: e instanceof Error ? e.message : "Erreur",
      });
    }
  },
}));
