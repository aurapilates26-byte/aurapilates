import { describe, expect, it } from "vitest";
import {
  isPackSessionConsumed,
  isPackSessionDebited,
} from "@/lib/pack-session-consumption";

describe("pack session consumption rules", () => {
  it("consumed only on ATTENDED or late cancellation", () => {
    expect(isPackSessionConsumed({ status: "ATTENDED" })).toBe(true);
    expect(isPackSessionConsumed({ status: "CANCELLED", packRefundedAt: null })).toBe(true);
    expect(isPackSessionConsumed({ status: "CANCELLED", packRefundedAt: new Date() })).toBe(false);
    expect(isPackSessionConsumed({ status: "BOOKED" })).toBe(false);
    expect(isPackSessionConsumed({ status: "WAITLIST" })).toBe(false);
  });

  it("debited on BOOKED, ATTENDED, or late cancellation", () => {
    expect(isPackSessionDebited({ status: "BOOKED" })).toBe(true);
    expect(isPackSessionDebited({ status: "ATTENDED" })).toBe(true);
    expect(isPackSessionDebited({ status: "CANCELLED", packRefundedAt: null })).toBe(true);
    expect(isPackSessionDebited({ status: "CANCELLED", packRefundedAt: new Date() })).toBe(false);
    expect(isPackSessionDebited({ status: "WAITLIST" })).toBe(false);
  });
});
