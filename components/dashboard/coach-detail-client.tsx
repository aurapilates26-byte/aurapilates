"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { PlanningDaysScrollRow } from "@/components/dashboard/planning-days-scroll-row";
import { DashboardHeader } from "@/components/dashboard/header";
import { Button, Checkbox, ConfirmDialog, Input, SelectMenu, Textarea } from "@/components/ui";
import { COACH_PAYROLL_MODE_OPTIONS } from "@/lib/coach-payroll-mode";
import type { CoachPayrollMode } from "@/types/admin/coach";
import { useToast } from "@/components/ui/toast-provider";
import type { CoachDetailData } from "@/lib/admin/coach-detail-server";
import { useCoachStore } from "@/store/admin/coach-store";
import { useCoachDetailStore } from "@/store/admin/coach-detail-store";
import { DAY_LABEL_FR } from "@/lib/planning-public-labels";
import type { PlanningDayOfWeek } from "@/types/admin/planning";

const ORDERED_DAYS: PlanningDayOfWeek[] = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

const iconBtnBase =
  "inline-flex h-8 w-8 items-center justify-center rounded-lg border focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-60";

function formatYmdDisplay(ymd: string) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd);
  if (!m) return ymd;
  const [, year, month, day] = m;
  return `${day}/${month}/${year}`;
}

function InfoField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-brand-medium/15 bg-zinc-50/60 px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-dark/50">{label}</p>
      <div className="mt-1.5 text-sm font-medium text-brand-dark">{children}</div>
    </div>
  );
}

function IconEditButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Modifier le coach"
      title="Modifier"
      className={`${iconBtnBase} border-brand-medium/30 bg-brand-light/40 text-brand-dark focus-visible:ring-brand-medium/30`}
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
        <path d="M4 17.25V20h2.75l8.12-8.12-2.75-2.75L4 17.25zm12.71-9.04a1 1 0 000-1.41l-1.5-1.5a1 1 0 00-1.41 0l-1.17 1.17 2.75 2.75 1.33-1.01z" />
      </svg>
    </button>
  );
}

function IconDeleteButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Supprimer le coach"
      title="Supprimer"
      className={`${iconBtnBase} border-red-200 bg-red-50 text-red-700 focus-visible:ring-red-200`}
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
        <path d="M9 3h6l1 2h4v2H4V5h4l1-2zm1 6h2v9h-2V9zm4 0h2v9h-2V9zM7 9h2v9H7V9z" />
      </svg>
    </button>
  );
}

type PanelMode = "view" | "edit";

type CoachDetailClientProps = {
  coachId: string;
};

