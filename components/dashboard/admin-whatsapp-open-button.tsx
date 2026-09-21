"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/toast-provider";

function WhatsAppGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className ?? "h-4 w-4"} fill="currentColor" aria-hidden>
      <path d="M12.04 2C6.58 2 2.15 6.43 2.15 11.89c0 1.96.52 3.87 1.5 5.55L2 22l4.72-1.55a9.86 9.86 0 0 0 5.32 1.55h.01c5.46 0 9.89-4.43 9.89-9.89C21.94 6.43 17.5 2 12.04 2zm5.76 14.04c-.24.68-1.4 1.25-1.94 1.33-.5.07-1.13.1-1.82-.11-.42-.13-.96-.31-1.66-.61-2.92-1.26-4.82-4.2-4.97-4.4-.14-.2-1.18-1.57-1.18-3 0-1.42.75-2.12 1.01-2.41.27-.29.58-.36.78-.36h.56c.18 0 .42-.07.66.5.24.58.82 2 .89 2.15.07.15.12.32.02.52-.1.2-.15.32-.3.5-.14.17-.31.39-.44.52-.14.14-.29.29-.12.57.16.28.72 1.19 1.55 1.93 1.06.95 1.96 1.25 2.24 1.39.28.14.44.12.6-.07.17-.2.7-.81.89-1.09.19-.28.38-.23.64-.14.27.1 1.7.8 1.99.95.29.14.48.22.55.34.07.12.07.7-.17 1.38z" />
    </svg>
  );
}

type AdminWhatsAppOpenButtonProps = {
  /** URL relative GET qui renvoie `{ waUrl: string }`. */
  fetchUrl: string;
  ariaLabel: string;
  title: string;
  hasPhone: boolean;
  missingPhoneDescription: string;
  disabled?: boolean;
  className?: string;
};

/** Bouton lecture seule : charge un lien wa.me et l'ouvre (aucun effet métier). */
export function AdminWhatsAppOpenButton({
  fetchUrl,
  ariaLabel,
  title,
  hasPhone,
  missingPhoneDescription,
  disabled,
  className,
}: AdminWhatsAppOpenButtonProps) {
  const { toast } = useToast();
  const [opening, setOpening] = useState(false);

  const openWhatsApp = async () => {
    if (!hasPhone) {
      toast({
        variant: "warning",
        title: "Téléphone manquant",
        description: missingPhoneDescription,
      });
      return;
    }
    setOpening(true);
    try {
      const res = await fetch(fetchUrl, { cache: "no-store", credentials: "include" });
      const data = (await res.json().catch(() => null)) as {
        ok?: boolean;
        waUrl?: string;
        error?: string;
      };
      if (!res.ok || !data?.waUrl) {
        throw new Error(data?.error ?? "Impossible d'ouvrir WhatsApp.");
      }
      window.open(data.waUrl, "_blank", "noopener,noreferrer");
    } catch (e) {
      toast({
        variant: "error",
        title: "WhatsApp",
        description: e instanceof Error ? e.message : "Erreur.",
      });
    } finally {
      setOpening(false);
    }
  };

  return (
    <button
      type="button"
      disabled={!hasPhone || opening || disabled}
      onClick={() => void openWhatsApp()}
      aria-label={ariaLabel}
      title={hasPhone ? title : "Aucun téléphone enregistré"}
      className={
        className ??
        "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-emerald-200 bg-[#25D366]/15 text-[#128C7E] transition hover:bg-[#25D366]/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200 disabled:cursor-not-allowed disabled:opacity-50"
      }
    >
      {opening ? (
        <span className="text-[10px] font-semibold">…</span>
      ) : (
        <WhatsAppGlyph className="h-4 w-4" />
      )}
    </button>
  );
}
