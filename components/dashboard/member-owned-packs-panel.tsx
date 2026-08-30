"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { PaymentMethodBadge } from "@/components/dashboard/payment-method-badge";
import { useToast } from "@/components/ui/toast-provider";
import type { MemberOwnedPackDto } from "@/lib/admin/member-owned-packs";
import { formatPackPriceDt } from "@/lib/public-pack-display";
import { packCategoryMenuLabel } from "@/lib/pack-categories";
import {
  EMPTY_MEMBER_OWNED_PACKS,
  dispatchMemberOwnedPacksChanged,
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

type PackBadgeKind = "consuming" | "prolonged" | "pending" | "finished" | "expired";

function isPackDateExpired(pack: MemberOwnedPackDto): boolean {
  if (!pack.packExpiresAt) return false;
  const expiresAt = new Date(pack.packExpiresAt);
  if (Number.isNaN(expiresAt.getTime())) return false;
  const expiresDay = new Date(expiresAt.getFullYear(), expiresAt.getMonth(), expiresAt.getDate());
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return expiresDay.getTime() < todayStart.getTime();
}

/** Expiré · Terminé · Prolongé · En cours · En attente. */
function getPackBadgeKind(pack: MemberOwnedPackDto): PackBadgeKind {
  const hasRemaining =
    pack.remainingSessions > 0 ||
    (pack.totalSessions != null && pack.consumedSessions < pack.totalSessions);

  if (pack.totalSessions != null && pack.remainingSessions <= 0) return "finished";
  if (pack.consumedSessions > 0 && pack.remainingSessions <= 0) return "finished";

  if (hasRemaining && pack.packStartedAt && isPackDateExpired(pack)) {
    return "expired";
  }

  if (hasRemaining && pack.prolongedAt) return "prolonged";

  if (hasRemaining && !pack.packStartedAt) return "pending";

  if (hasRemaining) return "consuming";

  if (pack.status === "expired" || isPackDateExpired(pack)) return "expired";
  return "finished";
}

function packBadgeClass(kind: PackBadgeKind): string {
  if (kind === "consuming") {
    return "border-emerald-200 bg-emerald-50 text-emerald-900";
  }
  if (kind === "prolonged") {
    return "border-amber-200 bg-amber-50 text-amber-900";
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
  if (kind === "prolonged") return "Prolongé";
  if (kind === "pending") return "En attente";
  if (kind === "finished") return "Terminé";
  return "Expiré";
}

function isPackManuallyModified(pack: MemberOwnedPackDto): boolean {
  return pack.categoryReassignedAt != null || (pack.additionalSessionsCredit ?? 0) > 0;
}

function PackModifiedBadge() {
  return (
    <span
      className="inline-flex rounded border border-indigo-200/80 bg-indigo-50 px-1 py-px text-[9px] font-medium leading-none text-indigo-700"
      title="Pack modifié manuellement (catégorie ou séances supplémentaires)"
    >
      modifié
    </span>
  );
}

function InfoField({
  label,
  labelAddon,
  children,
}: {
  label: string;
  labelAddon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-brand-medium/15 bg-white/80 px-3 py-3">
      <p className="flex flex-wrap items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-brand-dark/50">
        <span>{label}</span>
        {labelAddon}
      </p>
      <div className="mt-1.5 text-sm font-medium text-brand-dark">{children}</div>
    </div>
  );
}

type MemberOwnedPacksPanelProps = {
  memberId: string;
  reloadToken?: number;
};

export function MemberOwnedPacksPanel({ memberId, reloadToken = 0 }: MemberOwnedPacksPanelProps) {
  const { toast } = useToast();
  const items = useMemberOwnedPacksStore(
    useCallback((s) => s.byMemberId[memberId] ?? EMPTY_MEMBER_OWNED_PACKS, [memberId]),
  );
  const isLoading = useMemberOwnedPacksStore((s) => Boolean(s.loadingByMemberId[memberId]));
  const error = useMemberOwnedPacksStore((s) => s.errorByMemberId[memberId] ?? null);
  const loadPacks = useMemberOwnedPacksStore((s) => s.loadPacks);
  const revision = useMemberOwnedPacksStore((s) => s.revision);
  const [openEnrollmentIds, setOpenEnrollmentIds] = useState<Set<string>>(() => new Set());
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [cancellingEnrollmentId, setCancellingEnrollmentId] = useState<string | null>(null);

  const handleCancelProlongation = useCallback(
    async (enrollmentId: string) => {
      setCancellingEnrollmentId(enrollmentId);
      try {
        const res = await fetch(
          `/api/admin/members/${encodeURIComponent(memberId)}/owned-packs/${encodeURIComponent(enrollmentId)}/prolong/cancel`,
          { method: "POST" },
        );
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        if (!res.ok) throw new Error(data?.error ?? "Annulation impossible.");

        toast({
          variant: "success",
          title: "Prolongation annulée",
          description: "La date d'expiration d'origine a été rétablie.",
        });
        dispatchMemberOwnedPacksChanged({ memberId });
        void loadPacks(memberId);
      } catch (e) {
        toast({
          variant: "error",
          title: "Erreur",
          description: e instanceof Error ? e.message : "Annulation impossible.",
        });
      } finally {
        setCancellingEnrollmentId(null);
      }
    },
    [loadPacks, memberId, toast],
  );

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
          const firstCurrent = next.find(
            (p) => getPackBadgeKind(p) === "consuming" || getPackBadgeKind(p) === "prolonged",
          );
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
      const firstCurrent = items.find(
        (p) => getPackBadgeKind(p) === "consuming" || getPackBadgeKind(p) === "prolonged",
      );
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
      return kind === "consuming" || kind === "prolonged" || kind === "pending";
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
    const isModified = isPackManuallyModified(pack);
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
                {pack.category ? (
                  <span className="inline-flex rounded-full border border-brand-medium/30 bg-white px-2 py-0.5 text-[11px] font-semibold text-brand-dark/80">
                    {packCategoryMenuLabel(pack.category)}
                  </span>
                ) : null}
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
            {pack.category ? (
              <InfoField label="Catégorie">{packCategoryMenuLabel(pack.category)}</InfoField>
            ) : null}
            <InfoField
              label="Séances"
              labelAddon={isModified ? <PackModifiedBadge /> : undefined}
            >
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

          {badgeKind === "prolonged" ? (
            <div className="flex justify-end border-t border-brand-medium/10 pt-3">
              <button
                type="button"
                disabled={cancellingEnrollmentId === pack.enrollmentId}
                onClick={() => void handleCancelProlongation(pack.enrollmentId)}
                className="text-sm font-medium text-red-700 hover:text-red-800 disabled:opacity-50"
              >
                {cancellingEnrollmentId === pack.enrollmentId
                  ? "Annulation…"
                  : "Annuler la prolongation"}
              </button>
            </div>
          ) : null}
        </div>
      </details>
    );
  }

  const prolongedItems = currentItems.filter((p) => getPackBadgeKind(p) === "prolonged");
  const activeItems = currentItems.filter((p) => getPackBadgeKind(p) === "consuming");
  const pendingItems = currentItems.filter((p) => getPackBadgeKind(p) === "pending");

  function renderPackSection(title: string, sectionItems: MemberOwnedPackDto[]) {
    if (sectionItems.length === 0) return null;
    return (
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-dark/50">{title}</p>
        <div className="space-y-2">{sectionItems.map(renderPackCard)}</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {renderPackSection("Prolongé", prolongedItems)}
      {renderPackSection("En cours", activeItems)}
      {renderPackSection("En attente", pendingItems)}
      {historyItems.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-dark/50">Historique</p>
          <div className="space-y-2">{historyItems.map(renderPackCard)}</div>
        </div>
      ) : null}
    </div>
  );
}
