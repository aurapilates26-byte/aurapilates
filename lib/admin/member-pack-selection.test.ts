import { describe, expect, it } from "vitest";

type PackQuotaShape = {
  sessionCount: number | null;
  courseQuotas: { courseSlug: string; sessionCount: number }[];
};

/** Copie de la logique member-pack-selection pour test unitaire. */
function totalRemaining(
  balances: { courseSlug: string | null; remaining: number }[],
  pack: PackQuotaShape,
): number {
  if (balances.length > 0) {
    return balances.reduce((sum, b) => sum + Math.max(0, b.remaining), 0);
  }
  if (pack.courseQuotas.length > 0) {
    return pack.courseQuotas.reduce((sum, q) => sum + q.sessionCount, 0);
  }
  return pack.sessionCount ?? 0;
}

describe("pack selection totalRemaining", () => {
  const simplePack: PackQuotaShape = { sessionCount: 8, courseQuotas: [] };

  it("returns 0 when balance row exists but pack is exhausted", () => {
    expect(totalRemaining([{ courseSlug: null, remaining: 0 }], simplePack)).toBe(0);
  });

  it("returns catalogue quota when no balance row yet", () => {
    expect(totalRemaining([], simplePack)).toBe(8);
  });

  it("sums positive balances for mixed packs", () => {
    const mixed: PackQuotaShape = {
      sessionCount: null,
      courseQuotas: [
        { courseSlug: "pilates-reformer", sessionCount: 15 },
        { courseSlug: "mat-pilates", sessionCount: 15 },
      ],
    };
    expect(
      totalRemaining(
        [
          { courseSlug: "pilates-reformer", remaining: 3 },
          { courseSlug: "mat-pilates", remaining: 0 },
        ],
        mixed,
      ),
    ).toBe(3);
  });
});
