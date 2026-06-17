"use client";

import { useCallback, useEffect, useState } from "react";
import { Button, DatePicker, SelectMenu } from "@/components/ui";
import { formatYmdLocal, startOfLocalToday } from "@/lib/calendar-day";
import { BOOKING_WINDOW_DAYS } from "@/lib/planning-booking-window";
import { PlanningPeriodAdminAlert } from "@/components/planning/planning-period-admin-alert";
import { adminPeriodAlertMessageFr } from "@/lib/planning-period-status";
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

type PlanningPeriodFormProps = {
  /** Dans le panneau « Période » : pas de carte ni bouton Annuler. */
  embedded?: boolean;
  onCancel?: () => void;
  onSaved?: () => void;
};

export function PlanningPeriodForm({ embedded = false, onCancel, onSaved }: PlanningPeriodFormProps) {
  const config = usePlanningPeriodStore((s) => s.config);
  const isSaving = usePlanningPeriodStore((s) => s.isSaving);
  const saveConfig = usePlanningPeriodStore((s) => s.saveConfig);

  const [draftWindow, setDraftWindow] = useState<PlanningBookingWindow>("WEEKLY");
  const [draftStartYmd, setDraftStartYmd] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const syncDraftFromStore = useCallback(() => {
    if (config) {
      setDraftWindow(config.bookingWindow);
      setDraftStartYmd(config.periodStartYmd);
    } else {
      setDraftWindow("WEEKLY");
      setDraftStartYmd(formatYmdLocal(startOfLocalToday()));
    }
    setFormError(null);
  }, [config]);

  useEffect(() => {
    syncDraftFromStore();
  }, [syncDraftFromStore]);

  const previewLabel =
    draftStartYmd && /^\d{4}-\d{2}-\d{2}$/.test(draftStartYmd)
      ? `Du ${draftStartYmd.split("-").reverse().join("/")} au ${previewEndYmd(draftStartYmd, draftWindow).split("-").reverse().join("/")}`
      : "—";

  const handleSubmit = async () => {
    if (!draftStartYmd.trim()) {
      setFormError("Choisissez la date de début de la période.");
      return;
    }

    setFormError(null);
    try {
      await saveConfig({
        bookingWindow: draftWindow,
        periodStartYmd: draftStartYmd,
      });
      onSaved?.();
      if (!embedded) onCancel?.();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Erreur");
    }
  };

  const fields = (
    <>
      {!embedded && config && adminPeriodAlertMessageFr(config) ? (
        <div className="mb-4">
          <PlanningPeriodAdminAlert onRenewed={onSaved} />
        </div>
      ) : null}

      <div className={embedded ? "space-y-4" : "mt-5 space-y-4"}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <SelectMenu
            id="planning-period-window"
            label="Durée de la période"
            value={draftWindow}
            onChange={(value) => setDraftWindow(value as PlanningBookingWindow)}
            options={WINDOW_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
          />
          <div>
            <DatePicker
              id="planning-period-start"
              label="Date de début"
              value={draftStartYmd}
              onChange={setDraftStartYmd}
              placeholder="JJ/MM/AAAA"
            />
            <span className="mt-1 block text-xs text-brand-dark/55">
              Ex. hier si vous avez publié le planning hier pour 15 jours
            </span>
          </div>
        </div>
        <p className="rounded-xl border border-brand-medium/15 bg-zinc-50/80 px-3 py-2.5 text-sm text-brand-dark/80">
          <span className="font-medium">Aperçu :</span> {previewLabel}
        </p>
        {formError ? <p className="text-sm text-red-700">{formError}</p> : null}
      </div>

      <div className={`flex flex-col-reverse gap-3 sm:flex-row sm:flex-wrap ${embedded ? "mt-4 justify-start" : "mt-6 justify-end"}`}>
        {!embedded && onCancel ? (
          <button
            type="button"
            disabled={isSaving}
            onClick={() => {
              syncDraftFromStore();
              onCancel();
            }}
            className="w-full rounded-full border border-brand-medium/35 bg-white px-4 py-2.5 text-sm font-medium text-brand-dark transition hover:bg-zinc-50 sm:w-auto"
          >
            Annuler
          </button>
        ) : null}
        {!embedded && config?.suggestedRenewal ? (
          <button
            type="button"
            disabled={isSaving}
            onClick={() => {
              const s = config.suggestedRenewal;
              if (!s) return;
              setDraftWindow(s.bookingWindow);
              setDraftStartYmd(s.periodStartYmd);
            }}
            className="w-full rounded-full border border-brand-medium/35 bg-white px-4 py-2.5 text-sm font-medium text-brand-dark transition hover:bg-zinc-50 sm:w-auto"
          >
            Appliquer la proposition
          </button>
        ) : null}
        <Button className="w-full sm:w-auto" onClick={() => void handleSubmit()} disabled={isSaving}>
          {isSaving ? "Enregistrement…" : "Enregistrer la période affichée"}
        </Button>
      </div>
    </>
  );

  if (embedded) {
    return <div>{fields}</div>;
  }

  return (
    <div className="rounded-2xl border border-brand-medium/20 bg-white p-4 shadow-sm sm:p-6">
      <h3 className="text-lg font-semibold text-brand-dark sm:text-xl">Période du planning</h3>
      <p className="mt-2 text-sm leading-relaxed text-brand-dark/70">
        Fixez la durée et la date de début. Les créneaux restent en place : vous décalez seulement la fenêtre pendant
        laquelle les adhérents peuvent réserver en ligne.
      </p>
      {fields}
    </div>
  );
}
