import { describe, expect, it } from "vitest";
import { attributeConsumedSessionsGlobally } from "@/lib/admin/member-pack-session-attribution";

describe("attributeConsumedSessionsGlobally", () => {
  const flowPackId = "pack-flow";
  const startPackId = "pack-start";

  it("Olfa: 11 séances uniques → 8 FLOW + 3 START (pas 5+8=13)", () => {
    const enrollmentsAsc = [
      {
        id: "enroll-flow",
        packId: flowPackId,
        courseQuotas: [],
        sessionCount: 8,
        category: "Pilates reformer",
      },
      {
        id: "enroll-start",
        packId: startPackId,
        courseQuotas: [],
        sessionCount: 5,
        category: "Pilates reformer",
      },
    ];

    const sessionsAsc = [
      { courseSlug: "pilates-reformer", debitedPackId: null },
      { courseSlug: "pilates-reformer", debitedPackId: null },
      { courseSlug: "pilates-reformer", debitedPackId: null },
      { courseSlug: "pilates-reformer", debitedPackId: null },
      { courseSlug: "pilates-reformer", debitedPackId: flowPackId },
      { courseSlug: "pilates-reformer", debitedPackId: flowPackId },
      { courseSlug: "pilates-reformer", debitedPackId: flowPackId },
      { courseSlug: "pilates-reformer", debitedPackId: flowPackId },
      { courseSlug: "pilates-reformer", debitedPackId: startPackId },
      { courseSlug: "pilates-reformer", debitedPackId: startPackId },
      { courseSlug: "pilates-reformer", debitedPackId: startPackId },
    ];

    const result = attributeConsumedSessionsGlobally({ enrollmentsAsc, sessionsAsc });

    expect(result.get("enroll-flow")?.total).toBe(8);
    expect(result.get("enroll-start")?.total).toBe(3);
    expect(
      (result.get("enroll-flow")?.total ?? 0) + (result.get("enroll-start")?.total ?? 0),
    ).toBe(11);
  });

  it("respecte le débit explicite même si des séances sans pack existent avant", () => {
    const enrollmentsAsc = [
      {
        id: "e1",
        packId: "p1",
        courseQuotas: [],
        sessionCount: 5,
        category: "Pilates reformer",
      },
      {
        id: "e2",
        packId: "p2",
        courseQuotas: [],
        sessionCount: 5,
        category: "Pilates reformer",
      },
    ];

    const sessionsAsc = [
      { courseSlug: "pilates-reformer", debitedPackId: "p2" },
      { courseSlug: "pilates-reformer", debitedPackId: null },
    ];

    const result = attributeConsumedSessionsGlobally({ enrollmentsAsc, sessionsAsc });
    expect(result.get("e2")?.total).toBe(1);
    expect(result.get("e1")?.total).toBe(1);
  });
});
