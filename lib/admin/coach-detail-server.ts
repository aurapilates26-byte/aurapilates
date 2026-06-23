import "server-only";

import { formatYmdLocal, normalizeClockHHMM, parseYmdLocal, parseYmdToPrismaDate } from "@/lib/calendar-day";
import { planningSlotOccurrenceDates } from "@/lib/planning-slot-occurrences";
import { getPlanningPeriodConfig, planningWindowDays } from "@/lib/admin/planning-period-config";
import { computeCoachPayrollForMonth } from "@/lib/admin/coach-payroll";
import { currentYearMonth } from "@/lib/admin/caisse-summary";
import { courseLabel } from "@/lib/course-labels";
import {
  formatPeriodIntervalFr,
  partitionRangeIntoBookingPeriods,
  planningWeeklyRepetitionCount,
} from "@/lib/planning-booking-window";
import { DAY_LABEL_FR } from "@/lib/planning-public-labels";
import { prisma } from "@/lib/prisma";
import type { CoachPayrollMode } from "@prisma/client";
import { coachPayrollModeLabelFr } from "@/lib/coach-payroll-mode";
import type { PlanningDayOfWeek } from "@/types/admin/planning";
import type { PlanningPeriodConfig } from "@/types/admin/planning";
import { listArchivedPlanningPeriodsForAdmin } from "@/lib/admin/planning-period-archive";
import { getCoachAssignedQrCode, type CoachQrCodeDto } from "@/lib/admin/coach-qrcode-server";

export type CoachPlanningSlotDetail = {
  planningId: string;
  dayOfWeek: PlanningDayOfWeek;
  dayLabel: string;
  courseSlug: string;
  courseLabel: string;
  startTime: string;
  endTime: string;
  sessionsInActivePeriod: number;
};

export type CoachPeriodBlockDto = {
  periodIndex: number;
  fromYmd: string;
  toYmd: string;
  periodLabel: string;
  sessionsInPeriod: number;
  slots: CoachPlanningSlotDetail[];
};

export type CoachPeriodSummaryDto = {
  periodStartYmd: string;
  periodEndYmd: string;
  periodLabel: string;
  sessionsInPeriod: number;
  slots: CoachPlanningSlotDetail[];
};

export type CoachDetailData = {
  id: string;
  imageUrl: string | null;
  firstName: string;
  lastName: string;
  description: string | null;
  email: string | null;
  phone: string | null;
  payrollMode: CoachPayrollMode;
  payrollModeLabel: string;
  sessionCostDinars: number | null;
  monthlySalaryDinars: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  periodConfig: PlanningPeriodConfig;
  weeklyRepetitionCount: number;
  totalSessionsInActivePeriod: number;
  totalCostActivePeriodDinars: number;
  periodBlocks: CoachPeriodBlockDto[];
  slotsByDay: Record<PlanningDayOfWeek, CoachPlanningSlotDetail[]>;
  archivedPeriods: CoachPeriodSummaryDto[];
  monthYearMonth: string;
  sessionsInMonth: number;
  monthlyCostDinars: number;
  qrCode: CoachQrCodeDto | null;
};

const ORDERED_DAYS: PlanningDayOfWeek[] = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

function buildSlotDetail(
  slot: {
    id: string;
    dayOfWeek: PlanningDayOfWeek;
    anchorSessionYmd: Date | null;
    courseSlug: string;
    startTime: string;
    endTime: string;
  },
  from: Date,
  to: Date,
): CoachPlanningSlotDetail {
  const occurrences = planningSlotOccurrenceDates(
    { dayOfWeek: slot.dayOfWeek, anchorSessionYmd: slot.anchorSessionYmd },
    from,
    to,
  );
  return {
    planningId: slot.id,
    dayOfWeek: slot.dayOfWeek,
    dayLabel: DAY_LABEL_FR[slot.dayOfWeek],
    courseSlug: slot.courseSlug,
    courseLabel: courseLabel(slot.courseSlug),
    startTime: normalizeClockHHMM(slot.startTime),
    endTime: normalizeClockHHMM(slot.endTime),
    sessionsInActivePeriod: occurrences.length,
  };
}

