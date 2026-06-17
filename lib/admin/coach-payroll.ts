import "server-only";

import type { CoachPayrollMode } from "@prisma/client";
import {
  formatYmdLocal,
  formatYmdPrismaDate,
  normalizeClockHHMM,
  prismaDateInclusiveUtcRange,
  sessionEndLocalFromYmd,
} from "@/lib/calendar-day";
import { daysInCalendarMonth } from "@/lib/caisse-history-period";
import { localMonthUtcRange } from "@/lib/admin/pack-payment";
import {
  countDistinctCalendarDaysInRanges,
  getPlanningPeriodSegmentsForYearMonth,
  prorateMonthlySalaryDinars,
} from "@/lib/admin/planning-period-archive";
import { getPlanningPeriodConfig, planningWindowDays } from "@/lib/admin/planning-period-config";
import { coachPayrollModeLabelFr } from "@/lib/coach-payroll-mode";
import { courseLabel } from "@/lib/course-labels";
import {
  BOOKING_WINDOW_SHORT_FR,
  formatPeriodIntervalFr,
  intersectionOfMonthAndActivePlanningPeriod,
  partitionRangeIntoBookingPeriods,
  planningWeeklyRepetitionCount,
} from "@/lib/planning-booking-window";
import { DAY_LABEL_FR } from "@/lib/planning-public-labels";
import { planningSlotOccurrenceDates } from "@/lib/planning-slot-occurrences";
import { prisma } from "@/lib/prisma";
import type {
  CoachMonthlyChargeDto,
  CoachPayrollLineDto,
  CoachPayrollMonthSummary,
  CoachPayrollPeriodDto,
  CoachPayrollSlotDto,
  CoachSessionChargeDto,
  CoachSessionDetailDto,
} from "@/types/admin/coach-payroll";

function attendanceKey(planningId: string, sessionDateYmd: string): string {
  return `${planningId}|${sessionDateYmd}`;
}

function sessionChargeFromAttendance(
  sessionCostDinars: number,
  attendanceCount: number,
): { amountDinars: number; ratePct: number } {
  if (attendanceCount > 0) {
    return { amountDinars: sessionCostDinars, ratePct: 100 };
  }
  return { amountDinars: sessionCostDinars * 0.5, ratePct: 50 };
}

