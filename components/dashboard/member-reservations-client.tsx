"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { DashboardHeader } from "@/components/dashboard/header";
import { Button, Modal } from "@/components/ui";
import { SelectMenu } from "@/components/ui/select-menu";
import { useToast } from "@/components/ui/toast-provider";
import { PlanningLevelPill } from "@/components/dashboard/planning-session-card";
import { badgeClasses } from "@/lib/badge-classes";
import { planningLevelBadgeClass } from "@/lib/planning-level-badge";
import { planningLevelLabelFr } from "@/lib/planning-public-labels";
import {
  DEFAULT_STUDIO_BOOKING_RULES,
  isMemberReservationDeskOpen,
  memberLateCancellationConfirmNoticeFr,
  memberReservationDeskClosedNoticeFr,
  memberReservationHoursNoticeFr,
} from "@/lib/studio-booking-rules";
import { useMemberBookingStore } from "@/store/member/member-booking-store";
import type { MemberPlanningWindow } from "@/types/member/booking";

const dayLabels: Record<number, string> = {
  0: "Dimanche",
  1: "Lundi",
  2: "Mardi",
  3: "Mercredi",
  4: "Jeudi",
  5: "Vendredi",
  6: "Samedi",
};
const orderedDays: number[] = [1, 2, 3, 4, 5, 6, 0];
const actionBtnSizeClass = "rounded-full px-2.5 py-0.5 text-[11px] font-semibold sm:px-3 sm:py-1 sm:text-xs lg:text-sm";
const actionBtnPrimaryClass =
  `${actionBtnSizeClass} border border-brand-dark/30 bg-brand-dark text-white transition hover:bg-brand-dark/90 disabled:cursor-not-allowed disabled:opacity-60`;
const actionBtnNeutralClass =
  `${actionBtnSizeClass} border border-brand-medium/40 bg-brand-light/50 text-brand-dark transition hover:bg-brand-light/60 disabled:cursor-not-allowed disabled:opacity-60`;
const actionBtnPackBlockedClass =
  `${actionBtnSizeClass} border border-orange-200 bg-orange-50 text-orange-900 transition hover:bg-orange-100 disabled:cursor-not-allowed disabled:opacity-70`;

function dayLabelFromYmd(ymd: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd);
  if (!m) return "—";
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return dayLabels[d.getDay()] ?? "—";
}

function formatDateFrFromYmd(ymd: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd);
  if (!m) return ymd;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

function formatRange(range: { from: string; to: string } | null): string {
  if (!range) return "—";
  return `${formatDateFrFromYmd(range.from)} au ${formatDateFrFromYmd(range.to)}`;
}

function planningWindowLabel(window: MemberPlanningWindow): string {
  if (window === "ONE_MONTH") return "1 mois";
  if (window === "FIFTEEN_DAYS") return "15 jours";
  return "Hebdomadaire";
}

function weekdayFromYmd(ymd: string): number | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd);
  if (!m) return null;
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])).getDay();
}

type BookingOccurrenceLite = {
  courseLabel: string;
  courseSlug: string;
  coachName: string | null;
  sessionDate: string;
  startTime: string;
  endTime: string;
};

type BookablePackOption = {
  packId: string;
  packName: string;
  remainingSessions: number;
  remainingForCourse: number;
  courseCoverageLabel: string;
};

type PendingBooking = {
  planningId: string;
  sessionDate: string;
  mode: "main" | "wait";
  occurrence: BookingOccurrenceLite;
  packOptions: BookablePackOption[];
  selectedPackId: string;
  packsLoading: boolean;
};

const TOAST_BOOKING_MS = 10_000;

function bookingDetailLine(o: BookingOccurrenceLite): string {
  const coach = o.coachName?.trim() ? o.coachName.trim() : "—";
  const day = dayLabelFromYmd(o.sessionDate);
  const date = formatDateFrFromYmd(o.sessionDate);
  return `${o.courseLabel}, coach ${coach}, le ${day} ${date} de ${o.startTime} à ${o.endTime}`;
}

