"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useAdminQrCodes } from "@/hooks/admin/use-admin-qrcodes";
import { useToast } from "@/components/ui/toast-provider";
import { useQrCodeStore } from "@/store/admin/qrcode-store";
import type { AdminQrCode } from "@/types/admin/qrcode";
import { ConfirmDialog, Input, Modal, Select } from "@/components/ui";

const assignmentOptions: Array<{ value: "ALL" | "UNASSIGNED" | "ASSIGNED"; label: string }> = [
  { value: "ALL", label: "Tous" },
  { value: "UNASSIGNED", label: "Disponible" },
  { value: "ASSIGNED", label: "Assigne" },
];

function mapAssignmentLabel(item: AdminQrCode) {
  return item.assignedMemberId ? "Assigne" : "Disponible";
}

function getAssignmentClasses(item: AdminQrCode) {
  return item.assignedMemberId ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700";
}

function maskScanUrl(scanUrl: string) {
  const match = scanUrl.match(/^(.*\/id\/)([a-z0-9]+)$/i);
  if (!match) return scanUrl;
  const prefix = match[1];
  const id = match[2];
  if (id.length <= 8) return scanUrl;
  return `${prefix}${id.slice(0, 4)}…${id.slice(-4)}`;
}

function QrPreview() {
  return (
    <div className="grid h-36 w-36 grid-cols-6 gap-1 rounded-2xl border border-brand-medium/20 bg-white p-3 shadow-sm">
      {Array.from({ length: 36 }, (_, index) => (
        <span
          key={index}
          className={`rounded-[3px] ${index % 2 === 0 || index % 5 === 0 ? "bg-brand-dark" : "bg-brand-light"}`}
        />
      ))}
    </div>
  );
}

function QrCardImage({ src, alt }: { src: string; alt: string }) {
  const [retryCount, setRetryCount] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const maxRetries = 6;

  const retrySuffix = src.includes("?") ? `&rt=${retryCount}` : `?rt=${retryCount}`;
  const liveSrc = `${src}${retrySuffix}`;

  return (
    <div className="relative mt-3 h-16 w-16 overflow-hidden rounded-lg border border-brand-medium/25 bg-white p-1">
      {!isReady ? <div className="absolute inset-1 animate-pulse rounded bg-zinc-100" /> : null}
      <Image
        src={liveSrc}
        alt={alt}
        width={56}
        height={56}
        unoptimized
        loading="eager"
        className={`h-full w-full object-contain transition-opacity ${isReady ? "opacity-100" : "opacity-0"}`}
        onLoad={() => setIsReady(true)}
        onError={() => {
          if (retryCount >= maxRetries) return;
          window.setTimeout(() => {
            setRetryCount((prev) => prev + 1);
          }, 220);
        }}
      />
    </div>
  );
}