function coachDisplayName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`.trim() || "Coach";
}

function mergeCoachPayrollPeriods(
  a: CoachPayrollPeriodDto[],
  b: CoachPayrollPeriodDto[],
): CoachPayrollPeriodDto[] {
  const byFrom = new Map<string, CoachPayrollPeriodDto>();
  for (const period of [...a, ...b]) {
    const prev = byFrom.get(period.fromYmd);
    if (prev) {
      prev.sessionsInPeriod += period.sessionsInPeriod;
      prev.costDinars += period.costDinars;
    } else {
      byFrom.set(period.fromYmd, { ...period });
    }
  }
  return [...byFrom.values()].sort((x, y) => x.fromYmd.localeCompare(y.fromYmd));
}

function mergeCoachPayrollSlots(a: CoachPayrollSlotDto[], b: CoachPayrollSlotDto[]): CoachPayrollSlotDto[] {
  const byPlanning = new Map<string, CoachPayrollSlotDto>();
  for (const slot of [...a, ...b]) {
    const prev = byPlanning.get(slot.planningId);
    if (prev) {
      prev.sessionsInMonth += slot.sessionsInMonth;
      prev.sessionsUpcomingInMonth += slot.sessionsUpcomingInMonth;
      prev.monthlyCostDinars += slot.monthlyCostDinars;
    } else {
      byPlanning.set(slot.planningId, { ...slot });
    }
  }
  return [...byPlanning.values()];
}

function periodIndexForDate(occ: Date, monthPeriods: { from: Date; to: Date }[]): number {
  const t = occ.getTime();
  for (let pi = 0; pi < monthPeriods.length; pi += 1) {
    const p = monthPeriods[pi]!;
    const from = new Date(p.from.getFullYear(), p.from.getMonth(), p.from.getDate()).getTime();
    const to = new Date(p.to.getFullYear(), p.to.getMonth(), p.to.getDate()).getTime();
    if (t >= from && t <= to) return pi;
  }
  return -1;
}

function emptySummary(
  periodConfig: Awaited<ReturnType<typeof getPlanningPeriodConfig>>,
  windowDays: number,
): CoachPayrollMonthSummary {
  return {
    bookingWindow: periodConfig.bookingWindow,
    bookingWindowLabel: BOOKING_WINDOW_SHORT_FR[periodConfig.bookingWindow],
    periodStartYmd: periodConfig.periodStartYmd,
    periodEndYmd: periodConfig.periodEndYmd,
    weeklyRepetitionCount: planningWeeklyRepetitionCount(windowDays),
    billingPeriodLabel: null,
    billingFromYmd: null,
    billingToYmd: null,
    periodCount: 0,
    lines: [],
    sessionCharges: [],
    monthlyCharges: [],
    totalDinars: 0,
    sessionCoachCount: 0,
    monthlyCoachCount: 0,
    sessionPayrollTotalDinars: 0,
    monthlyPayrollTotalDinars: 0,
  };
}

function buildSessionCoachLine(
  coach: {
    id: string;
    firstName: string;
    lastName: string;
    sessionCostDinars: number | null;
    payrollMode: CoachPayrollMode;
    monthlySalaryDinars: number | null;
    planning: {
      id: string;
      dayOfWeek: keyof typeof DAY_LABEL_FR;
      anchorSessionYmd: Date | null;
      courseSlug: string;
      startTime: string;
      endTime: string;
    }[];
  },
  billingRange: { billFrom: Date; billTo: Date; billFromYmd: string; billToYmd: string },
  billingPeriodLabel: string,
  monthPeriods: { from: Date; to: Date }[],
  sessionCharges: CoachSessionChargeDto[],
  attendanceCountBySlotDate: Map<string, number>,
  now: Date,
): CoachPayrollLineDto {
  const sessionCostDinars = coach.sessionCostDinars ?? 0;
  const coachName = coachDisplayName(coach.firstName, coach.lastName);
  const slots = coach.planning;
  const recurringSlotCount = slots.length;
  const templateWeekCostDinars = recurringSlotCount * sessionCostDinars;

  const slotDtos: CoachPayrollSlotDto[] = [];
  const periodAgg = new Map<
    number,
    { sessions: number; cost: number; label: string; fromYmd: string; toYmd: string }
  >();

  for (let pi = 0; pi < monthPeriods.length; pi += 1) {
    const period = monthPeriods[pi]!;
    periodAgg.set(pi, {
      sessions: 0,
      cost: 0,
      label: formatPeriodIntervalFr(period.from, period.to),
      fromYmd: formatYmdLocal(period.from),
      toYmd: formatYmdLocal(period.to),
    });
  }

  let sessionsInMonth = 0;
  let sessionsUpcomingInMonth = 0;
  let monthlyCostDinars = 0;
  const sessionDetails: CoachSessionDetailDto[] = [];

  for (const slot of slots) {
    const startTime = normalizeClockHHMM(slot.startTime);
    const endTime = normalizeClockHHMM(slot.endTime);
    const courseLabelFr = courseLabel(slot.courseSlug);
    const dayLabel = DAY_LABEL_FR[slot.dayOfWeek];

    const occurrences = planningSlotOccurrenceDates(
      { dayOfWeek: slot.dayOfWeek, anchorSessionYmd: slot.anchorSessionYmd },
      billingRange.billFrom,
      billingRange.billTo,
    );
    let slotSessionsBilled = 0;
    let slotSessionsUpcoming = 0;
    let slotCostDinars = 0;

    for (const occ of occurrences) {
      const sessionDateYmd = formatYmdLocal(occ);
      const sessionEnd = sessionEndLocalFromYmd(sessionDateYmd, endTime);
      const isPast = sessionEnd != null && now.getTime() >= sessionEnd.getTime();

      const pi = periodIndexForDate(occ, monthPeriods);
      const periodLabel =
        pi >= 0 ? formatPeriodIntervalFr(monthPeriods[pi]!.from, monthPeriods[pi]!.to) : billingPeriodLabel;
      const timeLabel = `${dayLabel} ${startTime}–${endTime}`;
      const detailId = `coach-${coach.id}-${slot.id}-${sessionDateYmd}`;

      if (!isPast) {
        slotSessionsUpcoming += 1;
        sessionsUpcomingInMonth += 1;
        sessionDetails.push({
          id: detailId,
          planningId: slot.id,
          sessionDateYmd,
          dayLabel,
          startTime,
          endTime,
          courseLabel: courseLabelFr,
          timeLabel,
          isBilled: false,
          attendanceCount: 0,
          ratePct: null,
          amountDinars: null,
          periodLabel,
          periodIndex: pi >= 0 ? pi : 0,
        });
        continue;
      }

      const attendanceCount =
        attendanceCountBySlotDate.get(attendanceKey(slot.id, sessionDateYmd)) ?? 0;
      const { amountDinars, ratePct } = sessionChargeFromAttendance(sessionCostDinars, attendanceCount);

      slotSessionsBilled += 1;
      sessionsInMonth += 1;
      slotCostDinars += amountDinars;
      monthlyCostDinars += amountDinars;

      if (pi >= 0) {
        const agg = periodAgg.get(pi)!;
        agg.sessions += 1;
        agg.cost += amountDinars;
      }

      sessionCharges.push({
        id: detailId,
        coachId: coach.id,
        coachName,
        sessionDateYmd,
        courseLabel: courseLabelFr,
        timeLabel,
        amountDinars,
        attendanceCount,
        ratePct,
        periodLabel,
        periodIndex: pi >= 0 ? pi : 0,
      });

      sessionDetails.push({
        id: detailId,
        planningId: slot.id,
        sessionDateYmd,
        dayLabel,
        startTime,
        endTime,
        courseLabel: courseLabelFr,
        timeLabel,
        isBilled: true,
        attendanceCount,
        ratePct,
        amountDinars,
        periodLabel,
        periodIndex: pi >= 0 ? pi : 0,
      });
    }

    slotDtos.push({
      planningId: slot.id,
      dayOfWeek: slot.dayOfWeek,
      dayLabel,
      courseSlug: slot.courseSlug,
      courseLabel: courseLabelFr,
      startTime,
      endTime,
      sessionsInMonth: slotSessionsBilled,
      sessionsUpcomingInMonth: slotSessionsUpcoming,
      sessionCostDinars,
      monthlyCostDinars: slotCostDinars,
    });
  }

  sessionDetails.sort((a, b) => {
    const byDate = a.sessionDateYmd.localeCompare(b.sessionDateYmd);
    if (byDate !== 0) return byDate;
    return a.timeLabel.localeCompare(b.timeLabel);
  });

  const periods: CoachPayrollPeriodDto[] = [...periodAgg.entries()]
    .map(([periodIndex, agg]) => ({
      periodIndex,
      fromYmd: agg.fromYmd,
      toYmd: agg.toYmd,
      periodLabel: agg.label,
      sessionsInPeriod: agg.sessions,
      costDinars: agg.cost,
    }))
    .filter((p) => p.sessionsInPeriod > 0);

  return {
    coachId: coach.id,
    coachName,
    payrollMode: "PER_SESSION",
    payrollModeLabel: coachPayrollModeLabelFr("PER_SESSION"),
    sessionCostDinars,
    monthlySalaryDinars: coach.monthlySalaryDinars ?? 0,
    recurringSlotCount,
    templateWeekCostDinars,
    sessionsInMonth,
    sessionsUpcomingInMonth,
    monthlyCostDinars,
    slots: slotDtos,
    periods,
    sessionDetails,
  };
}

function buildMonthlyCoachLine(coach: {
  id: string;
  firstName: string;
  lastName: string;
  sessionCostDinars: number | null;
  monthlySalaryDinars: number | null;
  payrollMode: CoachPayrollMode;
}): CoachPayrollLineDto {
  const monthlySalaryDinars = coach.monthlySalaryDinars ?? 0;
  return {
    coachId: coach.id,
    coachName: coachDisplayName(coach.firstName, coach.lastName),
    payrollMode: "PER_MONTH",
    payrollModeLabel: coachPayrollModeLabelFr("PER_MONTH"),
    sessionCostDinars: coach.sessionCostDinars ?? 0,
    monthlySalaryDinars,
    recurringSlotCount: 0,
    templateWeekCostDinars: 0,
    sessionsInMonth: 0,
    sessionsUpcomingInMonth: 0,
    monthlyCostDinars: monthlySalaryDinars,
    slots: [],
    periods: [],
    sessionDetails: [],
  };
}

type BillingSegment = {
  periodConfig: Awaited<ReturnType<typeof getPlanningPeriodConfig>>;
  billFrom: Date;
  billTo: Date;
  billFromYmd: string;
  billToYmd: string;
  windowDays: number;
};

/**
 * Charges coach actifs uniquement :
 * - Créneaux planning PUBLIÉS uniquement (isDraft: false) — le brouillon n'entre jamais en caisse.
 * - Plage = union des intersections (mois calendaire × chaque période archivée ou actuelle).
 * - PER_SESSION : après fin du créneau uniquement ; 100 % si ≥1 présence, sinon 50 % (pas de réservation)
 * - PER_MONTH : forfait proratisé selon les jours du mois couverts par les périodes planning
 */
export async function computeCoachPayrollForMonth(yearMonth: string): Promise<CoachPayrollMonthSummary> {
  const monthRange = localMonthUtcRange(yearMonth);
  const fallbackConfig = await getPlanningPeriodConfig();
  const fallbackWindowDays = planningWindowDays(fallbackConfig.bookingWindow);

  if (!monthRange) {
    return emptySummary(fallbackConfig, fallbackWindowDays);
  }

  const periodSegments = await getPlanningPeriodSegmentsForYearMonth(yearMonth);
  const segmentRanges: BillingSegment[] = [];

  for (const periodConfig of periodSegments) {
    const intersection = intersectionOfMonthAndActivePlanningPeriod(
      periodConfig.periodStartYmd,
      periodConfig.periodEndYmd,
      monthRange.from,
      monthRange.to,
    );
    if (!intersection) continue;
    segmentRanges.push({
      periodConfig,
      billFrom: intersection.billFrom,
      billTo: intersection.billTo,
      billFromYmd: intersection.billFromYmd,
      billToYmd: intersection.billToYmd,
      windowDays: planningWindowDays(periodConfig.bookingWindow),
    });
  }

  if (segmentRanges.length === 0) {
    return emptySummary(fallbackConfig, fallbackWindowDays);
  }

  const billingFrom = segmentRanges.reduce(
    (min, s) => (s.billFrom < min ? s.billFrom : min),
    segmentRanges[0]!.billFrom,
  );
  const billingTo = segmentRanges.reduce(
    (max, s) => (s.billTo > max ? s.billTo : max),
    segmentRanges[0]!.billTo,
  );
  const billingRange = {
    billFrom: billingFrom,
    billTo: billingTo,
    billFromYmd: formatYmdLocal(billingFrom),
    billToYmd: formatYmdLocal(billingTo),
  };

  const primaryConfig = segmentRanges[0]!.periodConfig;
  const windowDays = segmentRanges[0]!.windowDays;
  const billingPeriodLabel = formatPeriodIntervalFr(billingRange.billFrom, billingRange.billTo);
  const monthPeriods = partitionRangeIntoBookingPeriods(
    billingRange.billFrom,
    billingRange.billTo,
    windowDays,
  );

  const coaches = await prisma.coach.findMany({
    where: {
      isActive: true,
      OR: [
        { payrollMode: "PER_SESSION", sessionCostDinars: { gt: 0 } },
        { payrollMode: "PER_MONTH", monthlySalaryDinars: { gt: 0 } },
      ],
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      sessionCostDinars: true,
      monthlySalaryDinars: true,
      payrollMode: true,
      planning: {
        where: { isDraft: false },
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
    orderBy: [{ payrollMode: "asc" }, { lastName: "asc" }, { firstName: "asc" }],
  });

  const lines: CoachPayrollLineDto[] = [];
  const sessionChargesById = new Map<string, CoachSessionChargeDto>();
  const monthlyCharges: CoachMonthlyChargeDto[] = [];
  const now = new Date();

  const sessionPlanningIds = coaches
    .filter((c) => c.payrollMode === "PER_SESSION")
    .flatMap((c) => c.planning.map((p) => p.id));

  const attendanceDateRange = prismaDateInclusiveUtcRange(billingRange.billFrom, billingRange.billTo);

  const attendanceRows =
    sessionPlanningIds.length > 0
      ? await prisma.attendance.findMany({
          where: {
            planningId: { in: sessionPlanningIds },
            sessionDate: attendanceDateRange,
          },
          select: { planningId: true, sessionDate: true },
        })
      : [];

  const attendanceCountBySlotDate = new Map<string, number>();
  for (const row of attendanceRows) {
    const ymd = formatYmdPrismaDate(row.sessionDate);
    const key = attendanceKey(row.planningId, ymd);
    attendanceCountBySlotDate.set(key, (attendanceCountBySlotDate.get(key) ?? 0) + 1);
  }

  const coveredPlanningDays = countDistinctCalendarDaysInRanges(
    segmentRanges.map((s) => ({ from: s.billFrom, to: s.billTo })),
  );
  const monthDays = daysInCalendarMonth(yearMonth);

  const sessionCoachLines = new Map<string, CoachPayrollLineDto>();

  for (const coach of coaches) {
    if (coach.payrollMode === "PER_MONTH") {
      const salary = coach.monthlySalaryDinars ?? 0;
      if (salary <= 0) continue;

      const amountDinars = prorateMonthlySalaryDinars(salary, coveredPlanningDays, monthDays);
      if (amountDinars <= 0) continue;

      const line = buildMonthlyCoachLine(coach);
      line.monthlyCostDinars = amountDinars;
      lines.push(line);
      monthlyCharges.push({
        id: `coach-monthly-${coach.id}-${yearMonth}`,
        coachId: coach.id,
        coachName: line.coachName,
        amountDinars,
        yearMonth,
      });
      continue;
    }

    const cost = coach.sessionCostDinars ?? 0;
    if (cost <= 0) continue;

    for (const segment of segmentRanges) {
      const segmentBilling = {
        billFrom: segment.billFrom,
        billTo: segment.billTo,
        billFromYmd: segment.billFromYmd,
        billToYmd: segment.billToYmd,
      };
      const segmentLabel = formatPeriodIntervalFr(segment.billFrom, segment.billTo);
      const segmentMonthPeriods = partitionRangeIntoBookingPeriods(
        segment.billFrom,
        segment.billTo,
        segment.windowDays,
      );

      const segmentLine = buildSessionCoachLine(
        coach,
        segmentBilling,
        segmentLabel,
        segmentMonthPeriods,
        [],
        attendanceCountBySlotDate,
        now,
      );

      for (const charge of segmentLine.sessionDetails) {
        if (!charge.isBilled || charge.amountDinars == null) continue;
        const chargeDto: CoachSessionChargeDto = {
          id: charge.id,
          coachId: coach.id,
          coachName: segmentLine.coachName,
          sessionDateYmd: charge.sessionDateYmd,
          courseLabel: charge.courseLabel,
          timeLabel: charge.timeLabel,
          amountDinars: charge.amountDinars,
          attendanceCount: charge.attendanceCount,
          ratePct: charge.ratePct ?? 50,
          periodLabel: charge.periodLabel,
          periodIndex: charge.periodIndex,
        };
        sessionChargesById.set(charge.id, chargeDto);
      }

      const existing = sessionCoachLines.get(coach.id);
      if (!existing) {
        sessionCoachLines.set(coach.id, segmentLine);
      } else {
        existing.sessionsInMonth += segmentLine.sessionsInMonth;
        existing.sessionsUpcomingInMonth += segmentLine.sessionsUpcomingInMonth;
        existing.monthlyCostDinars += segmentLine.monthlyCostDinars;
        existing.sessionDetails.push(...segmentLine.sessionDetails);
        existing.periods = mergeCoachPayrollPeriods(existing.periods, segmentLine.periods);
        existing.slots = mergeCoachPayrollSlots(existing.slots, segmentLine.slots);
      }
    }
  }

  for (const line of sessionCoachLines.values()) {
    line.sessionDetails.sort((a, b) => {
      const byDate = a.sessionDateYmd.localeCompare(b.sessionDateYmd);
      if (byDate !== 0) return byDate;
      return a.timeLabel.localeCompare(b.timeLabel);
    });
    lines.push(line);
  }

  const sessionCharges = [...sessionChargesById.values()];

  sessionCharges.sort((a, b) => {
    const byDate = b.sessionDateYmd.localeCompare(a.sessionDateYmd);
    if (byDate !== 0) return byDate;
    return a.periodIndex - b.periodIndex;
  });

  const sessionLines = lines.filter((l) => l.payrollMode === "PER_SESSION");
  const monthlyLines = lines.filter((l) => l.payrollMode === "PER_MONTH");
  const sessionPayrollTotalDinars = sessionLines.reduce((s, l) => s + l.monthlyCostDinars, 0);
  const monthlyPayrollTotalDinars = monthlyLines.reduce((s, l) => s + l.monthlyCostDinars, 0);

  return {
    bookingWindow: primaryConfig.bookingWindow,
    bookingWindowLabel: BOOKING_WINDOW_SHORT_FR[primaryConfig.bookingWindow],
    periodStartYmd: primaryConfig.periodStartYmd,
    periodEndYmd: primaryConfig.periodEndYmd,
    weeklyRepetitionCount: planningWeeklyRepetitionCount(windowDays),
    billingPeriodLabel,
    billingFromYmd: billingRange.billFromYmd,
    billingToYmd: billingRange.billToYmd,
    periodCount: monthPeriods.length,
    lines,
    sessionCharges,
    monthlyCharges,
    totalDinars: sessionPayrollTotalDinars + monthlyPayrollTotalDinars,
    sessionCoachCount: sessionLines.length,
    monthlyCoachCount: monthlyLines.length,
    sessionPayrollTotalDinars,
    monthlyPayrollTotalDinars,
  };
}