export function MemberReservationsClient({ embedded = false }: { embedded?: boolean }) {
  const { toast } = useToast();
  const todayDay = new Date().getDay();
  const occurrences = useMemberBookingStore((s) => s.occurrences);
  const myReservations = useMemberBookingStore((s) => s.myReservations);
  const eligibility = useMemberBookingStore((s) => s.eligibility);
  const bookableCourseSlugs = useMemberBookingStore((s) => s.bookableCourseSlugs);
  const planningRange = useMemberBookingStore((s) => s.planningRange);
  const planningWindow = useMemberBookingStore((s) => s.planningWindow);
  const bookingRules = useMemberBookingStore((s) => s.bookingRules);
  const loadAll = useMemberBookingStore((s) => s.loadAll);

  const cancellationNotice = memberLateCancellationConfirmNoticeFr(
    bookingRules ?? DEFAULT_STUDIO_BOOKING_RULES,
  );
  const reservationHoursNotice = memberReservationHoursNoticeFr(
    bookingRules ?? DEFAULT_STUDIO_BOOKING_RULES,
  );
  const reservationDeskOpen = isMemberReservationDeskOpen(bookingRules ?? DEFAULT_STUDIO_BOOKING_RULES);
  const reservationDeskClosedNotice = memberReservationDeskClosedNoticeFr(
    bookingRules ?? DEFAULT_STUDIO_BOOKING_RULES,
  );

  const [loading, setLoading] = useState(true);
  const [actionKey, setActionKey] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<number>(() => new Date().getDay());
  const [pendingBooking, setPendingBooking] = useState<PendingBooking | null>(null);
  const [confirmationChecked, setConfirmationChecked] = useState(false);

  const daysWithMyReservations = useMemo(() => {
    const s = new Set<number>();
    for (const r of myReservations) {
      const wd = weekdayFromYmd(r.sessionDate);
      if (wd != null) s.add(wd);
    }
    return s;
  }, [myReservations]);

  const nextByPlanning = occurrences.reduce<Record<string, (typeof occurrences)[number]>>((acc, occ) => {
    if (!acc[occ.planningId]) acc[occ.planningId] = occ;
    return acc;
  }, {});
  const nextOccurrences = Object.values(nextByPlanning).sort((a, b) => {
    const dc = a.sessionDate.localeCompare(b.sessionDate);
    if (dc !== 0) return dc;
    return a.startTime.localeCompare(b.startTime);
  });
  const daysWithOccurrences = useMemo(() => {
    const s = new Set<number>();
    for (const o of nextOccurrences) {
      const wd = weekdayFromYmd(o.sessionDate);
      if (wd != null) s.add(wd);
    }
    return s;
  }, [nextOccurrences]);

  const visible = nextOccurrences.filter((o) => {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(o.sessionDate);
    if (!m) return false;
    const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    return d.getDay() === selectedDay;
  });

  useEffect(() => {
    let alive = true;
    setLoading(true);
    void loadAll()
      .catch((e) => {
        if (!alive) return;
        toast({
          variant: "error",
          title: "Erreur",
          description: e instanceof Error ? e.message : "Erreur.",
        });
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [loadAll, toast]);

  const reserve = async (
    planningId: string,
    sessionDate: string,
    mode: "main" | "wait",
    occurrence: BookingOccurrenceLite,
    packId: string,
  ) => {
    const key = `${planningId}-${sessionDate}-${mode}`;
    setActionKey(key);
    try {
      const res = await fetch("/api/member/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planningId, sessionDate, packId }),
      });
      const data = (await res.json().catch(() => null)) as { error?: string; item?: { status: string } };
      if (!res.ok) {
        throw new Error(data?.error ?? "Réservation impossible.");
      }
      const detail = bookingDetailLine(occurrence);
      toast({
        variant: "success",
        title: data.item?.status === "WAITLIST" ? "Liste d'attente" : "Réservation",
        description:
          data.item?.status === "WAITLIST"
            ? `Liste d'attente enregistrée pour le cours de ${detail}.`
            : `Réservation enregistrée pour le cours de ${detail}.`,
        durationMs: TOAST_BOOKING_MS,
      });
      await loadAll();
    } catch (e) {
      toast({
        variant: "error",
        title: "Erreur",
        description: e instanceof Error ? e.message : "Erreur.",
      });
    } finally {
      setActionKey(null);
    }
  };

  const loadBookablePacks = useCallback(
    async (courseSlug: string, sessionDate: string): Promise<BookablePackOption[]> => {
      const params = new URLSearchParams({ courseSlug, sessionDate });
      const response = await fetch(`/api/member/bookable-packs?${params.toString()}`, {
        cache: "no-store",
      });
      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? "Impossible de charger les packs.");
      }
      const data = (await response.json()) as { items: BookablePackOption[] };
      return data.items ?? [];
    },
    [],
  );

  const openReservationConfirmation = async (
    o: BookingOccurrenceLite & { planningId: string },
    mode: "main" | "wait",
  ) => {
    setPendingBooking({
      planningId: o.planningId,
      sessionDate: o.sessionDate,
      mode,
      occurrence: {
        courseLabel: o.courseLabel,
        courseSlug: o.courseSlug,
        coachName: o.coachName,
        sessionDate: o.sessionDate,
        startTime: o.startTime,
        endTime: o.endTime,
      },
      packOptions: [],
      selectedPackId: "",
      packsLoading: true,
    });
    setConfirmationChecked(false);

    try {
      const options = await loadBookablePacks(o.courseSlug, o.sessionDate);
      if (options.length === 0) {
        throw new Error("Aucun pack avec des séances disponibles pour ce cours.");
      }
      setPendingBooking((prev) =>
        prev
          ? {
              ...prev,
              packOptions: options,
              selectedPackId: options[0]!.packId,
              packsLoading: false,
            }
          : prev,
      );
    } catch (e) {
      setPendingBooking(null);
      toast({
        variant: "error",
        title: "Réservation",
        description: e instanceof Error ? e.message : "Erreur.",
      });
    }
  };

  const confirmReservation = async () => {
    if (!pendingBooking || !confirmationChecked || !pendingBooking.selectedPackId) return;
    await reserve(
      pendingBooking.planningId,
      pendingBooking.sessionDate,
      pendingBooking.mode,
      pendingBooking.occurrence,
      pendingBooking.selectedPackId,
    );
    setPendingBooking(null);
    setConfirmationChecked(false);
  };

  return (
    <>
      {!embedded ? (
        <DashboardHeader
          role="MEMBRE"
          title="Réservations"
          description="Consultez le planning et réservez selon les places disponibles."
          showRoleLine={false}
        />
      ) : null}

      <section className={`${embedded ? "mt-6" : ""} rounded-2xl border border-brand-medium/20 bg-white p-4 shadow-sm sm:p-6`}>
        <div className="flex flex-col gap-1">
          <h2 className="text-base font-semibold text-brand-dark sm:text-lg lg:text-xl">Planning</h2>
          <p className="text-[11px] text-brand-dark/70 sm:text-xs lg:text-sm">
            Période de réservation : <span className="font-semibold">{formatRange(planningRange)}</span>
          </p>
          <p className="text-[11px] text-brand-dark/70 sm:text-xs lg:text-sm">
            Période configurée par le studio : <span className="font-semibold">{planningWindowLabel(planningWindow)}</span>
          </p>
        </div>

        {!loading ? (
          <div
            className={`mt-3 rounded-xl border px-3 py-2 text-[11px] sm:text-xs lg:text-sm ${
              reservationDeskOpen
                ? "border-brand-medium/20 bg-brand-light/30 text-brand-dark/80"
                : "border-amber-200 bg-amber-50 text-amber-900"
            }`}
          >
            <p>
              <span className="font-semibold">Horaires de réservation :</span> {reservationHoursNotice}
            </p>
            {!reservationDeskOpen ? (
              <p className="mt-1 font-medium">{reservationDeskClosedNotice}</p>
            ) : null}
          </div>
        ) : null}

        {loading ? (
          <p className="mt-4 text-sm text-brand-dark/65">Chargement...</p>
        ) : nextOccurrences.length === 0 ? (
          <p className="mt-4 text-sm text-brand-dark/65">Aucun créneau planifié pour le moment.</p>
        ) : (
          <>
            <div
              className="planning-days-scroll -mx-4 mt-3 flex items-center justify-start overflow-x-auto overflow-y-hidden overscroll-x-contain px-4 pb-2 touch-pan-x sm:-mx-6 sm:px-6 lg:justify-center"
              aria-label="Jours de la semaine, défilement horizontal"
            >
              <div className="flex w-max flex-nowrap items-center gap-2 pr-1">
              {orderedDays.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => {
                    setSelectedDay(d);
                  }}
                  className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold transition sm:px-3 sm:py-1 sm:text-xs lg:text-sm ${
                    selectedDay === d
                      ? "border-brand-dark/30 bg-brand-dark text-white"
                      : d === todayDay
                        ? "border-brand-medium/40 bg-brand-light/50 text-brand-dark"
                        : "border-brand-medium/25 bg-white text-brand-dark/75 hover:bg-zinc-50"
                  }`}
                >
                  <span>{dayLabels[d]?.toUpperCase()}</span>
                  {daysWithOccurrences.has(d) ? (
                    <span
                      className={`inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold leading-none ${
                        selectedDay === d ? "bg-white/20 text-white" : "bg-brand-medium/15 text-brand-dark/70"
                      }`}
                      title="Séances planifiées ce jour"
                    >
                      {nextOccurrences.filter((o) => weekdayFromYmd(o.sessionDate) === d).length}
                    </span>
                  ) : null}
                  {daysWithMyReservations.has(d) ? (
                    <span
                      className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                        selectedDay === d ? "bg-white" : "bg-brand-dark"
                      }`}
                      title="Vous avez une réservation ce jour-là"
                      aria-hidden
                    />
                  ) : null}
                </button>
              ))}
              </div>
            </div>

            {visible.length === 0 ? (
              <div className="mt-4 rounded-xl border border-brand-medium/20 bg-zinc-50/60 px-4 py-3 text-sm text-brand-dark/70">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-brand-medium/30 text-xs font-bold">
                    i
                  </span>
                  <span>Aucune séance planifiée pour ce jour.</span>
                </div>
              </div>
            ) : (
              <div className="mt-4 grid grid-cols-1 gap-3">
                {visible.map((o) => {
                  const rowKey = `${o.planningId}-${o.sessionDate}`;
                  const isPast = o.isPast;
                  const canBookMain =
                    reservationDeskOpen && !isPast && !o.myReservation && o.spotsRemaining > 0;
                  const categoryBlocked =
                    !isPast &&
                    bookableCourseSlugs.length > 0 &&
                    !bookableCourseSlugs.includes(o.courseSlug);
                  const canWait =
                    reservationDeskOpen &&
                    !isPast &&
                    !o.myReservation &&
                    o.spotsRemaining === 0 &&
                    o.waitlistCapacity != null &&
                    (o.waitSpotsRemaining ?? 0) > 0;
                  const full = !isPast && !o.myReservation && !canBookMain && !canWait;
                  const enrolled = Boolean(o.myReservation);
                  const enrolledLabel = o.myReservation?.status === "WAITLIST" ? "En attente" : "Déjà inscrite";

                  const onAlreadyEnrolled = () => {
                    toast({
                      variant: "warning",
                      title: "Vous êtes déjà inscrite sur ce cours",
                      description: `${o.courseLabel} · ${dayLabelFromYmd(o.sessionDate)} ${formatDateFrFromYmd(
                        o.sessionDate,
                      )} · ${o.startTime}-${o.endTime} · ${planningLevelLabelFr(o.level)}`,
                    });
                  };

                  return (
                    <article
                      key={rowKey}
                      className={`rounded-xl border p-3 sm:p-4 ${
                        isPast
                          ? "border-brand-medium/15 bg-zinc-100/70 opacity-80"
                          : "border-brand-medium/20 bg-zinc-50/40"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className={`min-w-0 flex-1 ${isPast ? "text-brand-dark/55" : ""}`}>
                          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-dark/60 sm:text-xs">
                            {dayLabelFromYmd(o.sessionDate)} · {formatDateFrFromYmd(o.sessionDate)}
                          </p>
                          <p className="mt-1 text-base font-semibold leading-tight text-brand-dark break-words sm:text-lg lg:text-xl">
                            {o.courseLabel}
                          </p>
                          <div className="mt-1 flex items-center gap-2">
                            <div className="h-7 w-7 shrink-0 overflow-hidden rounded-full border border-brand-medium/20 bg-white">
                              {o.coachImageUrl ? (
                                <img src={o.coachImageUrl} alt="Coach" className="h-full w-full object-cover" />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-[10px] font-semibold text-brand-dark/50">
                                  —
                                </div>
                              )}
                            </div>
                            <p className="text-xs text-brand-dark/80 break-words sm:text-sm lg:text-base">
                              Coach : <span className="font-semibold">{o.coachName ?? "—"}</span>
                            </p>
                          </div>
                          <p className="mt-1 text-xs text-brand-dark/75 sm:text-sm lg:text-base">
                            {o.startTime} - {o.endTime}
                          </p>
                          {categoryBlocked && !enrolled ? (
                            <p className="mt-2">
                              <span className={badgeClasses.packIncompatible}>Non inclus dans votre pack</span>
                            </p>
                          ) : null}
                        </div>

                        <div className="flex items-center justify-end gap-1.5 shrink-0">
                          {isPast && !enrolled ? (
                            <span className="rounded-full border border-zinc-300 bg-zinc-200/80 px-2.5 py-0.5 text-[11px] font-semibold text-zinc-600 sm:px-3 sm:py-1 sm:text-xs">
                              Séance passée
                            </span>
                          ) : enrolled ? (
                            <button
                              type="button"
                              className={actionBtnNeutralClass}
                              onClick={onAlreadyEnrolled}
                            >
                              {enrolledLabel}
                            </button>
                          ) : !reservationDeskOpen && !isPast && !enrolled ? (
                            <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-900 sm:px-3 sm:py-1 sm:text-xs">
                              Fermé
                            </span>
                          ) : canBookMain ? (
                            <button
                              type="button"
                              className={categoryBlocked ? actionBtnPackBlockedClass : actionBtnPrimaryClass}
                              disabled={categoryBlocked || actionKey === `${rowKey}-main`}
                              onClick={() =>
                                categoryBlocked
                                  ? toast({
                                      variant: "warning",
                                      title: "Pack incompatible",
                                      description:
                                        "Aucune séance disponible sur vos packs pour ce type de cours.",
                                    })
                                  : void openReservationConfirmation(
                                      {
                                        planningId: o.planningId,
                                        courseLabel: o.courseLabel,
                                        courseSlug: o.courseSlug,
                                        coachName: o.coachName,
                                        sessionDate: o.sessionDate,
                                        startTime: o.startTime,
                                        endTime: o.endTime,
                                      },
                                      "main",
                                    )
                              }
                            >
                              Réserver
                            </button>
                          ) : canWait ? (
                            <button
                              type="button"
                              className={categoryBlocked ? actionBtnPackBlockedClass : actionBtnNeutralClass}
                              disabled={categoryBlocked || actionKey === `${rowKey}-wait`}
                              onClick={() =>
                                categoryBlocked
                                  ? toast({
                                      variant: "warning",
                                      title: "Pack incompatible",
                                      description:
                                        "Aucune séance disponible sur vos packs pour ce type de cours.",
                                    })
                                  : void openReservationConfirmation(
                                      {
                                        planningId: o.planningId,
                                        courseLabel: o.courseLabel,
                                        courseSlug: o.courseSlug,
                                        coachName: o.coachName,
                                        sessionDate: o.sessionDate,
                                        startTime: o.startTime,
                                        endTime: o.endTime,
                                      },
                                      "wait",
                                    )
                              }
                            >
                              Liste d&apos;attente
                            </button>
                          ) : (
                            <span className="text-xs font-medium text-brand-dark/55">{full ? "Complet" : "—"}</span>
                          )}
                        </div>
                      </div>

                      <div className={`mt-3 flex flex-wrap items-center gap-2 ${isPast ? "opacity-75" : ""}`}>
                        {isPast ? (
                          <span className="rounded-full border border-zinc-300/80 bg-zinc-200/60 px-2 py-0.5 text-[11px] font-medium text-zinc-600">
                            Créneau terminé — réservation fermée
                          </span>
                        ) : null}
                        {o.level && planningLevelLabelFr(o.level) ? (
                          <PlanningLevelPill
                            levelLabel={planningLevelLabelFr(o.level)!}
                            levelToneClass={planningLevelBadgeClass(o.level)}
                          />
                        ) : null}
                        {!categoryBlocked || enrolled ? (
                          <>
                            <span className={badgeClasses.availability}>
                              {o.spotsRemaining} places disponibles / {o.capacity}
                            </span>
                            <span className={badgeClasses.waitlist}>
                              Attente :{" "}
                              {o.waitlistCapacity == null ? "—" : `${o.waitlistCount}/${o.waitlistCapacity}`}
                            </span>
                          </>
                        ) : null}
                      </div>

                    </article>
                  );
                })}
              </div>
            )}
          </>
        )}
      </section>

      <Modal
        isOpen={Boolean(pendingBooking)}
        title={pendingBooking?.mode === "wait" ? "Confirmer la liste d'attente" : "Confirmer la réservation"}
        description={
          pendingBooking?.packOptions.length && pendingBooking.packOptions.length > 1
            ? "Plusieurs packs couvrent ce cours. Choisissez celui à utiliser pour cette séance."
            : pendingBooking?.mode === "wait"
              ? "Veuillez confirmer avant de rejoindre la liste d'attente."
              : "Veuillez confirmer avant de finaliser votre inscription à cette séance."
        }
        onClose={() => {
          if (actionKey) return;
          setPendingBooking(null);
          setConfirmationChecked(false);
        }}
        footer={
          <>
            <button
              type="button"
              onClick={() => {
                setPendingBooking(null);
                setConfirmationChecked(false);
              }}
              disabled={Boolean(actionKey)}
              className="rounded-full border border-brand-medium/35 bg-white px-4 py-2 text-sm font-medium text-brand-dark transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Annuler
            </button>
            <Button
              type="button"
              onClick={() => void confirmReservation()}
              disabled={
                !confirmationChecked ||
                Boolean(actionKey) ||
                !pendingBooking?.selectedPackId ||
                pendingBooking.packsLoading
              }
            >
              {actionKey ? "Enregistrement..." : pendingBooking?.mode === "wait" ? "Confirmer" : "Confirmer ma réservation"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {pendingBooking?.packsLoading ? (
            <p className="text-sm text-brand-dark/65">Chargement des packs disponibles…</p>
          ) : null}

          {pendingBooking && !pendingBooking.packsLoading && pendingBooking.packOptions.length > 1 ? (
            <SelectMenu
              id="member-book-pack"
              label="Pack pour cette séance"
              value={pendingBooking.selectedPackId}
              onChange={(packId) =>
                setPendingBooking((prev) => (prev ? { ...prev, selectedPackId: packId } : prev))
              }
              options={pendingBooking.packOptions.map((option) => ({
                value: option.packId,
                label: `${option.packName} · ${option.remainingForCourse} séance(s) · ${option.courseCoverageLabel}`,
              }))}
            />
          ) : null}

          {pendingBooking && !pendingBooking.packsLoading && pendingBooking.packOptions.length === 1 ? (
            <div className="rounded-xl border border-brand-medium/15 bg-zinc-50/70 px-4 py-3 text-sm text-brand-dark">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-dark/50">Pack utilisé</p>
              <p className="mt-1 font-semibold">{pendingBooking.packOptions[0]!.packName}</p>
              <p className="mt-0.5 text-xs text-brand-dark/65">
                {pendingBooking.packOptions[0]!.remainingForCourse} séance(s) restante(s) pour ce cours
              </p>
            </div>
          ) : null}

          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-amber-100 text-amber-800">
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5" aria-hidden="true">
                  <path d="M5 2.5A1.5 1.5 0 0 0 3.5 4v12A1.5 1.5 0 0 0 5 17.5h10a1.5 1.5 0 0 0 1.5-1.5V7.6a1.5 1.5 0 0 0-.44-1.06l-3.1-3.1A1.5 1.5 0 0 0 11.9 3H5Zm6 .75v2a2 2 0 0 0 2 2h2.75V16a.75.75 0 0 1-.75.75H5A.75.75 0 0 1 4.25 16V4A.75.75 0 0 1 5 3.25h6Z" />
                  <path d="M6.75 10a.75.75 0 0 1 .75-.75h5a.75.75 0 0 1 0 1.5h-5a.75.75 0 0 1-.75-.75Zm0 2.75A.75.75 0 0 1 7.5 12h5a.75.75 0 0 1 0 1.5h-5a.75.75 0 0 1-.75-.75Z" />
                </svg>
              </span>
              <p className="leading-relaxed">
                <span className="font-semibold">Note importante :</span> {cancellationNotice}
              </p>
            </div>
          </div>

          <div className="space-y-1.5 text-sm text-brand-dark">
            <p>J&apos;ai lu et compris cette règle.</p>
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={confirmationChecked}
                onChange={(e) => setConfirmationChecked(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-brand-medium/35"
              />
              <span className="font-medium">Je confirme ma réservation.</span>
            </label>
          </div>
        </div>
      </Modal>
    </>
  );
}
