import { describe, expect, it } from "vitest";
import { assignConsumedSessionsFifo } from "@/lib/admin/member-pack-fifo";

describe("assignConsumedSessionsFifo", () => {
  const quotas = [
    { courseSlug: "pilates-reformer", sessionCount: 15 },
    { courseSlug: "mat-pilates", sessionCount: 15 },
  ];

  it("fills oldest enrollment first for the same course", () => {
    const reformerSessions = Array.from({ length: 19 }, () => ({
      courseSlug: "pilates-reformer",
    }));

    const result = assignConsumedSessionsFifo({
      enrollmentsAsc: [{ id: "pack1" }, { id: "pack2" }],
      courseQuotas: quotas,
      sessionCount: 30,
      sessionsAsc: reformerSessions,
    });

    expect(result.get("pack1")?.byCourse.get("pilates-reformer")).toBe(15);
    expect(result.get("pack2")?.byCourse.get("pilates-reformer")).toBe(4);
    expect(result.get("pack1")?.total).toBe(15);
    expect(result.get("pack2")?.total).toBe(4);
  });

  it("keeps mat quotas independent from reformer", () => {
    const sessions = [
      ...Array.from({ length: 16 }, () => ({ courseSlug: "pilates-reformer" })),
      ...Array.from({ length: 6 }, () => ({ courseSlug: "mat-pilates" })),
    ];

    const result = assignConsumedSessionsFifo({
      enrollmentsAsc: [{ id: "pack1" }, { id: "pack2" }],
      courseQuotas: quotas,
      sessionCount: 30,
      sessionsAsc: sessions,
    });

    expect(result.get("pack1")?.byCourse.get("pilates-reformer")).toBe(15);
    expect(result.get("pack2")?.byCourse.get("pilates-reformer")).toBe(1);
    expect(result.get("pack1")?.byCourse.get("mat-pilates")).toBe(6);
    expect(result.get("pack2")?.byCourse.get("mat-pilates")).toBe(0);
  });
});
