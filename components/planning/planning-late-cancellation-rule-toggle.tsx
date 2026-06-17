"use client";

import { useCallback, useEffect, useState } from "react";
import { useToast } from "@/components/ui/toast-provider";
import { usePlanningPeriodStore } from "@/store/planning-period-store";

export function PlanningLateCancellationRuleToggle() {
  const { toast } = useToast();
  const bookingRules = usePlanningPeriodStore((s) => s.bookingRules);
  const setWindow = usePlanningPeriodStore((s) => s.setWindow);
  const fetchConfig = usePlanningPeriodStore((s) => s.fetchConfig);
  const [enabled, setEnabled] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (bookingRules) setEnabled(bookingRules.lateCancellationRuleEnabled);
  }, [bookingRules]);

  useEffect(() => {
    void fetchConfig({ source: "admin", force: true });
  }, [fetchConfig]);

  const save = useCallback(
    async (next: boolean) => {
      setSaving(true);
      try {
        const res = await fetch("/api/admin/planning/booking-rules", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lateCancellationRuleEnabled: next }),
        });
        const data = (await res.json().catch(() => null)) as {
          error?: string;
          published?: Parameters<typeof setWindow>[0]["published"];
          draft?: Parameters<typeof setWindow>[0]["draft"];
          bookingRules?: { lateCancellationRuleEnabled: boolean; lateCancellationHours: number };
        } | null;
        if (!res.ok || !data?.bookingRules || !data.published) {
          throw new Error(data?.error ?? "Enregistrement impossible");
        }
        setEnabled(next);
        setWindow({
          published: data.published,
          draft: data.draft ?? null,
          bookingRules: data.bookingRules,
        });
        toast({
          variant: "success",
          title: "Règle enregistrée",
          description: next
            ? "Annulation tardive (< 6 h) : la séance n'est pas rendue au pack."
            : "Toute annulation membre rend la séance au pack.",
        });
      } catch (e) {
        setEnabled(!next);
        toast({
          variant: "error",
          title: "Erreur",
          description: e instanceof Error ? e.message : "Enregistrement impossible",
        });
      } finally {
        setSaving(false);
      }
    },
    [setWindow, toast],
  );

  const hours = bookingRules?.lateCancellationHours ?? 6;

  return (
    <div className="rounded-xl border border-brand-medium/20 bg-zinc-50/50 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-semibold text-brand-dark">Annulation tardive (adhérentes)</h4>
          <p className="mt-1.5 text-xs leading-relaxed text-brand-dark/70 sm:text-sm">
            {enabled ? (
              <>
                <span className="font-medium text-brand-dark">Règle activée :</span> si une adhérente annule moins de{" "}
                {hours} h avant le cours, la séance <span className="font-medium">n&apos;est pas rendue</span> au pack.
                À {hours} h ou plus, la séance est rendue (+1).
              </>
            ) : (
              <>
                <span className="font-medium text-brand-dark">Règle désactivée :</span> toute annulation membre rend la
                séance au pack, quelle que soit l&apos;heure.
              </>
            )}
          </p>
        </div>
        <label className="flex shrink-0 cursor-pointer items-center gap-2.5 rounded-lg border border-brand-medium/25 bg-white px-3 py-2">
          <input
            type="checkbox"
            checked={enabled}
            disabled={saving}
            onChange={(e) => {
              const next = e.target.checked;
              setEnabled(next);
              void save(next);
            }}
            className="h-4 w-4 rounded border-brand-medium/35"
          />
          <span className="text-xs font-semibold text-brand-dark sm:text-sm">
            {saving ? "Enregistrement…" : enabled ? "Activée" : "Désactivée"}
          </span>
        </label>
      </div>
    </div>
  );
}
