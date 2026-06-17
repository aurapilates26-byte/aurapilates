"use client";

import { useMemo } from "react";
import { DashboardOverviewCards } from "@/components/dashboard/overview-cards";
import { parseYmdLocal } from "@/lib/calendar-day";
import { useMemberBookingStore } from "@/store/member/member-booking-store";

type MemberOverviewStats = NonNullable<Parameters<typeof DashboardOverviewCards>[0]["memberStats"]>;

type Props = {
  initialStats: MemberOverviewStats;
};

function formatNextSessionFromReservation(
  sessionDate: string,
  startTime: string,
): { dayAndTime: string; dateYmd: string } {
  const cal = parseYmdLocal(sessionDate);
  if (!cal) return { dayAndTime: "—", dateYmd: "—" };
  const weekday = cal
    .toLocaleDateString("fr-FR", { weekday: "long" })
    .replace(/^\p{L}/u, (c) => c.toUpperCase());
  const day = String(cal.getDate()).padStart(2, "0");
  const month = String(cal.getMonth() + 1).padStart(2, "0");
  const year = cal.getFullYear();
  return {
    dayAndTime: `${weekday} · ${startTime}`,
    dateYmd: `${day}/${month}/${year}`,
  };
}

/** Cartes dashboard membre : valeurs SSR puis mises à jour via le store après réservation / annulation. */
export function DashboardOverviewCardsMember({ initialStats }: Props) {
  const packSummary = useMemberBookingStore((s) => s.packSummary);
  const myReservations = useMemberBookingStore((s) => s.myReservations);

  const memberStats = useMemo((): MemberOverviewStats => {
    const activePrefix = initialStats.subscriptionStatusLine?.startsWith("Inactif") ? "Inactif" : "Actif";

    const next = myReservations[0];
    const nextFormatted = next
      ? formatNextSessionFromReservation(next.sessionDate, next.planning.startTime)
      : null;

    const subscriptionStatusLine = packSummary
      ? packSummary.mixedRemainingLine
        ? `${activePrefix} · ${packSummary.mixedRemainingLine}`
        : packSummary.totalSessions != null
          ? `${activePrefix} reste ${packSummary.remainingSessions ?? 0}/${packSummary.totalSessions}`
          : initialStats.subscriptionStatusLine
      : initialStats.subscriptionStatusLine;

    return {
      ...initialStats,
      reservedThisWeek: packSummary?.reservedConfirmed ?? initialStats.reservedThisWeek,
      reservedWaitlist: packSummary?.reservedWaitlist ?? 0,
      nextSessionDateYmd: nextFormatted?.dateYmd ?? initialStats.nextSessionDateYmd,
      nextSessionDayAndTime: nextFormatted?.dayAndTime ?? initialStats.nextSessionDayAndTime,
      subscriptionStatusLine,
    };
  }, [initialStats, myReservations, packSummary]);

  return <DashboardOverviewCards memberStats={memberStats} />;
}
