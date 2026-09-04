import { describe, expect, it } from "vitest";
import { parseYmdToPrismaDate } from "@/lib/calendar-day";
import { assignConsumedReservationsToEnrollments } from "@/lib/member-pack-consumption-assign";

const day = (ymd: string) => parseYmdToPrismaDate(ymd)!;

const reformerPack = (sessionCount: number) => ({
  sessionCount,
  category: "Pilates reformer",
  courseQuotas: [] as { courseSlug: string; sessionCount: number }[],
});

describe("assignConsumedReservationsToEnrollments", () => {
  it("does not double-count orphan ATTENDED sessions across two catalogue packs (Mariem)", () => {
    const glow = {
      id: "glow",
      packId: "pack-glow",
      purchasedAt: day("2026-05-14"),
      closedAt: null,
      packStartedAt: day("2026-05-31"),
      status: "ACTIVE",
      pack: reformerPack(12),
    };
    const prestige = {
      id: "prestige",
      packId: "pack-prestige",
      purchasedAt: day("2026-07-06"),
      closedAt: null,
      packStartedAt: day("2026-07-09"),
      status: "ACTIVE",
      pack: reformerPack(24),
    };

    const reservations = [
      ...["2026-05-31", "2026-06-04", "2026-06-07", "2026-06-11", "2026-06-14", "2026-06-18", "2026-06-21"].map(
        (ymd) => ({
          sessionDate: day(ymd),
          courseSlug: "pilates-reformer",
          debitedPackId: null,
        }),
      ),
      ...["2026-06-25", "2026-06-28", "2026-07-02", "2026-07-05", "2026-07-12"].map((ymd) => ({
        sessionDate: day(ymd),
        courseSlug: "pilates-reformer",
        debitedPackId: "pack-glow",
      })),
      ...[
        "2026-07-09",
        "2026-07-16",
        "2026-07-19",
        "2026-07-23",
        "2026-07-26",
        "2026-07-30",
        "2026-08-02",
        "2026-08-06",
        "2026-08-09",
        "2026-08-20",
        "2026-08-27",
      ].map((ymd) => ({
        sessionDate: day(ymd),
        courseSlug: "pilates-reformer",
        debitedPackId: "pack-prestige",
      })),
    ];

    const alloc = assignConsumedReservationsToEnrollments([glow, prestige], reservations);
    expect(alloc.get("glow")?.consumedTotal).toBe(12);
    expect(alloc.get("prestige")?.consumedTotal).toBe(11);
    expect(
      (alloc.get("glow")?.consumedTotal ?? 0) + (alloc.get("prestige")?.consumedTotal ?? 0),
    ).toBe(23);
  });

  it("keeps a pre-purchase orphan on the first eligible catalogue pack, not a PENDING unique (Imen)", () => {
    const unique = {
      id: "unique",
      packId: "pack-unique",
      purchasedAt: day("2026-06-22"),
      closedAt: null,
      packStartedAt: null,
      status: "PENDING_START",
      pack: reformerPack(1),
    };
    const glow = {
      id: "glow",
      packId: "pack-glow",
      purchasedAt: day("2026-08-14"),
      closedAt: null,
      packStartedAt: day("2026-08-20"),
      status: "ACTIVE",
      pack: reformerPack(12),
    };

    const reservations = [
      { sessionDate: day("2026-06-06"), courseSlug: "pilates-reformer", debitedPackId: null },
      { sessionDate: day("2026-08-20"), courseSlug: "pilates-reformer", debitedPackId: "pack-glow" },
      { sessionDate: day("2026-08-23"), courseSlug: "pilates-reformer", debitedPackId: "pack-glow" },
    ];

    const alloc = assignConsumedReservationsToEnrollments([unique, glow], reservations);
    expect(alloc.get("unique")?.consumedTotal).toBe(0);
    expect(alloc.get("glow")?.consumedTotal).toBe(3);
  });
});