export function QrCodeManager() {
  const { items, meta, filters, isLoading, error, setSearch, setAssignment, reload } = useAdminQrCodes();
  const { toast } = useToast();
  const { removeItem } = useQrCodeStore();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<AdminQrCode | null>(null);
  const [previewItem, setPreviewItem] = useState<AdminQrCode | null>(null);

  const quickStats = useMemo(() => {
    return {
      assigned: items.filter((item) => Boolean(item.assignedMemberId)).length,
      unassigned: items.filter((item) => !item.assignedMemberId).length,
    };
  }, [items]);

  const handlePreview = (item: AdminQrCode) => {
    setPreviewItem(item);
  };

  const handleDelete = async (item: AdminQrCode) => {
    setBusyId(item.publicId);
    removeItem(item.publicId);
    try {
      const response = await fetch(`/api/admin/qrcode/${encodeURIComponent(item.publicId)}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Suppression impossible.");
      }
      toast({
        variant: "success",
        title: "QR code supprime",
        description: "Le QR code et son image ont ete supprimes.",
      });
    } catch (deleteError) {
      toast({
        variant: "error",
        title: "Erreur",
        description: deleteError instanceof Error ? deleteError.message : "Erreur de suppression.",
      });
      await reload();
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <ConfirmDialog
        isOpen={Boolean(pendingDelete)}
        title="Supprimer ce QR code ?"
        description={
          pendingDelete
            ? `Supprimer le QR code ${pendingDelete.publicId} ? Cette action est irreversible.`
            : undefined
        }
        confirmText="Supprimer"
        isConfirming={pendingDelete ? busyId === pendingDelete.publicId : false}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => {
          if (!pendingDelete) return;
          void handleDelete(pendingDelete).finally(() => setPendingDelete(null));
        }}
      />
      <Modal
        isOpen={Boolean(previewItem)}
        title={previewItem ? `Apercu - ${previewItem.name}` : "Apercu"}
        description={previewItem?.scanUrl}
        onClose={() => setPreviewItem(null)}
      >
        {previewItem ? (
          <div className="flex justify-center">
            <div className="rounded-2xl border border-brand-medium/20 bg-white p-3">
              <Image
                src={previewItem.imageUrl}
                alt={`QR ${previewItem.publicId}`}
                width={280}
                height={280}
                unoptimized
                className="h-auto w-auto max-w-full object-contain"
              />
            </div>
          </div>
        ) : null}
      </Modal>
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_320px]">
        <div className="rounded-2xl border border-brand-medium/20 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
            <div className="flex-1">
              <Input
                id="qr-search"
                label="Recherche"
                type="text"
                value={filters.search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Titre ou identifiant"
              />
            </div>

            <div className="min-w-[180px]">
              <Select
                id="qr-status"
                label="Etat QR"
                value={filters.assignment}
                onChange={(event) => setAssignment(event.target.value as "ALL" | "ASSIGNED" | "UNASSIGNED")}
              >
                {assignmentOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="mt-6 grid gap-4">
            {isLoading ? (
              <div className="rounded-xl border border-dashed border-brand-medium/40 p-5 text-sm text-brand-dark/70">
                Chargement des QR codes...
              </div>
            ) : null}
            {error ? (
              <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">{error}</div>
            ) : null}
            {!isLoading && !error && items.length === 0 ? (
              <div className="rounded-xl border border-dashed border-brand-medium/40 p-5 text-sm text-brand-dark/70">
                Aucun QR code trouve. Utilisez &quot;Nouveau QR code&quot; pour commencer.
              </div>
            ) : null}
            {items.map((item) => (
              <article
                key={item.publicId}
                className="rounded-2xl border border-brand-medium/20 bg-zinc-50/70 p-5 transition hover:border-brand-medium/35"
              >
                <div className="flex flex-col gap-4">
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-lg font-semibold text-brand-dark">{item.name}</h3>
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getAssignmentClasses(item)}`}>
                          {mapAssignmentLabel(item)}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => handlePreview(item)}
                          className="rounded-full border border-brand-medium/35 bg-white px-3 py-1.5 text-xs font-semibold text-brand-dark transition hover:bg-zinc-100"
                        >
                          Apercu
                        </button>
                        <button
                          type="button"
                          onClick={() => setPendingDelete(item)}
                          disabled={busyId === item.publicId}
                          className="rounded-full border border-red-300 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Supprimer
                        </button>
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-brand-dark/70">
                      {item.publicId}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-brand-dark/60">
                      <a
                        href={item.scanUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="truncate underline decoration-brand-medium/40 underline-offset-4 hover:text-brand-dark"
                      >
                        {maskScanUrl(item.scanUrl)}
                      </a>
                      <button
                        type="button"
                        onClick={() => {
                          void navigator.clipboard
                            .writeText(item.scanUrl)
                            .then(() => toast({ variant: "success", title: "Lien copie" }))
                            .catch(() => toast({ variant: "error", title: "Copie impossible" }));
                        }}
                        className="rounded-full border border-brand-medium/30 bg-white px-2 py-1 text-[11px] font-medium text-brand-dark/80 transition hover:bg-zinc-50"
                      >
                        Copier
                      </button>
                    </div>
                    <p className="mt-1 text-sm text-brand-dark/60">
                      Derniere mise a jour: {new Date(item.updatedAt).toLocaleString("fr-FR")}
                    </p>
                    <QrCardImage key={item.imageUrl} src={item.imageUrl} alt={`QR ${item.publicId}`} />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <section className="rounded-2xl border border-brand-medium/20 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-brand-dark">Apercu du QR code</h3>
            <p className="mt-2 text-sm text-brand-dark/70">
              Visualisez le rendu final avant generation pour garder une presentation propre et lisible.
            </p>
            <div className="mt-5 flex justify-center">
              <QrPreview />
            </div>
          </section>

          <section className="rounded-2xl border border-brand-medium/20 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-brand-dark">Filtres rapides</h3>
            <div className="mt-4 space-y-3 text-sm text-brand-dark/75">
              <div className="rounded-xl bg-brand-light/30 px-4 py-3">Codes assignes: {quickStats.assigned}</div>
              <div className="rounded-xl bg-brand-light/30 px-4 py-3">Codes disponibles: {quickStats.unassigned}</div>
              <div className="rounded-xl bg-brand-light/30 px-4 py-3">Total: {meta.total}</div>
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}
