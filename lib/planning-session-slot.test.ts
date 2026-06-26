import { describe, expect, it } from "vitest";
import {
  computePlanningGlobalSlotEnd,
  doPlanningGlobalSlotsOverlap,
  hasPlanningSlotOverlap,
  PLANNING_GLOBAL_SLOT_MINUTES,
} from "@/lib/planning-session-slot";

describe("planning-session-slot", () => {
  it("computes global slot end as start + 1 hour", () => {
    expect(computePlanningGlobalSlotEnd("09:00")).toBe("10:00");
    expect(computePlanningGlobalSlotEnd("09:30")).toBe("10:30");
  });

  it("detects overlapping 1-hour global slots", () => {
    expect(doPlanningGlobalSlotsOverlap("09:00", "09:00")).toBe(true);
    expect(doPlanningGlobalSlotsOverlap("09:00", "09:30")).toBe(true);
    expect(doPlanningGlobalSlotsOverlap("09:00", "10:00")).toBe(false);
    expect(doPlanningGlobalSlotsOverlap("09:30", "10:00")).toBe(true);
    expect(doPlanningGlobalSlotsOverlap("09:30", "11:30")).toBe(false);
  });

  it("detects overlap in loaded items on the same day and same course", () => {
    const items = [
      { id: "a", courseSlug: "pilates-reformer", anchorSessionYmd: "2026-06-22", startTime: "09:00" },
      { id: "b", courseSlug: "mat-pilates", anchorSessionYmd: "2026-06-22", startTime: "11:00" },
    ];
    expect(hasPlanningSlotOverlap(items, "2026-06-22", "pilates-reformer", "09:30")).toBe(true);
    expect(hasPlanningSlotOverlap(items, "2026-06-22", "pilates-reformer", "10:00")).toBe(false);
    expect(hasPlanningSlotOverlap(items, "2026-06-22", "pilates-reformer", "09:00", "a")).toBe(false);
    expect(hasPlanningSlotOverlap(items, "2026-06-23", "pilates-reformer", "09:30")).toBe(false);
  });

  it("allows same time on the same day when course slug differs", () => {
    const items = [
      { id: "a", courseSlug: "pilates-reformer", anchorSessionYmd: "2026-06-22", startTime: "09:00" },
    ];
    expect(hasPlanningSlotOverlap(items, "2026-06-22", "mat-pilates", "09:00")).toBe(false);
    expect(hasPlanningSlotOverlap(items, "2026-06-22", "mat-pilates", "09:30")).toBe(false);
  });

  it("uses a 60-minute global slot", () => {
    expect(PLANNING_GLOBAL_SLOT_MINUTES).toBe(60);
  });
});
