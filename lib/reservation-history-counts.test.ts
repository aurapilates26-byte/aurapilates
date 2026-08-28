import { describe, expect, it } from "vitest";
import {
  buildReservationHistoryCounts,
  formatHistoryCourseBreakdown,
} from "@/lib/reservation-history-counts";

describe("buildReservationHistoryCounts", () => {
  const quotaSlugs = ["pilates-reformer", "mat-pilates"];

  it("counts only attended and non-refunded late cancellations", () => {
    const history = [
      {
        status: "ATTENDED",
        packRefundedAt: null,
        planning: { courseSlug: "pilates-reformer", courseLabel: "Pilates reformer" },
      },
      {
        status: "ATTENDED",
        packRefundedAt: null,
        planning: { courseSlug: "mat-pilates", courseLabel: "Mat pilates" },
      },
      {
        status: "BOOKED",
        packRefundedAt: null,
        planning: { courseSlug: "pilates-reformer", courseLabel: "Pilates reformer" },
      },
      {
        status: "CANCELLED",
        packRefundedAt: "2026-08-01T00:00:00.000Z",
        planning: { courseSlug: "pilates-reformer", courseLabel: "Pilates reformer" },
      },
    ];

    const counts = buildReservationHistoryCounts(history, quotaSlugs);
    expect(counts.total).toBe(2);
    expect(formatHistoryCourseBreakdown(counts.byCourse)).toBe("Reformer 1 · Mat 1");
  });

  it("shows zero quotas for mixed pack when a course has no consumed sessions yet", () => {
    const history = [
      {
        status: "ATTENDED",
        packRefundedAt: null,
        planning: { courseSlug: "mat-pilates", courseLabel: "Mat pilates" },
      },
    ];

    const counts = buildReservationHistoryCounts(history, quotaSlugs);
    expect(counts.total).toBe(1);
    expect(formatHistoryCourseBreakdown(counts.byCourse)).toBe("Reformer 0 · Mat 1");
  });
});
