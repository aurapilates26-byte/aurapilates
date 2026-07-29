import { getEligibilityForPack } from "@/lib/pack-eligibility";
import type { FifoEnrollmentConsumption } from "@/lib/admin/member-pack-fifo";

export type SessionAttributionEnrollment = {
  id: string;
  packId: string;
  courseQuotas: { courseSlug: string; sessionCount: number }[];
  sessionCount: number | null;
  category?: string | null;
};

export type SessionAttributionSession = {
  courseSlug: string;
  debitedPackId: string | null;
};

function allowedCourseSlugs(enrollment: SessionAttributionEnrollment): string[] {
  if (enrollment.courseQuotas.length > 0) {
    return enrollment.courseQuotas.map((q) => q.courseSlug);
  }
  return getEligibilityForPack({
    category: enrollment.category ?? null,
    courseQuotas: [],
  }).allowedCourseSlugs;
}

function isCourseAllowed(enrollment: SessionAttributionEnrollment, courseSlug: string): boolean {
  const slugs = allowedCourseSlugs(enrollment);
  if (slugs.length === 0) return true;
  return slugs.includes(courseSlug);
}

function hasCapacity(
  bucket: FifoEnrollmentConsumption,
  enrollment: SessionAttributionEnrollment,
  courseSlug: string,
): boolean {
  if (enrollment.courseQuotas.length > 0) {
    const quota = enrollment.courseQuotas.find((q) => q.courseSlug === courseSlug);
    if (!quota) return false;
    return (bucket.byCourse.get(courseSlug) ?? 0) < quota.sessionCount;
  }
  if (enrollment.sessionCount == null) return true;
  return bucket.total < enrollment.sessionCount;
}

function assignToBucket(
  bucket: FifoEnrollmentConsumption,
  enrollment: SessionAttributionEnrollment,
  courseSlug: string,
): void {
  if (enrollment.courseQuotas.length > 0) {
    bucket.byCourse.set(courseSlug, (bucket.byCourse.get(courseSlug) ?? 0) + 1);
  }
  bucket.total += 1;
}

function initBucket(enrollment: SessionAttributionEnrollment): FifoEnrollmentConsumption {
  const byCourse = new Map<string, number>();
  for (const q of enrollment.courseQuotas) {
    byCourse.set(q.courseSlug, 0);
  }
  return { byCourse, total: 0 };
}

/**
 * Attribue chaque séance consommée à une seule inscription (FIFO global).
 * - `debitedPackId` explicite → pack ciblé (FIFO parmi ses inscriptions).
 * - Sinon → plus ancienne inscription avec capacité restante.
 * Évite le double comptage quand plusieurs packs catalogue coexistent (ex. AURA FLOW + AURA START).
 */
export function attributeConsumedSessionsGlobally(input: {
  enrollmentsAsc: SessionAttributionEnrollment[];
  sessionsAsc: SessionAttributionSession[];
}): Map<string, FifoEnrollmentConsumption> {
  const result = new Map<string, FifoEnrollmentConsumption>();
  for (const enrollment of input.enrollmentsAsc) {
    result.set(enrollment.id, initBucket(enrollment));
  }

  for (const session of input.sessionsAsc) {
    if (!session.courseSlug) continue;

    const targetPackId = session.debitedPackId;
    const candidateEnrollments = targetPackId
      ? input.enrollmentsAsc.filter((e) => e.packId === targetPackId)
      : input.enrollmentsAsc;

    let assigned = false;
    for (const enrollment of candidateEnrollments) {
      if (!isCourseAllowed(enrollment, session.courseSlug)) continue;
      const bucket = result.get(enrollment.id);
      if (!bucket || !hasCapacity(bucket, enrollment, session.courseSlug)) continue;
      assignToBucket(bucket, enrollment, session.courseSlug);
      assigned = true;
      break;
    }

    // Débit explicite mais capacité dépassée : compter quand même sur la 1ʳᵉ inscription du pack.
    if (!assigned && targetPackId && candidateEnrollments.length > 0) {
      const enrollment = candidateEnrollments[0]!;
      if (isCourseAllowed(enrollment, session.courseSlug)) {
        const bucket = result.get(enrollment.id);
        if (bucket) assignToBucket(bucket, enrollment, session.courseSlug);
      }
    }
  }

  return result;
}

export function sumAttributionForPack(
  attribution: Map<string, FifoEnrollmentConsumption>,
  enrollmentIds: string[],
): { total: number; byCourse: Map<string, number> } {
  const byCourse = new Map<string, number>();
  let total = 0;
  for (const enrollmentId of enrollmentIds) {
    const bucket = attribution.get(enrollmentId);
    if (!bucket) continue;
    total += bucket.total;
    for (const [slug, count] of bucket.byCourse) {
      byCourse.set(slug, (byCourse.get(slug) ?? 0) + count);
    }
  }
  return { total, byCourse };
}
