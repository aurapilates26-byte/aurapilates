"use client";

import { useCallback, useEffect } from "react";
import { useQrCodeStore } from "@/store/admin/qrcode-store";
import type { QrCodeListResponse } from "@/types/admin/qrcode";

function buildQueryString(filters: { search: string; assignment: string }) {
  const query = new URLSearchParams();

  if (filters.search.trim()) {
    query.set("search", filters.search.trim());
  }

  if (filters.assignment !== "ALL") {
    query.set("assignment", filters.assignment);
  }

  return query.toString();
}

export function useAdminQrCodes() {
  const {
    items,
    meta,
    filters,
    isLoading,
    error,
    setItems,
    setLoading,
    setError,
    setSearch,
    setAssignment,
  } = useQrCodeStore();

  const loadQrCodes = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const queryString = buildQueryString(filters);
      const endpoint = queryString ? `/api/admin/qrcode?${queryString}` : "/api/admin/qrcode";
      const response = await fetch(endpoint, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Impossible de charger les QR codes.");
      }

      const data = (await response.json()) as QrCodeListResponse;
      setItems(data.items, data.meta);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Erreur de chargement.");
    } finally {
      setLoading(false);
    }
  }, [filters, setError, setItems, setLoading]);

  useEffect(() => {
    void loadQrCodes();
  }, [loadQrCodes]);

  return {
    items,
    meta,
    filters,
    isLoading,
    error,
    setSearch,
    setAssignment,
    reload: loadQrCodes,
  };
}
