"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/ui";
import { useToast } from "@/components/ui/toast-provider";
import { planningLevelLabelFr } from "@/lib/planning-public-labels";
import { useMemberBookingStore } from "@/store/member/member-booking-store";
import type { MemberReservationItem } from "@/types/member/booking";

const cancelBtnClass =
  "inline-flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-200 disabled:cursor-not-allowed disabled:opacity-60";

const historyStatusLabels: Record<string, string> = {
  BOOKED: "Confirmé",
  WAITLIST: "En attente",
  CANCELLED: "Annulé",
  ATTENDED: "Présence enregistrée",
};

function formatReservationPassedAt(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const day = String(d.getDate()).padStart(2, "0");
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const y = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${day}/${m}/${y} ${hh}:${mm}`;
}

function formatCourseDateWithWeekday(ymd: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd);
  if (!m) return ymd;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  const weekday = d.toLocaleDateString("fr-FR", { weekday: "long" }).replace(/^\p{L}/u, (c) => c.toUpperCase());
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${weekday} ${day}/${month}/${year}`;
}

const TOAST_BOOKING_MS = 10_000;

function cancelDetailLine(r: MemberReservationItem): string {
  const coach = r.planning.coachName?.trim() ? r.planning.coachName.trim() : "—";
  return `${r.planning.courseLabel}, coach ${coach}, le ${formatCourseDateWithWeekday(r.sessionDate)} de ${r.planning.startTime} à ${r.planning.endTime}`;
}

function upcomingStatusLabel(status: string): string {
  return status === "WAITLIST" ? "En attente" : "Confirmé";
}

type ReservationsTab = "upcoming" | "history";

function cancellationRefundLabel(r: MemberReservationItem) {
  if (r.status !== "CANCELLED") return null;
  return r.packRefundedAt ? "Annulation : séance rendue au pack" : "Annulation tardive : séance non rendue";
}

