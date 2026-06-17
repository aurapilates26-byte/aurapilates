"use client";

import { useCallback, useEffect, useState } from "react";
import { ConfirmDialog } from "@/components/ui";
import { useToast } from "@/components/ui/toast-provider";
import type { AdminMemberReservationItem } from "@/lib/admin/member-reservations-list";
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

const cancelBtnClass =
  "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-200 disabled:cursor-not-allowed disabled:opacity-60";

function toListItem(
  r: AdminMemberReservationItem,
  tab: ReservationsListTab
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
  };
}

type AdminMemberReservationsPanelProps = {
  memberId: string;
  reloadToken?: number;
  onUpcomingChange?: (items: AdminMemberReservationItem[]) => void;
  onReservationsMutated?: () => void;
};

export function AdminMemberReservationsPanel({
  memberId,
  reloadToken = 0,
  onUpcomingChange,
  onReservationsMutated,
}: AdminMemberReservationsPanelProps) {
  const { toast } = useToast();
  const [tab, setTab] = useState<ReservationsListTab>("upcoming");
  const [upcoming, setUpcoming] = useState<AdminMemberReservationItem[]>([]);
  const [history, setHistory] = useState<AdminMemberReservationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionKey, setActionKey] = useState<string | null>(null);
  const [reservationToCancel, setReservationToCancel] = useState<AdminMemberReservationItem | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/members/${encodeURIComponent(memberId)}/reservations`, {
        cache: "no-store",
      });
      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? "Impossible de charger les réservations.");
      }
      const data = (await response.json()) as {
        items: AdminMemberReservationItem[];
        history: AdminMemberReservationItem[];
      };
      setUpcoming(data.items);
      setHistory(data.history);
      onUpcomingChange?.(data.items);
    } catch (e) {
      toast({
        variant: "error",
        title: "Réservations",
        description: e instanceof Error ? e.message : "Erreur",
      });
    } finally {
      setLoading(false);
    }
  }, [memberId, onUpcomingChange, toast]);

  useEffect(() => {
    void load();
  }, [load, reloadToken]);

  const handleCancel = async () => {
    if (!reservationToCancel) return;
    setActionKey(`cancel-${reservationToCancel.id}`);
    try {
      const response = await fetch(
        `/api/admin/members/${encodeURIComponent(memberId)}/reservations/${encodeURIComponent(reservationToCancel.id)}`,
        { method: "DELETE" }
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

  const listForTab = tab === "upcoming" ? upcoming : history;
  const emptyMessage =
    tab === "upcoming" ? "Aucune réservation à venir." : "Aucune réservation dans l'historique.";

  return (
    <section className="mt-5 rounded-xl border border-brand-medium/15 bg-zinc-50/40 p-4">
      <div>
        <h4 className="text-sm font-semibold text-brand-dark">Réservations</h4>
        <p className="mt-0.5 text-xs text-brand-dark/60">
          Prochaines séances et historique de l&apos;adhérent.
        </p>
      </div>

      {!loading ? (
        <ReservationSegmentedTabs className="mt-3" value={tab} onChange={setTab} />
      ) : null}

      {!loading && tab === "upcoming" ? (
        <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-900">
          <p>
            <span className="font-semibold">Note :</span> annulation membre possible jusqu&apos;à 6 h avant le cours ;
            l&apos;admin peut annuler à tout moment (séance rendue au pack).
          </p>
        </div>
      ) : null}

      {loading ? (
        <p className="mt-4 text-sm text-brand-dark/60">Chargement...</p>
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
    </section>
  );
}
