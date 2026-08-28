import { describe, expect, it } from "vitest";
import { studioClockHHMM, studioYmd } from "@/lib/studio-timezone";

describe("studio timezone (Africa/Tunis)", () => {
  it("uses Tunis wall clock, not UTC, for presence windows", () => {
    // 28 Aug 2026 10:55 UTC = 11:55 in Tunis (UTC+1)
    const instant = new Date("2026-08-28T10:55:00.000Z");
    expect(studioClockHHMM(instant)).toBe("11:55");
    expect(studioYmd(instant)).toBe("2026-08-28");
  });

  it("opens presence at 11:45 for a 12:00 class when Tunis time is 11:53", () => {
    const instant = new Date("2026-08-28T10:53:00.000Z");
    const now = studioClockHHMM(instant);
    expect(now).toBe("11:53");
    expect(now >= "11:45").toBe(true);
  });
});
