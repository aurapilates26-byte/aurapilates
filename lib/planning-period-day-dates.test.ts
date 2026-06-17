import { describe, expect, it } from "vitest";
import {
  buildPeriodDaySelectOptions,
  calendarYmdsByWeekdayInPeriod,
  formatPlanningDayDatesLine,
  weekdayDateLineForPeriod,
} from "@/lib/planning-period-day-dates";

describe("planning-period-day-dates", () => {
  it("maps each weekday to its calendar date in a 7-day period", () => {
    const map = calendarYmdsByWeekdayInPeriod("2026-05-22", "2026-05-28");
    expect(map.get("THU")).toEqual(["2026-05-22"]);
    expect(map.get("MON")).toEqual(["2026-05-26"]);
    expect(map.get("WED")).toEqual(["2026-05-28"]);
  });

  it("formats a readable date line under the day label", () => {
    expect(weekdayDateLineForPeriod("2026-05-22", "2026-05-28", "MON")).toBe("26/05");
    expect(formatPlanningDayDatesLine(["2026-05-26", "2026-06-02"])).toBe("26/05 · 02/06");
  });

  it("lists each calendar day of a Mon–Sun week with Sunday on the period end", () => {
    const opts = buildPeriodDaySelectOptions("2026-06-01", "2026-06-07");
    expect(opts).toHaveLength(7);
    expect(opts.find((o) => o.dayOfWeek === "SUN")).toEqual({
      value: "2026-06-07",
      label: "Dimanche — 07/06",
      dayOfWeek: "SUN",
      sessionYmd: "2026-06-07",
    });
    expect(opts.some((o) => o.sessionYmd === "2026-05-31")).toBe(false);
  });
});
