"use client";

import { useCallback, useEffect, useState } from "react";
import { Button, DatePicker, SelectMenu } from "@/components/ui";
import { formatYmdLocal, startOfLocalToday } from "@/lib/calendar-day";
import { BOOKING_WINDOW_DAYS } from "@/lib/planning-booking-window";
import { proposeNextPlanningPeriod } from "@/lib/planning-period-status";
import { usePlanningPeriodStore } from "@/store/planning-period-store";
import type { PlanningBookingWindow } from "@/types/admin/planning";

const WINDOW_OPTIONS = [
  { value: "WEEKLY" as const, label: "Hebdomadaire (7 jours)" },
  { value: "FIFTEEN_DAYS" as const, label: "15 jours" },
  { value: "ONE_MONTH" as const, label: "1 mois (30 jours)" },
];

function previewEndYmd(startYmd: string, window: PlanningBookingWindow): string {
  const start = new Date(startYmd + "T12:00:00");
  if (Number.isNaN(start.getTime())) return startYmd;
  const days = BOOKING_WINDOW_DAYS[window];
  const end = new Date(start);
  end.setDate(end.getDate() + days - 1);
  return formatYmdLocal(end);
}

function formatShortFr(ymd: string): string {
  const p = ymd.split("-");
  if (p.length !== 3) return ymd;
  return `${p[2]}/${p[1]}/${p[0]}`;
}

type PlanningPeriodDraftFormProps = {
  embedded?: boolean;
  draftSessionCount?: number;
  onSaved?: () => void;
};

