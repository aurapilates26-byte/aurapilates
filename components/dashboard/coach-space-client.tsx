"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { PlanningDaysScrollRow } from "@/components/dashboard/planning-days-scroll-row";
import { DashboardHeader } from "@/components/dashboard/header";
import { SelectMenu } from "@/components/ui";
import type { CoachSpaceData, CoachSpaceSessionDto } from "@/lib/coach-space-server";
import { DAY_LABEL_FR } from "@/lib/planning-public-labels";
import type { PlanningDayOfWeek } from "@/types/admin/planning";

const ORDERED_DAYS: PlanningDayOfWeek[] = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

function formatYmdDisplay(ymd: string) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd);
  if (!m) return ymd;
  const [, year, month, day] = m;
  return `${day}/${month}/${year}`;
}

function formatYearMonthFr(yearMonth: string) {
  const m = /^(\d{4})-(\d{2})$/.exec(yearMonth);
  if (!m) return yearMonth;
  const year = Number(m[1]);
  const monthIndex = Number(m[2]) - 1;
  const label = new Date(year, monthIndex, 1).toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function reservationStatusLabel(status: string): string {
  if (status === "BOOKED") return "Confirmée";
  if (status === "ATTENDED") return "Présente";
  if (status === "CANCELLED") return "Annulée";
  if (status === "WAITLIST") return "Liste d'attente";
  return status;
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="relative min-w-0 overflow-hidden rounded-2xl border border-brand-medium/20 bg-white p-4 shadow-sm">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand-light/30 via-transparent to-transparent" />
      <div className="relative">
        <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-brand-dark/60">{label}</p>
        <p className="mt-2 text-xl font-bold tracking-tight text-brand-dark sm:text-2xl">{value}</p>
      </div>
    </article>
  );
}

