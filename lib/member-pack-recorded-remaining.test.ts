import { describe, expect, it } from "vitest";
import {
  remainingForCourseFromBalances,
  totalRemainingFromBalances,
} from "@/lib/member-pack-recorded-remaining";

const glow = { sessionCount: 12, courseQuotas: [] as { courseSlug: string; sessionCount: number }[] };

describe("totalRemainingFromBalances", () => {
  it("treats a recorded remaining of 0 as empty, not as a full unused pack", () => {
    expect(totalRemainingFromBalances([{ courseSlug: null, remaining: 0 }], glow)).toBe(0);
  });

  it("falls back to catalogue size only when no balance row exists", () => {
    expect(totalRemainingFromBalances([], glow)).toBe(12);
  });
});

describe("remainingForCourseFromBalances", () => {
  it("does not revive a finished single-course pack", () => {
    expect(
      remainingForCourseFromBalances([{ courseSlug: null, remaining: 0 }], glow, "pilates-reformer"),
    ).toBe(0);
  });
});
