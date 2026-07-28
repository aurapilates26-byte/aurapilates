import { describe, expect, it } from "vitest";
import {
  computePackCourseRemaining,
  packBalanceCapacityUnits,
} from "@/lib/admin/member-pack-renewal";

describe("pack multi-purchase balance capacity", () => {
  it("counts each enrollment as one capacity unit", () => {
    expect(packBalanceCapacityUnits(2, true)).toBe(2);
    expect(packBalanceCapacityUnits(1, true)).toBe(1);
    expect(packBalanceCapacityUnits(0, true)).toBe(1);
    expect(packBalanceCapacityUnits(0, false)).toBe(0);
  });

  it("gives 30 reformer capacity for 2× AURA SCULPT (15 each)", () => {
    // Amel: 19 reformer consumed across both purchases → 11 remaining
    expect(computePackCourseRemaining(15, 2, 19)).toBe(11);
    expect(computePackCourseRemaining(15, 2, 7)).toBe(23);
    expect(computePackCourseRemaining(15, 2, 30)).toBe(0);
    expect(computePackCourseRemaining(15, 1, 15)).toBe(0);
  });

  it("never returns negative remaining", () => {
    expect(computePackCourseRemaining(15, 2, 40)).toBe(0);
  });
});
