import { describe, expect, it } from "vitest";
import { getEnrollmentPeriodBounds } from "@/lib/member-pack-enrollment-period";

describe("getEnrollmentPeriodBounds", () => {
  it("does not use packStartedAt as lower bound on the first catalogue pack", () => {
    const glow = {
      id: "glow",
      packId: "pack-glow",
      purchasedAt: new Date("2026-08-14T00:00:00.000Z"),
      closedAt: null,
      packStartedAt: new Date("2026-08-20T00:00:00.000Z"),
      status: "ACTIVE",
    };
    const unique = {
      id: "unique",
      packId: "pack-unique",
      purchasedAt: new Date("2026-06-22T00:00:00.000Z"),
      closedAt: null,
      packStartedAt: null,
      status: "PENDING_START",
    };

    const glowBounds = getEnrollmentPeriodBounds(glow, [unique, glow]);
    expect(glowBounds.periodStart).toBeNull();

    const uniqueBounds = getEnrollmentPeriodBounds(unique, [unique, glow]);
    expect(uniqueBounds.periodStart?.toISOString().slice(0, 10)).toBe("2026-06-22");
  });

  it("bounds a renewal at its purchase date", () => {
    const first = {
      id: "a",
      packId: "same",
      purchasedAt: new Date("2026-01-01T00:00:00.000Z"),
      closedAt: null,
      packStartedAt: new Date("2026-01-05T00:00:00.000Z"),
      status: "ACTIVE",
    };
    const renewal = {
      id: "b",
      packId: "same",
      purchasedAt: new Date("2026-08-01T00:00:00.000Z"),
      closedAt: null,
      packStartedAt: new Date("2026-08-10T00:00:00.000Z"),
      status: "ACTIVE",
    };

    const bounds = getEnrollmentPeriodBounds(renewal, [first, renewal]);
    expect(bounds.periodStart?.toISOString().slice(0, 10)).toBe("2026-08-01");
    expect(getEnrollmentPeriodBounds(first, [first, renewal]).periodEndExclusive?.toISOString().slice(0, 10)).toBe(
      "2026-08-01",
    );
  });
});
