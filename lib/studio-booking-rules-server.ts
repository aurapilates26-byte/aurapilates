import "server-only";

import {
  DEFAULT_STUDIO_BOOKING_RULES,
  type StudioBookingRules,
} from "@/lib/studio-booking-rules";
import { prisma } from "@/lib/prisma";

const SINGLETON_ID = "singleton";

export async function getStudioBookingRules(): Promise<StudioBookingRules> {
  const row = await prisma.studioPlanningPeriod.findUnique({
    where: { id: SINGLETON_ID },
    select: { lateCancellationRuleEnabled: true },
  });

  if (!row) return DEFAULT_STUDIO_BOOKING_RULES;

  return {
    lateCancellationRuleEnabled: row.lateCancellationRuleEnabled,
    lateCancellationHours: DEFAULT_STUDIO_BOOKING_RULES.lateCancellationHours,
  };
}

export async function saveLateCancellationRuleEnabled(enabled: boolean): Promise<StudioBookingRules> {
  await prisma.studioPlanningPeriod.upsert({
    where: { id: SINGLETON_ID },
    create: {
      id: SINGLETON_ID,
      bookingWindow: "WEEKLY",
      periodStartDate: new Date(),
      lateCancellationRuleEnabled: enabled,
    },
    update: { lateCancellationRuleEnabled: enabled },
  });

  return getStudioBookingRules();
}
