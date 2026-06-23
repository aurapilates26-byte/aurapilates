import "server-only";

import { formatYmdLocal, parseYmdToPrismaDate, startOfLocalToday } from "@/lib/calendar-day";
import { currentYearMonth, normalizeYearMonthParam } from "@/lib/admin/caisse-summary";
import { computeCoachPayrollForMonth } from "@/lib/admin/coach-payroll";
import {
  getCoachDetailById,
  type CoachPeriodBlockDto,
  type CoachPeriodSummaryDto,
  type CoachPlanningSlotDetail,
} from "@/lib/admin/coach-detail-server";
import { yearMonthFromDate } from "@/lib/admin/pack-payment";
import { coachPayrollModeLabelFr } from "@/lib/coach-payroll-mode";
import { prisma } from "@/lib/prisma";
import type { CoachPayrollPeriodDto, CoachSessionDetailDto } from "@/types/admin/coach-payroll";
import type { PlanningDayOfWeek, PlanningPeriodConfig } from "@/types/admin/planning";

export type CoachSpaceReservationDto = {
  id: string;
  memberName: string;
  status: string;
  attended: boolean;
};

export type CoachSpaceSessionDto = CoachSessionDetailDto & {
  reservations: CoachSpaceReservationDto[];
};

export type CoachSpacePayrollSummary = {
  billingPeriodLabel: string | null;
  bookingWindowLabel: string;
  sessionsInMonth: number;
  sessionsUpcomingInMonth: number;
  monthlyCostDinars: number;
  periods: CoachPayrollPeriodDto[];
};

export type CoachSpacePlanningSummary = {
  periodConfig: PlanningPeriodConfig;
  weeklyRepetitionCount: number;
  totalSessionsInActivePeriod: number;
  totalCostActivePeriodDinars: number;
  slotsByDay: Record<PlanningDayOfWeek, CoachPlanningSlotDetail[]>;
  periodBlocks: CoachPeriodBlockDto[];
  archivedPeriods: CoachPeriodSummaryDto[];
};

export type CoachSpaceData = {
  coach: {
    id: string;
    imageUrl: string | null;
    firstName: string;
    lastName: string;
    description: string | null;
    phone: string | null;
    payrollMode: string;
    payrollModeLabel: string;
    sessionCostDinars: number | null;
    monthlySalaryDinars: number | null;
  };
  yearMonth: string;
  availableMonths: string[];
  payroll: CoachSpacePayrollSummary;
  planning: CoachSpacePlanningSummary;
  sessions: CoachSpaceSessionDto[];
};

function memberDisplayName(firstName: string | null, lastName: string | null): string {
  return `${firstName ?? ""} ${lastName ?? ""}`.trim() || "Adhérente";
}

function sessionReservationKey(planningId: string, sessionDateYmd: string): string {
  return `${planningId}|${sessionDateYmd}`;
}

export function recentCoachYearMonths(count = 12): string[] {
  const anchor = startOfLocalToday();
  const months: string[] = [];
  for (let offset = 0; offset < count; offset += 1) {
    const d = new Date(anchor.getFullYear(), anchor.getMonth() - offset, 1);
    months.push(yearMonthFromDate(d));
  }
  return months;
}

async function loadReservationsForSessions(
  sessionDetails: CoachSessionDetailDto[],
): Promise<Map<string, CoachSpaceReservationDto[]>> {
  const reservationFilters = sessionDetails
    .map((session) => {
      const sessionDate = parseYmdToPrismaDate(session.sessionDateYmd);
      if (!sessionDate) return null;
      return { planningId: session.planningId, sessionDate };
    })
    .filter((row): row is { planningId: string; sessionDate: Date } => row != null);

  const reservations =
    reservationFilters.length > 0
      ? await prisma.reservation.findMany({
          where: { OR: reservationFilters },
          orderBy: [{ createdAt: "asc" }],
          select: {
            id: true,
            planningId: true,
            sessionDate: true,
            status: true,
            member: { select: { firstName: true, lastName: true } },
            attendance: { select: { id: true } },
          },
        })
      : [];

  const reservationsBySession = new Map<string, CoachSpaceReservationDto[]>();
  for (const reservation of reservations) {
    const key = sessionReservationKey(reservation.planningId, formatYmdLocal(reservation.sessionDate));
    const list = reservationsBySession.get(key) ?? [];
    list.push({
      id: reservation.id,
      memberName: memberDisplayName(reservation.member.firstName, reservation.member.lastName),
      status: reservation.status,
      attended: Boolean(reservation.attendance),
    });
    reservationsBySession.set(key, list);
  }

  return reservationsBySession;
}

export async function getCoachSpaceData(
  coachId: string,
  yearMonthInput?: string,
): Promise<CoachSpaceData | null> {
  const yearMonth = normalizeYearMonthParam(yearMonthInput);

  const detail = await getCoachDetailById(coachId);
  if (!detail || !detail.isActive) return null;

  const payrollMonth = await computeCoachPayrollForMonth(yearMonth);
  const line = payrollMonth.lines.find((row) => row.coachId === coachId);
  const sessionDetails = line?.sessionDetails ?? [];
  const reservationsBySession = await loadReservationsForSessions(sessionDetails);

  const sessions: CoachSpaceSessionDto[] = sessionDetails.map((session) => ({
    ...session,
    reservations:
      reservationsBySession.get(sessionReservationKey(session.planningId, session.sessionDateYmd)) ?? [],
  }));

  return {
    coach: {
      id: detail.id,
      imageUrl: detail.imageUrl,
      firstName: detail.firstName,
      lastName: detail.lastName,
      description: detail.description,
      phone: detail.phone,
      payrollMode: detail.payrollMode,
      payrollModeLabel: coachPayrollModeLabelFr(detail.payrollMode),
      sessionCostDinars: detail.sessionCostDinars,
      monthlySalaryDinars: detail.monthlySalaryDinars,
    },
    yearMonth,
    availableMonths: recentCoachYearMonths(12),
    payroll: {
      billingPeriodLabel: payrollMonth.billingPeriodLabel,
      bookingWindowLabel: payrollMonth.bookingWindowLabel,
      sessionsInMonth: line?.sessionsInMonth ?? 0,
      sessionsUpcomingInMonth: line?.sessionsUpcomingInMonth ?? 0,
      monthlyCostDinars: line?.monthlyCostDinars ?? 0,
      periods: line?.periods ?? [],
    },
    planning: {
      periodConfig: detail.periodConfig,
      weeklyRepetitionCount: detail.weeklyRepetitionCount,
      totalSessionsInActivePeriod: detail.totalSessionsInActivePeriod,
      totalCostActivePeriodDinars: detail.totalCostActivePeriodDinars,
      slotsByDay: detail.slotsByDay,
      periodBlocks: detail.periodBlocks,
      archivedPeriods: detail.archivedPeriods,
    },
    sessions,
  };
}

export function isCurrentCoachYearMonth(yearMonth: string): boolean {
  return yearMonth === currentYearMonth();
}
