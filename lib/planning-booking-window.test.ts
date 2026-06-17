import { describe, expect, it } from "vitest";
import { intersectionOfMonthAndActivePlanningPeriod } from "@/lib/planning-booking-window";

describe("intersectionOfMonthAndActivePlanningPeriod", () => {
  it("clips to active period inside month (16–22 May in May 2026)", () => {
    const monthFrom = new Date(2026, 4, 1);
    const monthTo = new Date(2026, 4, 31);
    const hit = intersectionOfMonthAndActivePlanningPeriod("2026-05-16", "2026-05-22", monthFrom, monthTo);
    expect(hit).not.toBeNull();
    expect(hit!.billFromYmd).toBe("2026-05-16");
    expect(hit!.billToYmd).toBe("2026-05-22");
  });

  it("returns null when active period does not overlap month", () => {
    const monthFrom = new Date(2026, 3, 1);
    const monthTo = new Date(2026, 3, 30);
    const hit = intersectionOfMonthAndActivePlanningPeriod("2026-05-16", "2026-05-22", monthFrom, monthTo);
    expect(hit).toBeNull();
  });
});
