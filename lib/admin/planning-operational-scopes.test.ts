import { describe, expect, it } from "vitest";
import {
  isAdminOperationalSlotInScope,
  resolveAdminOperationalScopesForDate,
} from "@/lib/admin/planning-operational-scopes";

const published = {
  periodStartYmd: "2026-07-27",
  periodEndYmd: "2026-08-02",
};

const draft = {
  periodStartYmd: "2026-08-03",
  periodEndYmd: "2026-08-09",
};

describe("resolveAdminOperationalScopesForDate", () => {
  it("returns published for a date in the published period", () => {
    expect(resolveAdminOperationalScopesForDate("2026-07-30", published, draft)).toEqual([
      "published",
    ]);
  });

  it("returns draft for a date in the next/draft period (Jeu 6 case)", () => {
    expect(resolveAdminOperationalScopesForDate("2026-08-06", published, draft)).toEqual([
      "draft",
    ]);
  });

  it("returns empty outside both periods", () => {
    expect(resolveAdminOperationalScopesForDate("2026-08-13", published, draft)).toEqual([]);
  });

  it("returns empty for draft date when there is no draft schedule", () => {
    expect(resolveAdminOperationalScopesForDate("2026-08-06", published, null)).toEqual([]);
  });

  it("returns both scopes when periods overlap on a date", () => {
    const overlappingDraft = {
      periodStartYmd: "2026-08-01",
      periodEndYmd: "2026-08-07",
    };
    expect(resolveAdminOperationalScopesForDate("2026-08-01", published, overlappingDraft)).toEqual([
      "published",
      "draft",
    ]);
  });
});

describe("isAdminOperationalSlotInScope", () => {
  const scopesDraft = resolveAdminOperationalScopesForDate("2026-08-06", published, draft);
  const scopesPublished = resolveAdminOperationalScopesForDate("2026-07-30", published, draft);

  it("accepts draft slot whose anchor is in the draft period", () => {
    expect(
      isAdminOperationalSlotInScope(
        { isDraft: true, anchorSessionYmd: "2026-08-06" },
        scopesDraft,
        published,
        draft,
      ),
    ).toBe(true);
  });

  it("rejects published slot when only draft scope applies", () => {
    expect(
      isAdminOperationalSlotInScope(
        { isDraft: false, anchorSessionYmd: "2026-07-30" },
        scopesDraft,
        published,
        draft,
      ),
    ).toBe(false);
  });

  it("accepts published slot for published scope", () => {
    expect(
      isAdminOperationalSlotInScope(
        { isDraft: false, anchorSessionYmd: "2026-07-30" },
        scopesPublished,
        published,
        draft,
      ),
    ).toBe(true);
  });

  it("rejects draft slot for published-only scope", () => {
    expect(
      isAdminOperationalSlotInScope(
        { isDraft: true, anchorSessionYmd: "2026-08-06" },
        scopesPublished,
        published,
        draft,
      ),
    ).toBe(false);
  });

  it("rejects slot without anchor", () => {
    expect(
      isAdminOperationalSlotInScope(
        { isDraft: true, anchorSessionYmd: null },
        scopesDraft,
        published,
        draft,
      ),
    ).toBe(false);
  });
});
