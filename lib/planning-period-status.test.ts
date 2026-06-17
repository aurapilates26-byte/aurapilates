import { describe, expect, it } from "vitest";
import {
  adminPeriodAlertMessageFr,
  enrichPlanningPeriodConfig,
  isSessionYmdWithinPlanningPeriod,
  proposeNextPlanningPeriod,
} from "@/lib/planning-period-status";
import type { PlanningPeriodConfig } from "@/types/admin/planning";

const sample: PlanningPeriodConfig = {
  bookingWindow: "WEEKLY",
  periodStartYmd: "2026-05-22",
  periodEndYmd: "2026-05-28",
  periodLabel: "Du 22/05/2026 au 28/05/2026",
};

describe("planning-period-status", () => {
  it("detects expired period", () => {
    const today = new Date(2026, 4, 30);
    const meta = enrichPlanningPeriodConfig(sample, today);
    expect(meta.status).toBe("expired");
    expect(meta.daysSinceExpiry).toBe(2);
    expect(meta.suggestedRenewal?.periodStartYmd).toBe("2026-05-29");
  });

  it("proposes next period after end", () => {
    const next = proposeNextPlanningPeriod(sample);
    expect(next.periodStartYmd).toBe("2026-05-29");
    expect(next.periodEndYmd).toBe("2026-06-04");
  });

  it("blocks session outside period", () => {
    expect(isSessionYmdWithinPlanningPeriod("2026-05-26", sample)).toBe(true);
    expect(isSessionYmdWithinPlanningPeriod("2026-06-01", sample)).toBe(false);
  });

  it("builds admin alert when expired", () => {
    const meta = enrichPlanningPeriodConfig(sample, new Date(2026, 4, 30));
    expect(adminPeriodAlertMessageFr(meta)).toMatch(/terminée/);
  });
});
