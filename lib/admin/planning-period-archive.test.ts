import { describe, expect, it } from "vitest";
import {
  countDistinctCalendarDaysInRanges,
  prorateMonthlySalaryDinars,
} from "@/lib/admin/planning-period-archive";

describe("prorateMonthlySalaryDinars", () => {
  it("returns full salary when month fully covered", () => {
    expect(prorateMonthlySalaryDinars(1000, 30, 30)).toBe(1000);
  });

  it("prorates when only part of month covered", () => {
    expect(prorateMonthlySalaryDinars(1000, 7, 30)).toBe(233);
  });

  it("returns 0 for zero salary", () => {
    expect(prorateMonthlySalaryDinars(0, 15, 30)).toBe(0);
  });
});

describe("countDistinctCalendarDaysInRanges", () => {
  it("counts union without double-counting overlap", () => {
    const count = countDistinctCalendarDaysInRanges([
      { from: new Date(2026, 4, 1), to: new Date(2026, 4, 7) },
      { from: new Date(2026, 4, 5), to: new Date(2026, 4, 10) },
    ]);
    expect(count).toBe(10);
  });
});
