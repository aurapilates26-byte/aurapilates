"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ConfirmDialog } from "@/components/ui";
import { useToast } from "@/components/ui/toast-provider";
import type { AdminMemberReservationItem } from "@/lib/admin/member-reservations-list";
import { buildReservationHistoryCounts } from "@/lib/reservation-history-counts";
import {
  HISTORY_RESERVATION_STATUS_LABELS,
  UPCOMING_RESERVATION_STATUS_LABELS,
  cancellationRefundLabel,
  formatCourseDateWithWeekday,
  type ReservationsListTab,
} from "@/lib/reservation-display";
import { ReservationSegmentedTabs } from "@/components/dashboard/reservations/reservation-segmented-tabs";
import {
  ReservationAdminListItem,
  type ReservationAdminListItemData,
} from "@/components/dashboard/reservations/reservation-admin-list-item";
import { reservationStatusBadgeClass } from "@/components/dashboard/reservations/reservation-status-styles";
import {
  EditMemberPackEnrollmentDialog,
  PackEnrollmentEditButton,
} from "@/components/dashboard/edit-member-pack-enrollment-dialog";
import { PaymentMethodBadge } from "@/components/dashboard/payment-method-badge";
import { packCategoryMenuLabel } from "@/lib/pack-categories";
import type { MemberOwnedPackDto } from "@/lib/admin/member-owned-packs";
import {
  EMPTY_MEMBER_OWNED_PACKS,
  subscribeMemberOwnedPacksChanged,
  useMemberOwnedPacksStore,
} from "@/store/admin/member-owned-packs-store";

const cancelBtnClass =
  "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-200 disabled:cursor-not-allowed disabled:opacity-60";

function formatDateFr(value: string | null | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("fr-FR");
}

function toListItem(
  r: AdminMemberReservationItem,
  tab: Extract<ReservationsListTab, "upcoming" | "history">,
): ReservationAdminListItemData {
  const statusLabel =
    tab === "upcoming"
      ? UPCOMING_RESERVATION_STATUS_LABELS[r.status] ?? r.status
      : HISTORY_RESERVATION_STATUS_LABELS[r.status] ?? r.status;

  return {
    id: r.id,
    sessionDate: r.sessionDate,
    startTime: r.planning.startTime,
    endTime: r.planning.endTime,
    courseLabel: r.planning.courseLabel,
    coachName: r.planning.coachName,
    level: r.planning.level,
    reservedAt: r.reservedAt,
    source: r.source,
    status: r.status,
    statusLabel,
    statusBadgeClass: reservationStatusBadgeClass(r.status),
    packRefundNote:
      tab === "history" && r.status === "CANCELLED"
        ? cancellationRefundLabel(r.packRefundedAt)
        : null,
    debitedPackName: r.debitedPackName,
  };
}

type AdminMemberReservationsPanelProps = {
  memberId: string;
  reloadToken?: number;
  /** Slugs des quotas cours du pack (ex. reformer + mat) pour le détail Historique. */
  courseQuotaSlugs?: string[];
  personalDiscount?: {
    type: "PERCENT" | "AMOUNT";
    value: number;
    reason?: string | null;
  } | null;
  onUpcomingChange?: (items: AdminMemberReservationItem[]) => void;
  onReservationsMutated?: () => void;
  onPackEnrollmentSaved?: () => void;
};