export function MemberMyReservations({ limit = 3 }: { limit?: number }) {
  const router = useRouter();
  const { toast } = useToast();
  const myReservations = useMemberBookingStore((s) => s.myReservations);
  const reservationHistory = useMemberBookingStore((s) => s.reservationHistory);
  const loadAll = useMemberBookingStore((s) => s.loadAll);
  const [booted, setBooted] = useState(false);
  const [tab, setTab] = useState<ReservationsTab>("upcoming");
  const [actionKey, setActionKey] = useState<string | null>(null);
  const [reservationToCancel, setReservationToCancel] = useState<MemberReservationItem | null>(null);

  const upcomingItems = myReservations.slice(0, limit);

  useEffect(() => {
    let alive = true;
    void loadAll()
      .catch((e) => {
        if (!alive) return;
        toast({ variant: "error", title: "Erreur", description: e instanceof Error ? e.message : "Erreur." });
      })
      .finally(() => {
        if (alive) setBooted(true);
      });
    return () => {
      alive = false;
    };
  }, [loadAll, toast]);

  const cancel = useCallback(
    async (row: MemberReservationItem) => {
      setActionKey(`cancel-${row.id}`);
      try {
        const res = await fetch(`/api/member/reservations/${encodeURIComponent(row.id)}`, { method: "DELETE" });
        const data = (await res.json().catch(() => null)) as { error?: string; refundable?: boolean } | null;
        if (!res.ok) throw new Error(data?.error ?? "Annulation impossible.");
        const detail = cancelDetailLine(row);
        const refundLine =
          data?.refundable === true
            ? "La séance a été rendue au pack."
            : data?.refundable === false
              ? "Annulation tardive : la séance n'a pas été rendue au pack."
              : null;
        toast({
          variant: "success",
          title: "Annulation enregistrée",
          description: refundLine ? `Annulation enregistrée pour le cours de ${detail}. ${refundLine}` : `Annulation enregistrée pour le cours de ${detail}.`,
          durationMs: TOAST_BOOKING_MS,
        });
        await loadAll();
        router.refresh();
      } catch (e) {
        toast({
          variant: "error",
          title: "Erreur",
          description: e instanceof Error ? e.message : "Erreur.",
        });
      } finally {
        setActionKey(null);
      }
    },
    [loadAll, router, toast],
  );

  const loading = !booted;

  const tabBtnBase =
    "flex-1 rounded-lg px-3 py-2 text-center text-xs font-semibold transition sm:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-medium/40";
  const tabBtnActive = "bg-white text-brand-dark shadow-sm border border-brand-medium/25";
  const tabBtnIdle = "text-brand-dark/70 hover:text-brand-dark hover:bg-white/60";

  const listForTab = tab === "upcoming" ? upcomingItems : reservationHistory;
  const emptyMessage =
    tab === "upcoming" ? "Aucune réservation à venir." : "Aucune réservation dans l'historique.";

  return (
    <section className="mt-6 rounded-2xl border border-brand-medium/20 bg-white p-4 shadow-sm sm:p-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <h2 className="text-base font-semibold text-brand-dark sm:text-lg lg:text-xl">Mes réservations</h2>
      </div>

      {!loading ? (
        <div
          className="mt-3 flex rounded-xl border border-brand-medium/20 bg-zinc-50/80 p-1 sm:mt-4"
          role="group"
          aria-label="Affichage des réservations"
        >
          <button
            type="button"
            className={`${tabBtnBase} ${tab === "upcoming" ? tabBtnActive : tabBtnIdle}`}
            onClick={() => setTab("upcoming")}
          >
            Prochaines séances
          </button>
          <button
            type="button"
            className={`${tabBtnBase} ${tab === "history" ? tabBtnActive : tabBtnIdle}`}
            onClick={() => setTab("history")}
          >
            Historique
          </button>
        </div>
      ) : null}

      {!loading && tab === "upcoming" ? (
        <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-900 sm:text-xs lg:text-sm">
          <p>
            <span className="font-semibold">Note :</span> les annulations sont acceptées jusqu&apos;à 6 heures avant le cours ;
            passé ce délai, la séance est facturée.
          </p>
        </div>
      ) : null}

      {loading ? (
        <p className="mt-4 text-sm text-brand-dark/65">Chargement...</p>
      ) : listForTab.length === 0 ? (
        <p className="mt-4 text-sm text-brand-dark/65">{emptyMessage}</p>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {listForTab.map((r) => (
            <article key={r.id} className="rounded-xl border border-brand-medium/20 bg-zinc-50/40 p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <p className="text-base font-semibold text-brand-dark sm:text-lg lg:text-xl">{r.planning.courseLabel}</p>
                {tab === "upcoming" ? (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className={cancelBtnClass}
                      disabled={actionKey === `cancel-${r.id}`}
                      onClick={() => setReservationToCancel(r)}
                      aria-label="Supprimer la réservation"
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
                  </div>
                ) : null}
              </div>
              <div className="mt-3 flex items-center gap-2">
                <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full border border-brand-medium/20 bg-white">
                  {r.planning.coachImageUrl ? (
                    <img src={r.planning.coachImageUrl} alt="Coach" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[10px] font-semibold text-brand-dark/50">
                      —
                    </div>
                  )}
                </div>
                <p className="text-xs text-brand-dark/85 sm:text-sm lg:text-base">
                  <span className="font-semibold">{r.planning.coachName ?? "—"}</span>
                </p>
              </div>
              <p className="mt-2 text-xs font-medium text-brand-dark/85 sm:text-sm lg:text-base">
                Date du cours : {formatCourseDateWithWeekday(r.sessionDate)}
              </p>
              <p className="mt-1 text-xs text-brand-dark/85 sm:text-sm lg:text-base">
                Statut de réservation :{" "}
                <span className="font-semibold text-brand-dark">
                  {tab === "upcoming" ? upcomingStatusLabel(r.status) : historyStatusLabels[r.status] ?? r.status}
                </span>
              </p>
              {tab === "history" && r.status === "CANCELLED" ? (
                <p className="mt-1 text-[11px] text-brand-dark/70 sm:text-xs lg:text-sm">
                  <span className="font-semibold">Info pack:</span> {cancellationRefundLabel(r)}
                </p>
              ) : null}
              <p className="mt-1 text-xs text-brand-dark/80 sm:text-sm lg:text-base">
                Heure du cours : {r.planning.startTime} - {r.planning.endTime}
              </p>
              <p className="mt-1 text-[11px] text-brand-dark/70 sm:text-xs lg:text-sm">
                Niveau : <span className="font-semibold">{planningLevelLabelFr(r.planning.level)}</span>
              </p>
              <p className="mt-1 text-[11px] text-brand-dark/70 sm:text-xs lg:text-sm">
                Date de réservation : <span className="font-semibold">{formatReservationPassedAt(r.reservedAt)}</span>
              </p>
            </article>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={Boolean(reservationToCancel)}
        title="Annuler cette réservation ?"
        description={
          reservationToCancel
            ? `${reservationToCancel.planning.courseLabel} · ${formatCourseDateWithWeekday(reservationToCancel.sessionDate)}`
            : undefined
        }
        confirmText="Confirmer"
        isConfirming={Boolean(reservationToCancel && actionKey === `cancel-${reservationToCancel.id}`)}
        onClose={() => {
          if (reservationToCancel && actionKey === `cancel-${reservationToCancel.id}`) return;
          setReservationToCancel(null);
        }}
        onConfirm={() => {
          if (!reservationToCancel) return;
          void cancel(reservationToCancel).then(() => {
            setReservationToCancel(null);
          });
        }}
      />
    </section>
  );
}
