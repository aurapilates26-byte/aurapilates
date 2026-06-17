import { describe, expect, it } from "vitest";
import {
  computeStaggeredPublishTimes,
  isPlanningOccurrenceVisibleToPublic,
  STUDIO_PLANNING_PUBLISH_HOUR,
} from "@/lib/admin/planning-staggered-publish";
import type { StaggeredPublicationContext } from "@/lib/admin/planning-staggered-publish";

describe("computeStaggeredPublishTimes", () => {
  it("schedules Saturday 13h and Sunday 13h before Monday period start", () => {
    const times = computeStaggeredPublishTimes("2026-06-09");
    expect(times).not.toBeNull();
    expect(times!.partialPublishYmd).toBe("2026-06-07");
    expect(times!.fullPublishYmd).toBe("2026-06-08");
    expect(times!.partialPublishAt.getHours()).toBe(STUDIO_PLANNING_PUBLISH_HOUR);
    expect(times!.fullPublishAt.getHours()).toBe(STUDIO_PLANNING_PUBLISH_HOUR);
  });
});

describe("isPlanningOccurrenceVisibleToPublic", () => {
  const partialCtx: StaggeredPublicationContext = {
    mode: "partial",
    published: {
      bookingWindow: "WEEKLY",
      periodStartYmd: "2026-06-02",
      periodEndYmd: "2026-06-08",
      periodLabel: "",
    },
    draft: {
      bookingWindow: "WEEKLY",
      periodStartYmd: "2026-06-09",
      periodEndYmd: "2026-06-15",
      periodLabel: "",
    },
    partialLegacySundayYmd: "2026-06-08",
  };

  it("shows draft Mon-Sat during partial phase", () => {
    expect(
      isPlanningOccurrenceVisibleToPublic(
        partialCtx,
        { isDraft: true, dayOfWeek: "MON", anchorSessionYmd: "2026-06-09" },
        "2026-06-09",
      ),
    ).toBe(true);
    expect(
      isPlanningOccurrenceVisibleToPublic(
        partialCtx,
        { isDraft: true, dayOfWeek: "SUN", anchorSessionYmd: "2026-06-15" },
        "2026-06-15",
      ),
    ).toBe(false);
  });

  it("keeps legacy Sunday from published period during partial phase", () => {
    expect(
      isPlanningOccurrenceVisibleToPublic(
        partialCtx,
        { isDraft: false, dayOfWeek: "SUN", anchorSessionYmd: "2026-06-08" },
        "2026-06-08",
      ),
    ).toBe(true);
    expect(
      isPlanningOccurrenceVisibleToPublic(
        partialCtx,
        { isDraft: false, dayOfWeek: "MON", anchorSessionYmd: "2026-06-02" },
        "2026-06-02",
      ),
    ).toBe(false);
  });
});
