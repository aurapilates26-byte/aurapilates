"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { PaymentMethodBadge } from "@/components/dashboard/payment-method-badge";
import { PackMetricsGrid } from "@/components/pack-metrics-grid";
import type { MemberOwnedPackDto, MemberOwnedPackStatus } from "@/lib/admin/member-owned-packs";
import { formatPackPriceDt } from "@/lib/public-pack-display";

function formatDateFr(value: string | null | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("fr-FR");
}

function formatPackDurationLabel(durationDays: string | null | undefined): string {
  if (durationDays == null || !String(durationDays).trim()) return "—";
  const n = Number(durationDays);
  if (!Number.isFinite(n)) return String(durationDays);
  return n === 1 ? "1 jour" : `${n} jours`;
}

function formatPackSessionsValue(count: number | null): string {
  if (count === null) return "—";
  return String(count);
}

function packStatusBadgeClass(status: MemberOwnedPackStatus): string {
  if (status === "active") {
    return "border-emerald-200 bg-emerald-50 text-emerald-900";
  }
  return "border-red-200 bg-red-50 text-red-800";
}

function packStatusLabel(status: MemberOwnedPackStatus): string {
  return status === "active" ? "En cours" : "Expiré";
}

function InfoField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-brand-medium/15 bg-white/80 px-3 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-dark/50">{label}</p>
      <div className="mt-1.5 text-sm font-medium text-brand-dark">{children}</div>
    </div>
  );
}

type MemberOwnedPacksPanelProps = {
  memberId: string;
  reloadToken?: number;
};

export function MemberOwnedPacksPanel({ memberId, reloadToken = 0 }: MemberOwnedPacksPanelProps) {
  const [items, setItems] = useState<MemberOwnedPackDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openPackIds, setOpenPackIds] = useState<Set<string>>(() => new Set());

  const togglePackOpen = (packId: string) => {
    setOpenPackIds((prev) => {
      const next = new Set(prev);
      if (next.has(packId)) next.delete(packId);
      else next.add(packId);
      return next;
    });
  };

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/members/${encodeURIComponent(memberId)}/owned-packs`, {
        cache: "no-store",
      });
      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? "Chargement impossible.");
      }
      const data = (await response.json()) as { items: MemberOwnedPackDto[] };
      const next = data.items ?? [];
      setItems(next);
      setOpenPackIds((prev) => {
        const kept = new Set([...prev].filter((id) => next.some((p) => p.packId === id)));
        if (kept.size > 0) return kept;
        const firstActive = next.find((p) => p.status === "active");
        return firstActive ? new Set([firstActive.packId]) : new Set();
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [memberId]);

  useEffect(() => {
    void load();
  }, [load, reloadToken]);

  if (isLoading) {
    return <p className="text-sm text-brand-dark/60">Chargement des packs…</p>;
  }

  if (error) {
    return <p className="text-sm text-red-700">{error}</p>;
  }

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-brand-medium/15 bg-zinc-50/60 px-4 py-3">
        <p className="text-base font-semibold text-brand-dark">—</p>
        <p className="mt-1 text-sm text-brand-dark/60">Aucun pack actif.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((pack) => {
        const isOpen = openPackIds.has(pack.packId);
        const sessionsTotal =
          pack.totalSessions ??
          (pack.courseQuotas.length > 0
            ? pack.courseQuotas.reduce((sum, q) => sum + q.sessionCount, 0)
            : pack.sessionCount);

        return (
          <details
            key={pack.packId}
            open={isOpen}
            className="overflow-hidden rounded-xl border border-brand-medium/15 bg-zinc-50/60"
          >
            <summary
              className="cursor-pointer list-none px-4 py-3 marker:content-none [&::-webkit-details-marker]:hidden"
              onClick={(e) => {
                e.preventDefault();
                togglePackOpen(pack.packId);
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-base font-semibold text-brand-dark">{pack.packName}</p>
                    <span
                      className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${packStatusBadgeClass(pack.status)}`}
                    >
                      {packStatusLabel(pack.status)}
                    </span>
                  </div>
                  <PackMetricsGrid
                    className="mt-3"
                    price={formatPackPriceDt(pack.priceCents) ?? "—"}
                    sessions={formatPackSessionsValue(sessionsTotal)}
                    duration={formatPackDurationLabel(pack.durationDays)}
                  />
                </div>
                <span
                  className={`mt-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-brand-medium/20 bg-white text-brand-dark/70 transition-transform ${
                    isOpen ? "rotate-180" : ""
                  }`}
                  aria-hidden="true"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
                    <path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6z" />
                  </svg>
                </span>
              </div>
              <p className="mt-2 text-[11px] font-medium text-brand-dark/50">
                {isOpen ? "Masquer le détail du pack" : "Afficher le détail du pack"}
              </p>
            </summary>

            <div className="space-y-3 border-t border-brand-medium/15 px-4 py-3">
              <div className="grid grid-cols-2 gap-3">
                <InfoField label="Acheté le">{formatDateFr(pack.purchasedAt)}</InfoField>
                <InfoField label="Pack début">
                  {pack.packStartedAt ? formatDateFr(pack.packStartedAt) : "À la première réservation"}
                </InfoField>
                <InfoField label="Expiration du pack">
                  {pack.packExpiresAt
                    ? formatDateFr(pack.packExpiresAt)
                    : pack.durationDays
                      ? "Après la 1ʳᵉ réservation"
                      : "—"}
                </InfoField>
                <InfoField label="Paiement">
                  <PaymentMethodBadge method={pack.packPaymentMethod} fallback="Non renseigné" />
                  {pack.depositPaymentMethod && pack.depositPaymentMethod !== pack.packPaymentMethod ? (
                    <p className="mt-1 text-xs font-normal text-brand-dark/60">
                      Acompte : <PaymentMethodBadge method={pack.depositPaymentMethod} />
                    </p>
                  ) : null}
                </InfoField>
              </div>
              <div className="rounded-xl border border-brand-medium/15 bg-white/80 px-3 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-dark/50">
                  Suivi séances pack
                </p>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  <InfoField label="Séances pack">
                    {pack.totalSessions != null ? pack.totalSessions : "—"}
                  </InfoField>
                  <InfoField label="Séances consommées">{pack.consumedSessions}</InfoField>
                  <InfoField label="Séances restantes">{pack.remainingSessions}</InfoField>
                </div>
                <p className="mt-3 text-[11px] leading-relaxed text-brand-dark/60">
                  Confirmée/Présente consomme une séance. Annulation avant 6 h : non comptabilisée.
                  Annulation tardive : séance comptabilisée.
                </p>
              </div>
            </div>
          </details>
        );
      })}
    </div>
  );
}
