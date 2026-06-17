import "server-only";

import type { DayOfWeek } from "@prisma/client";
import { parseYmdToPrismaDate } from "@/lib/calendar-day";
import { getArchivedPlanningPeriodConfig } from "@/lib/admin/planning-period-archive";
import { draftPeriodConfigOrNull, getAdminPlanningPeriodWindow } from "@/lib/admin/planning-period-draft";
import { getPlanningPeriodConfig } from "@/lib/admin/planning-period-config";
import { dayOfWeekFromSessionYmd } from "@/lib/planning-period-day-dates";
import { isSessionYmdWithinPlanningPeriod } from "@/lib/planning-period-status";
import type { PlanningAdminScope } from "@/types/admin/planning";

export function validatePlanningAnchorSession(
  anchorSessionYmd: string | undefined,
  dayOfWeek: DayOfWeek,
  periodStartYmd: string,
  periodEndYmd: string,
): { anchorDate: Date | null; error: string | null } {
  if (!anchorSessionYmd?.trim()) {
    return { anchorDate: null, error: "Choisissez le jour de la période." };
  }

  const anchorDate = parseYmdToPrismaDate(anchorSessionYmd.trim());
  if (!anchorDate) {
    return { anchorDate: null, error: "Date du créneau invalide." };
  }

  if (!isSessionYmdWithinPlanningPeriod(anchorSessionYmd, { periodStartYmd, periodEndYmd })) {
    return {
      anchorDate: null,
      error: "Cette date est en dehors de la période sélectionnée.",
    };
  }

  const derived = dayOfWeekFromSessionYmd(anchorSessionYmd);
  if (derived !== dayOfWeek) {
    return { anchorDate: null, error: "Le jour choisi ne correspond pas à la date." };
  }

  return { anchorDate, error: null };
}

export async function validatePlanningAnchorForActivePeriod(
  anchorSessionYmd: string | undefined,
  dayOfWeek: DayOfWeek,
  scope: PlanningAdminScope = "published",
  archivePeriodStartYmd?: string,
): Promise<{ anchorDate: Date | null; error: string | null }> {
  if (scope === "archive") {
    if (!archivePeriodStartYmd?.trim()) {
      return { anchorDate: null, error: "Période historique requise." };
    }
    const archive = await getArchivedPlanningPeriodConfig(archivePeriodStartYmd.trim());
    if (!archive) {
      return { anchorDate: null, error: "Période historique introuvable." };
    }
    return validatePlanningAnchorSession(
      anchorSessionYmd,
      dayOfWeek,
      archive.periodStartYmd,
      archive.periodEndYmd,
    );
  }

  if (scope === "draft") {
    const window = await getAdminPlanningPeriodWindow();
    const draft = draftPeriodConfigOrNull(window.draft);
    if (!draft) {
      return { anchorDate: null, error: "Configurez d'abord la période brouillon." };
    }
    return validatePlanningAnchorSession(
      anchorSessionYmd,
      dayOfWeek,
      draft.periodStartYmd,
      draft.periodEndYmd,
    );
  }

  const period = await getPlanningPeriodConfig();
  return validatePlanningAnchorSession(
    anchorSessionYmd,
    dayOfWeek,
    period.periodStartYmd,
    period.periodEndYmd,
  );
}
