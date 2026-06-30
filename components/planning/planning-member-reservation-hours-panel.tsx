"use client";

import { useCallback, useEffect, useState } from "react";
import { Button, Input } from "@/components/ui";
import { useToast } from "@/components/ui/toast-provider";
import {
  DEFAULT_MEMBER_RESERVATION_CLOSE_TIME,
  DEFAULT_MEMBER_RESERVATION_OPEN_TIME,
  memberReservationHoursLabelFr,
  memberReservationHoursNoticeFr,
} from "@/lib/studio-booking-rules";
import { usePlanningPeriodStore } from "@/store/planning-period-store";

export function PlanningMemberReservationHoursPanel() {
  const { toast } = useToast();
  const bookingRules = usePlanningPeriodStore((s) => s.bookingRules);
  const setWindow = usePlanningPeriodStore((s) => s.setWindow);
  const fetchConfig = usePlanningPeriodStore((s) => s.fetchConfig);
  const [openTime, setOpenTime] = useState(DEFAULT_MEMBER_RESERVATION_OPEN_TIME);
  const [closeTime, setCloseTime] = useState(DEFAULT_MEMBER_RESERVATION_CLOSE_TIME);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void fetchConfig({ source: "admin", force: true });
  }, [fetchConfig]);

  useEffect(() => {
    if (!bookingRules) return;
    setOpenTime(bookingRules.memberReservationOpenTime);
    setCloseTime(bookingRules.memberReservationCloseTime);
  }, [bookingRules]);

  const save = useCallback(async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/planning-booking-rules", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberReservationOpenTime: openTime,
          memberReservationCloseTime: closeTime,
        }),
      });
      const data = (await res.json().catch(() => null)) as {
        error?: string;
        published?: Parameters<typeof setWindow>[0]["published"];
        draft?: Parameters<typeof setWindow>[0]["draft"];
        bookingRules?: NonNullable<typeof bookingRules>;
      } | null;
      if (!res.ok || !data?.bookingRules || !data.published) {
        throw new Error(data?.error ?? "Enregistrement impossible");
      }
      setWindow({
        published: data.published,
        draft: data.draft ?? null,
        bookingRules: data.bookingRules,
      });
      toast({
        variant: "success",
        title: "Horaires enregistrés",
        description: `Réservations adhérentes : ${memberReservationHoursLabelFr(data.bookingRules)}.`,
      });
    } catch (e) {
      toast({
        variant: "error",
        title: "Erreur",
        description: e instanceof Error ? e.message : "Enregistrement impossible",
      });
    } finally {
      setSaving(false);
    }
  }, [closeTime, openTime, setWindow, toast]);

  const previewRules = {
    memberReservationOpenTime: openTime,
    memberReservationCloseTime: closeTime,
    lateCancellationRuleEnabled: bookingRules?.lateCancellationRuleEnabled ?? true,
    lateCancellationHours: bookingRules?.lateCancellationHours ?? 6,
  };

  return (
    <div className="rounded-xl border border-brand-medium/20 bg-zinc-50/50 p-4">
      <h4 className="text-sm font-semibold text-brand-dark">Horaires de réservation en ligne</h4>
      <p className="mt-1.5 text-xs leading-relaxed text-brand-dark/70 sm:text-sm">
        {memberReservationHoursNoticeFr(previewRules)} En dehors de cette plage, les adhérentes voient le planning mais
        ne peuvent pas réserver.
      </p>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          id="member-reservation-open-time"
          label="Heure d'ouverture"
          type="time"
          value={openTime}
          onChange={(e) => setOpenTime(e.target.value)}
        />
        <Input
          id="member-reservation-close-time"
          label="Heure de fermeture"
          type="time"
          value={closeTime}
          onChange={(e) => setCloseTime(e.target.value)}
        />
      </div>

      <div className="mt-4 flex justify-end">
        <Button type="button" onClick={() => void save()} disabled={saving}>
          {saving ? "Enregistrement…" : "Enregistrer les horaires"}
        </Button>
      </div>
    </div>
  );
}