export function AdminMemberReservationsPanel({
  memberId,
  reloadToken = 0,
  courseQuotaSlugs,
  personalDiscount = null,
  onUpcomingChange,
  onReservationsMutated,
  onPackEnrollmentSaved,
}: AdminMemberReservationsPanelProps) {
  const { toast } = useToast();
  const [tab, setTab] = useState<ReservationsListTab>("upcoming");
  const [upcoming, setUpcoming] = useState<AdminMemberReservationItem[]>([]);
  const [history, setHistory] = useState<AdminMemberReservationItem[]>([]);
  const ownedPacks = useMemberOwnedPacksStore(
    useCallback((s) => s.byMemberId[memberId] ?? EMPTY_MEMBER_OWNED_PACKS, [memberId]),
  );
  const loadOwnedPacks = useMemberOwnedPacksStore((s) => s.loadPacks);
  const [loading, setLoading] = useState(true);
  const [actionKey, setActionKey] = useState<string | null>(null);
  const [reservationToCancel, setReservationToCancel] = useState<AdminMemberReservationItem | null>(null);
  const [packToEdit, setPackToEdit] = useState<MemberOwnedPackDto | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const reservationsRes = await fetch(`/api/admin/members/${encodeURIComponent(memberId)}/reservations`, {
        cache: "no-store",
      });

      if (!reservationsRes.ok) {
        const data = (await reservationsRes.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? "Impossible de charger les réservations.");
      }
      const reservationsData = (await reservationsRes.json()) as {
        items: AdminMemberReservationItem[];
        history: AdminMemberReservationItem[];
      };
      setUpcoming(reservationsData.items);
      setHistory(reservationsData.history);
      onUpcomingChange?.(reservationsData.items);

      await loadOwnedPacks(memberId).catch(() => undefined);
    } catch (e) {
      toast({
        variant: "error",
        title: "Réservations",
        description: e instanceof Error ? e.message : "Erreur",
      });
    } finally {
      setLoading(false);
    }
  }, [loadOwnedPacks, memberId, onUpcomingChange, toast]);

  useEffect(() => {
    void load();
  }, [load, reloadToken]);

  useEffect(() => {
    return subscribeMemberOwnedPacksChanged((detail) => {
      if (detail.memberId !== memberId) return;
      if (detail.items) return;
      void loadOwnedPacks(memberId);
    });
  }, [loadOwnedPacks, memberId]);

  const handleCancel = async () => {
    if (!reservationToCancel) return;
    setActionKey(`cancel-${reservationToCancel.id}`);
    try {
      const response = await fetch(
        `/api/admin/members/${encodeURIComponent(memberId)}/reservations/${encodeURIComponent(reservationToCancel.id)}`,
        { method: "DELETE" },
      );
      const data = (await response.json().catch(() => null)) as {
        error?: string;
        refundable?: boolean;
      } | null;
      if (!response.ok) {
        throw new Error(data?.error ?? "Annulation impossible.");
      }
      const refundLine =
        data?.refundable === true
          ? "La séance a été rendue au pack."
          : "Annulation enregistrée.";
      toast({
        variant: "success",
        title: "Réservation annulée",
        description: `${reservationToCancel.planning.courseLabel} — ${formatCourseDateWithWeekday(reservationToCancel.sessionDate)}. ${refundLine}`,
      });
      setReservationToCancel(null);
      await load();
      onReservationsMutated?.();
    } catch (e) {
      toast({
        variant: "error",
        title: "Annulation",
        description: e instanceof Error ? e.message : "Erreur",
      });
    } finally {
      setActionKey(null);
    }
  };

  const historyCounts = useMemo(
    () => buildReservationHistoryCounts(history, courseQuotaSlugs),
    [history, courseQuotaSlugs],
  );

  const listForTab = tab === "upcoming" ? upcoming : tab === "history" ? history : [];
  const emptyMessage =
    tab === "upcoming"
      ? "Aucune réservation à venir."
      : tab === "history"
        ? "Aucune réservation dans l'historique."
        : "Aucun achat de pack enregistré.";

  return (
    <section className="mt-5 rounded-xl border border-brand-medium/15 bg-zinc-50/40 p-4">
      <div>
        <h4 className="text-sm font-semibold text-brand-dark">Réservations</h4>
        <p className="mt-0.5 text-xs text-brand-dark/60">
          Prochaines séances, historique et achats de packs.
        </p>
      </div>

      {!loading ? (
        <ReservationSegmentedTabs
          className="mt-3"
          value={tab}
          onChange={setTab}
          counts={{
            upcoming: upcoming.length,
            history: historyCounts.total,
            packs: ownedPacks.length,
          }}
          historyCourseBreakdown={historyCounts.byCourse}
        />
      ) : null}

      {!loading && tab === "upcoming" ? (
        <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-900">
          <p>
            <span className="font-semibold">Note :</span> annulation membre possible jusqu&apos;à 6 h avant le
            cours ; l&apos;admin peut annuler à tout moment (séance rendue au pack).
          </p>
        </div>
      ) : null}

      {loading ? (
        <p className="mt-4 text-sm text-brand-dark/60">Chargement...</p>
      ) : tab === "packs" ? (
        ownedPacks.length === 0 ? (
          <p className="mt-4 text-sm text-brand-dark/60">{emptyMessage}</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {ownedPacks.map((pack) => (
              <li
                key={pack.enrollmentId}
                className="rounded-xl border border-brand-medium/15 bg-white px-4 py-3 text-sm shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-brand-dark">{pack.packName}</p>
                      {pack.category ? (
                        <span className="inline-flex rounded-full border border-brand-medium/30 bg-brand-light/50 px-2 py-0.5 text-[11px] font-semibold text-brand-dark/80">
                          {packCategoryMenuLabel(pack.category)}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-0.5 text-xs text-brand-dark/60">
                      {pack.isRenewal ? "Renouvellement" : "Premier pack"}
                      {pack.totalPaidDinars > 0 ? ` · ${pack.totalPaidDinars} DT` : ""}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <PaymentMethodBadge method={pack.packPaymentMethod} fallback="Paiement non renseigné" />
                    <PackEnrollmentEditButton onClick={() => setPackToEdit(pack)} />
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-lg border border-brand-medium/15 bg-zinc-50/70 px-3 py-2">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-dark/50">
                      Catégorie
                    </p>
                    <p className="mt-1 text-sm font-medium text-brand-dark">
                      {pack.category ? packCategoryMenuLabel(pack.category) : "—"}
                    </p>
                  </div>
                  <div className="rounded-lg border border-brand-medium/15 bg-zinc-50/70 px-3 py-2">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-dark/50">
                      {pack.isRenewal ? "Date d'achat" : "Date d'ajout"}
                    </p>
                    <p className="mt-1 text-sm font-medium text-brand-dark">
                      {formatDateFr(pack.purchasedAt)}
                    </p>
                  </div>
                  <div className="rounded-lg border border-brand-medium/15 bg-zinc-50/70 px-3 py-2">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-dark/50">
                      1ʳᵉ réservation
                    </p>
                    <p className="mt-1 text-sm font-medium text-brand-dark">
                      {pack.packStartedAt ? formatDateFr(pack.packStartedAt) : "Pas encore démarré"}
                    </p>
                  </div>
                  <div className="rounded-lg border border-brand-medium/15 bg-zinc-50/70 px-3 py-2">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-dark/50">
                      Séances
                    </p>
                    <p className="mt-1 text-sm font-medium text-brand-dark">
                      {pack.consumedSessions}
                      {pack.totalSessions != null ? ` / ${pack.totalSessions}` : ""}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )
      ) : listForTab.length === 0 ? (
        <p className="mt-4 text-sm text-brand-dark/60">{emptyMessage}</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {listForTab.map((r) => (
            <li key={r.id}>
              <ReservationAdminListItem
                item={toListItem(r, tab)}
                listTab={tab}
                showReservedMeta
                trailingAction={
                  tab === "upcoming" ? (
                    <button
                      type="button"
                      className={cancelBtnClass}
                      disabled={actionKey === `cancel-${r.id}`}
                      onClick={() => setReservationToCancel(r)}
                      aria-label="Annuler la réservation"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="h-4 w-4"
                        aria-hidden="true"
                      >
                        <path d="M3 6h18" />
                        <path d="M8 6V4h8v2" />
                        <path d="M19 6l-1 14H6L5 6" />
                        <path d="M10 11v6" />
                        <path d="M14 11v6" />
                      </svg>
                    </button>
                  ) : undefined
                }
              />
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        isOpen={Boolean(reservationToCancel)}
        title="Annuler cette réservation ?"
        description={
          reservationToCancel
            ? `${reservationToCancel.planning.courseLabel} · ${formatCourseDateWithWeekday(reservationToCancel.sessionDate)}`
            : undefined
        }
        confirmText="Annuler la réservation"
        isConfirming={Boolean(reservationToCancel && actionKey === `cancel-${reservationToCancel.id}`)}
        onClose={() => {
          if (reservationToCancel && actionKey === `cancel-${reservationToCancel.id}`) return;
          setReservationToCancel(null);
        }}
        onConfirm={() => void handleCancel()}
      />

      <EditMemberPackEnrollmentDialog
        open={Boolean(packToEdit)}
        memberId={memberId}
        pack={packToEdit}
        personalDiscount={personalDiscount}
        onClose={() => setPackToEdit(null)}
        onSaved={onPackEnrollmentSaved}
      />
    </section>
  );
}
