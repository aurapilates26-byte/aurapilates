/**
 * Attribution FIFO des séances consommées sur plusieurs achats du même pack catalogue.
 * Le stock le plus ancien se remplit en premier (ex. Reformer 15 du pack 1, puis pack 2).
 */

export type FifoEnrollmentRef = { id: string };

export type FifoCourseQuota = { courseSlug: string; sessionCount: number };

export type FifoSessionRef = { courseSlug: string };

export type FifoEnrollmentConsumption = {
  byCourse: Map<string, number>;
  total: number;
};

export function assignConsumedSessionsFifo(input: {
  enrollmentsAsc: FifoEnrollmentRef[];
  courseQuotas: FifoCourseQuota[];
  sessionCount: number | null;
  sessionsAsc: FifoSessionRef[];
}): Map<string, FifoEnrollmentConsumption> {
  const result = new Map<string, FifoEnrollmentConsumption>();
  const quotaBySlug = new Map(input.courseQuotas.map((q) => [q.courseSlug, q.sessionCount]));

  for (const enrollment of input.enrollmentsAsc) {
    const byCourse = new Map<string, number>();
    for (const q of input.courseQuotas) {
      byCourse.set(q.courseSlug, 0);
    }
    result.set(enrollment.id, { byCourse, total: 0 });
  }

  for (const session of input.sessionsAsc) {
    if (input.courseQuotas.length > 0 && !quotaBySlug.has(session.courseSlug)) {
      continue;
    }

    for (const enrollment of input.enrollmentsAsc) {
      const bucket = result.get(enrollment.id);
      if (!bucket) continue;

      if (input.courseQuotas.length > 0) {
        const cap = quotaBySlug.get(session.courseSlug) ?? 0;
        const used = bucket.byCourse.get(session.courseSlug) ?? 0;
        if (used >= cap) continue;
        bucket.byCourse.set(session.courseSlug, used + 1);
        bucket.total += 1;
        break;
      }

      if (input.sessionCount != null && bucket.total >= input.sessionCount) continue;
      bucket.total += 1;
      break;
    }
  }

  return result;
}
