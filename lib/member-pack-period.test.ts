import { describe, expect, it } from "vitest";
import {
  clampPackStartToPurchasedAt,
  isPackStartBeforePurchase,
} from "@/lib/member-pack-period";

describe("pack start vs purchase date", () => {
  it("detects start before purchase (Molka FLOW case)", () => {
    const purchased = new Date(2026, 6, 28); // 28/07
    const inherited = new Date(2026, 4, 18); // 18/05
    expect(isPackStartBeforePurchase(inherited, purchased)).toBe(true);
    expect(isPackStartBeforePurchase(purchased, purchased)).toBe(false);
    expect(isPackStartBeforePurchase(new Date(2026, 6, 29), purchased)).toBe(false);
    expect(isPackStartBeforePurchase(null, purchased)).toBe(false);
  });

  it("clamps inherited start up to purchase day", () => {
    const purchased = new Date(2026, 6, 28);
    const inherited = new Date(2026, 4, 18);
    const clamped = clampPackStartToPurchasedAt(inherited, purchased);
    expect(clamped.getFullYear()).toBe(2026);
    expect(clamped.getMonth()).toBe(6);
    expect(clamped.getDate()).toBe(28);
  });
});
