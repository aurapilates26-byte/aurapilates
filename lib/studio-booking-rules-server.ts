import "server-only";

import {
  DEFAULT_STUDIO_BOOKING_RULES,
  normalizeReservationClockHHMM,
  type StudioBookingRules,
  validateMemberReservationHours,
} from "@/lib/studio-booking-rules";
import { prisma } from "@/lib/prisma";

const SINGLETON_ID = "singleton";

function mapBookingRules(row: {
  lateCancellationRuleEnabled: boolean;
  memberReservationOpenTime: string;
  memberReservationCloseTime: string;
}): StudioBookingRules {
  return {
    lateCancellationRuleEnabled: row.lateCancellationRuleEnabled,
    lateCancellationHours: DEFAULT_STUDIO_BOOKING_RULES.lateCancellationHours,
    memberReservationOpenTime:
      normalizeReservationClockHHMM(row.memberReservationOpenTime) ??
      DEFAULT_STUDIO_BOOKING_RULES.memberReservationOpenTime,
    memberReservationCloseTime:
      normalizeReservationClockHHMM(row.memberReservationCloseTime) ??
      DEFAULT_STUDIO_BOOKING_RULES.memberReservationCloseTime,
  };
}

export async function getStudioBookingRules(): Promise<StudioBookingRules> {
  const row = await prisma.studioPlanningPeriod.findUnique({
    where: { id: SINGLETON_ID },
    select: {
      lateCancellationRuleEnabled: true,
      memberReservationOpenTime: true,
      memberReservationCloseTime: true,
    },
  });

  if (!row) return DEFAULT_STUDIO_BOOKING_RULES;

  return mapBookingRules(row);
}

export type SaveStudioBookingRulesInput = {
  lateCancellationRuleEnabled?: boolean;
  memberReservationOpenTime?: string;
  memberReservationCloseTime?: string;
};

export async function saveStudioBookingRules(
  input: SaveStudioBookingRulesInput,
): Promise<StudioBookingRules> {
  if (input.memberReservationOpenTime != null || input.memberReservationCloseTime != null) {
    const current = await getStudioBookingRules();
    const open = input.memberReservationOpenTime ?? current.memberReservationOpenTime;
    const close = input.memberReservationCloseTime ?? current.memberReservationCloseTime;
    const hoursError = validateMemberReservationHours(open, close);
    if (hoursError) {
      throw new Error(hoursError);
    }
  }

  const openNormalized =
    input.memberReservationOpenTime != null
      ? normalizeReservationClockHHMM(input.memberReservationOpenTime)
      : undefined;
  const closeNormalized =
    input.memberReservationCloseTime != null
      ? normalizeReservationClockHHMM(input.memberReservationCloseTime)
      : undefined;

  if (input.memberReservationOpenTime != null && !openNormalized) {
    throw new Error("Heure d'ouverture invalide.");
  }
  if (input.memberReservationCloseTime != null && !closeNormalized) {
    throw new Error("Heure de fermeture invalide.");
  }

  await prisma.studioPlanningPeriod.upsert({
    where: { id: SINGLETON_ID },
    create: {
      id: SINGLETON_ID,
      bookingWindow: "WEEKLY",
      periodStartDate: new Date(),
      lateCancellationRuleEnabled: input.lateCancellationRuleEnabled ?? true,
      memberReservationOpenTime: openNormalized ?? DEFAULT_STUDIO_BOOKING_RULES.memberReservationOpenTime,
      memberReservationCloseTime: closeNormalized ?? DEFAULT_STUDIO_BOOKING_RULES.memberReservationCloseTime,
    },
    update: {
      ...(input.lateCancellationRuleEnabled != null
        ? { lateCancellationRuleEnabled: input.lateCancellationRuleEnabled }
        : {}),
      ...(openNormalized ? { memberReservationOpenTime: openNormalized } : {}),
      ...(closeNormalized ? { memberReservationCloseTime: closeNormalized } : {}),
    },
  });

  return getStudioBookingRules();
}

/** @deprecated Utiliser saveStudioBookingRules */
export async function saveLateCancellationRuleEnabled(enabled: boolean): Promise<StudioBookingRules> {
  return saveStudioBookingRules({ lateCancellationRuleEnabled: enabled });
}