export async function getCoachDetailById(id: string): Promise<CoachDetailData | null> {
  const periodConfig = await getPlanningPeriodConfig();
  const periodStart = parseYmdLocal(periodConfig.periodStartYmd);
  const periodEnd = parseYmdLocal(periodConfig.periodEndYmd);
  if (!periodStart || !periodEnd) return null;
  const periodStartDb = parseYmdToPrismaDate(periodConfig.periodStartYmd);
  const periodEndDb = parseYmdToPrismaDate(periodConfig.periodEndYmd);
  if (!periodStartDb || !periodEndDb) return null;

  const coach = await prisma.coach.findUnique({
    where: { id },
    select: {
      id: true,
      imageUrl: true,
      firstName: true,
      lastName: true,
      description: true,
      email: true,
      phone: true,
      payrollMode: true,
      sessionCostDinars: true,
      monthlySalaryDinars: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      planning: {
        // Aligné sur /api/admin/planning?scope=published :
        // uniquement créneaux publiés ancrés dans la période active.
        where: {
          isDraft: false,
          anchorSessionYmd: { gte: periodStartDb, lte: periodEndDb },
        },
        select: {
          id: true,
          dayOfWeek: true,
          anchorSessionYmd: true,
          courseSlug: true,
          startTime: true,
          endTime: true,
        },
        orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
      },
    },
  });

  if (!coach) return null;

  const windowDays = planningWindowDays(periodConfig.bookingWindow);
  const weeklyRepetitionCount = planningWeeklyRepetitionCount(windowDays);
  const weekPeriods = partitionRangeIntoBookingPeriods(periodStart, periodEnd, windowDays);

  const slots = coach.planning.map((s) => ({
    ...s,
    dayOfWeek: s.dayOfWeek as PlanningDayOfWeek,
  }));

  const periodBlocks: CoachPeriodBlockDto[] = weekPeriods.map((period, periodIndex) => {
    const blockSlots = slots.map((slot) => buildSlotDetail(slot, period.from, period.to));
    const sessionsInPeriod = blockSlots.reduce((sum, s) => sum + s.sessionsInActivePeriod, 0);
    return {
      periodIndex,
      fromYmd: formatYmdLocal(period.from),
      toYmd: formatYmdLocal(period.to),
      periodLabel: formatPeriodIntervalFr(period.from, period.to),
      sessionsInPeriod,
      slots: blockSlots,
    };
  });

  const allSlotDetails = slots.map((slot) => buildSlotDetail(slot, periodStart, periodEnd));
  const totalSessionsInActivePeriod = allSlotDetails.reduce((sum, s) => sum + s.sessionsInActivePeriod, 0);

  const slotsByDay = ORDERED_DAYS.reduce(
    (acc, day) => {
      acc[day] = allSlotDetails.filter((s) => s.dayOfWeek === day);
      return acc;
    },
    {} as Record<PlanningDayOfWeek, CoachPlanningSlotDetail[]>,
  );

  const monthYearMonth = currentYearMonth();
  const payroll = await computeCoachPayrollForMonth(monthYearMonth);
  const line = payroll.lines.find((l) => l.coachId === coach.id);
  const qrCode = await getCoachAssignedQrCode(coach.id);

  const totalCostActivePeriodDinars =
    line?.monthlyCostDinars ??
    (coach.payrollMode === "PER_MONTH" ? (coach.monthlySalaryDinars ?? 0) : 0);
  const sessionsInMonth =
    coach.payrollMode === "PER_SESSION" ? (line?.sessionsInMonth ?? 0) : 0;

  const archivedConfigs = (await listArchivedPlanningPeriodsForAdmin()).slice(0, 12);
  const archivedPeriods: CoachPeriodSummaryDto[] = [];
  for (const archive of archivedConfigs) {
    const startDb = parseYmdToPrismaDate(archive.periodStartYmd);
    const endDb = parseYmdToPrismaDate(archive.periodEndYmd);
    const startLocal = parseYmdLocal(archive.periodStartYmd);
    const endLocal = parseYmdLocal(archive.periodEndYmd);
    if (!startDb || !endDb || !startLocal || !endLocal) continue;

    const archivedSlots = await prisma.planning.findMany({
      where: {
        coachId: coach.id,
        isDraft: false,
        anchorSessionYmd: { gte: startDb, lte: endDb },
      },
      select: {
        id: true,
        dayOfWeek: true,
        anchorSessionYmd: true,
        courseSlug: true,
        startTime: true,
        endTime: true,
      },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    });

    const slotDetails = archivedSlots.map((s) =>
      buildSlotDetail({ ...s, dayOfWeek: s.dayOfWeek as PlanningDayOfWeek }, startLocal, endLocal),
    );
    archivedPeriods.push({
      periodStartYmd: archive.periodStartYmd,
      periodEndYmd: archive.periodEndYmd,
      periodLabel: archive.periodLabel,
      sessionsInPeriod: slotDetails.reduce((sum, s) => sum + s.sessionsInActivePeriod, 0),
      slots: slotDetails,
    });
  }

  return {
    id: coach.id,
    imageUrl: coach.imageUrl,
    firstName: coach.firstName,
    lastName: coach.lastName,
    description: coach.description,
    email: coach.email,
    phone: coach.phone,
    payrollMode: coach.payrollMode,
    payrollModeLabel: coachPayrollModeLabelFr(coach.payrollMode),
    sessionCostDinars: coach.sessionCostDinars,
    monthlySalaryDinars: coach.monthlySalaryDinars,
    isActive: coach.isActive,
    createdAt: coach.createdAt.toISOString(),
    updatedAt: coach.updatedAt.toISOString(),
    periodConfig,
    weeklyRepetitionCount,
    totalSessionsInActivePeriod,
    totalCostActivePeriodDinars,
    periodBlocks,
    slotsByDay,
    archivedPeriods,
    monthYearMonth,
    sessionsInMonth,
    monthlyCostDinars: line?.monthlyCostDinars ?? 0,
    qrCode,
  };
}
