"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { PaymentMethodBadge } from "@/components/dashboard/payment-method-badge";
import type { MemberOwnedPackDto } from "@/lib/admin/member-owned-packs";
import { formatPackPriceDt } from "@/lib/public-pack-display";
import {
  EMPTY_MEMBER_OWNED_PACKS,
  subscribeMemberOwnedPacksChanged,
  useMemberOwnedPacksStore,
} from "@/store/admin/member-owned-packs-store";

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

type PackBadgeKind = "consuming" | "pending" | "finished" | "expired";

function isPackDateExpired(pack: MemberOwnedPackDto): boolean {
  if (!pack.packExpiresAt) return false;
  const expiresAt = new Date(pack.packExpiresAt);
  if (Number.isNaN(expiresAt.getTime())) return false;
  const expiresDay = new Date(expiresAt.getFullYear(), expiresAt.getMonth(), expiresAt.getDate());
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return expiresDay.getTime() < todayStart.getTime();
}

/** Expiré · Terminé · En cours (démarré) · En attente (pas encore démarré, FIFO). */
function getPackBadgeKind(pack: MemberOwnedPackDto): PackBadgeKind {
  const hasRemaining =
    pack.remainingSessions > 0 ||
    (pack.totalSessions != null && pack.consumedSessions < pack.totalSessions);

  if (hasRemaining && pack.packStartedAt && isPackDateExpired(pack)) {
    return "expired";
  }

  if (hasRemaining && !pack.packStartedAt) return "pending";
  if (hasRemaining) return "consuming";

  if (pack.totalSessions != null && pack.remainingSessions <= 0) return "finished";
  if (pack.consumedSessions > 0 && pack.remainingSessions <= 0) return "finished";
  if (pack.status === "expired" || isPackDateExpired(pack)) return "expired";
  return "finished";
}

function packBadgeClass(kind: PackBadgeKind): string {
  if (kind === "consuming") {
    return "border-indigo-200 bg-indigo-50 text-indigo-900";
  }
  if (kind === "pending") {
    return "border-amber-200 bg-amber-50 text-amber-900";
  }
  if (kind === "finished") {
    return "border-zinc-200 bg-zinc-100 text-zinc-700";
  }
  return "border-red-200 bg-red-50 text-red-800";
}