export function PlanningPeriodDraftForm({
  embedded = false,
  draftSessionCount = 0,
  onSaved,
}: PlanningPeriodDraftFormProps) {
  const draft = usePlanningPeriodStore((s) => s.draft);
  const published = usePlanningPeriodStore((s) => s.config);
  const isSaving = usePlanningPeriodStore((s) => s.isSaving);
  const saveDraftSchedule = usePlanningPeriodStore((s) => s.saveDraftSchedule);
  const setDraftFormInput = usePlanningPeriodStore((s) => s.setDraftFormInput);
  const prepareDraftFromSuggestion = usePlanningPeriodStore((s) => s.prepareDraftFromSuggestion);
  const clearDraft = usePlanningPeriodStore((s) => s.clearDraft);

  const [draftWindow, setDraftWindow] = useState<PlanningBookingWindow>("WEEKLY");
  const [draftStartYmd, setDraftStartYmd] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const syncFromStore = useCallback(() => {
    if (draft) {
      setDraftWindow(draft.bookingWindow);
      setDraftStartYmd(draft.periodStartYmd);
    } else if (published) {
      const next = proposeNextPlanningPeriod(published);
      setDraftWindow(next.bookingWindow);
      setDraftStartYmd(next.periodStartYmd);
    } else {
      setDraftWindow("WEEKLY");
      setDraftStartYmd(formatYmdLocal(startOfLocalToday()));
    }
    setFormError(null);
  }, [draft, published]);

  useEffect(() => {
    syncFromStore();
  }, [syncFromStore]);

  useEffect(() => {
    if (draftStartYmd && /^\d{4}-\d{2}-\d{2}$/.test(draftStartYmd)) {
      setDraftFormInput({ bookingWindow: draftWindow, periodStartYmd: draftStartYmd });
    }
  }, [draftWindow, draftStartYmd, setDraftFormInput]);

  const previewLabel =
    draftStartYmd && /^\d{4}-\d{2}-\d{2}$/.test(draftStartYmd)
      ? `Du ${draftStartYmd.split("-").reverse().join("/")} au ${previewEndYmd(draftStartYmd, draftWindow).split("-").reverse().join("/")}`
      : "—";

  const autoPublishLabel =
    draftStartYmd && /^\d{4}-\d{2}-\d{2}$/.test(draftStartYmd)
      ? `Du lundi au samedi visibles le samedi précédent à 13 h · dimanche du brouillon le dimanche à 13 h.`
      : null;

  const handleClearDraft = async () => {
    const confirmed = window.confirm(
      "Supprimer le brouillon et toutes les séances préparées pour la prochaine période ?",
    );
    if (!confirmed) return;
    setFormError(null);
    try {
      await clearDraft();
      onSaved?.();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Erreur");
    }
  };

  const handleSave = async () => {
    if (!draftStartYmd.trim()) {
      setFormError("Choisissez la date de début de la prochaine période.");
      return;
    }
    setFormError(null);
    try {
      await saveDraftSchedule({
        bookingWindow: draftWindow,
        periodStartYmd: draftStartYmd,
      });
      onSaved?.();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Erreur");
    }
  };

  const wrapperClass = embedded
    ? "space-y-4"
    : "rounded-xl border border-violet-200/80 bg-violet-50/50 px-4 py-4 sm:px-5";

  return (
    <div className={wrapperClass}>
      {!embedded ? (
        <>
          <h4 className="text-sm font-semibold text-violet-950">Prochaine période (brouillon)</h4>
          <p className="mt-1 text-sm leading-relaxed text-violet-950/80">
            Préparez les créneaux ici. Ouverture automatique : du lundi au samedi le samedi à 13 h, le dimanche le dimanche à 13 h.
            Sans brouillon, aucune nouvelle semaine n&apos;est affichée.
          </p>
        </>
      ) : null}
      {draft?.partialPublishLabel ? (
        <p
          className={
            embedded
              ? "rounded-lg border border-brand-medium/15 bg-zinc-50/90 px-3 py-2 text-sm font-medium text-brand-dark"
              : "mt-2 text-sm font-medium text-violet-900"
          }
        >
          {draft.publicationPhase === "PARTIAL"
            ? `Publication partielle active · dimanche complet le ${draft.fullPublishLabel ?? "—"}`
            : `Ouverture du lundi au samedi le ${draft.partialPublishLabel}`}
          {draft.fullPublishLabel ? ` · dimanche le ${draft.fullPublishLabel}` : null}
        </p>
      ) : null}

      <div className={embedded ? "space-y-4" : "mt-4 space-y-4"}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <SelectMenu
            id="draft-period-window"
            label="Durée"
            value={draftWindow}
            onChange={(value) => setDraftWindow(value as PlanningBookingWindow)}
            options={WINDOW_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
          />
          <DatePicker
            id="draft-period-start"
            label="Début de la prochaine période"
            value={draftStartYmd}
            onChange={setDraftStartYmd}
            placeholder="JJ/MM/AAAA"
          />
        </div>
        {autoPublishLabel ? (
          <p
            className={
              embedded
                ? "rounded-xl border border-brand-medium/15 bg-zinc-50/80 px-3 py-2.5 text-sm text-brand-dark/80"
                : "rounded-lg border border-violet-200/50 bg-white/70 px-3 py-2 text-sm text-violet-950/90"
            }
          >
            <span className="font-medium">Publication :</span> {autoPublishLabel}
          </p>
        ) : null}
        <p
          className={
            embedded
              ? "rounded-xl border border-brand-medium/15 bg-zinc-50/80 px-3 py-2.5 text-sm text-brand-dark/80"
              : "rounded-lg border border-violet-200/50 bg-white/70 px-3 py-2 text-sm text-violet-950/90"
          }
        >
          <span className="font-medium">Aperçu période :</span> {previewLabel}
        </p>
        {published && draftStartYmd === published.periodStartYmd ? (
          <p className="text-sm text-amber-800">
            Cette date est identique à la période affichée. La prochaine période devrait commencer après le{" "}
            {published.periodEndYmd.split("-").reverse().join("/")}.
          </p>
        ) : null}
        {formError ? <p className="text-sm text-red-700">{formError}</p> : null}
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        {published?.suggestedRenewal && !draft ? (
          <Button
            type="button"
            size="sm"
            className="border-violet-300/50 bg-white text-violet-950 hover:bg-violet-50"
            disabled={isSaving}
            onClick={() =>
              void prepareDraftFromSuggestion().catch((e) =>
                setFormError(e instanceof Error ? e.message : "Erreur"),
              )
            }
          >
            Proposer la période suivante
          </Button>
        ) : null}
        <Button type="button" size="sm" disabled={isSaving} onClick={() => void handleSave()}>
          {isSaving ? "Enregistrement…" : draft ? "Mettre à jour le brouillon" : "Créer le brouillon"}
        </Button>
        {draft && draftSessionCount >= 1 ? (
          <button
            type="button"
            disabled={isSaving}
            onClick={() => void handleClearDraft()}
            className="text-sm font-medium text-red-800 underline-offset-2 hover:underline"
          >
            Supprimer le brouillon
          </button>
        ) : null}
      </div>
    </div>
  );
}