function SessionCard({ session }: { session: CoachSpaceSessionDto }) {
  return (
    <details
      className="rounded-xl border border-brand-medium/15 bg-white px-4 py-3 shadow-sm"
      open={!session.isBilled}
    >
      <summary className="cursor-pointer list-none">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="font-semibold text-brand-dark">
              {formatYmdDisplay(session.sessionDateYmd)} · {session.courseLabel}
            </p>
            <p className="text-sm text-brand-dark/65">{session.timeLabel}</p>
            {session.periodLabel ? (
              <p className="mt-0.5 text-xs text-brand-dark/50">{session.periodLabel}</p>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {session.isBilled ? (
              <>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    session.ratePct === 100
                      ? "border border-emerald-200 bg-emerald-50 text-emerald-900"
                      : "border border-amber-200 bg-amber-50 text-amber-900"
                  }`}
                >
                  {session.ratePct === 100 ? "Tarif plein" : "50 % sans présence"}
                </span>
                <span className="rounded-full bg-zinc-50 px-3 py-1 text-xs font-bold tabular-nums text-brand-dark">
                  {session.amountDinars ?? 0} DT
                </span>
              </>
            ) : (
              <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-900">
                À venir
              </span>
            )}
            <span className="rounded-full border border-brand-medium/20 bg-zinc-50 px-3 py-1 text-xs font-semibold text-brand-dark/75">
              {session.reservations.length} réservation{session.reservations.length > 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </summary>

      <div className="mt-3 border-t border-brand-medium/10 pt-3">
        {session.isBilled ? (
          <p className="text-xs text-brand-dark/60">Présences marquées : {session.attendanceCount}</p>
        ) : null}

        {session.reservations.length === 0 ? (
          <p className="mt-2 text-sm text-brand-dark/60">Aucune adhérente réservée.</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {session.reservations.map((reservation) => (
              <li
                key={reservation.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-brand-medium/10 bg-zinc-50/80 px-3 py-2 text-sm"
              >
                <span className="font-medium text-brand-dark">{reservation.memberName}</span>
                <span className="text-xs text-brand-dark/65">
                  {reservationStatusLabel(reservation.status)}
                  {reservation.attended ? " · Présente" : ""}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </details>
  );
}

export function CoachSpaceClient() {
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [data, setData] = useState<CoachSpaceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<PlanningDayOfWeek | null>(null);

  const load = useCallback(async (yearMonth?: string) => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const query = yearMonth ? `?yearMonth=${encodeURIComponent(yearMonth)}` : "";
      const response = await fetch(`/api/coach/space${query}`, { cache: "no-store" });
      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error ?? "Chargement impossible.");
      }
      const body = (await response.json()) as { item: CoachSpaceData };
      setData(body.item);
      setSelectedMonth(body.item.yearMonth);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Erreur");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const activeDays = useMemo(() => {
    if (!data) return [] as PlanningDayOfWeek[];
    return ORDERED_DAYS.filter((day) => (data.planning.slotsByDay[day]?.length ?? 0) > 0);
  }, [data]);

  useEffect(() => {
    if (activeDays.length === 0) {
      setSelectedDay(null);
      return;
    }
    if (!selectedDay || !activeDays.includes(selectedDay)) {
      setSelectedDay(activeDays[0]!);
    }
  }, [activeDays, selectedDay]);

  const monthOptions = useMemo(
    () =>
      (data?.availableMonths ?? []).map((ym) => ({
        value: ym,
        label: formatYearMonthFr(ym),
      })),
    [data?.availableMonths],
  );

  const billedSessions = useMemo(
    () => data?.sessions.filter((s) => s.isBilled) ?? [],
    [data?.sessions],
  );
  const upcomingSessions = useMemo(
    () => data?.sessions.filter((s) => !s.isBilled) ?? [],
    [data?.sessions],
  );

  if (isLoading && !data) {
    return (
      <div className="mx-auto max-w-6xl py-10">
        <p className="text-sm text-brand-dark/65">Chargement de votre espace…</p>
      </div>
    );
  }

  if (loadError && !data) {
    return (
      <div className="mx-auto max-w-6xl py-10">
        <p className="text-sm text-red-700">{loadError}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="mx-auto max-w-6xl py-10">
        <p className="text-sm text-brand-dark/65">Espace indisponible.</p>
      </div>
    );
  }

  const displayName = `${data.coach.firstName} ${data.coach.lastName}`.trim();
  const daySlots = selectedDay ? (data.planning.slotsByDay[selectedDay] ?? []) : [];
  const isPerSession = data.coach.payrollMode === "PER_SESSION";

  const statCards = isPerSession
    ? [
        { label: "Séances facturées", value: String(data.payroll.sessionsInMonth) },
        { label: "Coût période (estimé)", value: `${data.planning.totalCostActivePeriodDinars} DT` },
        { label: "Tarif / séance", value: `${data.coach.sessionCostDinars ?? 0} DT` },
      ]
    : [
        { label: "Séances facturées", value: String(data.payroll.sessionsInMonth) },
        { label: "Forfait mensuel", value: `${data.coach.monthlySalaryDinars ?? 0} DT` },
        { label: "Total mois", value: `${data.payroll.monthlyCostDinars} DT` },
      ];

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-10">
      <DashboardHeader
        showRoleLine={false}
        title={
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full border border-brand-medium/20 bg-zinc-50">
              {data.coach.imageUrl ? (
                <img src={data.coach.imageUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-lg font-semibold text-brand-dark/50">
                  {data.coach.firstName[0]}
                  {data.coach.lastName[0]}
                </div>
              )}
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-2xl font-semibold tracking-tight text-brand-dark sm:text-3xl">
                {displayName}
              </h1>
              <p className="mt-0.5 text-sm font-medium text-brand-dark/60">{data.coach.payrollModeLabel}</p>
            </div>
          </div>
        }
        actions={
          <div className="w-full min-w-[200px] sm:w-56">
            <SelectMenu
              id="coach-space-month"
              label="Mois"
              value={selectedMonth}
              onChange={(value) => {
                setSelectedMonth(value);
                void load(value);
              }}
              options={monthOptions}
            />
          </div>
        }
      />

      {isLoading ? <p className="text-xs text-brand-dark/55">Mise à jour…</p> : null}

      <section className="overflow-hidden rounded-2xl border border-brand-medium/25 bg-gradient-to-br from-brand-light/50 via-white to-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-dark/55">Rémunération</p>
            <h2 className="mt-1 text-2xl font-semibold text-brand-dark sm:text-3xl">
              {formatYearMonthFr(data.yearMonth)}
            </h2>
            <p className="mt-2 text-sm text-brand-dark/65">
              {data.payroll.billingPeriodLabel
                ? `Période caisse : ${data.payroll.billingPeriodLabel}`
                : `Fenêtre : ${data.payroll.bookingWindowLabel}`}
            </p>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-dark/50">Total du mois</p>
            <p className="text-3xl font-bold tabular-nums text-brand-dark sm:text-4xl">
              {data.payroll.monthlyCostDinars} DT
            </p>
          </div>
        </div>

        {isPerSession ? (
          <p className="mt-4 text-xs leading-relaxed text-brand-dark/60">
            Tarif plein si au moins une présence est marquée sur la séance, sinon 50 % du tarif séance.
          </p>
        ) : null}
      </section>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {statCards.map((card) => (
          <StatCard key={card.label} label={card.label} value={card.value} />
        ))}
      </div>

      <section className="rounded-2xl border border-brand-medium/20 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-brand-dark">Créneaux par jour</h2>
        <p className="mt-1 text-sm text-brand-dark/65">
          Période active {data.planning.periodConfig.periodLabel}
        </p>

        {activeDays.length === 0 ? (
          <p className="mt-6 text-sm text-brand-dark/60">Aucun créneau sur la période active.</p>
        ) : (
          <>
            <PlanningDaysScrollRow className="mt-4" scrollKey={data.planning.totalSessionsInActivePeriod}>
              <div className="flex w-max flex-nowrap gap-2">
                {activeDays.map((day) => {
                  const count = data.planning.slotsByDay[day]?.length ?? 0;
                  const active = selectedDay === day;
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => setSelectedDay(day)}
                      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${
                        active
                          ? "border-brand-dark/30 bg-brand-dark text-white"
                          : "border-brand-medium/35 bg-white text-brand-dark/80"
                      }`}
                    >
                      {DAY_LABEL_FR[day].toUpperCase()}
                      <span className={active ? "text-white/90" : "text-brand-dark/50"}>({count})</span>
                    </button>
                  );
                })}
              </div>
            </PlanningDaysScrollRow>
            <ul className="mt-4 space-y-2">
              {daySlots.map((slot) => (
                <li
                  key={slot.planningId}
                  className="rounded-xl border border-brand-medium/15 bg-zinc-50/50 px-4 py-3 text-sm"
                >
                  <span className="font-medium text-brand-dark">
                    {slot.courseLabel} · {slot.startTime}
                  </span>
                  <span className="ml-2 text-xs text-brand-dark/55">
                    ({slot.sessionsInActivePeriod} séance{slot.sessionsInActivePeriod > 1 ? "s" : ""})
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      {data.planning.periodBlocks.length > 0 ? (
        <section className="rounded-2xl border border-brand-medium/20 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-brand-dark">Planning par semaine</h2>
          <p className="mt-1 text-sm text-brand-dark/65">
            Semaines type dans {data.planning.periodConfig.periodLabel}
          </p>
          <div className="mt-4 space-y-3">
            {data.planning.periodBlocks.map((block) => (
              <div key={block.periodIndex} className="rounded-xl border border-brand-medium/15 bg-zinc-50/40 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold text-brand-dark">{block.periodLabel}</p>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-brand-dark/80">
                    {block.sessionsInPeriod} séance{block.sessionsInPeriod > 1 ? "s" : ""}
                  </span>
                </div>
                {block.slots.length > 0 ? (
                  <ul className="mt-3 space-y-1 text-sm text-brand-dark/80">
                    {block.slots
                      .filter((s) => s.sessionsInActivePeriod > 0)
                      .map((s) => (
                        <li key={`${block.periodIndex}-${s.planningId}`}>
                          {s.dayLabel} · {s.courseLabel} {s.startTime}
                        </li>
                      ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-xs text-brand-dark/55">Aucun créneau.</p>
                )}
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="rounded-2xl border border-brand-medium/20 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-brand-dark">
          Historique des séances — {formatYearMonthFr(data.yearMonth)}
        </h2>
        <p className="mt-1 text-sm text-brand-dark/65">
          Détail financier et réservations par séance pour le mois sélectionné.
        </p>

        {data.payroll.periods.length > 0 ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {data.payroll.periods.map((period) => (
              <div
                key={period.fromYmd}
                className="rounded-xl border border-brand-medium/15 bg-zinc-50/50 px-4 py-3"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-brand-dark/50">
                  {period.periodLabel}
                </p>
                <p className="mt-1 text-sm font-semibold text-brand-dark">
                  {period.sessionsInPeriod} séance{period.sessionsInPeriod > 1 ? "s" : ""} · {period.costDinars} DT
                </p>
              </div>
            ))}
          </div>
        ) : null}

        {billedSessions.length === 0 && upcomingSessions.length === 0 ? (
          <p className="mt-6 text-sm text-brand-dark/60">Aucune séance sur ce mois.</p>
        ) : (
          <div className="mt-6 space-y-6">
            {billedSessions.length > 0 ? (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-brand-dark">Séances facturées</h3>
                {billedSessions.map((session) => (
                  <SessionCard key={session.id} session={session} />
                ))}
              </div>
            ) : null}

            {upcomingSessions.length > 0 ? (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-brand-dark">Séances à venir</h3>
                {upcomingSessions.map((session) => (
                  <SessionCard key={session.id} session={session} />
                ))}
              </div>
            ) : null}
          </div>
        )}

        {data.planning.archivedPeriods.length > 0 ? (
          <div className="mt-8 border-t border-brand-medium/15 pt-6">
            <h3 className="text-sm font-semibold text-brand-dark">Créneaux sur les périodes passées</h3>
            <p className="mt-1 text-xs text-brand-dark/60">
              Modèle de planning des périodes précédentes (hors calcul du mois ci-dessus).
            </p>
            <div className="mt-4 space-y-2">
              {data.planning.archivedPeriods.map((period) => (
                <details
                  key={period.periodStartYmd}
                  className="rounded-xl border border-brand-medium/15 bg-zinc-50/40 px-4 py-3"
                >
                  <summary className="cursor-pointer list-none">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-brand-dark">
                        Du {formatYmdDisplay(period.periodStartYmd)} au {formatYmdDisplay(period.periodEndYmd)}
                      </p>
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-brand-dark/80">
                        {period.sessionsInPeriod} séance{period.sessionsInPeriod > 1 ? "s" : ""}
                      </span>
                    </div>
                  </summary>
                  {period.slots.length === 0 ? (
                    <p className="mt-3 text-sm text-brand-dark/60">Aucun créneau.</p>
                  ) : (
                    <ul className="mt-3 space-y-1 text-sm text-brand-dark/80">
                      {period.slots.map((slot) => (
                        <li key={`${period.periodStartYmd}-${slot.planningId}`}>
                          {slot.dayLabel} · {slot.courseLabel} {slot.startTime}
                        </li>
                      ))}
                    </ul>
                  )}
                </details>
              ))}
            </div>
          </div>
        ) : null}
      </section>

      {data.coach.description ? (
        <section className="rounded-2xl border border-brand-medium/20 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-brand-dark">À propos</h2>
          <p className="mt-2 text-sm leading-relaxed text-brand-dark/75">{data.coach.description}</p>
        </section>
      ) : null}
    </div>
  );
}