function packBadgeLabel(kind: PackBadgeKind): string {
  if (kind === "consuming") return "En cours";
  if (kind === "pending") return "En attente";
  if (kind === "finished") return "Terminé";
  return "Expiré";
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
  const items = useMemberOwnedPacksStore(
    useCallback((s) => s.byMemberId[memberId] ?? EMPTY_MEMBER_OWNED_PACKS, [memberId]),
  );
  const isLoading = useMemberOwnedPacksStore((s) => Boolean(s.loadingByMemberId[memberId]));
  const error = useMemberOwnedPacksStore((s) => s.errorByMemberId[memberId] ?? null);
  const loadPacks = useMemberOwnedPacksStore((s) => s.loadPacks);
  const revision = useMemberOwnedPacksStore((s) => s.revision);
  const [openEnrollmentIds, setOpenEnrollmentIds] = useState<Set<string>>(() => new Set());
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  const togglePackOpen = (enrollmentId: string) => {
    setOpenEnrollmentIds((prev) => {
      const next = new Set(prev);
      if (next.has(enrollmentId)) next.delete(enrollmentId);
      else next.add(enrollmentId);
      return next;
    });
  };

  useEffect(() => {
    let cancelled = false;
    void loadPacks(memberId)
      .then((next) => {
        if (cancelled) return;
        setHasLoadedOnce(true);
        setOpenEnrollmentIds((prev) => {
          const kept = new Set([...prev].filter((id) => next.some((p) => p.enrollmentId === id)));
          if (kept.size > 0) {
            if (kept.size === prev.size && [...kept].every((id) => prev.has(id))) return prev;
            return kept;
          }
          const firstCurrent = next.find((p) => getPackBadgeKind(p) === "consuming");
          const nextOpen = firstCurrent ? new Set([firstCurrent.enrollmentId]) : new Set<string>();
          if (nextOpen.size === prev.size && [...nextOpen].every((id) => prev.has(id))) return prev;
          return nextOpen;
        });
      })
      .catch(() => {
        if (!cancelled) setHasLoadedOnce(true);
      });
    return () => {
      cancelled = true;
    };
  }, [loadPacks, memberId, reloadToken]);

  useEffect(() => {
    return subscribeMemberOwnedPacksChanged((detail) => {
      if (detail.memberId !== memberId) return;
      if (detail.items) return;
      void loadPacks(memberId);
    });
  }, [loadPacks, memberId]);

  useEffect(() => {
    if (!items.length) return;
    setOpenEnrollmentIds((prev) => {
      const kept = new Set([...prev].filter((id) => items.some((p) => p.enrollmentId === id)));
      if (kept.size > 0) {
        if (kept.size === prev.size && [...kept].every((id) => prev.has(id))) return prev;
        return kept;
      }
      const firstCurrent = items.find((p) => getPackBadgeKind(p) === "consuming");
      const nextOpen = firstCurrent ? new Set([firstCurrent.enrollmentId]) : new Set<string>();
      if (nextOpen.size === prev.size && [...nextOpen].every((id) => prev.has(id))) return prev;
      return nextOpen;
    });
  }, [items, revision]);

  if (isLoading && !hasLoadedOnce && items.length === 0) {
    return <p className="text-sm text-brand-dark/60">Chargement des packs…</p>;
  }

  if (error && items.length === 0) {
    return <p className="text-sm text-red-700">{error}</p>;
  }

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-brand-medium/15 bg-zinc-50/60 px-4 py-3">
        <p className="text-base font-semibold text-brand-dark">—</p>
        <p className="mt-1 text-sm text-brand-dark/60">Aucun pack enregistré.</p>
      </div>
    );
  }

  const currentItems = items
    .filter((p) => {
      const kind = getPackBadgeKind(p);
      return kind === "consuming" || kind === "pending";
    })
    .sort((a, b) => new Date(a.purchasedAt).getTime() - new Date(b.purchasedAt).getTime());
  const historyItems = items
    .filter((p) => {
      const kind = getPackBadgeKind(p);
      return kind === "finished" || kind === "expired";
    })
    .sort((a, b) => new Date(b.purchasedAt).getTime() - new Date(a.purchasedAt).getTime());

  function renderPackCard(pack: MemberOwnedPackDto) {
    const isOpen = openEnrollmentIds.has(pack.enrollmentId);
    const badgeKind = getPackBadgeKind(pack);
    const sessionsTotal =
      pack.totalSessions ??
      (pack.courseQuotas.length > 0
        ? pack.courseQuotas.reduce((sum, q) => sum + q.sessionCount, 0)
        : pack.sessionCount);

    return (
      <details
        key={pack.enrollmentId}
        open={isOpen}
        className="overflow-hidden rounded-xl border border-brand-medium/15 bg-zinc-50/60"
      >
        <summary
          className="cursor-pointer list-none px-4 py-3 marker:content-none [&::-webkit-details-marker]:hidden"
          onClick={(e) => {
            e.preventDefault();
            togglePackOpen(pack.enrollmentId);
          }}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-base font-semibold text-brand-dark">{pack.packName}</p>
                <span
                  className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold ${packBadgeClass(badgeKind)}`}
                >
                  {packBadgeLabel(badgeKind)}
                </span>
              </div>
              <p className="mt-1 text-xs text-brand-dark/55">
                {pack.consumedSessions}
                {sessionsTotal != null ? ` / ${sessionsTotal}` : ""} séances
                {!pack.packStartedAt ? " · Pas encore démarré" : ""}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              <PaymentMethodBadge method={pack.packPaymentMethod} fallback="Paiement non renseigné" />
            </div>
          </div>
        </summary>

        <div className="space-y-3 border-t border-brand-medium/10 px-4 py-3">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <InfoField label={pack.isRenewal ? "Date d'achat" : "Date d'ajout"}>
              {formatDateFr(pack.purchasedAt)}
            </InfoField>
            <InfoField label="1ʳᵉ réservation">
              {pack.packStartedAt ? formatDateFr(pack.packStartedAt) : "Pas encore démarré"}
            </InfoField>
            <InfoField label="Expiration">
              {pack.packExpiresAt ? formatDateFr(pack.packExpiresAt) : "—"}
            </InfoField>
            <InfoField label="Durée">{formatPackDurationLabel(pack.durationDays)}</InfoField>
            <InfoField label="Séances">
              {pack.consumedSessions}
              {sessionsTotal != null ? ` / ${formatPackSessionsValue(sessionsTotal)}` : ""}
            </InfoField>
            <InfoField label="Prix">
              {pack.priceCents != null ? formatPackPriceDt(pack.priceCents) : "—"}
            </InfoField>
          </div>

          {pack.courseQuotaRemaining.length > 0 ? (
            <div className="grid gap-2 sm:grid-cols-2">
              {pack.courseQuotaRemaining.map((q) => (
                <InfoField key={q.courseLabel} label={q.courseLabel}>
                  {q.consumed} / {q.total}
                </InfoField>
              ))}
            </div>
          ) : null}
        </div>
      </details>
    );
  }

  return (
    <div className="space-y-4">
      {currentItems.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-dark/50">En cours</p>
          <div className="space-y-2">{currentItems.map(renderPackCard)}</div>
        </div>
      ) : null}
      {historyItems.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-dark/50">Historique</p>
          <div className="space-y-2">{historyItems.map(renderPackCard)}</div>
        </div>
      ) : null}
    </div>
  );
}
