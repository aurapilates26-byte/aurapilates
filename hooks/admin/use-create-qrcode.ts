"use client";

import { useCallback } from "react";
import { useQrCodeStore } from "@/store/admin/qrcode-store";
import type { AdminQrCode, CreateQrCodePayload } from "@/types/admin/qrcode";

type CreateQrCodeResponse = {
  items: AdminQrCode[];
};

function getRateLimitMessage(retryAfterHeader: string | null) {
  const retryAfter = Number.parseInt(retryAfterHeader ?? "", 10);
  if (Number.isFinite(retryAfter) && retryAfter > 0) {
    return `Vous avez atteint la limite, réessayez dans ${retryAfter} secondes.`;
  }
  return "Vous avez atteint la limite, réessayez dans quelques instants.";
}

export function useCreateQrCode() {
  const { setCreating, setError, setPage, bumpList } = useQrCodeStore();

  const createQrCode = useCallback(
    async (payload: CreateQrCodePayload) => {
      setCreating(true);
      setError(null);

      try {
        const response = await fetch("/api/admin/qrcode", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          if (response.status === 429) {
            throw new Error(getRateLimitMessage(response.headers.get("Retry-After")));
          }
          throw new Error("Création du QR code impossible.");
        }

        const data = (await response.json()) as CreateQrCodeResponse;
        setPage(1);
        bumpList();
        return data.items;
      } catch (createError) {
        const message = createError instanceof Error ? createError.message : "Erreur de création.";
        setError(message);
        throw createError;
      } finally {
        setCreating(false);
      }
    },
    [bumpList, setCreating, setError, setPage]
  );

  return { createQrCode };
}
