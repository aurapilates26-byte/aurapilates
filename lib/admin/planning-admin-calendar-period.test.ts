import { describe, expect, it } from "vitest";
import {
  periodContainsYmd,
  resolveCalendarCurrentPeriod,
  resolveNextPlanningPeriod,
  resolvePeriodConfigForSessionYmd,
} from "@/lib/admin/planning-admin-calendar-period";
import type { PlanningArchivedPeriodItem, PlanningPeriodConfig } from "@/types/admin/planning";

const published: PlanningPeriodConfig = {
  bookingWindow: "WEEKLY",
  periodStartYmd: "2026-06-29",
  periodEndYmd: "2026-07-05",
  periodLabel: "Du 29/06/2026 au 05/07/2026",
};

const archived: PlanningArchivedPeriodItem = {
  id: "a1",
  archivedAt: "2026-06-28T12:00:00.000Z",
  bookingWindow: "WEEKLY",
  periodStartYmd: "2026-06-22",
  periodEndYmd: "2026-06-28",
  periodLabel: "Du 22/06/2026 au 28/06/2026",
};

describe("planning-admin-calendar-period", () => {
  it("uses archive when today is last day but DB published is next period", () => {
    const current = resolveCalendarCurrentPeriod("2026-06-28", published, [archived]);
    expect(current?.source).toBe("archive");
    expect(current?.period.periodStartYmd).toBe("2026-06-22");
    expect(current?.period.periodEndYmd).toBe("2026-06-28");
  });

  it("next period is immediately after calendar current (29 Jun – 5 Jul)", () => {
    const current = resolveCalendarCurrentPeriod("2026-06-28", published, [archived]);
    const next = resolveNextPlanningPeriod(current);
    expect(next?.periodStartYmd).toBe("2026-06-29");
    expect(next?.periodEndYmd).toBe("2026-07-05");
  });

  it("periodContainsYmd is inclusive on both ends", () => {
    expect(periodContainsYmd(archived, "2026-06-22")).toBe(true);
    expect(periodContainsYmd(archived, "2026-06-28")).toBe(true);
    expect(periodContainsYmd(archived, "2026-06-29")).toBe(false);
  });

  it("resolvePeriodConfigForSessionYmd picks archive when date is outside published", () => {
    const resolved = resolvePeriodConfigForSessionYmd("2026-06-25", {
      published,
      archives: [archived],
    });
    expect(resolved?.periodStartYmd).toBe("2026-06-22");
    expect(resolved?.periodEndYmd).toBe("2026-06-28");
  });
});
