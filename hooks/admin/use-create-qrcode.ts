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
    return `Vous avez atteint la limite, reessayez dans ${retryAfter} secondes.`;
  }
  return "Vous avez atteint la limite, reessayez dans quelques instants.";
}

export function useCreateQrCode() {
  const { setCreating, setError, prependItem } = useQrCodeStore();

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
          throw new Error("Creation du QR code impossible.");
        }

        const data = (await response.json()) as CreateQrCodeResponse;
        for (const item of data.items.slice().reverse()) {
          prependItem(item);
        }
        return data.items;
      } catch (createError) {
        const message = createError instanceof Error ? createError.message : "Erreur de creation.";
        setError(message);
        throw createError;
      } finally {
        setCreating(false);
      }
    },
    [prependItem, setCreating, setError]
  );

  return { createQrCode };
}