export function CoachDetailClient({ coachId }: CoachDetailClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const cachedDetail = useCoachDetailStore((s) => s.cachedDetails[coachId]);
  const fetchCoachDetail = useCoachDetailStore((s) => s.fetchCoachDetail);
  const invalidateDetail = useCoachDetailStore((s) => s.invalidateDetail);
  const removeCoachFromList = useCoachStore((s) => s.removeCoach);

  const [coach, setCoach] = useState<CoachDetailData | null>(() => cachedDetail ?? null);
  const [panelMode, setPanelMode] = useState<PanelMode>("view");
  const [isLoading, setIsLoading] = useState(() => !cachedDetail);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<PlanningDayOfWeek>("MON");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [payrollMode, setPayrollMode] = useState<CoachPayrollMode>("PER_SESSION");
  const [sessionCostDinars, setSessionCostDinars] = useState("");
  const [monthlySalaryDinars, setMonthlySalaryDinars] = useState("");
  const [isActive, setIsActive] = useState(true);

  const populateForm = useCallback((c: CoachDetailData) => {
    setFirstName(c.firstName);
    setLastName(c.lastName);
    setDescription(c.description ?? "");
    setEmail(c.email ?? "");
    setPhone(c.phone ?? "");
    setPayrollMode(c.payrollMode);
    setSessionCostDinars(c.sessionCostDinars != null ? String(c.sessionCostDinars) : "");
    setMonthlySalaryDinars(c.monthlySalaryDinars != null ? String(c.monthlySalaryDinars) : "");
    setIsActive(c.isActive);
  }, []);

  useEffect(() => {
    setPanelMode("view");
    setLoadError(null);

    const cached = useCoachDetailStore.getState().getCachedDetail(coachId);
    if (cached) {
      setCoach(cached);
      populateForm(cached);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    void (async () => {
      try {
        const detail = await fetchCoachDetail(coachId);
        if (cancelled) return;
        setCoach(detail);
        populateForm(detail);
      } catch (e) {
        if (!cancelled) {
          setLoadError(e instanceof Error ? e.message : "Erreur");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [coachId, fetchCoachDetail, populateForm]);

  useEffect(() => {
    const firstWithSlots = ORDERED_DAYS.find((d) => (coach?.slotsByDay[d]?.length ?? 0) > 0);
    if (firstWithSlots) setSelectedDay(firstWithSlots);
  }, [coach?.id]);

  const handleSubmit = async () => {
    if (!coach) return;
    setFormError(null);
    const parsedSessionCost = sessionCostDinars.trim() === "" ? null : Number(sessionCostDinars.trim());
    const parsedMonthlySalary = monthlySalaryDinars.trim() === "" ? null : Number(monthlySalaryDinars.trim());
    if (isActive && payrollMode === "PER_SESSION" && (parsedSessionCost == null || parsedSessionCost <= 0)) {
      setFormError("Coach actif payé par séance : coût/séance > 0.");
      return;
    }
    if (isActive && payrollMode === "PER_MONTH" && (parsedMonthlySalary == null || parsedMonthlySalary <= 0)) {
      setFormError("Coach actif payé par mois : forfait mensuel > 0.");
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/admin/coaches/${encodeURIComponent(coachId)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          description: description.trim() || undefined,
          email: email.trim() || undefined,
          phone: phone.trim() || undefined,
          payrollMode,
          sessionCostDinars: payrollMode === "PER_SESSION" ? parsedSessionCost : null,
          monthlySalaryDinars: payrollMode === "PER_MONTH" ? parsedMonthlySalary : null,
          isActive,
          imageUrl: coach.imageUrl ?? undefined,
        }),
      });
      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? "Enregistrement impossible.");
      }
      invalidateDetail(coachId);
      const detail = await fetchCoachDetail(coachId, { force: true });
      setCoach(detail);
      populateForm(detail);
      toast({ variant: "success", title: "Coach modifié" });
      setPanelMode("view");
    } catch (e) {
      const message = e instanceof Error ? e.message : "Erreur";
      setFormError(message);
      toast({ variant: "error", title: "Erreur", description: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/admin/coaches/${encodeURIComponent(coachId)}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Suppression impossible.");
      removeCoachFromList(coachId);
      invalidateDetail(coachId);
      toast({ variant: "success", title: "Coach supprimé" });
      router.push("/dashboard/coachs");
    } catch (e) {
      toast({
        variant: "error",
        title: "Erreur",
        description: e instanceof Error ? e.message : "Erreur",
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (!coach && loadError) {
    return <p className="text-sm text-red-700">{loadError}</p>;
  }

  if (isLoading && !coach) {
    return <p className="text-sm text-brand-dark/65">Chargement…</p>;
  }

  if (!coach) {
    return <p className="text-sm text-brand-dark/65">Coach introuvable.</p>;
  }

  const displayName = `${coach.firstName} ${coach.lastName}`.trim();
  const daySlots = coach.slotsByDay[selectedDay] ?? [];

  return (
    <>
      <DashboardHeader
        role="ADMIN"
        title={displayName}
        description="Fiche coach, créneaux planning et séances par période."
        showRoleLine={false}
      />

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_320px]">
        <div className="space-y-6">
          <div className="rounded-2xl border border-brand-medium/20 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-3 border-b border-brand-medium/15 pb-4 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-lg font-semibold text-brand-dark">
                {panelMode === "edit" ? "Modifier le coach" : "Informations"}
              </h2>
              {panelMode === "view" ? (
                <div className="flex items-center gap-2">
                  <IconEditButton onClick={() => { populateForm(coach); setPanelMode("edit"); }} />
                  <IconDeleteButton onClick={() => setShowDeleteConfirm(true)} />
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => { populateForm(coach); setPanelMode("view"); }}
                  className="text-sm font-medium text-brand-dark/70 hover:text-brand-dark"
                >
                  Annuler
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => router.push("/dashboard/coachs")}
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-brand-dark/60 transition hover:text-brand-dark"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" aria-hidden="true">
                <path fill="currentColor" d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
              </svg>
              Retourner à la liste
            </button>

            {panelMode === "view" ? (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <InfoField label="Email">{coach.email ?? "—"}</InfoField>
                <InfoField label="Téléphone">{coach.phone ?? "—"}</InfoField>
                <InfoField label="Rémunération">{coach.payrollModeLabel}</InfoField>
                <InfoField label="Statut">{coach.isActive ? "Actif" : "Inactif"}</InfoField>
                {coach.payrollMode === "PER_SESSION" ? (
                  <InfoField label="Coût / séance">
                    {coach.sessionCostDinars != null ? `${coach.sessionCostDinars} DT` : "—"}
                  </InfoField>
                ) : (
                  <InfoField label="Forfait mensuel">
                    {coach.monthlySalaryDinars != null ? `${coach.monthlySalaryDinars} DT` : "—"}
                  </InfoField>
                )}
                <div className="sm:col-span-2">
                  <InfoField label="Description">{coach.description ?? "—"}</InfoField>
                </div>
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input id="coach-fn" label="Prénom" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                  <Input id="coach-ln" label="Nom" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                  <Input id="coach-email" label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                  <Input id="coach-phone" label="Téléphone" value={phone} onChange={(e) => setPhone(e.target.value)} />
                  <SelectMenu
                    id="coach-detail-payroll-mode"
                    label="Mode de rémunération"
                    value={payrollMode}
                    onChange={(v) => setPayrollMode(v as CoachPayrollMode)}
                    options={COACH_PAYROLL_MODE_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
                  />
                  {payrollMode === "PER_SESSION" ? (
                    <Input
                      id="coach-cost"
                      label="Coût par séance (DT)"
                      type="number"
                      min={0}
                      value={sessionCostDinars}
                      onChange={(e) => setSessionCostDinars(e.target.value)}
                    />
                  ) : (
                    <Input
                      id="coach-monthly"
                      label="Forfait mensuel (DT)"
                      type="number"
                      min={0}
                      value={monthlySalaryDinars}
                      onChange={(e) => setMonthlySalaryDinars(e.target.value)}
                    />
                  )}
                  <div className="flex items-end pb-1">
                    <Checkbox
                      id="coach-active"
                      label="Coach actif"
                      checked={isActive}
                      onChange={(event) => setIsActive(event.target.checked)}
                    />
                  </div>
                </div>
                <Textarea id="coach-desc" label="Description" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
                {formError ? <p className="text-sm text-red-700">{formError}</p> : null}
                <Button onClick={() => void handleSubmit()} disabled={isSubmitting}>
                  {isSubmitting ? "Enregistrement…" : "Enregistrer"}
                </Button>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-brand-medium/20 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-brand-dark">Créneaux par jour</h2>
            <p className="mt-1 text-sm text-brand-dark/65">
              Période active {coach.periodConfig.periodLabel} · {coach.weeklyRepetitionCount} semaine
              {coach.weeklyRepetitionCount > 1 ? "s" : ""} type
            </p>
            <PlanningDaysScrollRow className="mt-4" scrollKey={coach.totalSessionsInActivePeriod}>
              <div className="flex w-max flex-nowrap gap-2">
                {ORDERED_DAYS.map((day) => {
                  const count = coach.slotsByDay[day]?.length ?? 0;
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
            {daySlots.length === 0 ? (
              <p className="mt-6 text-sm text-brand-dark/60">Aucun créneau ce jour.</p>
            ) : (
              <ul className="mt-4 space-y-2">
                {daySlots.map((slot) => (
                  <li
                    key={slot.planningId}
                    className="rounded-xl border border-brand-medium/15 bg-zinc-50/50 px-4 py-3 text-sm"
                  >
                    <span className="font-medium text-brand-dark">
                      {slot.courseLabel} · {slot.startTime}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-2xl border border-brand-medium/20 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-brand-dark">Par semaine (répétition planning)</h2>
            <p className="mt-1 text-sm text-brand-dark/65">
              Chaque bloc = une semaine type (lun–dim) dans la fenêtre {coach.periodConfig.periodLabel}.
            </p>
            <div className="mt-4 space-y-4">
              {coach.periodBlocks.map((block) => (
                <div key={block.periodIndex} className="rounded-xl border border-brand-medium/15 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold text-brand-dark">{block.periodLabel}</p>
                    <span className="rounded-full bg-brand-light/80 px-3 py-1 text-xs font-semibold text-brand-dark">
                      {block.sessionsInPeriod} séance{block.sessionsInPeriod > 1 ? "s" : ""}
                    </span>
                  </div>
                  {block.slots.length > 0 ? (
                    <ul className="mt-3 space-y-1 text-sm text-brand-dark/80">
                      {block.slots.map((s) => (
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
          </div>

          <div className="rounded-2xl border border-brand-medium/20 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-brand-dark">Historique par période</h2>
            <p className="mt-1 text-sm text-brand-dark/65">
              Retrouvez les séances du coach sur les périodes précédentes.
            </p>
            {coach.archivedPeriods.length === 0 ? (
              <p className="mt-4 text-sm text-brand-dark/60">Aucune période archivée.</p>
            ) : (
              <div className="mt-4 space-y-3">
                {coach.archivedPeriods.map((p) => (
                  <details
                    key={p.periodStartYmd}
                    className="rounded-xl border border-brand-medium/15 bg-zinc-50/40 px-4 py-3"
                  >
                    <summary className="cursor-pointer list-none">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-semibold text-brand-dark">
                          Du {formatYmdDisplay(p.periodStartYmd)} au {formatYmdDisplay(p.periodEndYmd)}
                        </p>
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-brand-dark/80">
                          {p.sessionsInPeriod} séance{p.sessionsInPeriod > 1 ? "s" : ""}
                        </span>
                      </div>
                    </summary>
                    {p.slots.length === 0 ? (
                      <p className="mt-3 text-sm text-brand-dark/60">Aucun créneau.</p>
                    ) : (
                      <ul className="mt-3 space-y-1 text-sm text-brand-dark/80">
                        {p.slots.map((s) => (
                          <li key={`${p.periodStartYmd}-${s.planningId}`}>
                            {s.dayLabel} · {s.courseLabel} {s.startTime}
                          </li>
                        ))}
                      </ul>
                    )}
                  </details>
                ))}
              </div>
            )}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-brand-medium/20 bg-white p-5 shadow-sm">
            <div className="mx-auto h-24 w-24 overflow-hidden rounded-full border border-brand-medium/20 bg-zinc-50">
              {coach.imageUrl ? (
                <img src={coach.imageUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-2xl font-semibold text-brand-dark/50">
                  {coach.firstName[0]}
                  {coach.lastName[0]}
                </div>
              )}
            </div>
            <p className="mt-4 text-center text-sm font-semibold text-brand-dark">{displayName}</p>
          </div>
          <div className="rounded-2xl border border-brand-medium/20 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-brand-dark">Séances</h3>
            <dl className="mt-3 space-y-3 text-sm">
              <div>
                <dt className="text-brand-dark/55">Mode</dt>
                <dd className="font-medium text-brand-dark">{coach.payrollModeLabel}</dd>
              </div>
              {coach.payrollMode === "PER_SESSION" ? (
                <>
                  <div>
                    <dt className="text-brand-dark/55">Séances (période active)</dt>
                    <dd className="font-medium text-brand-dark">{coach.totalSessionsInActivePeriod}</dd>
                  </div>
                  <div>
                    <dt className="text-brand-dark/55">Coût période (calculé)</dt>
                    <dd className="font-medium text-brand-dark">{coach.totalCostActivePeriodDinars} DT</dd>
                  </div>
                </>
              ) : (
                <div>
                  <dt className="text-brand-dark/55">Forfait mensuel</dt>
                  <dd className="font-medium text-brand-dark">{coach.monthlySalaryDinars ?? 0} DT</dd>
                </div>
              )}
              <div>
                <dt className="text-brand-dark/55">Mois caisse ({coach.monthYearMonth})</dt>
                <dd className="font-medium text-brand-dark">{coach.monthlyCostDinars} DT</dd>
              </div>
            </dl>
          </div>
        </aside>
      </section>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Supprimer ce coach ?"
        description={displayName}
        confirmText="Supprimer"
        isConfirming={isDeleting}
        onClose={() => !isDeleting && setShowDeleteConfirm(false)}
        onConfirm={() => void handleDelete()}
      />
    </>
  );
}

