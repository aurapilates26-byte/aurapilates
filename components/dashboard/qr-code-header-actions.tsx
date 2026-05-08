"use client";

import { useState } from "react";
import { useCreateQrCode } from "@/hooks/admin/use-create-qrcode";

export function QrCodeHeaderActions() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [name, setName] = useState("Nouveau QR");
  const [quantity, setQuantity] = useState(1);
  const { createQrCode } = useCreateQrCode();

  const handleCreate = async () => {
    setModalError(null);
    setIsSubmitting(true);
    try {
      await createQrCode({
        name,
        quantity,
      });
      setIsOpen(false);
    } catch (error) {
      setModalError(error instanceof Error ? error.message : "Une erreur est survenue.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExport = () => {
    setIsExporting(true);
    window.setTimeout(() => setIsExporting(false), 600);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="rounded-full bg-brand-dark px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
      >
        Nouveau QR code
      </button>
      <button
        onClick={handleExport}
        className="rounded-full border border-brand-medium/35 bg-white px-4 py-2 text-sm font-medium text-brand-dark transition hover:bg-zinc-50"
      >
        {isExporting ? "Export..." : "Exporter"}
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-xl font-semibold text-brand-dark">Generer des QR codes</h3>
            <p className="mt-2 text-sm text-brand-dark/70">
              Definissez la quantite et confirmez. Les images seront stockees dans `public/qrcode`.
            </p>

            <div className="mt-5 space-y-4">
              <div>
                <label htmlFor="qr-name" className="text-sm font-medium text-brand-dark">
                  Nom de base
                </label>
                <input
                  id="qr-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-brand-medium/35 px-4 py-2.5 text-sm outline-none focus:border-brand-dark/60"
                />
              </div>
              <div>
                <label htmlFor="qr-quantity" className="text-sm font-medium text-brand-dark">
                  Quantite
                </label>
                <input
                  id="qr-quantity"
                  type="number"
                  min={1}
                  max={100}
                  value={quantity}
                  onChange={(event) => setQuantity(Math.max(1, Number(event.target.value || 1)))}
                  className="mt-2 w-full rounded-xl border border-brand-medium/35 px-4 py-2.5 text-sm outline-none focus:border-brand-dark/60"
                />
              </div>
            </div>
            {modalError ? (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {modalError}
              </div>
            ) : null}

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setIsOpen(false)}
                disabled={isSubmitting}
                className="rounded-full border border-brand-medium/35 bg-white px-4 py-2 text-sm font-medium text-brand-dark transition hover:bg-zinc-50"
              >
                Annuler
              </button>
              <button
                onClick={() => void handleCreate()}
                disabled={isSubmitting}
                className="rounded-full bg-brand-dark px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
              >
                {isSubmitting ? "Generation..." : "Confirmer"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
