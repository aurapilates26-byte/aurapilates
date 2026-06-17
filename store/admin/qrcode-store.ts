import { create } from "zustand";
import type { AdminQrCode, QrCodeFilters, QrCodeListMeta } from "@/types/admin/qrcode";

type QrCodeStoreState = {
  items: AdminQrCode[];
  meta: QrCodeListMeta;
  filters: QrCodeFilters;
  isLoading: boolean;
  isCreating: boolean;
  error: string | null;
  listVersion: number;
  setItems: (items: AdminQrCode[], meta: QrCodeListMeta) => void;
  bumpList: () => void;
  prependItem: (item: AdminQrCode) => void;
  removeItem: (publicId: string) => void;
  setLoading: (isLoading: boolean) => void;
  setCreating: (isCreating: boolean) => void;
  setError: (error: string | null) => void;
  setSearch: (search: string) => void;
  setAssignment: (assignment: QrCodeFilters["assignment"]) => void;
  setPage: (page: number) => void;
  resetFilters: () => void;
};

const defaultMeta: QrCodeListMeta = {
  page: 1,
  pageSize: 10,
  total: 0,
  totalPages: 1,
  assignedCount: 0,
  unassignedCount: 0,
};

const defaultFilters: QrCodeFilters = {
  search: "",
  assignment: "ALL",
  page: 1,
};

export const useQrCodeStore = create<QrCodeStoreState>((set) => ({
  items: [],
  meta: defaultMeta,
  filters: defaultFilters,
  isLoading: false,
  isCreating: false,
  error: null,
  listVersion: 0,
  setItems: (items, meta) => set({ items, meta }),
  bumpList: () => set((state) => ({ listVersion: state.listVersion + 1 })),
  prependItem: (item) =>
    set((state) => ({
      items: [item, ...state.items],
      meta: {
        ...state.meta,
        total: state.meta.total + 1,
      },
    })),
  removeItem: (publicId) =>
    set((state) => {
      const nextItems = state.items.filter((x) => x.publicId !== publicId);
      const removed = nextItems.length !== state.items.length;
      return {
        items: nextItems,
        meta: removed
          ? {
              ...state.meta,
              total: Math.max(0, state.meta.total - 1),
            }
          : state.meta,
      };
    }),
  setLoading: (isLoading) => set({ isLoading }),
  setCreating: (isCreating) => set({ isCreating }),
  setError: (error) => set({ error }),
  setSearch: (search) =>
    set((state) => ({
      filters: { ...state.filters, search, page: 1 },
    })),
  setAssignment: (assignment) =>
    set((state) => ({
      filters: { ...state.filters, assignment, page: 1 },
    })),
  setPage: (page) =>
    set((state) => ({
      filters: { ...state.filters, page: Math.max(1, page) },
    })),
  resetFilters: () => set({ filters: defaultFilters }),
}));
