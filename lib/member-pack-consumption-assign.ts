import { formatYmdLocal, parseYmdToPrismaDate } from "@/lib/calendar-day";
import { getEnrollmentPeriodBounds, type EnrollmentPeriodRow } from "@/lib/member-pack-enrollment-period";
import { getEligibilityForPack, isCourseAllowedForPack } from "@/lib/pack-eligibility";

export type EnrollmentConsumptionTarget = EnrollmentPeriodRow & {
  pack: {
    sessionCount: number | null;
    category?: string | null;
    courseQuotas: { courseSlug: string; sessionCount: number }[];
  };
};

export type ConsumedReservationToAssign = {
  sessionDate: Date;
  courseSlug: string;
  debitedPackId: string | null;
};

export type EnrollmentConsumptionAlloc = {
  enrollmentId: string;
  consumedTotal: number;
  consumedByCourse: Map<string, number>;
  firstSessionDate: Date | null;
  remainingTotal: number;
  remainingByCourse: Map<string, number>;
};

function toPrismaDateLocal(d: Date): Date {
  return parseYmdToPrismaDate(formatYmdLocal(d))!;
}

function sessionInPeriod(
  sessionDate: Date,
  bounds: { periodStart: Date | null; periodEndExclusive: Date | null },
): boolean {
  const day = toPrismaDateLocal(sessionDate);
  if (bounds.periodStart && day.getTime() < bounds.periodStart.getTime()) return false;
  if (bounds.periodEndExclusive && day.getTime() >= bounds.periodEndExclusive.getTime()) return false;
  return true;
}

function packCap(pack: EnrollmentConsumptionTarget["pack"]): number | null {
  if (pack.courseQuotas.length > 0) {
    return pack.courseQuotas.reduce((sum, q) => sum + q.sessionCount, 0);
  }
  return pack.sessionCount;
}

/**
 * Attribue chaque séance consommée à **une seule** inscription (FIFO par date d'achat).
 * Évite de compter les présences sans `debitedPackId` sur plusieurs packs en parallèle.
 */
export function assignConsumedReservationsToEnrollments(
  enrollmentsAsc: EnrollmentConsumptionTarget[],
  reservationsAsc: ConsumedReservationToAssign[],
): Map<string, EnrollmentConsumptionAlloc> {
  const result = new Map<string, EnrollmentConsumptionAlloc>();
  const boundsById = new Map<string, { periodStart: Date | null; periodEndExclusive: Date | null }>();

  for (const enrollment of enrollmentsAsc) {
    const pack = enrollment.pack;
    const hasQuotas = pack.courseQuotas.length > 0;
    const totalCap = packCap(pack);
    const consumedByCourse = new Map<string, number>();
    const remainingByCourse = new Map<string, number>();
    if (hasQuotas) {
      for (const q of pack.courseQuotas) {
        consumedByCourse.set(q.courseSlug, 0);
        remainingByCourse.set(q.courseSlug, q.sessionCount);
      }
    }
    result.set(enrollment.id, {
      enrollmentId: enrollment.id,
      consumedTotal: 0,
      consumedByCourse,
      firstSessionDate: null,
      remainingTotal: totalCap ?? Number.POSITIVE_INFINITY,
      remainingByCourse,
    });
    boundsById.set(enrollment.id, getEnrollmentPeriodBounds(enrollment, enrollmentsAsc));
  }

  for (const reservation of reservationsAsc) {
    const candidates = enrollmentsAsc.filter((enrollment) => {
      const alloc = result.get(enrollment.id)!;
      if (alloc.remainingTotal <= 0) return false;
      const bounds = boundsById.get(enrollment.id)!;
      if (!sessionInPeriod(reservation.sessionDate, bounds)) return false;
      const eligibility = getEligibilityForPack({
        category: enrollment.pack.category ?? null,
        courseQuotas: enrollment.pack.courseQuotas,
      });
      if (!isCourseAllowedForPack(eligibility, reservation.courseSlug)) return false;
      if (enrollment.pack.courseQuotas.length > 0) {
        const remainingForCourse = alloc.remainingByCourse.get(reservation.courseSlug) ?? 0;
        if (remainingForCourse <= 0) return false;
      }
      return true;
    });

    let chosen =
      reservation.debitedPackId != null
        ? candidates.find((enrollment) => enrollment.packId === reservation.debitedPackId)
        : undefined;
    if (!chosen) chosen = candidates[0];
    if (!chosen) continue;

    const alloc = result.get(chosen.id)!;
    const pack = chosen.pack;
    if (pack.courseQuotas.length > 0) {
      const remainingForCourse = alloc.remainingByCourse.get(reservation.courseSlug) ?? 0;
      alloc.remainingByCourse.set(reservation.courseSlug, remainingForCourse - 1);
      alloc.consumedByCourse.set(
        reservation.courseSlug,
        (alloc.consumedByCourse.get(reservation.courseSlug) ?? 0) + 1,
      );
    }
    alloc.consumedTotal += 1;
    const totalCap = packCap(pack);
    alloc.remainingTotal =
      totalCap != null ? Math.max(0, totalCap - alloc.consumedTotal) : Number.POSITIVE_INFINITY;
    if (!alloc.firstSessionDate) alloc.firstSessionDate = reservation.sessionDate;
  }

  return result;
}
