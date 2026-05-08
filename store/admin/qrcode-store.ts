import { create } from "zustand";
import type { AdminQrCode, QrCodeFilters, QrCodeListMeta } from "@/types/admin/qrcode";

type QrCodeStoreState = {
  items: AdminQrCode[];
  meta: QrCodeListMeta;
  filters: QrCodeFilters;
  isLoading: boolean;
  isCreating: boolean;
  error: string | null;
  setItems: (items: AdminQrCode[], meta: QrCodeListMeta) => void;
  prependItem: (item: AdminQrCode) => void;
  removeItem: (publicId: string) => void;
  setLoading: (isLoading: boolean) => void;
  setCreating: (isCreating: boolean) => void;
  setError: (error: string | null) => void;
  setSearch: (search: string) => void;
  setAssignment: (assignment: QrCodeFilters["assignment"]) => void;
  resetFilters: () => void;
};

const defaultMeta: QrCodeListMeta = {
  page: 1,
  pageSize: 10,
  total: 0,
  totalPages: 1,
};

const defaultFilters: QrCodeFilters = {
  search: "",
  assignment: "ALL",
};

export const useQrCodeStore = create<QrCodeStoreState>((set) => ({
  items: [],
  meta: defaultMeta,
  filters: defaultFilters,
  isLoading: false,
  isCreating: false,
  error: null,
  setItems: (items, meta) => set({ items, meta }),
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
      filters: { ...state.filters, search },
    })),
  setAssignment: (assignment) =>
    set((state) => ({
      filters: { ...state.filters, assignment },
    })),
  resetFilters: () => set({ filters: defaultFilters }),
}));
